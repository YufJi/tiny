import SwiftUI

struct MiniProgramView: View {
  let app: AppInfo

  @Environment(\.dismiss) private var dismiss
  @Environment(\.scenePhase) private var scenePhase
  @StateObject private var session: MiniProgramSession

  init(app: AppInfo, smoke: Bool) {
    self.app = app
    _session = StateObject(wrappedValue: MiniProgramSession(app: app, smoke: smoke))
  }

  private var customNavigation: Bool {
    session.uiState?.nav.custom ?? false
  }

  private var ignoredEdges: Edge.Set {
    var edges: Edge.Set = []
    if customNavigation {
      edges.insert(.top)
    }
    if session.uiState?.tabBar == nil || session.uiState?.tabBar?.position == "top" {
      edges.insert(.bottom)
    }
    return edges
  }

  var body: some View {
    ZStack {
      VStack(spacing: 0) {
        if !customNavigation {
          navigationBar
        }
        if let tabBar = session.uiState?.tabBar, tabBar.position == "top" {
          tabBarView(tabBar)
        }
        TinyWebView(session: session)
        if let tabBar = session.uiState?.tabBar, tabBar.position != "top" {
          tabBarView(tabBar)
        }
      }
      .ignoresSafeArea(edges: ignoredEdges)

      if customNavigation {
        floatingNavigation
      }
      if session.loading {
        loadingOverlay
      }
      if let message = session.errorMessage {
        errorOverlay(message)
      }
    }
    .background(Color.white)
    .onAppear {
      session.startIfNeeded()
    }
    .onChange(of: scenePhase) { phase in
      session.setVisible(phase == .active)
    }
    .interactiveDismissDisabled()
  }

