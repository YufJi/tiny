import SwiftUI
import UIKit

struct AppInfo: Identifiable, Decodable, Hashable {
  let id: String
  let label: String
  let title: String
  let pages: Int
  let firstPage: String
}

struct AppRegistryFile: Decodable {
  let apps: [AppInfo]
}

enum AppRegistryError: LocalizedError {
  case missingBundle
  case missingRegistry
  case invalidRegistry(String)

  var errorDescription: String? {
    switch self {
    case .missingBundle:
      return "应用资源目录不可用"
    case .missingRegistry:
      return "缺少 Generated/apps.json，请先运行 pnpm ios:assets"
    case .invalidRegistry(let message):
      return "apps.json 解析失败：\(message)"
    }
  }
}

enum AppRegistry {
  static func load(bundle: Bundle = .main) throws -> [AppInfo] {
    guard let resourceRoot = bundle.resourceURL else {
      throw AppRegistryError.missingBundle
    }
    let url = resourceRoot.appendingPathComponent("Generated/apps.json")
    guard let data = try? Data(contentsOf: url) else {
      throw AppRegistryError.missingRegistry
    }
    do {
      return try JSONDecoder().decode(AppRegistryFile.self, from: data).apps
    } catch {
      throw AppRegistryError.invalidRegistry(error.localizedDescription)
    }
  }
}

struct NavState: Decodable, Equatable {
  let custom: Bool
  let backgroundColor: String
  let textStyle: String
}

struct TabBarItemState: Decodable, Identifiable, Equatable {
  let index: Int
  let pagePath: String
  let text: String
  let iconPath: String?
  let selectedIconPath: String?
  let badge: String?
  let redDot: Bool

  var id: Int { index }
}

struct TabBarState: Decodable, Equatable {
  let visible: Bool
  let custom: Bool
  let position: String
  let color: String
  let selectedColor: String
  let backgroundColor: String
  let borderStyle: String
  let selectedIndex: Int
  let items: [TabBarItemState]
}

struct HostUIState: Decodable, Equatable {
  let appId: String
  let pageId: String?
  let path: String
  let title: String
  let canBack: Bool
  let nav: NavState
  let tabBar: TabBarState?
}

struct HostSystemInfo {
  let screenWidth: CGFloat
  let screenHeight: CGFloat
  let pixelRatio: CGFloat
  let deviceSystem: String
  let deviceModel: String
  let language: String
  let theme: String
  let safeAreaRect: CGRect
  let menuButtonRect: CGRect

  let safeAreaTop: CGFloat
  let safeAreaBottom: CGFloat

  var menuButtonTopInset: CGFloat {
    max(0, menuButtonRect.minY - safeAreaTop)
  }

  var menuButtonTrailingInset: CGFloat {
    max(0, screenWidth - menuButtonRect.maxX)
  }

  var menuButtonWidth: CGFloat { menuButtonRect.width }
  var menuButtonHeight: CGFloat { menuButtonRect.height }

  var menuButton: [String: Any] {
    [
      "width": Double(menuButtonRect.width),
      "height": Double(menuButtonRect.height),
      "top": Double(menuButtonRect.minY),
      "right": Double(menuButtonRect.maxX),
      "bottom": Double(menuButtonRect.maxY),
      "left": Double(menuButtonRect.minX),
    ]
  }

  static func current() -> HostSystemInfo {
    let screen = UIScreen.main
    let scene = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first
    let window = scene?.windows.first(where: \.isKeyWindow)
    let bounds = window?.bounds ?? screen.bounds
    let insets = window?.safeAreaInsets ?? .zero
    let statusBarHeight = insets.top > 0
      ? insets.top
      : (scene?.statusBarManager?.statusBarFrame.height ?? 20)
    let language = Locale.preferredLanguages.first?
      .replacingOccurrences(of: "-", with: "_") ?? "en"
    let systemVersion = UIDevice.current.systemVersion

    let safeTop = max(insets.top, statusBarHeight)
    let safeAreaRect = CGRect(
      x: insets.left,
      y: safeTop,
      width: max(0, bounds.width - insets.left - insets.right),
      height: max(0, bounds.height - safeTop - insets.bottom)
    )
    let menuButtonRect = CGRect(
      x: bounds.width - 8 - 87,
      y: statusBarHeight + 4,
      width: 87,
      height: 32
    )

    return HostSystemInfo(
      screenWidth: bounds.width,
      screenHeight: bounds.height,
      pixelRatio: screen.scale,
      deviceSystem: "\(UIDevice.current.systemName) \(systemVersion)",
      deviceModel: UIDevice.current.model,
      language: language,
      theme: "light",
      safeAreaRect: safeAreaRect,
      menuButtonRect: menuButtonRect,
      safeAreaTop: safeTop,
      safeAreaBottom: insets.bottom,
    )
  }

