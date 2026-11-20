import AudioToolbox
import CoreLocation
import CoreMotion
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
  private var toastView: UIView?
  private var loadingView: UIView?
  private let motionManager = CMMotionManager()
  private var headingManager: CLLocationManager?
  private var headingDelegate: HeadingDelegate?
  private var locationManager: CLLocationManager?
  private var locationDelegate: LocationDelegate?
  private var pendingLocationRequestId: String?
  private var pendingLocationFuzzy = false
  private var locationTracking = false
  private var documentPreview: UIDocumentInteractionController?
  /// Last network type reported by `NWPathMonitor`, served to `wx.getNetworkType`.
  private var currentNetworkType = "wifi"
  private var initialPageId: String?
  private var smokeNavigationStarted = false
  private var surfaces: [String: NativeRenderSurface] = [:]
  private var storage: [String: Any] = [:]
  /// Scopes granted through `identity.authorize`, the iOS mock of WeChat's
  /// permission model.
  private var authSetting: [String: Bool] = [:]
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
        self.currentNetworkType = networkType
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
    case "storage.batchGet":
      let keyList = params["keyList"] as? [String] ?? []
      result = [
        "dataList": keyList.map { storage[$0] ?? NSNull() },
        "errMsg": "batchGetStorage:ok",
      ]
    case "storage.batchSet":
      let kvList = params["kvList"] as? [[String: Any]] ?? []
      for entry in kvList {
        guard let key = entry["key"] as? String else { continue }
        let value = entry["value"] ?? NSNull()
        storage[key] = value
        persistStorageValue(key, value)
      }
      result = ["errMsg": "batchSetStorage:ok"]
    case "account.info":
      result = [
        "miniProgram": [
          "appId": app.id,
          "envVersion": "develop",
          "version": "0.0.0",
        ],
        "plugin": [:],
      ]
    case "system.setting":
      result = [
        "bluetoothEnabled": false,
        "locationEnabled": CLLocationManager.locationServicesEnabled(),
        "wifiEnabled": false,
        "errMsg": "getSystemSetting:ok",
      ]
    case "permissions.setting":
      result = authorizeSettingPayload()
    case "fs.access": result = fsAccess(params)
    case "fs.readFile": result = fsReadFile(params)
    case "fs.writeFile": result = fsWriteFile(params)
    case "fs.mkdir": result = fsMkdir(params)
    case "fs.readdir": result = fsReaddir(params)
    case "fs.stat": result = fsStat(params)
    case "fs.unlink": result = fsUnlink(params)
    case "fs.rmdir": result = fsRmdir(params)
    case "fs.copyFile": result = fsCopyFile(params)
    case "fs.rename": result = fsRename(params)
    case "fs.appendFile": result = fsAppendFile(params)
    case "network.type":
      result = ["networkType": currentNetworkType, "errMsg": "getNetworkType:ok"]
    default:
      result = ["error": "unsupported synchronous host API: \(method)"]
    }
    guard let data = try? JSONSerialization.data(withJSONObject: result),
          let text = String(data: data, encoding: .utf8)
    else { return "null" }
    return text
  }

  // MARK: - Documents

  private func userFileURL(_ params: [String: Any]) -> URL? {
    guard let url = userPath(params["filePath"] as? String ?? "") else { return nil }
    guard FileManager.default.fileExists(atPath: url.path) else { return nil }
    return url
  }

  private func openUserDocument(_ params: [String: Any]) -> [String: Any] {
    guard let url = userFileURL(params),
          topViewController() != nil
    else { return ["errMsg": "openDocument:fail no such file or directory"] }
    let preview = UIDocumentInteractionController(url: url)
    documentPreview = preview
    if !preview.presentPreview(animated: true) {
      documentPreview = nil
      return ["errMsg": "openDocument:fail the document cannot be previewed"]
    }
    return ["errMsg": "openDocument:ok"]
  }

  private func shareUserFile(_ params: [String: Any]) -> [String: Any] {
    guard let url = userFileURL(params),
          let controller = topViewController()
    else { return ["errMsg": "saveFileToDisk:fail no such file or directory"] }
    let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)
    if let popover = activity.popoverPresentationController {
      popover.sourceView = container
      popover.sourceRect = CGRect(
        x: container.bounds.midX,
        y: container.bounds.midY,
        width: 0,
        height: 0,
      )
      popover.permittedArrowDirections = []
    }
    controller.present(activity, animated: true)
    return ["errMsg": "saveFileToDisk:ok"]
  }

  // MARK: - File system

  private func userDirectory() -> URL {
    let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      ?? URL(fileURLWithPath: NSTemporaryDirectory())
    return documents.appendingPathComponent("usr", isDirectory: true)
  }

  private func userPath(_ raw: String) -> URL? {
    guard raw.hasPrefix("wxfile://usr") else { return nil }
    var url = userDirectory()
    let rest = raw.dropFirst("wxfile://usr".count)
    for component in rest.split(separator: "/") {
      let name = String(component)
      if name.isEmpty || name == "." { continue }
      if name == ".." { return nil }
      url.appendPathComponent(name)
    }
    return url
  }

  private func fsFailure(_ api: String, _ reason: String) -> [String: Any] {
    ["errMsg": "\(api):fail \(reason)"]
  }

  private func fsAccess(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("access", "no such file or directory")
    }
    guard FileManager.default.fileExists(atPath: url.path) else {
      return fsFailure("access", "no such file or directory")
    }
    return ["errMsg": "access:ok"]
  }

  private func fsReadFile(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? ""),
          let data = try? Data(contentsOf: url)
    else { return fsFailure("readFile", "no such file or directory") }
    return ["data": data.base64EncodedString(), "errMsg": "readFile:ok"]
  }

  private func fsWriteFile(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("writeFile", "no such file or directory")
    }
    let parent = url.deletingLastPathComponent()
    guard FileManager.default.fileExists(atPath: parent.path) else {
      return fsFailure("writeFile", "no such file or directory")
    }
    guard let data = Data(base64Encoded: params["base64"] as? String ?? "") else {
      return fsFailure("writeFile", "invalid base64 data")
    }
    do {
      try data.write(to: url)
      return ["errMsg": "writeFile:ok"]
    } catch {
      return fsFailure("writeFile", error.localizedDescription)
    }
  }

  private func fsMkdir(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("mkdir", "no such file or directory")
    }
    let recursive = params["recursive"] as? Bool ?? false
    do {
      try FileManager.default.createDirectory(
        at: url,
        withIntermediateDirectories: recursive,
        attributes: nil,
      )
      return ["errMsg": "mkdir:ok"]
    } catch {
      return fsFailure("mkdir", "file already exists")
    }
  }

  private func fsReaddir(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("readdir", "no such file or directory")
    }
    guard let names = try? FileManager.default.contentsOfDirectory(atPath: url.path) else {
      return fsFailure("readdir", "no such file or directory")
    }
    return ["files": names.sorted(), "errMsg": "readdir:ok"]
  }

  private func fsStat(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? ""),
          let attributes = try? FileManager.default.attributesOfItem(atPath: url.path)
    else { return fsFailure("stat", "no such file or directory") }
    let isDirectory = (attributes[.type] as? FileAttributeType) == .typeDirectory
    let modified = (attributes[.modificationDate] as? Date)?.timeIntervalSince1970 ?? 0
    return [
      "stats": [
        "size": (attributes[.size] as? NSNumber)?.intValue ?? 0,
        "lastModifiedTime": modified,
        "lastAccessedTime": modified,
        "isDirectory": isDirectory,
      ],
      "errMsg": "stat:ok",
    ]
  }

  private func fsUnlink(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("unlink", "no such file or directory")
    }
    var isDirectory: ObjCBool = false
    guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory) else {
      return fsFailure("unlink", "no such file or directory")
    }
    if isDirectory.boolValue { return fsFailure("unlink", "is a directory") }
    do {
      try FileManager.default.removeItem(at: url)
      return ["errMsg": "unlink:ok"]
    } catch {
      return fsFailure("unlink", error.localizedDescription)
    }
  }

  private func fsRmdir(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("rmdir", "no such file or directory")
    }
    var isDirectory: ObjCBool = false
    guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDirectory),
          isDirectory.boolValue
    else { return fsFailure("rmdir", "no such file or directory") }
    let recursive = params["recursive"] as? Bool ?? false
    if !recursive {
      let children = (try? FileManager.default.contentsOfDirectory(atPath: url.path)) ?? []
      if !children.isEmpty { return fsFailure("rmdir", "directory not empty") }
    }
    do {
      try FileManager.default.removeItem(at: url)
      return ["errMsg": "rmdir:ok"]
    } catch {
      return fsFailure("rmdir", error.localizedDescription)
    }
  }

  private func fsCopyFile(_ params: [String: Any]) -> [String: Any] {
    guard let source = userPath(params["srcPath"] as? String ?? ""),
          let destination = userPath(params["destPath"] as? String ?? "")
    else { return fsFailure("copyFile", "no such file or directory") }
    do {
      try FileManager.default.copyItem(at: source, to: destination)
      return ["errMsg": "copyFile:ok"]
    } catch {
      return fsFailure("copyFile", error.localizedDescription)
    }
  }

  private func fsRename(_ params: [String: Any]) -> [String: Any] {
    guard let source = userPath(params["oldPath"] as? String ?? ""),
          let destination = userPath(params["newPath"] as? String ?? "")
    else { return fsFailure("rename", "no such file or directory") }
    do {
      try FileManager.default.moveItem(at: source, to: destination)
      return ["errMsg": "rename:ok"]
    } catch {
      return fsFailure("rename", error.localizedDescription)
    }
  }

  private func fsAppendFile(_ params: [String: Any]) -> [String: Any] {
    guard let url = userPath(params["path"] as? String ?? "") else {
      return fsFailure("appendFile", "no such file or directory")
    }
    guard let addition = Data(base64Encoded: params["base64"] as? String ?? "") else {
      return fsFailure("appendFile", "invalid base64 data")
    }
    let existing = (try? Data(contentsOf: url)) ?? Data()
    do {
      try (existing + addition).write(to: url)
      return ["errMsg": "appendFile:ok"]
    } catch {
      return fsFailure("appendFile", error.localizedDescription)
    }
  }

  // MARK: - Location

  private func locationPayload(_ location: CLLocation) -> [String: Any] {
    [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude,
      "speed": max(0, location.speed),
      "accuracy": location.horizontalAccuracy,
      "altitude": location.altitude,
      "verticalAccuracy": location.verticalAccuracy,
      "horizontalAccuracy": location.horizontalAccuracy,
    ]
  }

  private func locationErrorText(_ error: Error) -> String {
    let code = (error as NSError).code
    if code == 1 { return "auth deny" }
    return error.localizedDescription
  }

  private func ensureLocationManager() -> CLLocationManager {
    if let manager = locationManager, locationDelegate != nil {
      return manager
    }
    let manager = CLLocationManager()
    let delegate = LocationDelegate()
    delegate.onUpdate = { [weak self] location in
      Task { @MainActor in
        guard let self else { return }
        if let requestId = self.pendingLocationRequestId {
          self.pendingLocationRequestId = nil
          var payload = self.locationPayload(location)
          if self.pendingLocationFuzzy {
            payload["latitude"] = (payload["latitude"] as? Double).map { ($0 * 100).rounded() / 100 } ?? 0
            payload["longitude"] = (payload["longitude"] as? Double).map { ($0 * 100).rounded() / 100 } ?? 0
            payload["errMsg"] = "getFuzzyLocation:ok"
          } else {
            payload["errMsg"] = "getLocation:ok"
          }
          self.pendingLocationFuzzy = false
          try? self.core?.platformResult(requestId: requestId, result: payload)
          self.locationManager?.stopUpdatingLocation()
          self.locationTracking = false
        } else if self.locationTracking {
          try? self.core?.command([
            "type": "emitEvent",
            "name": "locationChange",
            "payload": self.locationPayload(location),
          ])
        }
      }
    }
    delegate.onError = { [weak self] error in
      Task { @MainActor in
        guard let self else { return }
        let message = self.locationErrorText(error)
        if let requestId = self.pendingLocationRequestId {
          self.pendingLocationRequestId = nil
          self.pendingLocationFuzzy = false
          try? self.core?.platformResult(requestId: requestId, result: [
            "errMsg": "getLocation:fail \(message)",
          ])
        } else {
          try? self.core?.command([
            "type": "emitEvent",
            "name": "locationChangeError",
            "payload": ["errMsg": "locationChange:fail \(message)"],
          ])
        }
      }
    }
    delegate.onAuthorization = { [weak self] status in
      Task { @MainActor in
        guard let self else { return }
        switch status {
        case .authorizedWhenInUse, .authorizedAlways:
          if self.pendingLocationRequestId != nil || self.locationTracking {
            self.locationManager?.startUpdatingLocation()
          }
        case .denied, .restricted:
          if let requestId = self.pendingLocationRequestId {
            self.pendingLocationRequestId = nil
            self.pendingLocationFuzzy = false
            try? self.core?.platformResult(requestId: requestId, result: [
              "errMsg": "getLocation:fail auth deny",
            ])
          }
        default:
          break
        }
      }
    }
    manager.delegate = delegate
    manager.desiredAccuracy = kCLLocationAccuracyBest
    locationManager = manager
    locationDelegate = delegate
    return manager
  }

  private func requestLocation(requestId: String, fuzzy: Bool) {
    let manager = ensureLocationManager()
    pendingLocationRequestId = requestId
    pendingLocationFuzzy = fuzzy
    if manager.authorizationStatus == .notDetermined {
      manager.requestWhenInUseAuthorization()
    }
    manager.requestLocation()
  }

  private func startLocationTracking(background: Bool) -> String {
    let manager = ensureLocationManager()
    if manager.authorizationStatus == .notDetermined {
      manager.requestWhenInUseAuthorization()
    }
    if background {
      manager.allowsBackgroundLocationUpdates = true
    }
    locationTracking = true
    manager.startUpdatingLocation()
    return background ? "startLocationUpdateBackground:ok" : "startLocationUpdate:ok"
  }

  // MARK: - Motion sensors

  private func sensorIntervalMs(_ value: Any?) -> Double {
    if let number = value as? Double, number.isFinite, number > 0 { return number }
    if let number = value as? Int, number > 0 { return Double(number) }
    switch value as? String {
    case "game": return 20
    case "ui": return 60
    default: return 200
    }
  }

  private func emitSensor(_ name: String, _ payload: [String: Any]) {
    try? core?.command(["type": "emitEvent", "name": name, "payload": payload])
  }

  private func startSensor(_ params: [String: Any]) -> String {
    let type = params["type"] as? String ?? ""
    let seconds = sensorIntervalMs(params["interval"]) / 1000
    switch type {
    case "accelerometer":
      guard motionManager.isAccelerometerAvailable else {
        return "startAccelerometer:fail accelerometer is not available"
      }
      motionManager.accelerometerUpdateInterval = seconds
      motionManager.startAccelerometerUpdates(to: OperationQueue()) { [weak self] data, _ in
        guard let data else { return }
        let acceleration = data.acceleration
        Task { @MainActor in
          self?.emitSensor("accelerometerChange", [
            "x": acceleration.x,
            "y": acceleration.y,
            "z": acceleration.z,
          ])
        }
      }
      return "startAccelerometer:ok"
    case "gyroscope":
      guard motionManager.isGyroAvailable else {
        return "startGyroscope:fail gyroscope is not available"
      }
      motionManager.gyroUpdateInterval = seconds
      motionManager.startGyroUpdates(to: OperationQueue()) { [weak self] data, _ in
        guard let data else { return }
        // CoreMotion reports rad/s; WeChat reports deg/s.
        let rate = data.rotationRate
        let factor = 180.0 / Double.pi
        Task { @MainActor in
          self?.emitSensor("gyroscopeChange", [
            "x": rate.x * factor,
            "y": rate.y * factor,
            "z": rate.z * factor,
          ])
        }
      }
      return "startGyroscope:ok"
    case "deviceMotion":
      guard motionManager.isDeviceMotionAvailable else {
        return "startDeviceMotionListening:fail device motion is not available"
      }
      motionManager.deviceMotionUpdateInterval = seconds
      motionManager.startDeviceMotionUpdates(to: OperationQueue()) { [weak self] data, _ in
        guard let attitude = data?.attitude else { return }
        Task { @MainActor in
          self?.emitSensor("deviceMotionChange", [
            "alpha": attitude.yaw,
            "beta": attitude.pitch,
            "gamma": attitude.roll,
          ])
        }
      }
      return "startDeviceMotionListening:ok"
    case "compass":
      let manager = headingManager ?? CLLocationManager()
      let delegate = headingDelegate ?? HeadingDelegate()
      delegate.onHeading = { [weak self] heading in
        Task { @MainActor in
          self?.emitSensor("compassChange", [
            "direction": heading.trueHeading >= 0 ? heading.trueHeading : heading.magneticHeading,
            "accuracy": heading.headingAccuracy >= 0 ? "high" : "low",
          ])
        }
      }
      manager.delegate = delegate
      manager.startUpdatingHeading()
      headingManager = manager
      headingDelegate = delegate
      return "startCompass:ok"
    default:
      return "startSensor:fail unknown sensor"
    }
  }

  private func stopSensor(_ params: [String: Any]) -> String {
    switch params["type"] as? String ?? "" {
    case "accelerometer":
      motionManager.stopAccelerometerUpdates()
      return "stopAccelerometer:ok"
    case "gyroscope":
      motionManager.stopGyroUpdates()
      return "stopGyroscope:ok"
    case "deviceMotion":
      motionManager.stopDeviceMotionUpdates()
      return "stopDeviceMotionListening:ok"
    case "compass":
      headingManager?.stopUpdatingHeading()
      return "stopCompass:ok"
    default:
      return "stopSensor:fail unknown sensor"
    }
  }

  // MARK: - Native overlays

  private func overlayContainer() -> UIView {
    let box = UIView()
    box.backgroundColor = UIColor.black.withAlphaComponent(0.75)
    box.layer.cornerRadius = 10
    box.translatesAutoresizingMaskIntoConstraints = false
    return box
  }

  private func showToastOverlay(_ text: String) {
    toastView?.removeFromSuperview()
    guard !text.isEmpty else { return }
    let box = overlayContainer()
    let label = UILabel()
    label.text = text
    label.textColor = .white
    label.font = .systemFont(ofSize: 14)
    label.numberOfLines = 0
    label.textAlignment = .center
    label.translatesAutoresizingMaskIntoConstraints = false
    box.addSubview(label)
    container.addSubview(box)
    NSLayoutConstraint.activate([
      label.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 14),
      label.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -14),
      label.topAnchor.constraint(equalTo: box.topAnchor, constant: 10),
      label.bottomAnchor.constraint(equalTo: box.bottomAnchor, constant: -10),
      box.centerXAnchor.constraint(equalTo: container.centerXAnchor),
      box.centerYAnchor.constraint(equalTo: container.centerYAnchor),
      box.widthAnchor.constraint(lessThanOrEqualTo: container.widthAnchor, constant: -40),
    ])
    toastView = box
    box.alpha = 0
    UIView.animate(withDuration: 0.15) { box.alpha = 1 }
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { [weak self, weak box] in
      guard let self, let box, self.toastView === box else { return }
      box.removeFromSuperview()
      self.toastView = nil
    }
  }

  private func showLoadingOverlay(_ text: String) {
    hideLoadingOverlay()
    let box = overlayContainer()
    let spinner = UIActivityIndicatorView(style: .medium)
    spinner.color = .white
    spinner.startAnimating()
    spinner.translatesAutoresizingMaskIntoConstraints = false
    let label = UILabel()
    label.text = text.isEmpty ? "加载中" : text
    label.textColor = .white
    label.font = .systemFont(ofSize: 13)
    label.translatesAutoresizingMaskIntoConstraints = false
    box.addSubview(spinner)
    box.addSubview(label)
    container.addSubview(box)
    NSLayoutConstraint.activate([
      spinner.topAnchor.constraint(equalTo: box.topAnchor, constant: 12),
      spinner.centerXAnchor.constraint(equalTo: box.centerXAnchor),
      label.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 8),
      label.leadingAnchor.constraint(equalTo: box.leadingAnchor, constant: 14),
      label.trailingAnchor.constraint(equalTo: box.trailingAnchor, constant: -14),
      label.bottomAnchor.constraint(equalTo: box.bottomAnchor, constant: -12),
      box.centerXAnchor.constraint(equalTo: container.centerXAnchor),
      box.centerYAnchor.constraint(equalTo: container.centerYAnchor),
    ])
    loadingView = box
  }

  private func hideLoadingOverlay() {
    loadingView?.removeFromSuperview()
    loadingView = nil
  }

  private func presentModal(requestId: String, params: [String: Any]) {
    guard let controller = topViewController() else {
      try? core?.platformResult(requestId: requestId, result: [
        "confirm": false,
        "cancel": false,
        "errMsg": "showModal:fail no view controller",
      ])
      return
    }
    let alert = UIAlertController(
      title: params["title"] as? String,
      message: params["content"] as? String,
      preferredStyle: .alert,
    )
    let confirmText = params["confirmText"] as? String ?? "确定"
    let cancelText = params["cancelText"] as? String ?? "取消"
    let showCancel = params["showCancel"] as? Bool ?? true
    alert.addAction(UIAlertAction(title: confirmText, style: .default) { [weak self] _ in
      try? self?.core?.platformResult(requestId: requestId, result: [
        "confirm": true,
        "cancel": false,
        "errMsg": "showModal:ok",
      ])
    })
    if showCancel {
      alert.addAction(UIAlertAction(title: cancelText, style: .cancel) { [weak self] _ in
        try? self?.core?.platformResult(requestId: requestId, result: [
          "confirm": false,
          "cancel": true,
          "errMsg": "showModal:ok",
        ])
      })
    }
    controller.present(alert, animated: true)
  }

  private func presentActionSheet(requestId: String, params: [String: Any]) {
    guard let controller = topViewController() else {
      try? core?.platformResult(requestId: requestId, result: [
        "tapIndex": -1,
        "errMsg": "showActionSheet:fail no view controller",
      ])
      return
    }
    let sheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
    let items = params["itemList"] as? [String] ?? []
    for (index, item) in items.enumerated() {
      sheet.addAction(UIAlertAction(title: item, style: .default) { [weak self] _ in
        try? self?.core?.platformResult(requestId: requestId, result: [
          "tapIndex": index,
          "errMsg": "showActionSheet:ok",
        ])
      })
    }
    let cancelText = params["cancelText"] as? String ?? "取消"
    sheet.addAction(UIAlertAction(title: cancelText, style: .cancel) { [weak self] _ in
      try? self?.core?.platformResult(requestId: requestId, result: [
        "tapIndex": -1,
        "errMsg": "showActionSheet:fail cancel",
      ])
    })
    // iPad requires a popover anchor; the container center is good enough.
    if let popover = sheet.popoverPresentationController {
      popover.sourceView = container
      popover.sourceRect = CGRect(x: container.bounds.midX, y: container.bounds.maxY, width: 0, height: 0)
      popover.permittedArrowDirections = []
    }
    controller.present(sheet, animated: true)
  }

  /// URLSession-backed `wx.request`. The reply is delivered later, so the
  /// switch returns without calling `platformResult`.
  private func performNetworkRequest(requestId: String, params: [String: Any]) {
    guard let urlString = params["url"] as? String,
          let url = URL(string: urlString),
          let scheme = url.scheme?.lowercased(),
          scheme == "http" || scheme == "https"
    else {
      try? core?.platformResult(requestId: requestId, result: ["errMsg": "request:fail invalid url"])
      return
    }
    var request = URLRequest(url: url)
    request.httpMethod = (params["method"] as? String ?? "GET").uppercased()
    if let header = params["header"] as? [String: Any] {
      for (key, value) in header {
        request.setValue(String(describing: value), forHTTPHeaderField: key)
      }
    }
    if let data = params["data"] {
      if let text = data as? String {
        request.httpBody = text.data(using: .utf8)
      } else if JSONSerialization.isValidJSONObject(data),
                let body = try? JSONSerialization.data(withJSONObject: data) {
        request.httpBody = body
      }
    }
    let timeout = (params["timeout"] as? Double ?? 60000) / 1000
    request.timeoutInterval = max(1, timeout)
    let wantsBuffer = (params["responseType"] as? String) == "arraybuffer"
    URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
      Task { @MainActor in
        guard let self else { return }
        if let error {
          try? self.core?.platformResult(requestId: requestId, result: [
            "errMsg": "request:fail \(error.localizedDescription)",
          ])
          return
        }
        let http = response as? HTTPURLResponse
        var result: [String: Any] = [
          "statusCode": http?.statusCode ?? 0,
          "header": (http?.allHeaderFields as? [String: String]) ?? [:],
          "errMsg": "request:ok",
        ]
        if let data {
          if wantsBuffer {
            result["data"] = data.base64EncodedString()
          } else {
            result["data"] = String(data: data, encoding: .utf8) ?? ""
          }
        } else {
          result["data"] = ""
        }
        try? self.core?.platformResult(requestId: requestId, result: result)
      }
    }.resume()
  }

  /// WeChat mock identity: fields match the real envelope so prototype flows
  /// keep moving; no WeChat account is involved.
  private func mockProfile() -> [String: Any] {
    let userInfo: [String: Any] = [
      "nickName": "Tiny User",
      "avatarUrl": "",
      "gender": 0,
      "country": "",
      "province": "",
      "city": "",
      "language": "zh_CN",
    ]
    return [
      "userInfo": userInfo,
      "rawData": "{}",
      "signature": "mock-signature",
      "encryptedData": "",
      "iv": "",
      "errMsg": "getUserProfile:ok",
    ]
  }

  private func authorizeSettingPayload() -> [String: Any] {
    [
      "albumAuthorized": "not determined",
      "bluetoothAuthorized": "not determined",
      "cameraAuthorized": "not determined",
      "locationAuthorized": "not determined",
      "locationReducedAccuracy": false,
      "microphoneAuthorized": "not determined",
      "notificationAuthorized": "not determined",
      "phoneCalendarAuthorized": "not determined",
    ]
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
      case "clipboard.set":
        UIPasteboard.general.string = params["data"] as? String ?? ""
        try core?.platformResult(requestId: requestId, result: ["errMsg": "setClipboardData:ok"])
      case "clipboard.get":
        try core?.platformResult(requestId: requestId, result: [
          "data": UIPasteboard.general.string ?? "",
          "errMsg": "getClipboardData:ok",
        ])
      case "identity.checkSession":
        try core?.platformResult(requestId: requestId, result: ["errMsg": "checkSession:ok"])
      case "identity.authorize":
        let scope = params["scope"] as? String ?? ""
        guard !scope.isEmpty else {
          try core?.platformResult(requestId: requestId, result: ["errMsg": "authorize:fail invalid scope"])
          return
        }
        authSetting[scope] = true
        try core?.platformResult(requestId: requestId, result: ["errMsg": "authorize:ok"])
      case "settings.get":
        try core?.platformResult(requestId: requestId, result: [
          "authSetting": authSetting,
          "errMsg": "getSetting:ok",
        ])
      case "settings.open":
        try core?.platformResult(requestId: requestId, result: [
          "authSetting": authSetting,
          "errMsg": "openSetting:ok",
        ])
      case "login":
        try core?.platformResult(requestId: requestId, result: [
          "code": UUID().uuidString.replacingOccurrences(of: "-", with: ""),
          "errMsg": "login:ok",
        ])
      case "profile.get":
        try core?.platformResult(requestId: requestId, result: mockProfile())
      case "update.check":
        try core?.platformResult(requestId: requestId, result: ["hasUpdate": false, "errMsg": "checkForUpdate:ok"])
      case "network.type":
        try core?.platformResult(requestId: requestId, result: [
          "networkType": currentNetworkType,
          "errMsg": "getNetworkType:ok",
        ])
      case "battery.get":
        let device = UIDevice.current
        device.isBatteryMonitoringEnabled = true
        let level = device.batteryLevel < 0 ? 100 : Int((device.batteryLevel * 100).rounded())
        let charging = device.batteryState == .charging || device.batteryState == .full
        try core?.platformResult(requestId: requestId, result: [
          "level": level,
          "isCharging": charging,
          "errMsg": "getBatteryInfo:ok",
        ])
      case "screen.getBrightness":
        try core?.platformResult(requestId: requestId, result: [
          "value": Double(UIScreen.main.brightness),
          "errMsg": "getScreenBrightness:ok",
        ])
      case "screen.setBrightness":
        let value = (params["value"] as? Double) ?? 0
        UIScreen.main.brightness = CGFloat(min(1, max(0, value)))
        try core?.platformResult(requestId: requestId, result: ["errMsg": "setScreenBrightness:ok"])
      case "device.keepScreenOn":
        UIApplication.shared.isIdleTimerDisabled = (params["keepScreenOn"] as? Bool) ?? true
        try core?.platformResult(requestId: requestId, result: ["errMsg": "setKeepScreenOn:ok"])
      case "device.vibrate":
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        try core?.platformResult(requestId: requestId, result: ["errMsg": "vibrateShort:ok"])
      case "sensor.start":
        try core?.platformResult(requestId: requestId, result: ["errMsg": startSensor(params)])
      case "sensor.stop":
        try core?.platformResult(requestId: requestId, result: ["errMsg": stopSensor(params)])
      case "fs.access": try core?.platformResult(requestId: requestId, result: fsAccess(params))
      case "fs.readFile": try core?.platformResult(requestId: requestId, result: fsReadFile(params))
      case "fs.writeFile": try core?.platformResult(requestId: requestId, result: fsWriteFile(params))
      case "fs.mkdir": try core?.platformResult(requestId: requestId, result: fsMkdir(params))
      case "fs.readdir": try core?.platformResult(requestId: requestId, result: fsReaddir(params))
      case "fs.stat": try core?.platformResult(requestId: requestId, result: fsStat(params))
      case "fs.unlink": try core?.platformResult(requestId: requestId, result: fsUnlink(params))
      case "fs.rmdir": try core?.platformResult(requestId: requestId, result: fsRmdir(params))
      case "fs.copyFile": try core?.platformResult(requestId: requestId, result: fsCopyFile(params))
      case "fs.rename": try core?.platformResult(requestId: requestId, result: fsRename(params))
      case "fs.appendFile": try core?.platformResult(requestId: requestId, result: fsAppendFile(params))
      case "location.get":
        requestLocation(requestId: requestId, fuzzy: false)
      case "location.fuzzy":
        requestLocation(requestId: requestId, fuzzy: true)
      case "location.start":
        try core?.platformResult(requestId: requestId, result: ["errMsg": startLocationTracking(background: false)])
      case "location.startBackground":
        try core?.platformResult(requestId: requestId, result: ["errMsg": startLocationTracking(background: true)])
      case "location.stop":
        locationManager?.stopUpdatingLocation()
        locationTracking = false
        try core?.platformResult(requestId: requestId, result: ["errMsg": "stopLocationUpdate:ok"])
      case "network.request":
        performNetworkRequest(requestId: requestId, params: params)
      case "file.openDocument":
        try core?.platformResult(requestId: requestId, result: openUserDocument(params))
      case "file.saveToDisk":
        try core?.platformResult(requestId: requestId, result: shareUserFile(params))
      case "toast.show":
        showToastOverlay(params["title"] as? String ?? "")
        try core?.platformResult(requestId: requestId, result: ["errMsg": "showToast:ok"])
      case "ui.loading":
        showLoadingOverlay(params["title"] as? String ?? "")
        try core?.platformResult(requestId: requestId, result: ["errMsg": "showLoading:ok"])
      case "ui.hideLoading":
        hideLoadingOverlay()
        try core?.platformResult(requestId: requestId, result: ["errMsg": "hideLoading:ok"])
      case "ui.modal":
        presentModal(requestId: requestId, params: params)
      case "ui.actionSheet":
        presentActionSheet(requestId: requestId, params: params)
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


/// Compass delegate kept outside the runtime so the main-actor class does not
/// have to conform to a nonisolated delegate protocol.
final class HeadingDelegate: NSObject, CLLocationManagerDelegate {
  var onHeading: ((CLHeading) -> Void)?

  func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
    onHeading?(newHeading)
  }

  func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool {
    false
  }
}


/// Location delegate kept outside the runtime for the same reason as the
/// compass one: the runtime is main-actor isolated.
final class LocationDelegate: NSObject, CLLocationManagerDelegate {
  var onUpdate: ((CLLocation) -> Void)?
  var onError: ((Error) -> Void)?
  var onAuthorization: ((CLAuthorizationStatus) -> Void)?

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let last = locations.last else { return }
    onUpdate?(last)
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    onError?(error)
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    onAuthorization?(manager.authorizationStatus)
  }
}
