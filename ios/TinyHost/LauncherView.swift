import SwiftUI
import UIKit

struct MiniProgramPresentation: Identifiable {
  let app: AppInfo
  let session: MiniProgramSession

  var id: String { app.id }
}

@MainActor
final class LauncherModel: ObservableObject {
  static let maxLiveSessions = 3

  @Published var apps: [AppInfo] = []
  @Published var loadError: String?
  @Published var activePresentation: MiniProgramPresentation?
  @Published private(set) var liveAppIds: [String] = []
  @Published var smoke: Bool

  private let launchAppId: String?
  private let runSessionSmoke: Bool
  private var sessions: [String: MiniProgramSession] = [:]
  private var recency: [String] = []

  init() {
    let arguments = ProcessInfo.processInfo.arguments
    if let index = arguments.firstIndex(of: "-TINY_AUTOLAUNCH"), index + 1 < arguments.count {
      launchAppId = arguments[index + 1]
    } else {
      launchAppId = nil
    }
    smoke = arguments.contains("-TINY_SMOKE")
    runSessionSmoke = arguments.contains("-TINY_LRU_SMOKE")
  }

  func load() {
    do {
      apps = try AppRegistry.load()
      HostDebug.log("apps loaded: \(apps.map { $0.id }.joined(separator: ","))")
      loadError = nil
      if runSessionSmoke {
        runSessionPoolSmoke()
      } else if let launchAppId, let app = apps.first(where: { $0.id == launchAppId }) {
        open(app)
      }
    } catch {
      loadError = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
      HostDebug.log("app registry failed: \(loadError ?? "")")
    }
  }

  func open(_ app: AppInfo) {
    let session = acquireSession(for: app)
    activePresentation = MiniProgramPresentation(app: app, session: session)
    session.setVisible(true)
    HostDebug.log("launcher open \(app.id); live=\(liveAppIds.joined(separator: ","))")
  }

  func close(_ session: MiniProgramSession) {
    if activePresentation?.session === session {
      activePresentation = nil
    }
    removeSession(appId: session.app.id)
  }

  func evictInactiveSessions() {
    let activeId = activePresentation?.app.id
    let victims = recency.filter { $0 != activeId }
    guard !victims.isEmpty else { return }
    HostDebug.log("launcher memory warning; evicting \(victims.joined(separator: ","))")
    for appId in victims {
      removeSession(appId: appId)
    }
  }

  func isLive(_ app: AppInfo) -> Bool {
    sessions[app.id] != nil
  }

  private func acquireSession(for app: AppInfo) -> MiniProgramSession {
    let session = reusableSession(for: app)
    touch(app.id)
    var protectedIds: Set<String> = [app.id]
    if let activeId = activePresentation?.app.id {
      protectedIds.insert(activeId)
    }
    evictIfNeeded(protecting: protectedIds)
    publishLiveApps()
    return session
  }

  private func reusableSession(for app: AppInfo) -> MiniProgramSession {
    if let session = sessions[app.id], !session.isClosed {
      return session
    }
    if let stale = sessions.removeValue(forKey: app.id) {
      stale.close()
      recency.removeAll { $0 == app.id }
    }
    let session = MiniProgramSession(app: app, smoke: smoke)
    sessions[app.id] = session
    recency.removeAll { $0 == app.id }
    recency.append(app.id)
    HostDebug.log("launcher session create \(app.id)")
    return session
  }

  private func touch(_ appId: String) {
    recency.removeAll { $0 == appId }
    recency.append(appId)
  }

  private func evictIfNeeded(protecting protectedIds: Set<String>) {
    while sessions.count > Self.maxLiveSessions {
      guard let victim = recency.first(where: { !protectedIds.contains($0) }) else { break }
      HostDebug.log("launcher LRU evict \(victim)")
      removeSession(appId: victim)
    }
  }

  private func removeSession(appId: String) {
    recency.removeAll { $0 == appId }
    sessions.removeValue(forKey: appId)?.close()
    publishLiveApps()
  }

  private func publishLiveApps() {
    liveAppIds = Array(recency.reversed())
  }

  private func runSessionPoolSmoke() {
    guard apps.count >= 4 else {
      HostDebug.writeResult([
        "ok": false,
        "error": "need at least four apps for the LRU smoke",
        "apps": apps.map(\.id),
      ], name: "session-lru-smoke.json")
      return
    }
    let firstApp = apps[0]
    let evictedApp = apps[1]
    let thirdApp = apps[2]
    let fourthApp = apps[3]
    let first = acquireSession(for: firstApp)
    _ = acquireSession(for: evictedApp)
    _ = acquireSession(for: thirdApp)
    let reopened = acquireSession(for: firstApp)
    let reused = first === reopened
    _ = acquireSession(for: fourthApp)
    let live = Set(sessions.keys)
    let expected = Set([firstApp.id, thirdApp.id, fourthApp.id])
    let evicted = !live.contains(evictedApp.id)
    let ok = reused && evicted && live == expected && sessions.count == LauncherModel.maxLiveSessions
    let result: [String: Any] = [
      "ok": ok,
      "runId": HostDebug.runId,
      "reused": reused,
      "evicted": evicted,
      "evictedApp": evictedApp.id,
      "maxLiveSessions": LauncherModel.maxLiveSessions,
      "expected": Array(expected),
      "live": Array(live),
    ]
    HostDebug.writeResult(result, name: "session-lru-smoke.json")
    HostDebug.log(
      "session LRU smoke ok=\(ok) reused=\(reused) evicted=\(evicted) " +
      "live=\(live.sorted().joined(separator: ","))"
    )
    for appId in recency {
      removeSession(appId: appId)
    }
  }
}

