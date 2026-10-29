import SwiftUI

@MainActor
final class LauncherModel: ObservableObject {
  @Published var apps: [AppInfo] = []
  @Published var loadError: String?
  @Published var selectedApp: AppInfo?
  @Published var smoke: Bool

  private let launchAppId: String?

  init() {
    let arguments = ProcessInfo.processInfo.arguments
    if let index = arguments.firstIndex(of: "-TINY_AUTOLAUNCH"), index + 1 < arguments.count {
      launchAppId = arguments[index + 1]
    } else {
      launchAppId = nil
    }
    smoke = arguments.contains("-TINY_SMOKE")
  }

  func load() {
    do {
      apps = try AppRegistry.load()
      HostDebug.log("apps loaded: \(apps.map { $0.id }.joined(separator: ","))")
      loadError = nil
      if let launchAppId, let app = apps.first(where: { $0.id == launchAppId }) {
        selectedApp = app
      }
    } catch {
      loadError = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
      HostDebug.log("app registry failed: \(loadError ?? "")")
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
                model.selectedApp = app
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
    .fullScreenCover(item: $model.selectedApp) { app in
      MiniProgramView(app: app, smoke: model.smoke)
    }
    .task {
      model.load()
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
        Text("\(app.pages) 个页面")
          .font(.system(size: 11))
          .foregroundColor(Color.secondary.opacity(0.8))
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
      Text("渲染层 WKWebView · 逻辑层 JavaScriptCore · 页面按 iframe 隔离")
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
