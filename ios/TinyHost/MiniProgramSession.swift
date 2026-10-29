import Foundation
import SwiftUI
import UIKit
import WebKit

@MainActor
final class MiniProgramSession: ObservableObject {
  let app: AppInfo
  let smoke: Bool
  let systemInfo: HostSystemInfo
  let generatedRoot: URL

  @Published private(set) var uiState: HostUIState?
  @Published private(set) var loading = true
  @Published private(set) var errorMessage: String?

  let relay = FrameRelay()
  let service = ServiceEngine()

  private weak var webView: WKWebView?
  private var hostReady = false
  private var serviceReady = false
  private var pendingCanvas: [String] = []
  private var notifiedService = false
  private var started = false
  private var closed = false
  private var lastVisible = true

  init(app: AppInfo, smoke: Bool) {
    self.app = app
    self.smoke = smoke
    self.systemInfo = HostSystemInfo.current()
    let resourceRoot = Bundle.main.resourceURL ?? URL(fileURLWithPath: "/")
    self.generatedRoot = resourceRoot.appendingPathComponent("Generated", isDirectory: true)
  }

  var bootstrapScript: String {
    "window.__TINY_IOS__ = \(systemInfo.jsonString(appId: app.id, smoke: smoke));"
  }

  func attach(webView: WKWebView) {
    HostDebug.log("webview attached \(app.id)")
    self.webView = webView
    relay.deliverToHost = { [weak self] frame in
      self?.deliverToHost(frame)
    }
    startIfNeeded()
    notifyHostIfReady()
  }