struct LauncherView: View {
  @StateObject private var model = LauncherModel()

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 18) {
          header

          if let loadError = model.loadError {
            errorCard(loadError)
          }

          if model.apps.isEmpty && model.loadError == nil {
            emptyCard
          } else {
            ForEach(Array(model.apps.enumerated()), id: \.element.id) { index, app in
              Button {
                model.open(app)
              } label: {
                appCard(app, index: index)
              }
              .buttonStyle(.plain)
            }
          }

          footer
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
        .padding(.bottom, 28)
      }
      .background(Color(uiColor: .systemGroupedBackground))
      .navigationTitle("Tiny 小程序")
      .navigationBarTitleDisplayMode(.large)
    }
    .fullScreenCover(item: $model.activePresentation) { presentation in
      MiniProgramView(session: presentation.session) {
        model.close(presentation.session)
      }
    }
    .task {
      model.load()
      if model.smoke {
        NativeRenderSurfaceSmoke.run()
        if ProcessInfo.processInfo.arguments.contains("-TINY_HOSTCORE_SMOKE") {
          NativeHostCoreSmoke.run()
        }
      }
    }
    .onReceive(NotificationCenter.default.publisher(
      for: UIApplication.didReceiveMemoryWarningNotification
    )) { _ in
      model.evictInactiveSessions()
    }
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text("本地示例")
        .font(.system(size: 13, weight: .medium))
        .foregroundColor(.secondary)
      Text("选择一个编译产物，在 WKWebView 中渲染，逻辑运行在 JavaScriptCore。")
        .font(.system(size: 15))
        .foregroundColor(.primary)
        .fixedSize(horizontal: false, vertical: true)
      if !model.liveAppIds.isEmpty {
        Label(
          "\(model.liveAppIds.count)/\(LauncherModel.maxLiveSessions) 个会话保活中",
          systemImage: "memorychip"
        )
        .font(.system(size: 12, weight: .medium))
        .foregroundColor(Color.accentColor)
      }
    }
    .padding(.vertical, 6)
  }

  private func appCard(_ app: AppInfo, index: Int) -> some View {
    HStack(spacing: 14) {
      ZStack {
        RoundedRectangle(cornerRadius: 14, style: .continuous)
          .fill(iconGradient(index: index))
        Image(systemName: iconName(index: index))
          .font(.system(size: 20, weight: .semibold))
          .foregroundColor(.white)
      }
      .frame(width: 52, height: 52)

      VStack(alignment: .leading, spacing: 3) {
        Text(app.label)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.primary)
          .lineLimit(1)
        Text(app.title == app.label ? app.firstPage : app.title)
          .font(.system(size: 13))
          .foregroundColor(.secondary)
          .lineLimit(1)
        HStack(spacing: 6) {
          Text("\(app.pages) 个页面")
            .foregroundColor(Color.secondary.opacity(0.8))
          if model.isLive(app) {
            Text("保活中")
              .foregroundColor(.green)
              .padding(.horizontal, 6)
              .padding(.vertical, 2)
              .background(Capsule().fill(Color.green.opacity(0.12)))
          }
        }
        .font(.system(size: 11, weight: .medium))
      }

      Spacer(minLength: 8)

      Image(systemName: "chevron.right")
        .font(.system(size: 13, weight: .semibold))
        .foregroundColor(Color.secondary.opacity(0.5))
    }
    .padding(16)
    .background(
      RoundedRectangle(cornerRadius: 18, style: .continuous)
        .fill(Color(uiColor: .secondarySystemGroupedBackground))
        .shadow(color: .black.opacity(0.04), radius: 10, y: 4)
    )
  }

  private var emptyCard: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("没有找到小程序")
        .font(.system(size: 15, weight: .semibold))
      Text("请先运行 `pnpm ios:assets` 生成 demo、mini 和 todo 产物，然后重新构建 App。")
        .font(.system(size: 13))
        .foregroundColor(.secondary)
    }
    .padding(18)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .fill(Color(uiColor: .secondarySystemGroupedBackground))
    )
  }

  private func errorCard(_ message: String) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Label("加载失败", systemImage: "exclamationmark.triangle.fill")
        .font(.system(size: 14, weight: .semibold))
        .foregroundColor(.orange)
      Text(message)
        .font(.system(size: 12))
        .foregroundColor(.secondary)
        .textSelection(.enabled)
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .fill(Color.orange.opacity(0.08))
    )
  }

  private var footer: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text("Tiny 引擎")
        .font(.system(size: 12, weight: .semibold))
        .foregroundColor(.secondary)
      Text("渲染层 WKWebView · 逻辑层 JavaScriptCore · 最近 3 个会话保活")
        .font(.system(size: 11))
        .foregroundColor(Color.secondary.opacity(0.75))
    }
    .padding(.top, 10)
  }

  private func iconGradient(index: Int) -> LinearGradient {
    let palettes: [(Color, Color)] = [
      (Color(red: 0.12, green: 0.72, blue: 0.42), Color(red: 0.04, green: 0.55, blue: 0.78)),
      (Color(red: 0.98, green: 0.55, blue: 0.22), Color(red: 0.91, green: 0.27, blue: 0.33)),
      (Color(red: 0.44, green: 0.38, blue: 0.95), Color(red: 0.20, green: 0.64, blue: 0.94)),
    ]
    let palette = palettes[index % palettes.count]
    return LinearGradient(
      colors: [palette.0, palette.1],
      startPoint: .topLeading,
      endPoint: .bottomTrailing
    )
  }

  private func iconName(index: Int) -> String {
    let names = ["square.stack.3d.up.fill", "checklist", "shippingbox.fill"]
    return names[index % names.count]
  }
}
