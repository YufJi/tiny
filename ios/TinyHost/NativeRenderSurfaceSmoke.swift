import Foundation
import UIKit

@MainActor
enum NativeRenderSurfaceSmoke {
  private static var surface: NativeRenderSurface?
  private static var hostView: UIView?

  static func run() {
    HostDebug.log("native render smoke requested")
    guard surface == nil, let resourceRoot = Bundle.main.resourceURL else { return }
    let generatedRoot = resourceRoot.appendingPathComponent("Generated", isDirectory: true)
    let surface = NativeRenderSurface(
      pageId: "native-render-smoke",
      appId: "demo",
      generatedRoot: generatedRoot
    )
    self.surface = surface
    if let window = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .flatMap({ $0.windows })
      .first(where: { $0.isKeyWindow }) {
      let host = UIView(frame: CGRect(x: 0, y: 0, width: 390, height: 844))
      host.isHidden = true
      window.addSubview(host)
      surface.webView.frame = host.bounds
      host.addSubview(surface.webView)
      self.hostView = host
    }
    surface.onReady = {
      HostDebug.writeResult([
        "ok": true,
        "pageId": surface.pageId,
      ], name: "native-render-smoke.json")
      surface.setVisible(false)
    }
    surface.onFrame = { frame in
      HostDebug.log("native render frame: \(frame.prefix(160))")
    }
    surface.onError = { message in
      HostDebug.log("native render error: \(message)")
      HostDebug.writeResult(["ok": false, "error": message], name: "native-render-smoke.json")
    }
  }
}
