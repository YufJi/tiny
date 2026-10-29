import SwiftUI
import WebKit

struct TinyWebView: UIViewRepresentable {
  @ObservedObject var session: MiniProgramSession

  func makeCoordinator() -> Coordinator {
    Coordinator(session: session)
  }

  func makeUIView(context: Context) -> WKWebView {
    let configuration = WKWebViewConfiguration()
    configuration.websiteDataStore = .nonPersistent()
    configuration.defaultWebpagePreferences.allowsContentJavaScript = true
    configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
    configuration.setURLSchemeHandler(
      TinySchemeHandler(root: session.generatedRoot),
      forURLScheme: "tinyapp"
    )
    configuration.userContentController.add(context.coordinator, name: "tinyControl")
    configuration.userContentController.add(context.coordinator, name: "tinyService")
    configuration.userContentController.addUserScript(
      WKUserScript(
        source: session.bootstrapScript,
        injectionTime: .atDocumentStart,
        forMainFrameOnly: true
      )
    )

    let webView = WKWebView(frame: .zero, configuration: configuration)
    webView.navigationDelegate = context.coordinator
    webView.backgroundColor = .white
    webView.isOpaque = false
    webView.allowsBackForwardNavigationGestures = false
    webView.allowsLinkPreview = false
    webView.scrollView.backgroundColor = .white
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.scrollView.showsVerticalScrollIndicator = false
    webView.scrollView.showsHorizontalScrollIndicator = false
    #if DEBUG
    if #available(iOS 16.4, *) {
      webView.isInspectable = true
    }
    #endif

    context.coordinator.attach(webView)
    var components = URLComponents()
    components.scheme = "tinyapp"
    components.host = "app"
    components.path = "/www/host.html"
    components.queryItems = [URLQueryItem(name: "app", value: session.app.id)]
    if let url = components.url {
      webView.load(URLRequest(url: url))
    }
    return webView
  }

  func updateUIView(_ uiView: WKWebView, context: Context) {
    // The page content is owned by the runtime; SwiftUI only resizes the view.
  }

  static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
    uiView.configuration.userContentController.removeScriptMessageHandler(forName: "tinyControl")
    uiView.configuration.userContentController.removeScriptMessageHandler(forName: "tinyService")
    coordinator.session.close()
  }

  final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    let session: MiniProgramSession
    private weak var webView: WKWebView?

    init(session: MiniProgramSession) {
      self.session = session
    }

    func attach(_ webView: WKWebView) {
      self.webView = webView
      session.attach(webView: webView)
    }

    func userContentController(
      _ userContentController: WKUserContentController,
      didReceive message: WKScriptMessage
    ) {
      guard let body = message.body as? [String: Any] else {
        HostDebug.log("ignored non-object message from \(message.name)")
        return
      }
      if message.name == "tinyService" {
        if let frame = body["frame"] as? String {
          session.handleControl(["type": "frame", "frame": frame])
        }
        return
      }
      if message.name == "tinyControl" {
        session.handleControl(body)
      }
    }

    func webView(
      _ webView: WKWebView,
      didFail navigation: WKNavigation!,
      withError error: Error
    ) {
      HostDebug.log("webview navigation failed: \(error.localizedDescription)")
    }

    func webView(
      _ webView: WKWebView,
      didFailProvisionalNavigation navigation: WKNavigation!,
      withError error: Error
    ) {
      HostDebug.log("webview provisional navigation failed: \(error.localizedDescription)")
    }
  }
}