  func systemInfo(windowWidth: CGFloat, windowHeight: CGFloat) -> [String: Any] {
    [
      "pixelRatio": Double(pixelRatio),
      "windowWidth": Double(windowWidth),
      "windowHeight": Double(windowHeight),
      "screenWidth": Double(screenWidth),
      "screenHeight": Double(screenHeight),
      "statusBarHeight": Double(safeAreaTop),
      "safeArea": [
        "top": Double(safeAreaRect.minY),
        "left": Double(safeAreaRect.minX),
        "right": Double(safeAreaRect.maxX),
        "bottom": Double(safeAreaRect.maxY),
        "width": Double(safeAreaRect.width),
        "height": Double(safeAreaRect.height),
      ],
      "platform": "ios",
      "system": deviceSystem,
      "model": deviceModel,
      "brand": "Apple",
      "language": language,
      "version": "8.0.0",
      "SDKVersion": "3.0.0",
      "theme": theme,
      "host": "WeChat",
      "enableDebug": false,
    ]
  }

  func payload(appId: String, smoke: Bool) -> [String: Any] {
    [
      "appId": appId,
      "smoke": smoke,
      "system": systemInfo(windowWidth: screenWidth, windowHeight: screenHeight),
      "menuButton": menuButton,
    ]
  }

  func jsonString(appId: String, smoke: Bool) -> String {
    let value = payload(appId: appId, smoke: smoke)
    guard
      let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]),
      let text = String(data: data, encoding: .utf8)
    else {
      return "{}"
    }
    return text
  }
}

extension Color {
  init(hex: String, fallback: Color = .black) {
    var value = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    if value.hasPrefix("#") {
      value.removeFirst()
    }
    if value.count == 3 {
      value = value.map { "\($0)\($0)" }.joined()
    }
    guard value.count == 6, let number = UInt64(value, radix: 16) else {
      self = fallback
      return
    }
    let red = Double((number >> 16) & 0xff) / 255
    let green = Double((number >> 8) & 0xff) / 255
    let blue = Double(number & 0xff) / 255
    self.init(.sRGB, red: red, green: green, blue: blue, opacity: 1)
  }
}


enum HostDebug {
  static let directory: URL = {
    let arguments = ProcessInfo.processInfo.arguments
    if let index = arguments.firstIndex(of: "-TINY_RESULT_DIR"), index + 1 < arguments.count {
      return URL(fileURLWithPath: arguments[index + 1], isDirectory: true)
    }
    if let value = ProcessInfo.processInfo.environment["TINY_RESULT_DIR"], !value.isEmpty {
      return URL(fileURLWithPath: value, isDirectory: true)
    }
    return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      ?? FileManager.default.temporaryDirectory
  }()

  static let runId: String = {
    let arguments = ProcessInfo.processInfo.arguments
    if let index = arguments.firstIndex(of: "-TINY_RUN_ID"), index + 1 < arguments.count {
      return arguments[index + 1]
    }
    return String(Int(Date().timeIntervalSince1970 * 1000))
  }()

  static func log(_ message: String) {
    let line = "[tiny ios] \(message)\n"
    FileHandle.standardError.write(Data(line.utf8))
    do {
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
      let file = directory.appendingPathComponent("tiny-host.log")
      if let handle = try? FileHandle(forWritingTo: file) {
        handle.seekToEndOfFile()
        handle.write(Data(line.utf8))
        try? handle.close()
      } else {
        try Data(line.utf8).write(to: file)
      }
    } catch {
      // Logging must never affect the host.
    }
  }

  static func writeResult(_ value: [String: Any], name: String) {
    guard let data = try? JSONSerialization.data(
      withJSONObject: value,
      options: [.prettyPrinted, .sortedKeys]
    ) else {
      return
    }
    do {
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
      try data.write(to: directory.appendingPathComponent(name))
    } catch {
      log("could not write \(name): \(error.localizedDescription)")
    }
  }
}
