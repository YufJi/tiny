import UIKit
import WebKit

/// WebKit may route touches to its private WKContentView before subviews
/// inserted into a WKChildScrollView. WeChat-style same-layer hosts opt into
/// WebKit's native interaction protocol and relax those gesture delays.
@MainActor
final class NativeSameLayerContainerView: UIView {
  override func conforms(to aProtocol: Protocol) -> Bool {
    if NSStringFromProtocol(aProtocol) == "WKNativelyInteractible" {
      return true
    }
    return super.conforms(to: aProtocol)
  }
}

/// Owns native controls inserted into the `WKChildScrollView` that WebKit
/// creates for an `overflow: scroll` placeholder.
///
/// There is intentionally no page-level overlay fallback. The placeholder and
/// the native control must share WebKit's scroll/compositing tree, otherwise
/// clipping, page transitions and scroll position cannot stay in sync.
@MainActor
final class NativeSameLayerHost {
  private var hosts: [String: NativeSameLayerContainerView] = [:]

  func container(
    for marker: String,
    in webView: WKWebView,
    targetFrame: CGRect? = nil
  ) -> UIView? {
    if let host = hosts[marker] {
      if host.superview != nil {
        return host
      }
      hosts.removeValue(forKey: marker)
    }
    guard !marker.isEmpty else { return nil }
    let targetInWindow = targetFrame.map { webView.convert($0, to: nil) }
    guard let childScrollView = findChildScrollView(
      in: webView.scrollView,
      targetFrame: targetInWindow
    ) else {
      debug("sameLayer miss marker=\(marker) frame=\(String(describing: targetInWindow))")
      return nil
    }
    for gesture in childScrollView.gestureRecognizers ?? [] {
      childScrollView.removeGestureRecognizer(gesture)
    }
    childScrollView.showsVerticalScrollIndicator = false
    childScrollView.showsHorizontalScrollIndicator = false
    let host = NativeSameLayerContainerView(frame: childScrollView.bounds)
    host.backgroundColor = .clear
    host.isUserInteractionEnabled = true
    host.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    childScrollView.addSubview(host)
    hosts[marker] = host
    debug(
      "sameLayer attach marker=\(marker) host=\(host.frame) "
        + "child=\(String(describing: type(of: childScrollView)))"
    )
    return host
  }

  func detach(marker: String) {
    guard let host = hosts.removeValue(forKey: marker) else { return }
    host.subviews.forEach { $0.removeFromSuperview() }
    host.removeFromSuperview()
    debug("sameLayer detach marker=\(marker)")
  }

  func detachAll() {
    for marker in Array(hosts.keys) {
      detach(marker: marker)
    }
  }

  private func findChildScrollView(
    in root: UIView,
    targetFrame: CGRect?
  ) -> UIScrollView? {
    guard let targetFrame else { return nil }
    return findChildScrollView(near: targetFrame, in: root, tolerance: 8)
  }

  private func findChildScrollView(
    near targetFrame: CGRect,
    in root: UIView,
    tolerance: CGFloat
  ) -> UIScrollView? {
    if isCompositingView(root),
       root.layer.name?.contains("tiny-nat") == true,
       let child = childScrollView(in: root) {
      let frame = child.convert(child.bounds, to: nil)
      let distance = abs(frame.minX - targetFrame.minX)
        + abs(frame.minY - targetFrame.minY)
        + abs(frame.width - targetFrame.width)
        + abs(frame.height - targetFrame.height)
      if distance <= tolerance {
        return child
      }
    }
    for subview in root.subviews {
      if let found = findChildScrollView(near: targetFrame, in: subview, tolerance: tolerance) {
        return found
      }
    }
    return nil
  }

  private func isCompositingView(_ view: UIView) -> Bool {
    String(describing: type(of: view)).hasPrefix("WKCompositingView")
  }

  private func childScrollView(in view: UIView) -> UIScrollView? {
    if String(describing: type(of: view)).hasPrefix("WKChildScrollView"),
       let scrollView = view as? UIScrollView {
      return scrollView
    }
    for subview in view.subviews {
      if let found = childScrollView(in: subview) {
        return found
      }
    }
    return nil
  }

  private func debug(_ message: String) {
    if ProcessInfo.processInfo.environment["TINY_DEBUG_NATIVE_VIEW"] == "1" {
      HostDebug.log(message)
    }
  }
}

@MainActor
final class NativeSameLayerWebView: WKWebView {
  private var didConfigureGestures = false

  override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    if !didConfigureGestures {
      didConfigureGestures = configureWebContentGestures()
    }
    return super.hitTest(point, with: event)
  }

  private func configureWebContentGestures() -> Bool {
    guard let contentView = findWebContentView(in: scrollView) else {
      if ProcessInfo.processInfo.environment["TINY_DEBUG_NATIVE_VIEW"] == "1" {
        HostDebug.log("sameLayer WKContentView not found")
      }
      return false
    }
    for gesture in contentView.gestureRecognizers ?? [] {
      if String(describing: type(of: gesture)).contains("UITextTapRecognizer") {
        gesture.isEnabled = false
        continue
      }
      gesture.cancelsTouchesInView = false
      gesture.delaysTouchesBegan = false
      gesture.delaysTouchesEnded = false
    }
    return true
  }

  private func findWebContentView(in view: UIView) -> UIView? {
    if String(describing: type(of: view)).hasPrefix("WKContentView") {
      return view
    }
    for subview in view.subviews {
      if let found = findWebContentView(in: subview) {
        return found
      }
    }
    return nil
  }
}