  func startIfNeeded() {
    guard !started, !closed else { return }
    started = true

    relay.deliverToService = { [weak self] frame in
      self?.service.receive(frame)
    }
    service.onFrame = { [weak self] frame in
      self?.relay.fromService(frame)
    }
    service.onLog = { level, message in
      print("[tiny:\(level)] \(message)")
    }
    service.onError = { [weak self] message in
      self?.reportError(message)
    }
    service.onCanvas = { [weak self] payload in
      self?.deliverCanvas(payload)
    }

    do {
      try service.start(
        appId: app.id,
        hostInfo: systemInfo.payload(appId: app.id, smoke: smoke)
      )
      serviceReady = true
      relay.markServiceReady(true)
      notifyHostIfReady()
      if smoke {
        print("[tiny ios] smoke mode enabled for \(app.id)")
      }
    } catch {
      reportError((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
    }
  }

  func handleControl(_ body: [String: Any]) {
    guard let type = body["type"] as? String else { return }
    switch type {
    case "hostReady":
      HostDebug.log("host shell ready")
      hostReady = true
      flushCanvas()
      notifyHostIfReady()
    case "runtimeReady":
      HostDebug.log("host runtime ready")
      relay.markHostReady(true)
    case "frame":
      if let frame = body["frame"] as? String {
        relay.fromHost(frame)
      }
    case "state":
      decodeState(body["state"])
    case "ready":
      HostDebug.log("bootstrap ready")
      HostDebug.writeResult(["appId": app.id, "runId": HostDebug.runId, "status": "ready"], name: "ready.json")
      loading = false
    case "error":
      reportError(body["message"] as? String ?? "unknown host error")
    case "console":
      let level = body["level"] as? String ?? "log"
      let message = body["message"] as? String ?? ""
      print("[web:\(level)] \(message)")
    case "diagnostic":
      let severity = body["severity"] as? String ?? "log"
      let code = body["code"] as? String ?? ""
      let message = body["message"] as? String ?? ""
      print("[tiny:\(severity)] \(code): \(message)")
    case "storage":
      handleStorage(body)
    case "smoke":
      handleSmoke(body)
    default:
      print("[tiny ios] unknown host control message: \(type)")
    }
  }

  func back() {
    guard hostReady else { return }
    sendCommand(["type": "back"])
  }

  func switchTab(_ index: Int) {
    guard hostReady else { return }
    sendCommand(["type": "switchTab", "index": index])
  }

  func setVisible(_ visible: Bool) {
    guard visible != lastVisible else { return }
    lastVisible = visible
    guard hostReady else { return }
    sendCommand(["type": "appVisible", "visible": visible])
  }

  func close() {
    guard !closed else { return }
    closed = true
    if hostReady {
      sendCommand(["type": "dispose"])
    }
    service.stop()
    webView = nil
    relay.deliverToHost = nil
    relay.deliverToService = nil
  }

  func loadAssetImage(_ path: String) -> UIImage? {
    var relative = path
    if relative.hasPrefix("/") {
      relative.removeFirst()
    }
    let url = generatedRoot
      .appendingPathComponent("apps/\(app.id)/assets/\(relative)")
    return UIImage(contentsOfFile: url.path)
  }

  private func decodeState(_ value: Any?) {
    guard
      let value,
      JSONSerialization.isValidJSONObject(value),
      let data = try? JSONSerialization.data(withJSONObject: value, options: []),
      let state = try? JSONDecoder().decode(HostUIState.self, from: data)
    else {
      print("[tiny ios] could not decode host state")
      return
    }
    uiState = state
    loading = false
    HostDebug.log("state \(state.path) title=\(state.title)")
    HostDebug.writeResult([
      "appId": app.id,
      "runId": HostDebug.runId,
      "title": state.title,
      "path": state.path,
      "pageId": state.pageId ?? "",
      "canBack": state.canBack,
      "tabBar": state.tabBar == nil ? "none" : "visible",
    ], name: "ui-state.json")
  }

  private func notifyHostIfReady() {
    guard hostReady, serviceReady, !notifiedService, let webView else { return }
    notifiedService = true
    webView.callAsyncJavaScript(
      "window.__tinyServiceReady()",
      arguments: [:],
      in: nil,
      in: .page
    ) { [weak self] result in
      if case .failure(let error) = result {
        self?.reportError("service ready handshake failed: \(error.localizedDescription)")
      }
    }
  }

  private func deliverCanvas(_ payload: String) {
    guard !closed else { return }
    guard hostReady, let webView else {
      pendingCanvas.append(payload)
      return
    }
    webView.callAsyncJavaScript(
      "window.__tinyCanvasCommand(payload)",
      arguments: ["payload": payload],
      in: nil,
      in: .page
    ) { [weak self] result in
      if case .failure(let error) = result {
        self?.reportError("canvas command failed: \(error.localizedDescription)")
      }
    }
  }

  private func flushCanvas() {
    guard let webView, !closed else { return }
    let pending = pendingCanvas
    pendingCanvas.removeAll()
    for payload in pending {
      webView.callAsyncJavaScript(
        "window.__tinyCanvasCommand(payload)",
        arguments: ["payload": payload],
        in: nil,
        in: .page
      ) { [weak self] result in
        if case .failure(let error) = result {
          self?.reportError("canvas command failed: \(error.localizedDescription)")
        }
      }
    }
  }

  private func deliverToHost(_ frame: String) {
    guard let webView, !closed else { return }
    webView.callAsyncJavaScript(
      "window.__tinyHostReceive(frame)",
      arguments: ["frame": frame],
      in: nil,
      in: .page
    ) { result in
      if case .failure(let error) = result {
        print("[tiny ios] failed to deliver a service frame: \(error.localizedDescription)")
      }
    }
  }

  private func sendCommand(_ command: [String: Any]) {
    guard let webView, !closed else { return }
    webView.callAsyncJavaScript(
      "return await window.__tinyHostCommand(command)",
      arguments: ["command": command],
      in: nil,
      in: .page
    ) { [weak self] result in
      if case .failure(let error) = result {
        self?.reportError("host command \(command["type"] ?? "") failed: \(error.localizedDescription)")
      }
    }
  }

  private func handleStorage(_ body: [String: Any]) {
    guard let requestId = (body["requestId"] as? NSNumber)?.intValue,
          let action = body["action"] as? String
    else {
      return
    }

    let defaults = UserDefaults.standard
    let prefix = "tiny.storage.\(app.id)."
    let key = body["key"] as? String ?? ""
    var result: [String: Any]

    switch action {
    case "all":
      var values: [String: Any] = [:]
      for (storedKey, storedValue) in defaults.dictionaryRepresentation() where storedKey.hasPrefix(prefix) {
        guard let text = storedValue as? String,
              let decoded = decodeJSON(text)
        else { continue }
        values[String(storedKey.dropFirst(prefix.count))] = decoded
      }
      result = ["ok": true, "value": values]
    case "get":
      if let text = defaults.string(forKey: prefix + key), let decoded = decodeJSON(text) {
        result = ["ok": true, "value": decoded]
      } else {
        result = ["ok": true, "value": NSNull()]
      }
    case "set":
      guard let text = encodeJSON(body["value"] ?? NSNull()) else {
        result = ["ok": false, "error": "storage value is not JSON-safe"]
        break
      }
      defaults.set(text, forKey: prefix + key)
      result = ["ok": true, "value": NSNull()]
    case "remove":
      defaults.removeObject(forKey: prefix + key)
      result = ["ok": true, "value": NSNull()]
    case "clear":
      for storedKey in defaults.dictionaryRepresentation().keys where storedKey.hasPrefix(prefix) {
        defaults.removeObject(forKey: storedKey)
      }
      result = ["ok": true, "value": NSNull()]
    case "info":
      var keys: [String] = []
      var size = 0
      for (storedKey, storedValue) in defaults.dictionaryRepresentation() where storedKey.hasPrefix(prefix) {
        keys.append(String(storedKey.dropFirst(prefix.count)))
        size += (storedValue as? String)?.count ?? 0
      }
      result = [
        "ok": true,
        "value": ["keys": keys, "currentSize": size, "limitSize": 10240],
      ]
    default:
      result = ["ok": false, "error": "unknown storage action: \(action)"]
    }

    webView?.callAsyncJavaScript(
      "window.__tinyStorageResult(requestId, result)",
      arguments: ["requestId": requestId, "result": result],
      in: nil,
      in: .page
    )
  }

  private func encodeJSON(_ value: Any) -> String? {
    guard JSONSerialization.isValidJSONObject(["value": value]) else { return nil }
    guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed]) else {
      return nil
    }
    return String(data: data, encoding: .utf8)
  }

  private func decodeJSON(_ text: String) -> Any? {
    guard let data = text.data(using: .utf8) else { return nil }
    return try? JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed])
  }

  private func handleSmoke(_ body: [String: Any]) {
    var result = body
    result["runId"] = HostDebug.runId
    HostDebug.writeResult(result, name: "smoke-result.json")
    HostDebug.log("smoke result ok=\(body["ok"] ?? "unknown")")
    if body["ok"] as? Bool != true {
      reportError("smoke failed: \(body["error"] as? String ?? "unknown error")")
    }
  }

  private func reportError(_ message: String) {
    HostDebug.log("error: \(message)")
    HostDebug.writeResult([
      "appId": app.id,
      "runId": HostDebug.runId,
      "error": message,
    ], name: "error.json")
    errorMessage = message
    loading = false
  }
}
