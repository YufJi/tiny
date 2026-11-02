import Foundation

/// Native HostCore adapter used by the iOS simulator smoke and the upcoming
/// service/render transports.
enum HostCoreAdapter {
  static func smoke() -> [String: Any] {
    let config: [String: Any] = [
      "appId": "native-smoke",
      "manifest": ["pages": [["path": "pages/index"]]],
      "initialPath": "pages/index",
      "systemInfo": ["platform": "ios"],
      "storage": [:],
      "maxPageStack": 10,
    ]
    guard
      JSONSerialization.isValidJSONObject(config),
      let configData = try? JSONSerialization.data(withJSONObject: config),
      let configJSON = String(data: configData, encoding: .utf8),
      let core = try? RustHostCore(configJson: configJSON)
    else {
      return ["ok": false, "error": "could not create RustHostCore"]
    }

    do {
      let helloActions = try core.start(nowMs: nowMs())
      guard helloActions.contains("\"hello\"") else {
        return ["ok": false, "error": "start did not emit runtime.hello"]
      }

      let ready = try core.handleEvent(
        eventJson: try eventJSON([
          "type": "serviceFrame",
          "frame": try frameJSON([
            message(
              kind: "control",
              domain: "runtime",
              method: "ready",
              source: "service",
              target: "host",
              payload: ["protocolVersion": 1, "role": "service", "capabilities": [:]]
            ),
          ]),
        ]),
        nowMs: nowMs() + 1
      )
      guard let bootstrapID = firstMessageID(in: ready, method: "bootstrap") else {
        return ["ok": false, "error": "service ready did not trigger bootstrap", "actions": ready]
      }

      let bootstrap = try core.handleEvent(
        eventJson: try eventJSON([
          "type": "serviceFrame",
          "frame": try frameJSON([
            message(
              kind: "reply",
              domain: "runtime",
              method: "bootstrap",
              source: "service",
              target: "host",
              payload: [
                "ok": true,
                "result": ["pageId": "page-1", "currentPath": "pages/index"],
              ],
              replyTo: bootstrapID
            ),
          ]),
        ]),
        nowMs: nowMs() + 2
      )
      let stack = try core.pageStackJson()
      let hasCreatePage = bootstrap.contains("\"createPage\"")
      let hasPage = stack.contains("\"page-1\"")
      return [
        "ok": hasCreatePage && hasPage,
        "hello": helloActions,
        "bootstrap": bootstrap,
        "pageStack": stack,
      ]
    } catch {
      return ["ok": false, "error": String(describing: error)]
    }
  }

  private static func nowMs() -> UInt64 {
    UInt64(Date().timeIntervalSince1970 * 1000)
  }

  private static func eventJSON(_ value: [String: Any]) throws -> String {
    let data = try JSONSerialization.data(withJSONObject: value)
    return String(decoding: data, as: UTF8.self)
  }

  private static func frameJSON(_ messages: [[String: Any]]) throws -> String {
    try eventJSON([
      "protocolVersion": 1,
      "messages": messages,
    ])
  }

  private static func message(
    kind: String,
    domain: String,
    method: String,
    source: String,
    target: String,
    payload: [String: Any],
    replyTo: String? = nil
  ) -> [String: Any] {
    var value: [String: Any] = [
      "protocolVersion": 1,
      "messageId": "smoke-\(method)-\(source)",
      "kind": kind,
      "domain": domain,
      "method": method,
      "source": source,
      "target": target,
      "payload": payload,
      "timestamp": nowMs(),
    ]
    if let replyTo { value["replyTo"] = replyTo }
    return value
  }

  private static func firstMessageID(in actions: String, method: String) -> String? {
    guard
      let data = actions.data(using: .utf8),
      let list = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
    else { return nil }
    for action in list {
      guard
        action["type"] as? String == "sendServiceFrame",
        let frame = action["frame"] as? [String: Any],
        let messages = frame["messages"] as? [[String: Any]]
      else { continue }
      for message in messages where message["method"] as? String == method {
        return message["messageId"] as? String
      }
    }
    return nil
  }
}
