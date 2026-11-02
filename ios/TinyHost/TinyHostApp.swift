import SwiftUI

@main
struct TinyHostApp: App {
  init() {
    let smoke = HostCoreAdapter.smoke()
    HostDebug.log("hostcore smoke \(smoke)")
    HostDebug.writeResult(smoke, name: "host-core-smoke.json")
  }

  var body: some Scene {
    WindowGroup {
      LauncherView()
        .preferredColorScheme(.light)
    }
  }
}
