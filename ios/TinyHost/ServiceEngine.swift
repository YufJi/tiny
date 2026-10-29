import Foundation
import JavaScriptCore
import UIKit
import CoreText

/// One JavaScriptCore context running the mini-program service thread.
///
/// The native host only provides the environment: bridge send/receive, timers,
/// logging, system information and an error sink. `Generated/service-engine.js`
/// is the generic runtime; per-app artifacts are injected through
/// `globalThis.__TINY_IOS_APP__` before the engine is evaluated.
@MainActor
final class ServiceEngine {
  private var context: JSContext?
  private var receiveFunction: JSValue?
  private var timers: [Int: Timer] = [:]

  var onFrame: ((String) -> Void)?
  var onLog: ((String, String) -> Void)?
  var onError: ((String) -> Void)?
  var onCanvas: ((String) -> Void)?

  func start(appId: String, hostInfo: [String: Any]) throws {
    stop()
    HostDebug.log("service start \(appId)")

    guard let resourceRoot = Bundle.main.resourceURL else {
      throw ServiceEngineError.missingBundle
    }
    let engineURL = resourceRoot
      .appendingPathComponent("Generated/service-engine.js")
    guard let engineSource = try? String(contentsOf: engineURL, encoding: .utf8) else {
      throw ServiceEngineError.missingEngine
    }
    let appDataURL = resourceRoot
      .appendingPathComponent("Generated/apps/\(appId)/app-data.json")
    guard let appDataData = try? Data(contentsOf: appDataURL),
          let appData = try? JSONSerialization.jsonObject(with: appDataData) as? [String: Any]
    else {
      throw ServiceEngineError.missingAppData(appId)
    }
    guard let context = JSContext() else {
      throw ServiceEngineError.contextUnavailable
    }
    self.context = context

    context.exceptionHandler = { [weak self] _, exception in
      let message = exception?.toString() ?? "unknown JavaScript exception"
      self?.onError?("JavaScript exception: \(message)")
    }

    installBridge(in: context)
    injectHostInfo(hostInfo, into: context)
    context.setObject(appData, forKeyedSubscript: "__TINY_IOS_APP__" as NSString)

    context.evaluateScript(engineSource, withSourceURL: engineURL)
    if let exception = context.exception {
      context.exception = nil
      throw ServiceEngineError.evaluationFailed(exception.toString() ?? "unknown exception")
    }

    let receive = context.objectForKeyedSubscript("__tinyReceiveFrame")
    guard let receive, !receive.isUndefined else {
      throw ServiceEngineError.receiverMissing
    }
    receiveFunction = receive
    HostDebug.log("service engine ready \(appId)")
  }

  func receive(_ frame: String) {
    receiveFunction?.call(withArguments: [frame])
  }

  func stop() {
    if context != nil { HostDebug.log("service stop") }
    for timer in timers.values {
      timer.invalidate()
    }
    timers.removeAll()
    receiveFunction = nil
    context = nil
  }

  private func installBridge(in context: JSContext) {
    let send: @convention(block) (String) -> Void = { [weak self] frame in
      self?.onFrame?(frame)
    }
    context.setObject(send, forKeyedSubscript: "__tinySend" as NSString)

    let log: @convention(block) (String, String) -> Void = { [weak self] level, message in
      self?.onLog?(level, message)
    }
    context.setObject(log, forKeyedSubscript: "__tinyLog" as NSString)

    let error: @convention(block) (String) -> Void = { [weak self] message in
      self?.onError?(message)
    }
    context.setObject(error, forKeyedSubscript: "__tinyError" as NSString)

    let started: @convention(block) (String) -> Void = { _ in }
    context.setObject(started, forKeyedSubscript: "__tinyServiceStarted" as NSString)

    let schedule: @convention(block) (Int, Double, Bool) -> Void = { [weak self] id, delay, repeats in
      self?.scheduleTimer(id: id, delay: delay, repeats: repeats)
    }
    context.setObject(schedule, forKeyedSubscript: "__tinySchedule" as NSString)

    let cancel: @convention(block) (Int) -> Void = { [weak self] id in
      self?.cancelTimer(id: id)
    }
    context.setObject(cancel, forKeyedSubscript: "__tinyCancelTimer" as NSString)

    let canvasSend: @convention(block) (String) -> Void = { [weak self] payload in
      self?.onCanvas?(payload)
    }
    context.setObject(canvasSend, forKeyedSubscript: "__tinyCanvasSend" as NSString)

    let canvasMeasure: @convention(block) (String, String) -> String = { font, text in
      CanvasTextMetrics.json(font: font, text: text)
    }
    context.setObject(canvasMeasure, forKeyedSubscript: "__tinyCanvasMeasureText" as NSString)
  }

  private func injectHostInfo(_ info: [String: Any], into context: JSContext) {
    guard
      let data = try? JSONSerialization.data(withJSONObject: info, options: [.sortedKeys]),
      let json = String(data: data, encoding: .utf8)
    else {
      return
    }
    context.evaluateScript("globalThis.__TINY_IOS__ = \(json)")
  }

