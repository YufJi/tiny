import Foundation
import JavaScriptCore

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
