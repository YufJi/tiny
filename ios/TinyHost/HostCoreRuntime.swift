import Foundation
import Network
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
  let hostInfo: HostSystemInfo

  private let service = ServiceEngine()
  private let smoke: Bool
  private var core: HostCoreSession?
  private var networkMonitor: NWPathMonitor?
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
  private var renderTemplatesSource: String?
  private var viewportSize: CGSize
  private var nativePicker: NativePickerController?
  private var pickerSessionId: String?
  private var pickerColumns: [[String: Any]] = []
  private var appVisible = true
  private var keyboardHeight: CGFloat = 0
  private var lastKeyboardHeight: CGFloat = 0
  private var pendingKeyboardRequests: [(requestId: String, pageId: String)] = []
  private var nativeKeyboard: NativeKeyboardHost?
  private var nativeKeyboardPageId: String?
  private var nativeKeyboardShowToken = 0
  private var pendingNativeKeyboardShow: (requestId: String, token: Int, ownerId: String)?

  var onReady: ((String) -> Void)?
  var onUIState: ((HostUIState) -> Void)?
  var onError: ((String) -> Void)?

  init(
    app: AppInfo,
    generatedRoot: URL,
    container: UIView,
    smoke: Bool = false,
    hostInfo: HostSystemInfo = .current(),
    viewportSize: CGSize = .zero
  ) {
    self.app = app
    self.generatedRoot = generatedRoot
    self.container = container
    self.smoke = smoke
    self.hostInfo = hostInfo
    self.viewportSize = viewportSize
    self.storagePrefix = "tiny.storage.\(app.id)."
    self.storage = Self.loadStorage(prefix: "tiny.storage.\(app.id).")
    super.init()
    let width = viewportSize.width > 0 ? viewportSize.width : hostInfo.screenWidth
    let height = viewportSize.height > 0 ? viewportSize.height : hostInfo.screenHeight
    self.systemInfo = hostInfo.systemInfo(windowWidth: width, windowHeight: height)
    container.clipsToBounds = true
    let gesture = UIScreenEdgePanGestureRecognizer(
      target: self,
      action: #selector(handleBackEdgePan(_:))
    )
    gesture.edges = .left
    container.addGestureRecognizer(gesture)
    installKeyboardObservers()
  }

  private func installKeyboardObservers() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillChangeFrame(_:)),
      name: UIResponder.keyboardWillChangeFrameNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(keyboardWillHide(_:)),
      name: UIResponder.keyboardWillHideNotification,
      object: nil
    )
  }

  @objc private func keyboardWillChangeFrame(_ notification: Notification) {
    guard
      let info = notification.userInfo,
      let endFrame = info[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect
    else { return }
    let converted = container.convert(endFrame, from: nil)
    let referenceBottom = container.window?.bounds.maxY ?? container.bounds.maxY
    let height = max(0, referenceBottom - converted.minY)
    let duration = (info[UIResponder.keyboardAnimationDurationUserInfoKey] as? NSNumber)?
      .doubleValue ?? 0
    deliverKeyboardHeight(height, duration: duration)
  }

  @objc private func keyboardWillHide(_ notification: Notification) {
    let duration = (notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? NSNumber)?
      .doubleValue ?? 0
    deliverKeyboardHeight(0, duration: duration)
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
    let templatesFile = generatedRoot.appendingPathComponent(
      "apps/\(app.id)/assets/templates.js"
    )
    renderTemplatesSource = try? String(contentsOf: templatesFile, encoding: .utf8)
    if let renderTemplatesSource {
      HostDebug.log("native render templates loaded \(renderTemplatesSource.utf8.count) bytes")
    } else {
      HostDebug.log("native render templates missing \(templatesFile.path)")
    }

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
    startNetworkMonitor()
  }

  func updateWindowSize(width: CGFloat, height: CGFloat) {
    guard width > 0, height > 0 else { return }
    if viewportSize.width == width, viewportSize.height == height { return }
    viewportSize = CGSize(width: width, height: height)
    systemInfo = hostInfo.systemInfo(windowWidth: width, windowHeight: height)
    try? core?.command([
      "type": "resize",
      "width": Int(width.rounded()),
      "height": Int(height.rounded()),
    ])
  }

  private func deliverKeyboardHeight(_ height: CGFloat, duration: TimeInterval) {
    let normalizedHeight = max(0, height.rounded())
    let durationMs = max(0, Int((duration * 1000).rounded()))
    let changed = abs(normalizedHeight - lastKeyboardHeight) > 0.5
    keyboardHeight = normalizedHeight
    lastKeyboardHeight = normalizedHeight
    resolvePendingKeyboardRequests(height: normalizedHeight, duration: durationMs)
    guard changed else { return }
    let payload: [String: Any] = [
      "height": Double(normalizedHeight),
      "duration": durationMs,
    ]
    if let activePageId {
      surfaces[activePageId]?.sendHostEvent(
        name: "keyboardHeightChange",
        payload: payload
      )
    }
    try? core?.command([
      "type": "emitEvent",
      "name": "keyboardHeightChange",
      "payload": payload,
    ])
  }

  private func resolvePendingKeyboardRequests(
    height: CGFloat,
    duration: Int,
    onlyRequestId: String? = nil
  ) {
    var remaining: [(requestId: String, pageId: String)] = []
    for request in pendingKeyboardRequests {
      if let onlyRequestId, request.requestId != onlyRequestId {
        remaining.append(request)
        continue
      }
      try? core?.renderHostResult(
        requestId: request.requestId,
        result: [
          "status": "ok",
          "height": Double(height),
          "duration": duration,
          "native": true,
        ]
      )
    }
    pendingKeyboardRequests = remaining
  }

  private func broadcastPageVisibility() {
    for (pageId, surface) in surfaces {
      surface.sendHostEvent(
        name: "pageVisibility",
        payload: [
          "pageId": pageId,
          "active": appVisible && pageId == activePageId,
        ]
      )
    }
  }

  private func beginNativeKeyboard(
    requestId: String,
    pageId: String,
    payload: [String: Any]
  ) {
    let targetPageId = pageId.isEmpty ? (activePageId ?? "") : pageId
    guard !targetPageId.isEmpty, let surface = surfaces[targetPageId] else {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showKeyboard:fail page is not active"]
      )
      return
    }
    let ownerId = payload["ownerId"] as? String ?? ""
    guard !ownerId.isEmpty else {
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showKeyboard:fail missing owner"]
      )
      return
    }
    let frame = nativeViewFrame(payload["style"]) ?? container.bounds
    nativeKeyboardShowToken += 1
    let token = nativeKeyboardShowToken
    if let previous = pendingNativeKeyboardShow {
      pendingNativeKeyboardShow = nil
      try? core?.renderHostResult(
        requestId: previous.requestId,
        result: ["status": "error", "errMsg": "showKeyboard:fail superseded"]
      )
    }
    pendingNativeKeyboardShow = (requestId: requestId, token: token, ownerId: ownerId)
    attemptNativeKeyboardShow(
      requestId: requestId,
      pageId: targetPageId,
      surface: surface,
      ownerId: ownerId,
      frame: frame,
      payload: payload,
      token: token,
      attempt: 0
    )
  }

  private func attemptNativeKeyboardShow(
    requestId: String,
    pageId: String,
    surface: NativeRenderSurface,
    ownerId: String,
    frame: CGRect,
    payload: [String: Any],
    token: Int,
    attempt: Int
  ) {
    guard token == nativeKeyboardShowToken,
          pendingNativeKeyboardShow?.token == token,
          surfaces[pageId] === surface
    else { return }
    guard let target = sameLayerContainer(for: surface, ownerId: ownerId, frame: frame) else {
      guard attempt < 30 else {
        failNativeKeyboardShow(
          requestId: requestId,
          token: token,
          reason: "native same-layer view unavailable"
        )
        return
      }
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self, weak surface] in
        guard let self, let surface else { return }
        self.attemptNativeKeyboardShow(
          requestId: requestId,
          pageId: pageId,
          surface: surface,
          ownerId: ownerId,
          frame: frame,
          payload: payload,
          token: token,
          attempt: attempt + 1
        )
      }
      return
    }
    presentNativeKeyboard(
      requestId: requestId,
      pageId: pageId,
      surface: surface,
      ownerId: ownerId,
      target: target,
      payload: payload,
      token: token
    )
  }

  private func presentNativeKeyboard(
    requestId: String,
    pageId: String,
    surface: NativeRenderSurface,
    ownerId: String,
    target: UIView,
    payload: [String: Any],
    token: Int
  ) {
    guard pendingNativeKeyboardShow?.token == token else { return }
    pendingNativeKeyboardShow = nil
    if let existing = nativeKeyboard {
      if existing.ownerId == ownerId, existing.isActive {
        existing.move(to: target)
        resolveKeyboardShow(requestId: requestId, pageId: pageId)
        return
      }
      if nativeKeyboardPageId == pageId,
         existing.isActive,
         existing.canReuse(config: payload) {
        let previousOwnerId = existing.ownerId
        let previous = existing.snapshot()
        existing.move(to: target)
        if previousOwnerId != ownerId {
          surface.sameLayerHost.detach(marker: sameLayerMarker(previousOwnerId))
        }
        configureNativeKeyboard(existing, pageId: pageId, ownerId: ownerId)
        _ = existing.retarget(
          ownerId: ownerId,
          config: payload,
          value: payload["value"] as? String ?? "",
          cursor: intPayload(payload["cursor"], fallback: -1),
          selectionStart: intPayload(payload["selectionStart"], fallback: -1),
          selectionEnd: intPayload(payload["selectionEnd"], fallback: -1)
        )
        surface.sendHostEvent(
          name: "keyboardBlur",
          payload: [
            "ownerId": previousOwnerId,
            "value": previous.value,
            "cursor": previous.cursor,
          ]
        )
        resolveKeyboardShow(requestId: requestId, pageId: pageId)
        return
      }
      existing.dismiss()
      nativeKeyboard = nil
      nativeKeyboardPageId = nil
    }
    let keyboard = NativeKeyboardHost(
      container: target,
      ownerId: ownerId
    )
    configureNativeKeyboard(keyboard, pageId: pageId, ownerId: ownerId)
    guard keyboard.begin(config: payload) else {
      keyboard.dismiss(suppressBlur: true)
      surface.sameLayerHost.detach(marker: sameLayerMarker(ownerId))
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "showKeyboard:fail native input unavailable"]
      )
      return
    }
    nativeKeyboard = keyboard
    nativeKeyboardPageId = pageId
    resolveKeyboardShow(requestId: requestId, pageId: pageId)
  }

  private func failNativeKeyboardShow(
    requestId: String,
    token: Int,
    reason: String
  ) {
    guard pendingNativeKeyboardShow?.token == token else { return }
    pendingNativeKeyboardShow = nil
    try? core?.renderHostResult(
      requestId: requestId,
      result: ["status": "error", "errMsg": "showKeyboard:fail \(reason)"]
    )
  }

  private func cancelPendingNativeKeyboardShow(reason: String) {
    nativeKeyboardShowToken += 1
    guard let pending = pendingNativeKeyboardShow else { return }
    pendingNativeKeyboardShow = nil
    try? core?.renderHostResult(
      requestId: pending.requestId,
      result: ["status": "error", "errMsg": "showKeyboard:fail \(reason)"]
    )
  }

  private func nativeViewFrame(_ raw: Any?) -> CGRect? {
    guard let value = raw as? [String: Any] else { return nil }
    let left = doubleValue(value["left"], fallback: 0)
    let top = doubleValue(value["top"], fallback: 0)
    let width = max(0, doubleValue(value["width"], fallback: 0))
    let height = max(0, doubleValue(value["height"], fallback: 0))
    return CGRect(x: left, y: top, width: width, height: height)
  }

  private func sameLayerMarker(_ ownerId: String) -> String {
    "tiny-native-view-\(ownerId)"
  }

  private func sameLayerContainer(
    for surface: NativeRenderSurface,
    ownerId: String,
    frame: CGRect?
  ) -> UIView? {
    guard !ownerId.isEmpty else { return nil }
    return surface.sameLayerHost.container(
      for: sameLayerMarker(ownerId),
      in: surface.webView,
      targetFrame: frame
    )
  }

  private func doubleValue(_ value: Any?, fallback: Double) -> Double {
    if let number = value as? NSNumber { return number.doubleValue }
    if let value = value as? Double { return value }
    if let value = value as? Int { return Double(value) }
    if let value = value as? String, let number = Double(value) { return number }
    return fallback
  }

  private func configureNativeKeyboard(
    _ keyboard: NativeKeyboardHost,
    pageId: String,
    ownerId: String
  ) {
    keyboard.onValueChange = { [weak self] value, cursor in
      self?.surfaces[pageId]?.sendHostEvent(
        name: "keyboardInput",
        payload: ["ownerId": ownerId, "value": value, "cursor": cursor]
      )
    }
    keyboard.onSelectionChange = { [weak self] start, end in
      self?.surfaces[pageId]?.sendHostEvent(
        name: "keyboardSelection",
        payload: ["ownerId": ownerId, "selectionStart": start, "selectionEnd": end]
      )
    }
    keyboard.onConfirm = { [weak self] value, cursor in
      self?.surfaces[pageId]?.sendHostEvent(
        name: "keyboardConfirm",
        payload: ["ownerId": ownerId, "value": value, "cursor": cursor]
      )
    }
    keyboard.onBlur = { [weak self, weak keyboard] value, cursor in
      guard let self else { return }
      self.surfaces[pageId]?.sendHostEvent(
        name: "keyboardBlur",
        payload: ["ownerId": ownerId, "value": value, "cursor": cursor]
      )
      guard let keyboard else { return }
      if self.nativeKeyboard === keyboard, !keyboard.isActive {
        self.nativeKeyboard = nil
        self.nativeKeyboardPageId = nil
      }
    }
  }

  private func resolveKeyboardShow(requestId: String, pageId: String) {
    if keyboardHeight > 0.5 {
      try? core?.renderHostResult(
        requestId: requestId,
        result: [
          "status": "ok",
          "height": Double(keyboardHeight),
          "duration": 0,
          "native": true,
        ]
      )
    } else {
      pendingKeyboardRequests.append((requestId: requestId, pageId: pageId))
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
        self?.resolvePendingKeyboardRequests(
          height: 0,
          duration: 0,
          onlyRequestId: requestId
        )
      }
    }
  }

  private func intPayload(_ value: Any?, fallback: Int) -> Int {
    if let number = value as? NSNumber { return number.intValue }
    if let value = value as? Int { return value }
    if let value = value as? String, let number = Int(value) { return number }
    return fallback
  }

  var systemSnapshot: [String: Any] {
    systemInfo
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
    appVisible = visible
    if !visible, let activePageId {
      cancelPendingNativeKeyboardShow(reason: "app is hidden")
      surfaces[activePageId]?.webView.endEditing(true)
      nativeKeyboard?.endEditing()
    }
    try? core?.command([
      "type": "emitEvent",
      "name": visible ? "appShow" : "appHide",
      "payload": [:],
    ])
    try? core?.command(["type": "setPageVisible", "visible": visible])
    broadcastPageVisibility()
  }

  func close() {
    NotificationCenter.default.removeObserver(self)
    cancelPendingNativeKeyboardShow(reason: "host closed")
    nativeKeyboard?.dismiss(suppressBlur: true)
    nativeKeyboard = nil
    nativeKeyboardPageId = nil
    nativePicker?.dismiss(animated: false)
    nativePicker = nil
    for surface in surfaces.values {
      surface.destroy()
    }
    surfaces.removeAll()
    deferredDestroyIds.removeAll()
    pendingKeyboardRequests.removeAll()
    keyboardHeight = 0
    lastKeyboardHeight = 0
    networkMonitor?.cancel()
    networkMonitor = nil
    core = nil
    service.stop()
  }

  private func startNetworkMonitor() {
    let monitor = NWPathMonitor()
    monitor.pathUpdateHandler = { [weak self] path in
      let connected = path.status == .satisfied
      let networkType: String
      if !connected {
        networkType = "none"
      } else if path.usesInterfaceType(.wifi) {
        networkType = "wifi"
      } else if path.usesInterfaceType(.cellular) {
        networkType = "4g"
      } else {
        networkType = "unknown"
      }
      DispatchQueue.main.async {
        guard let self else { return }
        try? self.core?.command([
          "type": "emitEvent",
          "name": "networkStatusChange",
          "payload": ["isConnected": connected, "networkType": networkType],
        ])
      }
    }
    monitor.start(queue: DispatchQueue(label: "tiny.host.network"))
    networkMonitor = monitor
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
      generatedRoot: generatedRoot,
      templatesSource: renderTemplatesSource
    )
    surface.view.frame = container.bounds
    surface.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    surface.onFrame = { [weak self] frame in
      guard let self, let core = self.core else { return }
      do {
        try core.receiveRenderFrame(pageId: pageId, frame: frame)
      } catch {
        self.fail("HostCore render event failed: \(error)")
      }
    }
    surface.onReady = { [weak self, weak surface] in
      guard let self, let core = self.core, let surface else { return }
      do {
        surface.sendHostEvent(name: "keyboardMode", payload: ["native": true])
        try core.pageReady(pageId: pageId)
        self.broadcastPageVisibility()
      } catch {
        self.fail("HostCore pageReady failed: \(error)")
      }
    }
    surface.onError = { [weak self] message in
      self?.fail("render page \(pageId) failed: \(message)")
    }
    deferredDestroyIds.remove(pageId)
    surfaces[pageId] = surface
    container.addSubview(surface.view)
    surface.setVisible(false)
    broadcastPageVisibility()
    _ = path
  }

  func activatePage(pageId: String) {
    let previousId = activePageId
    if previousId != pageId {
      cancelPendingNativeKeyboardShow(reason: "page changed")
      nativeKeyboard?.dismiss()
      nativeKeyboard = nil
      nativeKeyboardPageId = nil
      if let previousId {
        surfaces[previousId]?.sameLayerHost.detachAll()
      }
    }
    guard let newSurface = surfaces[pageId] else {
      activePageId = pageId
      broadcastPageVisibility()
      return
    }
    let newStack = core?.pageStack() ?? []

    if initialPageId == nil {
      initialPageId = pageId
      activePageId = pageId
      displayedStack = newStack
      newSurface.setVisible(true)
      broadcastPageVisibility()
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
      broadcastPageVisibility()
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
    broadcastPageVisibility()
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
    newSurface.view.alpha = 1

    if kind == .fade {
      newSurface.view.transform = .identity
      newSurface.view.alpha = 0
      container.bringSubviewToFront(newSurface.view)
    } else if kind == .push {
      newSurface.view.transform = CGAffineTransform(translationX: width, y: 0)
      container.bringSubviewToFront(newSurface.view)
    } else if let oldSurface {
      if !interactive {
        newSurface.view.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
      }
      container.insertSubview(newSurface.view, belowSubview: oldSurface.view)
    }

    let duration = interactive ? 0.22 : 0.32
    UIView.animate(
      withDuration: duration,
      delay: 0,
      options: [.curveEaseInOut, .beginFromCurrentState, .allowUserInteraction]
    ) {
      newSurface.view.transform = .identity
      newSurface.view.alpha = 1
      if let oldSurface {
        switch kind {
        case .push:
          oldSurface.view.transform = CGAffineTransform(translationX: -width, y: 0)
        case .pop:
          oldSurface.view.transform = CGAffineTransform(translationX: width, y: 0)
        case .fade:
          oldSurface.view.alpha = 0
        }
      }
    } completion: { [weak self] _ in
      guard let self else { return }
      oldSurface?.setVisible(false)
      oldSurface?.view.transform = .identity
      oldSurface?.view.alpha = 1
      newSurface.view.transform = .identity
      newSurface.view.alpha = 1
      self.container.bringSubviewToFront(newSurface.view)
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
      previous.view.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
      container.insertSubview(previous.view, belowSubview: current.view)

    case .changed:
      guard interactiveBackActive,
            let currentId = interactiveBackCurrentId,
            let previousId = interactiveBackPreviousId,
            let current = surfaces[currentId],
            let previous = surfaces[previousId]
      else { return }
      let translation = min(max(gesture.translation(in: container).x, 0), width)
      let progress = translation / width
      current.view.transform = CGAffineTransform(translationX: translation, y: 0)
      previous.view.transform = CGAffineTransform(
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
      current.view.transform = .identity
      previous.view.transform = CGAffineTransform(translationX: -width * 0.32, y: 0)
    } completion: { [weak self] _ in
      guard let self else { return }
      previous.setVisible(false)
      previous.view.transform = .identity
      current.view.transform = .identity
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
    appVisible = visible
    container.isHidden = !visible
    broadcastPageVisibility()
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
       let data = try? JSONSerialization.data(withJSONObject: raw),
       let decoded = try? JSONDecoder().decode(TabBarState.self, from: data),
       decoded.visible,
       !decoded.custom {
      tabBar = decoded
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
    if method.hasPrefix("nativeView.") {
      handleNativeViewRequest(
        requestId: requestId,
        pageId: pageId,
        method: method,
        payload: payload
      )
      return
    }
    if method == "updateKeyboard" {
      if let keyboard = nativeKeyboard,
         keyboard.ownerId == (payload["ownerId"] as? String ?? "") {
        _ = keyboard.update(
          value: payload["value"] as? String ?? "",
          cursor: intPayload(payload["cursor"], fallback: -1),
          selectionStart: intPayload(payload["selectionStart"], fallback: -1),
          selectionEnd: intPayload(payload["selectionEnd"], fallback: -1)
        )
      }
      try? core?.renderHostResult(requestId: requestId, result: ["status": "ok"])
      return
    }
    if method == "showKeyboard" {
      beginNativeKeyboard(requestId: requestId, pageId: pageId, payload: payload)
      return
    }
    if method == "hideKeyboard" {
      let targetPageId: String? = pageId.isEmpty ? activePageId : pageId
      let requestedOwnerId = payload["ownerId"] as? String
      if let pending = pendingNativeKeyboardShow,
         requestedOwnerId == nil || pending.ownerId == requestedOwnerId {
        cancelPendingNativeKeyboardShow(reason: "keyboard hidden")
      }
      if let targetPageId {
        surfaces[targetPageId]?.webView.endEditing(true)
      }
      if let keyboard = nativeKeyboard,
         requestedOwnerId == nil || keyboard.ownerId == requestedOwnerId {
        keyboard.endEditing()
        if let targetPageId {
          surfaces[targetPageId]?.sameLayerHost.detach(
            marker: sameLayerMarker(keyboard.ownerId)
          )
        }
        nativeKeyboard = nil
        nativeKeyboardPageId = nil
      }
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "ok", "height": 0, "duration": 0]
      )
      return
    }
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

  private func handleNativeViewRequest(
    requestId: String,
    pageId: String,
    method: String,
    payload: [String: Any]
  ) {
    let targetPageId = pageId.isEmpty ? (activePageId ?? "") : pageId
    guard !targetPageId.isEmpty, let surface = surfaces[targetPageId] else {
      try? core?.renderHostResult(requestId: requestId, result: ["status": "error"])
      return
    }
    let id = payload["id"] as? String ?? ""
    guard !id.isEmpty else {
      try? core?.renderHostResult(requestId: requestId, result: ["status": "error"])
      return
    }
    if method == "nativeView.detach" {
      surface.sameLayerHost.detach(marker: sameLayerMarker(id))
      if pendingNativeKeyboardShow?.ownerId == id {
        cancelPendingNativeKeyboardShow(reason: "native view detached")
      }
      if nativeKeyboard?.ownerId == id {
        nativeKeyboard?.dismiss(suppressBlur: true)
        nativeKeyboard = nil
        nativeKeyboardPageId = nil
      }
      try? core?.renderHostResult(requestId: requestId, result: ["status": "ok"])
      return
    }
    let frame = nativeViewFrame(payload["frame"]) ?? .zero
    guard let container = sameLayerContainer(for: surface, ownerId: id, frame: frame) else {
      if ProcessInfo.processInfo.environment["TINY_DEBUG_NATIVE_VIEW"] == "1" {
        HostDebug.log("nativeView \(method) page=\(targetPageId) id=\(id) missing same-layer view")
      }
      try? core?.renderHostResult(
        requestId: requestId,
        result: ["status": "error", "errMsg": "native same-layer view unavailable"]
      )
      return
    }
    if ProcessInfo.processInfo.environment["TINY_DEBUG_NATIVE_VIEW"] == "1" {
      HostDebug.log(
        "nativeView \(method) page=\(targetPageId) id=\(id) frame=\(frame) "
          + "container=\(container.convert(container.bounds, to: nil))"
      )
    }
    if nativeKeyboard?.ownerId == id {
      nativeKeyboard?.move(to: container)
      nativeKeyboard?.updateGeometry(
        style: payload["style"] as? [String: Any]
      )
    }
    try? core?.renderHostResult(requestId: requestId, result: ["status": "ok"])
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
    case "system.menuButton":
      result = hostInfo.menuButton
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
      case "keyboard.hide":
        nativeKeyboard?.endEditing()
        try core?.platformResult(requestId: requestId, result: ["errMsg": "hideKeyboard:ok"])
      default:
        // An unimplemented host handler is a platform failure, not a fake
        // success: `request` must not look like it fetched anything, `login`
        // must not look like it produced a code, etc.
        try core?.platformResult(requestId: requestId, result: [
          "errMsg": "\(method):fail not implemented",
        ])
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
