import Foundation
import UIKit

/// Native iOS host runtime: Rust HostCore + JSCore service + one WKWebView per page.
///
/// This is the migration target for `host.html + createTinyRuntime`. It is
/// currently exercised by the smoke path; the existing JS shell remains the
/// production fallback until parity is complete.
@MainActor
final class HostCoreRuntime: NSObject, HostCoreActionSink {
  let app: AppInfo
  let generatedRoot: URL
  let container: UIView

  private let service = ServiceEngine()
  private var core: HostCoreSession?
  private var surfaces: [String: NativeRenderSurface] = [:]
  private var storage: [String: Any] = [:]
  private var activePageId: String?
  private var finished = false

  var onReady: ((String) -> Void)?
  var onError: ((String) -> Void)?

  init(app: AppInfo, generatedRoot: URL, container: UIView) {
    self.app = app
    self.generatedRoot = generatedRoot
    self.container = container
    super.init()
  }

  func start() throws {
    let metaFile = generatedRoot.appendingPathComponent("apps/\(app.id)/meta.json")
    let data = try Data(contentsOf: metaFile)
    let meta = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
    guard let manifest = meta["manifest"] as? [String: Any] else {
      throw RuntimeError.missingManifest
    }
    let systemInfo = HostSystemInfo.current().system

    service.onFrame = { [weak self] frame in
      guard let self, let core = self.core else { return }
      do {
        try core.receiveServiceFrame(frame)
      } catch {
        self.fail("HostCore service event failed: \(error)")
      }
    }
    service.onError = { [weak self] message in
      self?.fail("JSCore service error: \(message)")
    }
    service.onLog = { level, message in
      HostDebug.log("native service [\(level)] \(message)")
    }

    try service.start(
      appId: app.id,
      hostInfo: systemInfo
    )

    let config: [String: Any] = [
      "appId": app.id,
      "manifest": manifest,
      "initialPath": app.firstPage,
      "systemInfo": systemInfo,
      "storage": storage,
      "maxPageStack": 10,
    ]
    let core = try HostCoreSession(config: config, sink: self)
    self.core = core
    try core.start()
  }

  func close() {
    for surface in surfaces.values {
      surface.destroy()
    }
    surfaces.removeAll()
    core = nil
    service.stop()
  }

  // MARK: HostCoreActionSink

  func sendServiceFrame(_ frame: String) {
    service.receive(frame)
  }

  func sendRenderFrame(pageId: String, frame: String) {
    surfaces[pageId]?.receive(frame: frame)
  }

  func createPage(pageId: String, path: String) {
    let surface = NativeRenderSurface(
      pageId: pageId,
      appId: app.id,
      generatedRoot: generatedRoot
    )
    surface.webView.frame = container.bounds
    surface.webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    surface.onFrame = { [weak self] frame in
      guard let self, let core = self.core else { return }
      do {
        try core.receiveRenderFrame(pageId: pageId, frame: frame)
      } catch {
        self.fail("HostCore render event failed: \(error)")
      }
    }
    surface.onReady = { [weak self] in
      guard let self, let core = self.core else { return }
      do {
        try core.pageReady(pageId: pageId)
      } catch {
        self.fail("HostCore pageReady failed: \(error)")
      }
    }
    surface.onError = { [weak self] message in
      self?.fail("render page \(pageId) failed: \(message)")
    }
    surfaces[pageId] = surface
    container.addSubview(surface.webView)
    surface.setVisible(false)
    _ = path
  }

  func activatePage(pageId: String) {
    activePageId = pageId
    for (id, surface) in surfaces {
      surface.setVisible(id == pageId)
    }
    if !finished {
      finished = true
      let result: [String: Any] = [
        "ok": true,
        "appId": app.id,
        "pageId": pageId,
        "pageStack": core?.pageStack() ?? [],
      ]
      HostDebug.writeResult(result, name: "native-hostcore-smoke.json")
      onReady?(pageId)
    }
  }

  func destroyPage(pageId: String) {
    surfaces.removeValue(forKey: pageId)?.destroy()
  }

  func setAppVisible(_ visible: Bool) {
    container.isHidden = !visible
  }

  func updateUIState(_ state: [String: Any]) {
    HostDebug.log("native HostCore state \(state)")
  }

  func platformCall(
    requestId: String,
    method: String,
    params: [String: Any],
    pageId: String?
  ) {
    do {
      switch method {
      case "storage.get":
        let key = params["key"] as? String ?? ""
        try core?.platformResult(requestId: requestId, result: ["value": storage[key] ?? NSNull()])
      case "storage.set":
        let key = params["key"] as? String ?? ""
        storage[key] = params["value"] ?? NSNull()
        try core?.platformResult(requestId: requestId, result: ["errMsg": "setStorageSync:ok"])
      case "storage.remove":
        storage.removeValue(forKey: params["key"] as? String ?? "")
        try core?.platformResult(requestId: requestId, result: ["errMsg": "removeStorageSync:ok"])
      case "storage.clear":
        storage.removeAll()
        try core?.platformResult(requestId: requestId, result: ["errMsg": "clearStorageSync:ok"])
      default:
        try core?.platformResult(requestId: requestId, result: ["errMsg": "\(method):ok"])
      }
    } catch {
      fail("HostCore platform result failed: \(error)")
    }
  }

  func commandResult(command: String, result: Any?) {
    HostDebug.log("native HostCore command result \(command): \(String(describing: result))")
  }

  func hostDiagnostic(level: String, payload: [String: Any]) {
    let code = payload["code"] as? String ?? "HOST_CORE"
    let message = payload["message"] as? String ?? ""
    HostDebug.log("native HostCore diagnostic [\(level)] \(code): \(message)")
  }

  private func fail(_ message: String) {
    HostDebug.log("native HostCore error: \(message)")
    HostDebug.writeResult(["ok": false, "error": message], name: "native-hostcore-smoke.json")
    onError?(message)
  }
}

private enum RuntimeError: LocalizedError {
  case missingManifest
  var errorDescription: String? { "Generated app meta.json has no manifest" }
}

@MainActor
enum NativeHostCoreSmoke {
  private static var runtime: HostCoreRuntime?
  private static var container: UIView?

  static func run() {
    guard runtime == nil, let resourceRoot = Bundle.main.resourceURL else { return }
    do {
      let apps = try AppRegistry.load()
      guard let demo = apps.first(where: { $0.id == "demo" }) else { return }
      let generatedRoot = resourceRoot.appendingPathComponent("Generated", isDirectory: true)
      let host = UIView(frame: CGRect(x: 0, y: 0, width: 390, height: 844))
      host.isHidden = true
      if let window = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .flatMap({ $0.windows })
        .first(where: { $0.isKeyWindow }) {
        window.addSubview(host)
      }
      let runtime = HostCoreRuntime(app: demo, generatedRoot: generatedRoot, container: host)
      runtime.onError = { message in
        HostDebug.log("native HostCore smoke error: \(message)")
      }
      self.container = host
      self.runtime = runtime
      try runtime.start()
      HostDebug.log("native HostCore smoke started")
    } catch {
      HostDebug.writeResult(["ok": false, "error": String(describing: error)], name: "native-hostcore-smoke.json")
    }
  }
}
