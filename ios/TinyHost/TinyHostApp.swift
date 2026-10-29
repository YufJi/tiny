import SwiftUI

@main
struct TinyHostApp: App {
  var body: some Scene {
    WindowGroup {
      LauncherView()
        .preferredColorScheme(.light)
    }
  }
}
