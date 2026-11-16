import Foundation
import SwiftUI
import UIKit

@MainActor
final class MiniProgramSession: ObservableObject {
  let app: AppInfo
  let smoke: Bool
  let systemInfo: HostSystemInfo
  let generatedRoot: URL

  @Published private(set) var uiState: HostUIState?
  @Published private(set) var loading = true
  @Published private(set) var errorMessage: String?

  private var nativeRuntime: HostCoreRuntime?
  private var nativeContainer: UIView?
  private var started = false
  private var closed = false
  private var lastVisible = true
  private var viewportSize: CGSize = .zero

  var isClosed: Bool { closed }

  init(app: AppInfo, smoke: Bool) {
    self.app = app
    self.smoke = smoke
    self.systemInfo = HostSystemInfo.current()
    let resourceRoot = Bundle.main.resourceURL ?? URL(fileURLWithPath: "/")
    self.generatedRoot = resourceRoot.appendingPathComponent("Generated", isDirectory: true)
  }

  func makeNativeView() -> UIView {
    if let nativeContainer {
      if nativeContainer.superview != nil {
        nativeContainer.removeFromSuperview()
      }
      return nativeContainer
    }
    let container = HostViewportView()
    container.backgroundColor = .white
    container.onViewportChange = { [weak self] size in
      self?.updateViewport(size)
    }
    nativeContainer = container
    startIfNeeded()
    return container
  }

  func startIfNeeded() {
    guard !started, !closed else { return }
    started = true
    guard let container = nativeContainer else { return }
    let runtime = HostCoreRuntime(
      app: app,
      generatedRoot: generatedRoot,
      container: container,
      smoke: smoke,
      hostInfo: systemInfo,
      viewportSize: viewportSize
    )
    nativeRuntime = runtime
    runtime.onUIState = { [weak self] state in
      self?.uiState = state
      self?.loading = false
      let system = self?.nativeRuntime?.systemSnapshot ?? [:]
      HostDebug.writeResult([
        "appId": self?.app.id ?? "",
        "runId": HostDebug.runId,
        "title": state.title,
        "path": state.path,
        "pageId": state.pageId ?? "",
        "canBack": state.canBack,
        "tabBar": state.tabBar == nil ? "none" : "visible",
        "system": system,
      ], name: "ui-state.json")
    }
    runtime.onReady = { [weak self] _ in
      guard let self else { return }
      self.loading = false
    }
    runtime.onError = { [weak self] message in
      self?.reportError(message)
    }
    do {
      try runtime.start()
    } catch {
      reportError((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
    }
  }

  func back() {
    nativeRuntime?.back()
  }

  private func updateViewport(_ size: CGSize) {
    guard size.width > 0, size.height > 0 else { return }
    viewportSize = size
    nativeRuntime?.updateWindowSize(width: size.width, height: size.height)
  }

  func switchTab(_ index: Int) {
    nativeRuntime?.switchTab(index: index)
  }

  func setVisible(_ visible: Bool) {
    guard !closed else { return }
    guard visible != lastVisible else { return }
    lastVisible = visible
    nativeRuntime?.setVisible(visible)
  }

  func loadAssetImage(_ path: String) -> UIImage? {
    var relative = path
    if relative.hasPrefix("/") { relative.removeFirst() }
    let url = generatedRoot.appendingPathComponent("apps/\(app.id)/assets/\(relative)")
    return UIImage(contentsOfFile: url.path)
  }

  func close() {
    guard !closed else { return }
    closed = true
    nativeRuntime?.close()
    nativeRuntime = nil
    nativeContainer?.removeFromSuperview()
    nativeContainer = nil
  }

  private func reportError(_ message: String) {
    HostDebug.log("native host error: \(message)")
    HostDebug.writeResult([
      "appId": app.id,
      "runId": HostDebug.runId,
      "error": message,
    ], name: "error.json")
    errorMessage = message
    loading = false
  }
}

private final class HostViewportView: UIView {
  var onViewportChange: ((CGSize) -> Void)?
  private var lastReportedSize: CGSize = .zero

  override func layoutSubviews() {
    super.layoutSubviews()
    let size = bounds.size
    guard size.width > 0, size.height > 0, size != lastReportedSize else { return }
    lastReportedSize = size
    onViewportChange?(size)
  }
}
