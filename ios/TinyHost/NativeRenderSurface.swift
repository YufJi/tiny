import Foundation
import UIKit
import WebKit

/// One native render surface: a standalone WKWebView for a single page.
///
/// The Rust HostCore owns the render Bridge; this class only transfers frames
/// between the HostCore and `render.html?native=1`.
@MainActor
final class NativeRenderSurface: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
  let pageId: String
  let appId: String
  let generatedRoot: URL
  private(set) var webView: WKWebView!

  var onReady: (() -> Void)?
  var onFrame: ((String) -> Void)?
  var onError: ((String) -> Void)?
  private var ready = false
  private var pendingFrames: [String] = []

  init(pageId: String, appId: String, generatedRoot: URL) {
    self.pageId = pageId
    self.appId = appId
    self.generatedRoot = generatedRoot
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
    let webView = WKWebView(frame: .zero, configuration: configuration)
    webView.backgroundColor = .white
    webView.isOpaque = false
    webView.scrollView.backgroundColor = .white
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.navigationDelegate = self
    self.webView = webView

    var components = URLComponents()
    components.scheme = "tinyapp"
    components.host = "app"
    components.path = "/www/render.html"
    components.queryItems = [
      URLQueryItem(name: "app", value: appId),
      URLQueryItem(name: "pageId", value: pageId),
      URLQueryItem(name: "native", value: "1"),
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

  func setVisible(_ visible: Bool) {
    webView.isHidden = !visible
    webView.alpha = visible ? 1 : 0
  }

  func destroy() {
    webView.configuration.userContentController.removeScriptMessageHandler(forName: "tinyRender")
    webView.stopLoading()
    webView.removeFromSuperview()
    onReady = nil
    onFrame = nil
    ready = false
    pendingFrames.removeAll()
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
}