  private var navigationBar: some View {
    let nav = session.uiState?.nav
    let background = Color(hex: nav?.backgroundColor ?? "#ffffff")
    let foreground: Color = nav?.textStyle == "white" ? .white : .black

    return ZStack {
      Text(session.uiState?.title ?? app.title)
        .font(.system(size: 17, weight: .semibold))
        .foregroundColor(foreground)
        .lineLimit(1)
        .padding(.horizontal, 90)

      HStack(spacing: 0) {
        if session.uiState?.canBack == true {
          Button {
            session.back()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 18, weight: .semibold))
              .foregroundColor(foreground)
              .frame(width: 44, height: 44)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
        } else {
          Color.clear.frame(width: 44, height: 44)
        }
        Spacer(minLength: 0)
        capsuleMenu(foreground: foreground, floating: false)
      }
      .padding(.horizontal, 8)
    }
    .frame(height: 44)
    .background(background.ignoresSafeArea(edges: .top))
  }

  private var floatingNavigation: some View {
    VStack {
      HStack(spacing: 8) {
        if session.uiState?.canBack == true {
          Button {
            session.back()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 16, weight: .bold))
              .foregroundColor(.black)
              .frame(width: 36, height: 32)
              .background(Capsule().fill(Color.white.opacity(0.92)))
              .overlay(Capsule().stroke(Color.black.opacity(0.12), lineWidth: 0.5))
              .shadow(color: .black.opacity(0.12), radius: 8, y: 2)
          }
          .buttonStyle(.plain)
        }
        Spacer(minLength: 0)
        capsuleMenu(foreground: .black, floating: true)
      }
      .padding(.top, session.systemInfo.safeAreaTop + 6)
      .padding(.horizontal, 10)
      Spacer(minLength: 0)
    }
  }

  private func capsuleMenu(foreground: Color, floating: Bool) -> some View {
    Menu {
      Button("关闭小程序", role: .destructive) {
        dismiss()
      }
    } label: {
      HStack(spacing: 8) {
        Image(systemName: "ellipsis")
        Rectangle()
          .fill(foreground.opacity(0.18))
          .frame(width: 1, height: 14)
        Image(systemName: "xmark")
      }
      .font(.system(size: 13, weight: .semibold))
      .foregroundColor(foreground)
      .padding(.horizontal, 10)
      .frame(height: 30)
      .background(
        Capsule().fill(floating ? Color.white.opacity(0.94) : Color.white.opacity(0.6))
      )
      .overlay(Capsule().stroke(foreground.opacity(0.16), lineWidth: 0.5))
      .shadow(color: .black.opacity(floating ? 0.12 : 0), radius: 8, y: 2)
    }
  }

  private func tabBarView(_ state: TabBarState) -> some View {
    HStack(spacing: 0) {
      ForEach(state.items) { item in
        Button {
          session.switchTab(item.index)
        } label: {
          VStack(spacing: 2) {
            tabIcon(item, state: state)
              .overlay(alignment: .topTrailing) {
                tabBadge(item)
              }
            Text(item.text)
              .font(.system(size: 10, weight: .medium))
              .foregroundColor(tabColor(item, state: state))
              .lineLimit(1)
          }
          .frame(maxWidth: .infinity)
          .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
      }
    }
    .padding(.top, 6)
    .padding(.bottom, 4)
    .frame(height: 50)
    .background(
      Color(hex: state.backgroundColor)
        .ignoresSafeArea(edges: state.position == "bottom" ? .bottom : [])
    )
    .overlay(alignment: state.position == "bottom" ? .top : .bottom) {
      Rectangle()
        .fill(Color.black.opacity(state.borderStyle == "white" ? 0.08 : 0.16))
        .frame(height: 0.5)
    }
  }

  private func tabColor(_ item: TabBarItemState, state: TabBarState) -> Color {
    item.index == state.selectedIndex
      ? Color(hex: state.selectedColor)
      : Color(hex: state.color)
  }

  @ViewBuilder
  private func tabIcon(_ item: TabBarItemState, state: TabBarState) -> some View {
    let selected = item.index == state.selectedIndex
    if let path = selected ? (item.selectedIconPath ?? item.iconPath) : item.iconPath,
       let image = session.loadAssetImage(path) {
      Image(uiImage: image)
        .resizable()
        .scaledToFit()
        .frame(width: 24, height: 24)
    } else {
      Circle()
        .fill(tabColor(item, state: state))
        .frame(width: 7, height: 7)
        .frame(width: 24, height: 24)
    }
  }

  @ViewBuilder
  private func tabBadge(_ item: TabBarItemState) -> some View {
    if let badge = item.badge, !badge.isEmpty {
      Text(badge)
        .font(.system(size: 9, weight: .bold))
        .foregroundColor(.white)
        .padding(.horizontal, 4)
        .frame(minWidth: 14, minHeight: 14)
        .background(Capsule().fill(Color.red))
        .offset(x: 5, y: -3)
    } else if item.redDot {
      Circle()
        .fill(Color.red)
        .frame(width: 7, height: 7)
        .offset(x: 5, y: -1)
    }
  }

  private var loadingOverlay: some View {
    VStack(spacing: 12) {
      ProgressView()
      Text("正在打开 \(app.label)…")
        .font(.system(size: 13))
        .foregroundColor(.secondary)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 20)
    .background(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .fill(Color.white)
        .shadow(color: .black.opacity(0.12), radius: 20, y: 6)
    )
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color.black.opacity(0.04))
  }

  private func errorOverlay(_ message: String) -> some View {
    ZStack {
      Color.black.opacity(0.35)
        .ignoresSafeArea()
      VStack(spacing: 14) {
        Image(systemName: "exclamationmark.triangle.fill")
          .font(.system(size: 30))
          .foregroundColor(.orange)
        Text("小程序加载失败")
          .font(.system(size: 17, weight: .semibold))
        ScrollView {
          Text(message)
            .font(.system(size: 12))
            .foregroundColor(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .textSelection(.enabled)
        }
        .frame(maxHeight: 180)
        Button {
          dismiss()
        } label: {
          Text("关闭")
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(RoundedRectangle(cornerRadius: 10).fill(Color.black))
        }
        .buttonStyle(.plain)
      }
      .padding(22)
      .frame(maxWidth: 320)
      .background(
        RoundedRectangle(cornerRadius: 18, style: .continuous)
          .fill(Color.white)
      )
    }
  }
}
