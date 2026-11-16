import SwiftUI

struct MiniProgramView: View {
  @ObservedObject var session: MiniProgramSession
  let onClose: () -> Void
  @Environment(\.dismiss) private var dismiss
  @Environment(\.scenePhase) private var scenePhase

  init(session: MiniProgramSession, onClose: @escaping () -> Void) {
    _session = ObservedObject(wrappedValue: session)
    self.onClose = onClose
  }

  private var app: AppInfo {
    session.app
  }

  private var customNavigation: Bool {
    session.uiState?.nav.custom ?? false
  }

  private var prefersDarkChrome: Bool {
    session.uiState?.nav.textStyle == "white"
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
        NativeHostView(session: session)
        if let tabBar = session.uiState?.tabBar, tabBar.position != "top" {
          tabBarView(tabBar)
        }
      }
      .ignoresSafeArea(edges: ignoredEdges)

      if customNavigation {
        customNavigationCapsule
      }
      if session.loading {
        loadingOverlay
      }
      if let message = session.errorMessage {
        errorOverlay(message)
      }
    }
    .background(Color.white)
    .preferredColorScheme(prefersDarkChrome ? .dark : .light)
    .onAppear {
      session.startIfNeeded()
    }
    .onChange(of: scenePhase) { phase in
      session.setVisible(phase == .active)
    }
    .onDisappear {
      session.setVisible(false)
    }
    .interactiveDismissDisabled()
  }

  private var navigationBar: some View {
    let nav = session.uiState?.nav
    let background = Color(hex: nav?.backgroundColor ?? "#ffffff")
    let foreground: Color = nav?.textStyle == "white" ? .white : .black

    return ZStack {
      Text(session.uiState?.title ?? app.title)
        .font(.system(size: 16, weight: .semibold))
        .foregroundColor(foreground)
        .lineLimit(1)
        .padding(.horizontal, 108)

      HStack(spacing: 0) {
        if session.uiState?.canBack == true {
          Button {
            session.back()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 21, weight: .semibold))
              .foregroundColor(foreground)
              .frame(width: 34, height: 34)
              .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
        } else {
          Color.clear.frame(width: 34, height: 34)
        }
        Spacer(minLength: 0)
      }
      .padding(.horizontal, 8)
    }
    .frame(height: 44)
    .background(background.ignoresSafeArea(edges: .top))
    .overlay(alignment: .bottom) {
      Rectangle()
        .fill(Color(white: 0.5).opacity(0.13))
        .frame(height: 0.5)
    }
    .overlay(alignment: .topTrailing) {
      capsuleMenu(dark: nav?.textStyle == "white")
        .padding(.top, session.systemInfo.menuButtonTopInset)
        .padding(.trailing, session.systemInfo.menuButtonTrailingInset)
    }
  }

  private var customNavigationCapsule: some View {
    VStack {
      HStack {
        Spacer(minLength: 0)
        capsuleMenu(dark: session.uiState?.nav.textStyle == "white")
      }
      .padding(.top, session.systemInfo.menuButtonTopInset)
      .padding(.trailing, session.systemInfo.menuButtonTrailingInset)
      Spacer(minLength: 0)
    }
  }

  private func capsuleMenu(dark: Bool) -> some View {
    let foreground: Color = dark ? .white : .black
    let fill = dark ? Color.white.opacity(0.14) : Color.black.opacity(0.045)
    let stroke = dark ? Color.white.opacity(0.18) : Color.black.opacity(0.08)

    return HStack(spacing: 0) {
      Menu {
        Button("返回上一页") {
          session.back()
        }
        .disabled(session.uiState?.canBack != true)
        Button("关闭当前小程序", role: .destructive) {
          onClose()
        }
      } label: {
        CapsuleDots(color: foreground)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .contentShape(Rectangle())
      }
      .accessibilityLabel("小程序菜单")
      .tint(foreground)

      Rectangle()
        .fill(foreground.opacity(0.16))
        .frame(width: 1, height: 14)

      Button {
        dismiss()
      } label: {
        CapsuleRing(color: foreground)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .accessibilityLabel("返回小程序列表")
    }
    .frame(
      width: session.systemInfo.menuButtonWidth,
      height: session.systemInfo.menuButtonHeight
    )
    .background(Capsule().fill(fill))
    .overlay(Capsule().stroke(stroke, lineWidth: 0.5))
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
          onClose()
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

private struct CapsuleDots: View {
  let color: Color

  var body: some View {
    HStack(spacing: 2) {
      ForEach(0..<3, id: \.self) { _ in
        Circle()
          .fill(color.opacity(0.8))
          .frame(width: 3, height: 3)
      }
    }
  }
}

private struct CapsuleRing: View {
  let color: Color

  var body: some View {
    Circle()
      .strokeBorder(color.opacity(0.75), lineWidth: 1.4)
      .frame(width: 12, height: 12)
  }
}
