import SwiftUI
import UIKit

/// UIView bridge for the Rust HostCore + per-page WKWebView runtime.
struct NativeHostView: UIViewRepresentable {
  @ObservedObject var session: MiniProgramSession

  func makeUIView(context: Context) -> UIView {
    session.makeNativeView()
  }

  func updateUIView(_ uiView: UIView, context: Context) {
    // Page surfaces are owned by HostCoreRuntime.
  }

  static func dismantleUIView(_ uiView: UIView, coordinator: ()) {
    // The session keeps this container warm for LRU reuse.
    uiView.removeFromSuperview()
  }
}
