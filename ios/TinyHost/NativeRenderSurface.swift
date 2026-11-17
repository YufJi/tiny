import Foundation
import UIKit
import WebKit

/// One native render surface: a standalone WKWebView for a single page.
///
/// The Rust HostCore owns the render Bridge; this class only transfers frames
/// between the HostCore and `render.html`.
@MainActor
final class NativeRenderSurface: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
  let pageId: String
  let appId: String
  let generatedRoot: URL
  let templatesSource: String?
  let view = UIView()
  let sameLayerHost = NativeSameLayerHost()
  private(set) var webView: WKWebView!

  var onReady: (() -> Void)?
  var onFrame: ((String) -> Void)?
  var onError: ((String) -> Void)?
  private var ready = false
  private var pendingFrames: [String] = []
  private var pendingHostEvents: [[String: Any]] = []

  init(
    pageId: String,
    appId: String,
    generatedRoot: URL,
    templatesSource: String? = nil
  ) {
    self.pageId = pageId
    self.appId = appId
    self.generatedRoot = generatedRoot
    self.templatesSource = templatesSource
    super.init()
    let configuration = WKWebViewConfiguration()
    configuration.websiteDataStore = .nonPersistent()
    configuration.defaultWebpagePreferences.allowsContentJavaScript = true
    configuration.setURLSchemeHandler(
      TinySchemeHandler(root: generatedRoot),
      forURLScheme: "tinyapp"
    )
    configuration.userContentController.add(self, name: "tinyRender")
    configuration.userContentController.addUserScript(WKUserScript(
      source: """
      (() => {
        const report = (message) => {
          try {
            window.webkit?.messageHandlers?.tinyRender?.postMessage({ type: 'error', message: String(message) })
          } catch (_) {}
        }
        window.addEventListener('error', (event) => report(event.message))
        window.addEventListener('unhandledrejection', (event) => report(event.reason))
      })()
      """,
      injectionTime: .atDocumentStart,
      forMainFrameOnly: true
    ))
    if let templatesSource,
       let literal = Self.javascriptStringLiteral(templatesSource) {
      configuration.userContentController.addUserScript(WKUserScript(
        source: """
        (() => {
          Object.defineProperty(window, '__TINY_NATIVE_TEMPLATES_SOURCE__', {
            value: \(literal),
            configurable: true,
          })
        })()
        """,
        injectionTime: .atDocumentStart,
        forMainFrameOnly: true
      ))
    }
    let webView = NativeSameLayerWebView(frame: .zero, configuration: configuration)
    // Host chrome may follow a dark navigation style, but the mini-program
    // WebView itself is currently a light-theme page.
    webView.overrideUserInterfaceStyle = .light
    webView.backgroundColor = .white
    webView.isOpaque = false
    webView.scrollView.backgroundColor = .white
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.navigationDelegate = self
    self.webView = webView
    view.backgroundColor = .clear
    view.clipsToBounds = true
    webView.frame = view.bounds
    webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    view.addSubview(webView)

    var components = URLComponents()
    components.scheme = "tinyapp"
    components.host = "app"
    components.path = "/www/render.html"
    components.queryItems = [
      URLQueryItem(name: "app", value: appId),
      URLQueryItem(name: "pageId", value: pageId),
    ]
    if let url = components.url {
      HostDebug.log("native render load \(url.absoluteString)")
      webView.load(URLRequest(url: url))
    }
  }

  func receive(frame: String) {
    guard ready else {
      pendingFrames.append(frame)
      return
    }
    webView.callAsyncJavaScript(
      "window.__tinyRenderReceive(frame)",
      arguments: ["frame": frame],
      in: nil,
      in: .page
    ) { result in
      if case .failure(let error) = result {
        print("[tiny native render] frame delivery failed: \(error.localizedDescription)")
      }
    }
  }

  func receiveCanvas(payload: String) {
    webView.callAsyncJavaScript(
      "window.__tinyNativeCanvasCommand(payload)",
      arguments: ["payload": payload],
      in: nil,
      in: .page
    ) { result in
      if case .failure(let error) = result {
        print("[tiny native canvas] command delivery failed: \(error.localizedDescription)")
      }
    }
  }

  /// Deliver a host-owned event into the page render WebView.
  func sendHostEvent(name: String, payload: [String: Any] = [:]) {
    let event: [String: Any] = ["name": name, "payload": payload]
    guard ready else {
      pendingHostEvents.append(event)
      return
    }
    deliverHostEvent(event)
  }

  func setVisible(_ visible: Bool) {
    view.isHidden = !visible
    view.alpha = visible ? 1 : 0
    if !visible {
      sameLayerHost.detachAll()
    }
  }

  func destroy() {
    sameLayerHost.detachAll()
    webView.configuration.userContentController.removeScriptMessageHandler(forName: "tinyRender")
    webView.stopLoading()
    webView.removeFromSuperview()
    view.removeFromSuperview()
    onReady = nil
    onFrame = nil
    ready = false
    pendingFrames.removeAll()
    pendingHostEvents.removeAll()
  }

  func userContentController(
    _ userContentController: WKUserContentController,
    didReceive message: WKScriptMessage
  ) {
    guard message.name == "tinyRender", let body = message.body as? [String: Any] else { return }
    switch body["type"] as? String {
    case "ready":
      ready = true
      flushPendingFrames()
      flushPendingHostEvents()
      onReady?()
    case "frame":
      if let frame = body["frame"] as? String {
        onFrame?(frame)
      }
    case "error":
      onError?(body["message"] as? String ?? "native render error")
    default:
      break
    }
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    HostDebug.log("native render didFinish \(webView.url?.absoluteString ?? "?")")
  }

  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    HostDebug.log("native render provisional failure \(error.localizedDescription)")
    onError?("render navigation failed: \(error.localizedDescription)")
  }

  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    HostDebug.log("native render failure \(error.localizedDescription)")
    onError?("render navigation failed: \(error.localizedDescription)")
  }

  private func flushPendingFrames() {
    let frames = pendingFrames
    pendingFrames.removeAll()
    for frame in frames {
      receive(frame: frame)
    }
  }

  private func flushPendingHostEvents() {
    let events = pendingHostEvents
    pendingHostEvents.removeAll()
    for event in events {
      deliverHostEvent(event)
    }
  }

  private func deliverHostEvent(_ event: [String: Any]) {
    webView.callAsyncJavaScript(
      "window.__tinyRenderHostEvent?.(event)",
      arguments: ["event": event],
      in: nil,
      in: .page
    ) { result in
      if case .failure(let error) = result {
        print("[tiny native render] host event delivery failed: \(error.localizedDescription)")
      }
    }
  }

  private static func javascriptStringLiteral(_ value: String) -> String? {
    guard
      let data = try? JSONSerialization.data(
        withJSONObject: value,
        options: [.fragmentsAllowed]
      )
    else {
      return nil
    }
    return String(data: data, encoding: .utf8)
  }
}