  private func scheduleTimer(id: Int, delay: Double, repeats: Bool) {
    timers[id]?.invalidate()
    let milliseconds = delay.isFinite ? max(0, delay) : 0
    let interval = max(0.001, milliseconds / 1000)
    let timer = Timer(timeInterval: interval, repeats: repeats) { [weak self] _ in
      Task { @MainActor [weak self] in
        guard let self else { return }
        if !repeats {
          self.timers.removeValue(forKey: id)?.invalidate()
        }
        self.fireTimer(id: id)
      }
    }
    RunLoop.main.add(timer, forMode: .common)
    timers[id] = timer
  }

  private func cancelTimer(id: Int) {
    timers.removeValue(forKey: id)?.invalidate()
  }

  private func fireTimer(id: Int) {
    guard
      let context,
      let fire = context.objectForKeyedSubscript("__tinyFireTimer"),
      !fire.isUndefined
    else {
      return
    }
    fire.call(withArguments: [id])
  }
}

private enum CanvasTextMetrics {
  static func json(font: String, text: String) -> String {
    let resolved = resolveFont(font)
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    var width: CGFloat = 0
    var ascent: CGFloat = 0
    var descent: CGFloat = 0
    var leading: CGFloat = 0
    var actualAscent: CGFloat = 0
    var actualDescent: CGFloat = 0

    for line in lines.isEmpty ? [""] : lines {
      let attributed = NSAttributedString(string: line, attributes: [.font: resolved])
      let lineRef = CTLineCreateWithAttributedString(attributed)
      var lineAscent: CGFloat = 0
      var lineDescent: CGFloat = 0
      var lineLeading: CGFloat = 0
      let lineWidth = CGFloat(CTLineGetTypographicBounds(
        lineRef,
        &lineAscent,
        &lineDescent,
        &lineLeading
      ))
      width = max(width, lineWidth)
      ascent = max(ascent, lineAscent)
      descent = max(descent, lineDescent)
      leading = max(leading, lineLeading)
      let bounds = CTLineGetBoundsWithOptions(lineRef, .useGlyphPathBounds)
      actualAscent = max(actualAscent, -bounds.minY)
      actualDescent = max(actualDescent, bounds.maxY)
    }

    let payload: [String: Any] = [
      "width": Double(width),
      "actualBoundingBoxLeft": 0,
      "actualBoundingBoxRight": Double(width),
      "actualBoundingBoxAscent": Double(actualAscent),
      "actualBoundingBoxDescent": Double(actualDescent),
      "fontBoundingBoxAscent": Double(ascent),
      "fontBoundingBoxDescent": Double(descent),
      "emHeightAscent": Double(ascent),
      "emHeightDescent": Double(descent),
      "lineHeight": Double(ascent + descent + leading),
    ]
    guard
      let data = try? JSONSerialization.data(withJSONObject: payload),
      let result = String(data: data, encoding: .utf8)
    else {
      return "{\"width\":0}"
    }
    return result
  }

  private static func resolveFont(_ spec: String) -> UIFont {
    let matched = spec.range(of: #"(\d+(?:\.\d+)?)px"#, options: .regularExpression)
    let size = matched
      .flatMap { Double(spec[$0].replacingOccurrences(of: "px", with: "")) }
      .map { CGFloat(max(1, $0)) } ?? 10
    let lower = spec.lowercased()
    let weight: UIFont.Weight = lower.contains("bold") ? .bold : .regular
    var font = UIFont.systemFont(ofSize: size, weight: weight)

    if let pxRange = matched {
      let tail = String(spec[pxRange.upperBound...])
      let family = tail
        .split(separator: ",")
        .first?
        .trimmingCharacters(in: CharacterSet(charactersIn: " \"'"))
        .lowercased() ?? ""
      if !family.isEmpty {
        let mapped: String?
        switch family {
        case "sans-serif", "system-ui", "-apple-system": mapped = nil
        case "serif": mapped = "Times New Roman"
        case "monospace": mapped = "Menlo"
        default: mapped = family
        }
        if let mapped, let custom = UIFont(name: mapped, size: size) {
          font = custom
        }
      }
    }

    if lower.contains("italic") || lower.contains("oblique") {
      let descriptor = font.fontDescriptor.withSymbolicTraits(.traitItalic)
      font = descriptor.map { UIFont(descriptor: $0, size: size) } ?? font
    }
    return font
  }
}

enum ServiceEngineError: LocalizedError {
  case missingBundle
  case missingEngine
  case missingAppData(String)
  case contextUnavailable
  case evaluationFailed(String)
  case receiverMissing

  var errorDescription: String? {
    switch self {
    case .missingBundle:
      return "应用资源目录不可用"
    case .missingEngine:
      return "缺少 Generated/service-engine.js，请先运行 pnpm ios:assets"
    case .missingAppData(let appId):
      return "缺少 \(appId) 的 app-data.json，请先运行 pnpm ios:assets"
    case .contextUnavailable:
      return "无法创建 JavaScriptCore 上下文"
    case .evaluationFailed(let message):
      return "service engine 执行失败：\(message)"
    case .receiverMissing:
      return "service engine 没有安装 __tinyReceiveFrame"
    }
  }
}
