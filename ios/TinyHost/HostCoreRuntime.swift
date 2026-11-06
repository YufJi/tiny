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
  private let smoke: Bool
  private var core: HostCoreSession?
  private var initialPageId: String?
  private var smokeNavigationStarted = false
  private var surfaces: [String: NativeRenderSurface] = [:]
  private var storage: [String: Any] = [:]
  private let storagePrefix: String
  private var activePageId: String?
  private var displayedStack: [String] = []
  private var deferredDestroyIds: Set<String> = []
  private var pendingBackTransition = false
  private var pendingTabTransition = false
  private var pageTransitionInProgress = false
  private var interactiveBackActive = false
  private var interactiveBackPreviousId: String?
  private var interactiveBackCurrentId: String?
  private var finished = false
  private var meta: [String: Any] = [:]
  private var manifest: [String: Any] = [:]
  private var systemInfo: [String: Any] = [:]
  private var nativePicker: NativePickerController?
  private var pickerSessionId: String?
  private var pickerColumns: [[String: Any]] = []

  var onReady: ((String) -> Void)?
  var onUIState: ((HostUIState) -> Void)?
  var onError: ((String) -> Void)?

  init(app: AppInfo, generatedRoot: URL, container: UIView, smoke: Bool = false) {
    self.app = app
    self.generatedRoot = generatedRoot
    self.container = container
    self.smoke = smoke
    self.storagePrefix = "tiny.storage.\(app.id)."
    self.storage = Self.loadStorage(prefix: "tiny.storage.\(app.id).")
    super.init()
    container.clipsToBounds = true
    let gesture = UIScreenEdgePanGestureRecognizer(
      target: self,
      action: #selector(handleBackEdgePan(_:))
    )
    gesture.edges = .left
    container.addGestureRecognizer(gesture)
  }

  private static func loadStorage(prefix: String) -> [String: Any] {
    var values: [String: Any] = [:]
    for (key, value) in UserDefaults.standard.dictionaryRepresentation() where key.hasPrefix(prefix) {
      guard let text = value as? String,
            let data = text.data(using: .utf8),
            let decoded = try? JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed])
      else { continue }
      values[String(key.dropFirst(prefix.count))] = decoded
    }
    return values
  }

  private func persistStorageValue(_ key: String, _ value: Any?) {
    let storageKey = storagePrefix + key
    guard let value else {
      UserDefaults.standard.removeObject(forKey: storageKey)
      return
    }
    guard JSONSerialization.isValidJSONObject(["value": value]),
          let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed]),
          let text = String(data: data, encoding: .utf8)
    else { return }
    UserDefaults.standard.set(text, forKey: storageKey)
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
    self.systemInfo = HostSystemInfo.current().system

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
      hostInfo: systemInfo,
      syncHostCall: { [weak self] method, payload in
        self?.handleSyncHostCall(method: method, payload: payload) ?? "null"
      }
    )

    let config: [String: Any] = [
      "appId": app.id,
      "manifest": manifest,
      "initialPath": app.firstPage,
      "maxPageStack": 10,
    ]
    let core = try HostCoreSession(config: config, sink: self)
    self.core = core
    try core.start()
  }

  func back(delta: Int = 1) {
    guard let core else { return }
    pendingBackTransition = true
    pendingTabTransition = false
    try? core.command(["type": "navigateBack", "delta": delta])
  }

  func switchTab(index: Int) {
    guard let core else { return }
    pendingTabTransition = true
    pendingBackTransition = false
    try? core.command(["type": "switchTab", "index": index])
  }

  func setVisible(_ visible: Bool) {
    try? core?.command(["type": "setPageVisible", "visible": visible])
  }

  func close() {
    nativePicker?.dismiss(animated: false)
    nativePicker = nil
    for surface in surfaces.values {
      surface.destroy()
    }
    surfaces.removeAll()
    deferredDestroyIds.removeAll()
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
    deferredDestroyIds.remove(pageId)
    surfaces[pageId] = surface
    container.addSubview(surface.webView)
    surface.setVisible(false)
    _ = path
  }

  func activatePage(pageId: String) {
    let previousId = activePageId
    guard let newSurface = surfaces[pageId] else {
      activePageId = pageId
      return
    }
    let newStack = core?.pageStack() ?? []

    if initialPageId == nil {
      initialPageId = pageId
      activePageId = pageId
      displayedStack = newStack
      newSurface.setVisible(true)
      if !finished {
        finished = true
        let result: [String: Any] = [
          "ok": true,
          "appId": app.id,
          "pageId": pageId,
          "pageStack": newStack,
        ]
        HostDebug.writeResult(result, name: "native-hostcore-smoke.json")
        onReady?(pageId)
      }
      if smoke {
        runSmokeNavigation()
      }
      return
    }

    if previousId == pageId {
      newSurface.setVisible(true)
      return
    }

    let oldSurface = previousId.flatMap { surfaces[$0] }
    let kind = transitionKind(
      previousId: previousId,
      pageId: pageId,
      newStack: newStack,
      interactive: interactiveBackActive && interactiveBackPreviousId == pageId
    )
    activePageId = pageId
    displayedStack = newStack
    animatePageTransition(
      from: oldSurface,
      to: newSurface,
      kind: kind,
      interactive: interactiveBackActive && interactiveBackPreviousId == pageId,
      pageId: pageId
    )
  }

  private enum PageTransitionKind {
    case push
    case pop
    case fade
  }

  private func transitionKind(
    previousId: String?,
    pageId: String,
    newStack: [String],
    interactive: Bool
  ) -> PageTransitionKind {
    if interactive { return .pop }
    if pendingTabTransition { return .fade }
    if pendingBackTransition || newStack.count < displayedStack.count { return .pop }
    if let previousId,
       let oldIndex = displayedStack.firstIndex(of: previousId),
       let newIndex = newStack.firstIndex(of: pageId),
       newIndex > oldIndex {
      return .push
    }
    return .fade
  }

  private func animatePageTransition(
    from oldSurface: NativeRenderSurface?,
    to newSurface: NativeRenderSurface,
    kind: PageTransitionKind,
    interactive: Bool,
    pageId: String
  ) {
    pageTransitionInProgress = true
    let width = max(container.bounds.width, UIScreen.main.bounds.width)
    newSurface.setVisible(true)
    newSurface.webView.alpha = 1

    if kind == .fade {
      newSurface.webView.transform = .identity
      newSurface.webView.alpha = 0
      container.bringSubviewToFront(newSurface.webView)
    } else if kind == .push {
      newSurface.webView.transform = CGAffineTransform(translationX: width, y: 0)
      container.bringSubviewToFront(newSurface.webView)
    } else if let oldSurface {
      if !interactive {
        newSurface.webView.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
      }
      container.insertSubview(newSurface.webView, belowSubview: oldSurface.webView)
    }

    let duration = interactive ? 0.22 : 0.32
    UIView.animate(
      withDuration: duration,
      delay: 0,
      options: [.curveEaseInOut, .beginFromCurrentState, .allowUserInteraction]
    ) {
      newSurface.webView.transform = .identity
      newSurface.webView.alpha = 1
      if let oldSurface {
        switch kind {
        case .push:
          oldSurface.webView.transform = CGAffineTransform(translationX: -width, y: 0)
        case .pop:
          oldSurface.webView.transform = CGAffineTransform(translationX: width, y: 0)
        case .fade:
          oldSurface.webView.alpha = 0
        }
      }
    } completion: { [weak self] _ in
      guard let self else { return }
      oldSurface?.setVisible(false)
      oldSurface?.webView.transform = .identity
      oldSurface?.webView.alpha = 1
      newSurface.webView.transform = .identity
      newSurface.webView.alpha = 1
      self.container.bringSubviewToFront(newSurface.webView)
      self.pageTransitionInProgress = false
      self.interactiveBackActive = false
      self.interactiveBackPreviousId = nil
      self.interactiveBackCurrentId = nil
      self.pendingBackTransition = false
      self.pendingTabTransition = false
      self.finishDeferredDestroys(keeping: pageId)
      self.finishSmokeIfNeeded(pageId: pageId)
    }
  }

  private func finishDeferredDestroys(keeping pageId: String) {
    for id in deferredDestroyIds where id != pageId {
      surfaces.removeValue(forKey: id)?.destroy()
    }
    deferredDestroyIds.removeAll()
  }

  private func finishSmokeIfNeeded(pageId: String) {
    guard smokeNavigationStarted, pageId != initialPageId else { return }
    smokeNavigationStarted = false
    writeSmokeResult(navigated: true, pageId: pageId)
  }

  @objc private func handleBackEdgePan(_ gesture: UIScreenEdgePanGestureRecognizer) {
    let width = max(container.bounds.width, UIScreen.main.bounds.width)
    let currentId = activePageId

    switch gesture.state {
    case .began:
      guard !pageTransitionInProgress,
            !interactiveBackActive,
            let currentId,
            let stack = core?.pageStack(),
            let currentIndex = stack.firstIndex(of: currentId),
            currentIndex > 0,
            let current = surfaces[currentId]
      else { return }
      var previousId: String?
      for index in stride(from: currentIndex - 1, through: 0, by: -1) where surfaces[stack[index]] != nil {
        previousId = stack[index]
        break
      }
      guard let previousId, let previous = surfaces[previousId] else { return }
      interactiveBackActive = true
      interactiveBackCurrentId = currentId
      interactiveBackPreviousId = previousId
      pageTransitionInProgress = true
      previous.setVisible(true)
      previous.webView.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
      container.insertSubview(previous.webView, belowSubview: current.webView)

    case .changed:
      guard interactiveBackActive,
            let currentId = interactiveBackCurrentId,
            let previousId = interactiveBackPreviousId,
            let current = surfaces[currentId],
            let previous = surfaces[previousId]
      else { return }
      let translation = min(max(gesture.translation(in: container).x, 0), width)
      let progress = translation / width
      current.webView.transform = CGAffineTransform(translationX: translation, y: 0)
      previous.webView.transform = CGAffineTransform(
        translationX: -width * 0.32 * (1 - progress),
        y: 0
      )

    case .ended, .cancelled, .failed:
      guard interactiveBackActive,
            let currentId = interactiveBackCurrentId,
            let previousId = interactiveBackPreviousId,
            let current = surfaces[currentId],
            let previous = surfaces[previousId]
      else { return }
      let translation = min(max(gesture.translation(in: container).x, 0), width)
      let progress = translation / width
      let velocity = gesture.velocity(in: container).x
      if gesture.state == .ended, progress > 0.32 || velocity > 500 {
        back()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
          guard let self,
                self.interactiveBackActive,
                self.activePageId == currentId
          else { return }
          self.cancelInteractiveBack(current: current, previous: previous, width: width)
        }
      } else {
        cancelInteractiveBack(current: current, previous: previous, width: width)
      }

    default:
      break
    }
  }

  private func cancelInteractiveBack(
    current: NativeRenderSurface,
    previous: NativeRenderSurface,
    width: CGFloat
  ) {
    pageTransitionInProgress = true
    UIView.animate(withDuration: 0.22, delay: 0, options: [.curveEaseOut, .beginFromCurrentState]) {
      current.webView.transform = .identity
      previous.webView.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
    } completion: { [weak self] _ in
      guard let self else { return }
      previous.setVisible(false)
      previous.webView.transform = .identity
      current.webView.transform = .identity
      self.pageTransitionInProgress = false
      self.interactiveBackActive = false
      self.interactiveBackPreviousId = nil
      self.interactiveBackCurrentId = nil
      self.pendingBackTransition = false
    }
  }

  private func runSmokeNavigation() {
    let pages = manifest["pages"] as? [[String: Any]] ?? []
    var tabPages = Set<String>()
    var tabTargets: [(path: String, index: Int)] = []
    if let app = manifest["app"] as? [String: Any],
       let configuration = app["configuration"] as? [String: Any],
       let effective = configuration["effective"] as? [String: Any],
       let tabBar = effective["tabBar"] as? [String: Any],
       let list = tabBar["list"] as? [[String: Any]] {
      for (index, item) in list.enumerated() {
        guard var path = item["pagePath"] as? String else { continue }
        if path.hasPrefix("/") { path.removeFirst() }
        tabPages.insert(path)
        tabTargets.append((path, index))
      }
    }
    let next = pages.first {
      guard let path = $0["path"] as? String else { return false }
      return path != app.firstPage && ($0["bodyType"] as? String) != "component" && !tabPages.contains(path)
    }
    if let path = next?["path"] as? String {
      smokeNavigationStarted = true
      try? core?.command(["type": "navigateTo", "url": "/\(path)"])
      return
    }
    if let target = tabTargets.first(where: { $0.path != app.firstPage }) {
      smokeNavigationStarted = true
      pendingTabTransition = true
      try? core?.command([
        "type": "switchTab",
        "index": target.index,
        "url": "/\(target.path)",
      ])
      return
    }
    writeSmokeResult(navigated: false, pageId: initialPageId)
  }

  private func writeSmokeResult(navigated: Bool, pageId: String?) {
    HostDebug.writeResult([
      "appId": app.id,
      "runId": HostDebug.runId,
      "ok": true,
      "type": "smoke",
      "details": [
        "appId": app.id,
        "firstPage": app.firstPage,
        "navigated": navigated,
        "native": true,
        "pageId": pageId ?? "",
      ],
    ], name: "smoke-result.json")
  }

  func destroyPage(pageId: String) {
    if pageId == activePageId || pageTransitionInProgress {
      deferredDestroyIds.insert(pageId)
      return
    }
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

  func renderHostRequest(
    requestId: String,
    pageId: String,
    method: String,
    payload: [String: Any]
  ) {
    if method == "pollPicker" {
      let sessionId = payload["sessionId"] as? String ?? ""
      let events = sessionId == pickerSessionId ? pickerColumns : []
      pickerColumns = []
      try? core?.renderHostResult(requestId: requestId, result: ["events": events])
      return
    }
    if method == "updatePicker" {
      nativePicker?.applyUpdate(payload)
      try? core?.renderHostResult(requestId: requestId, result: ["status": "ok"])
      return
    }
    guard method == "showPicker" else {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "unsupported host request: \(method)"]
      )
      return
    }
    guard nativePicker == nil else {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showPickerView:fail another picker is open"]
      )
      return
    }
    let mode = payload["mode"] as? String ?? "selector"
    let range = payload["range"] as? [Any] ?? []
    if (mode == "selector" || mode == "multiSelector") && range.isEmpty {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showPickerView:fail range is empty"]
      )
      return
    }
    guard let presenter = topViewController() else {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showPickerView:fail no host view controller"]
      )
      return
    }
    pickerSessionId = payload["sessionId"] as? String
    pickerColumns = []
    let picker = NativePickerController(payload: payload) { [weak self] result in
      guard let self else { return }
      self.nativePicker = nil
      self.pickerSessionId = nil
      self.pickerColumns = []
      do {
        try self.core?.renderHostResult(requestId: requestId, result: result)
      } catch {
        self.fail("HostCore render host result failed: \(error)")
      }
    }
    picker.onColumnChange = { [weak self] column, row in
      self?.pickerColumns.append(["column": column, "value": row])
    }
    nativePicker = picker
    presenter.present(picker, animated: true)
    _ = pageId
  }

  private func topViewController() -> UIViewController? {
    let root = container.window?.rootViewController
      ?? UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first(where: { $0.isKeyWindow })?
        .rootViewController
    var top = root
    while let presented = top?.presentedViewController {
      top = presented
    }
    return top
  }

  /// Synchronous host call for WeChat's `*Sync` APIs (JSCore block).
  /// Returns a JSON string; `null` means the call failed.
  private func handleSyncHostCall(method: String, payload: String) -> String {
    let params = (payload.data(using: .utf8))
      .flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
      ?? [:]
    let result: [String: Any]
    switch method {
    case "system.info":
      result = systemInfo
    case "storage.get":
      let key = params["key"] as? String ?? ""
      result = ["value": storage[key] ?? NSNull()]
    case "storage.set":
      let key = params["key"] as? String ?? ""
      let value = params["value"] ?? NSNull()
      storage[key] = value
      persistStorageValue(key, value)
      result = ["errMsg": "setStorageSync:ok"]
    case "storage.remove":
      let key = params["key"] as? String ?? ""
      storage.removeValue(forKey: key)
      UserDefaults.standard.removeObject(forKey: storagePrefix + key)
      result = ["errMsg": "removeStorageSync:ok"]
    case "storage.clear":
      for key in storage.keys {
        UserDefaults.standard.removeObject(forKey: storagePrefix + key)
      }
      storage.removeAll()
      result = ["errMsg": "clearStorageSync:ok"]
    case "storage.info":
      result = [
        "keys": Array(storage.keys),
        "currentSize": 0,
        "limitSize": 10240,
      ]
    default:
      result = ["error": "unsupported synchronous host API: \(method)"]
    }
    guard let data = try? JSONSerialization.data(withJSONObject: result),
          let text = String(data: data, encoding: .utf8)
    else { return "null" }
    return text
  }

  func platformCall(
    requestId: String,
    method: String,
    params: [String: Any],
    pageId: String?
  ) {
    do {
      switch method {
      case "system.info":
        try core?.platformResult(requestId: requestId, result: systemInfo)
      case "storage.get":
        let key = params["key"] as? String ?? ""
        try core?.platformResult(requestId: requestId, result: ["value": storage[key] ?? NSNull()])
      case "storage.set":
        let key = params["key"] as? String ?? ""
        let value = params["value"] ?? NSNull()
        storage[key] = value
        persistStorageValue(key, value)
        try core?.platformResult(requestId: requestId, result: ["errMsg": "setStorageSync:ok"])
      case "storage.remove":
        let key = params["key"] as? String ?? ""
        storage.removeValue(forKey: key)
        UserDefaults.standard.removeObject(forKey: storagePrefix + key)
        try core?.platformResult(requestId: requestId, result: ["errMsg": "removeStorageSync:ok"])
      case "storage.clear":
        for key in storage.keys {
          UserDefaults.standard.removeObject(forKey: storagePrefix + key)
        }
        storage.removeAll()
        try core?.platformResult(requestId: requestId, result: ["errMsg": "clearStorageSync:ok"])
      case "storage.info":
        try core?.platformResult(requestId: requestId, result: [
          "keys": Array(storage.keys),
          "currentSize": 0,
          "limitSize": 10240,
        ])
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
