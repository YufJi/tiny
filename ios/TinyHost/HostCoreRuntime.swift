import Foundation
import UIKit

/// Native iOS host runtime: Rust HostCore + JSCore service + one WKWebView per page.
///
/// This is the native replacement for the removed `host.html +
/// createTinyRuntime` shell.
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
  private var meta: [String: Any] = [:]
  private var manifest: [String: Any] = [:]

  var onReady: ((String) -> Void)?
  var onUIState: ((HostUIState) -> Void)?
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
    self.meta = meta
    self.manifest = manifest
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
    service.onCanvas = { [weak self] payload in
      guard let self else { return }
      let pageId = (try? JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: Any])?["pageId"] as? String
      let target = pageId ?? self.activePageId
      if let target, let surface = self.surfaces[target] {
        surface.receiveCanvas(payload: payload)
      }
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

  func back(delta: Int = 1) {
    try? core?.command(["type": "navigateBack", "delta": delta])
  }

  func switchTab(index: Int) {
    try? core?.command(["type": "switchTab", "index": index])
  }

  func setVisible(_ visible: Bool) {
    try? core?.command(["type": "setPageVisible", "visible": visible])
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
    guard let details = state["details"] as? [String: Any] else {
      HostDebug.log("native UIState missing details: \(state)")
      return
    }
    if let uiState = buildUIState(details) {
      HostDebug.log("native UIState built \(uiState.path) \(uiState.title)")
      onUIState?(uiState)
    } else {
      HostDebug.log("native UIState decode failed: \(details)")
    }
  }

  private func buildUIState(_ details: [String: Any]) -> HostUIState? {
    let stack = details["pageStack"] as? [String] ?? []
    let currentPath = details["currentPage"] as? String ?? ""
    let pages = manifest["pages"] as? [[String: Any]] ?? []
    let page = pages.first { ($0["path"] as? String) == currentPath }
    let appWindow = ((manifest["app"] as? [String: Any])?["configuration"] as? [String: Any])
      .flatMap { $0["effective"] as? [String: Any] } ?? [:]
    let pageConfig = ((page?["configuration"] as? [String: Any])?["effective"] as? [String: Any]) ?? [:]
    let merged = appWindow.merging(pageConfig) { _, new in new }
    let title = (merged["navigationBarTitleText"] as? String).flatMap { $0.isEmpty ? nil : $0 }
      ?? app.title
    let nav = NavState(
      custom: (merged["navigationStyle"] as? String) == "custom",
      backgroundColor: (merged["navigationBarBackgroundColor"] as? String) ?? "#ffffff",
      textStyle: (merged["navigationBarTextStyle"] as? String) == "white" ? "white" : "black"
    )
    var tabBar: TabBarState?
    if let raw = details["tabBar"],
       JSONSerialization.isValidJSONObject(raw),
       let data = try? JSONSerialization.data(withJSONObject: raw) {
      tabBar = try? JSONDecoder().decode(TabBarState.self, from: data)
    }
    return HostUIState(
      appId: app.id,
      pageId: stack.last,
      path: currentPath,
      title: title,
      canBack: stack.count > 1,
      nav: nav,
      tabBar: tabBar
    )
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
