import Foundation

/// Native sink executed by the Swift host adapter for each Rust HostCore action.
/// The transport/page layer implements this; HostCoreSession stays free of
/// WebKit and JavaScriptCore details.
protocol HostCoreActionSink: AnyObject {
  func sendServiceFrame(_ frame: String)
  func sendRenderFrame(pageId: String, frame: String)
  func createPage(pageId: String, path: String)
  func activatePage(pageId: String)
  func destroyPage(pageId: String)
  func setAppVisible(_ visible: Bool)
  func updateUIState(_ state: [String: Any])
  func platformCall(requestId: String, method: String, params: [String: Any], pageId: String?)
  func commandResult(command: String, result: Any?)
  func hostDiagnostic(level: String, payload: [String: Any])
}

/// Swift side adapter around UniFFI `RustHostCore`.
///
/// The future native session owns one of these, feeds service/render frames
/// into it and implements `HostCoreActionSink` with WKWebView/JavaScriptCore.
final class HostCoreSession {
  private let core: RustHostCore
  weak var sink: HostCoreActionSink?

  init(config: [String: Any], sink: HostCoreActionSink? = nil) throws {
    guard
      JSONSerialization.isValidJSONObject(config),
      let data = try? JSONSerialization.data(withJSONObject: config),
      let json = String(data: data, encoding: .utf8)
    else {
      throw HostCoreSessionError.invalidConfig
    }
    self.core = try RustHostCore(configJson: json)
    self.sink = sink
  }

  func start(nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.start(nowMs: nowMs))
  }

  func receiveServiceFrame(_ frame: String, nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.handleEvent(eventJson: try eventJSON([
      "type": "serviceFrame",
      "frame": frame,
    ]), nowMs: nowMs))
  }

  func receiveRenderFrame(pageId: String, frame: String, nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.handleEvent(eventJson: try eventJSON([
      "type": "renderFrame",
      "pageId": pageId,
      "frame": frame,
    ]), nowMs: nowMs))
  }

  func pageReady(pageId: String, nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.handleEvent(eventJson: try eventJSON([
      "type": "pageReady",
      "pageId": pageId,
    ]), nowMs: nowMs))
  }

  func pageFailed(pageId: String, error: String, nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.handleEvent(eventJson: try eventJSON([
      "type": "pageFailed",
      "pageId": pageId,
      "error": error,
    ]), nowMs: nowMs))
  }

  func platformResult(
    requestId: String,
    result: Any? = nil,
    error: String? = nil,
    nowMs: UInt64 = hostCoreNowMs()
  ) throws -> Int {
    var payload: [String: Any] = ["requestId": requestId]
    if let result { payload["result"] = result }
    if let error { payload["error"] = error }
    return try dispatch(core.handleEvent(
      eventJson: try eventJSON({
        var event: [String: Any] = ["type": "platformResult"]
        event.merge(payload) { _, new in new }
        return event
      }()),
      nowMs: nowMs
    ))
  }

  func command(_ command: [String: Any], nowMs: UInt64 = hostCoreNowMs()) throws -> Int {
    try dispatch(core.handleEvent(
      eventJson: try eventJSON(["type": "command", "command": command]),
      nowMs: nowMs
    ))
  }

  func setAppVisible(_ visible: Bool) throws -> Int {
    try dispatch(core.setAppVisible(visible: visible))
  }

  func pageStack() -> [String] {
    guard
      let json = try? core.pageStackJson(),
      let data = json.data(using: .utf8),
      let stack = try? JSONSerialization.jsonObject(with: data) as? [String]
    else { return [] }
    return stack
  }

  func diagnostics() -> [[String: Any]] {
    guard
      let json = try? core.diagnosticsJson(),
      let data = json.data(using: .utf8),
      let diagnostics = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
    else { return [] }
    return diagnostics
  }

  @discardableResult
  private func dispatch(_ actionsJSON: String) throws -> Int {
    guard
      let data = actionsJSON.data(using: .utf8),
      let actions = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
    else {
      throw HostCoreSessionError.invalidActions
    }
    for action in actions {
      guard let type = action["type"] as? String else { continue }
      switch type {
      case "sendServiceFrame":
        if let frame = action["frame"] as? [String: Any],
           let json = try? eventJSON(frame) {
          sink?.sendServiceFrame(json)
        }
      case "sendRenderFrame":
        if let pageId = action["pageId"] as? String,
           let frame = action["frame"] as? [String: Any],
           let json = try? eventJSON(frame) {
          sink?.sendRenderFrame(pageId: pageId, frame: json)
        }
      case "createPage":
        if let pageId = action["pageId"] as? String,
           let path = action["path"] as? String {
          sink?.createPage(pageId: pageId, path: path)
        }
      case "activatePage":
        if let pageId = action["pageId"] as? String {
          sink?.activatePage(pageId: pageId)
        }
      case "destroyPage":
        if let pageId = action["pageId"] as? String {
          sink?.destroyPage(pageId: pageId)
        }
      case "setAppVisible":
        sink?.setAppVisible(action["visible"] as? Bool ?? true)
      case "updateUIState":
        if let state = action["state"] as? [String: Any] {
          sink?.updateUIState(state)
        }
      case "platformCall":
        if let requestId = action["requestId"] as? String,
           let method = action["method"] as? String {
          sink?.platformCall(
            requestId: requestId,
            method: method,
            params: action["params"] as? [String: Any] ?? [:],
            pageId: action["pageId"] as? String
          )
        }
      case "commandResult":
        if let command = action["command"] as? String {
          sink?.commandResult(command: command, result: action["result"])
        }
      case "diagnostic":
        if let payload = action["payload"] as? [String: Any] {
          sink?.hostDiagnostic(
            level: action["level"] as? String ?? "log",
            payload: payload
          )
        }
      default:
        break
      }
    }
    return actions.count
  }

  private func eventJSON(_ value: [String: Any]) throws -> String {
    let data = try JSONSerialization.data(withJSONObject: value)
    return String(decoding: data, as: UTF8.self)
  }

}

private func hostCoreNowMs() -> UInt64 {
  UInt64(Date().timeIntervalSince1970 * 1000)
}

enum HostCoreSessionError: LocalizedError {
  case invalidConfig
  case invalidActions

  var errorDescription: String? {
    switch self {
    case .invalidConfig: return "HostCore config is not JSON-serializable"
    case .invalidActions: return "HostCore returned invalid actions"
    }
  }
}
