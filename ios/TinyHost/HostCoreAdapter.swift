import Foundation

/// Native smoke adapter around the UniFFI-generated `RustHostCore` object.
///
/// Transport/page adapters will call the same generated object; this first
/// bridge proves the UniFFI library is linked into the simulator app.
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
      let data = try? JSONSerialization.data(withJSONObject: config),
      let json = String(data: data, encoding: .utf8)
    else {
      return ["ok": false, "error": "could not encode HostCore config"]
    }
    do {
      let core = try RustHostCore(configJson: json)
      let actions = try core.start(nowMs: UInt64(Date().timeIntervalSince1970 * 1000))
      let stack = try core.pageStackJson()
      return [
        "ok": actions.contains("\"hello\""),
        "actions": actions,
        "pageStack": stack,
      ]
    } catch {
      return ["ok": false, "error": String(describing: error)]
    }
  }
}
