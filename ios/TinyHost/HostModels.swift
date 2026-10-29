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
  let system: [String: Any]
  let menuButton: [String: Any]
  let safeAreaTop: CGFloat
  let safeAreaBottom: CGFloat
  let screenWidth: CGFloat

  static func current() -> HostSystemInfo {
    let screen = UIScreen.main
    let bounds = screen.bounds
    let scene = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first
    let window = scene?.windows.first(where: \.isKeyWindow)
    let insets = window?.safeAreaInsets ?? .zero
    let statusBarHeight = insets.top > 0
      ? insets.top
      : (scene?.statusBarManager?.statusBarFrame.height ?? 20)
    let language = Locale.preferredLanguages.first?
      .replacingOccurrences(of: "-", with: "_") ?? "en"
    let systemVersion = UIDevice.current.systemVersion

    let system: [String: Any] = [
      "pixelRatio": Double(screen.scale),
      "windowWidth": Double(bounds.width),
      "windowHeight": Double(bounds.height),
      "screenWidth": Double(bounds.width),
      "screenHeight": Double(bounds.height),
      "statusBarHeight": Double(statusBarHeight),
      "safeArea": [
        "top": Double(insets.top),
        "left": Double(insets.left),
        "right": Double(insets.right),
        "bottom": Double(insets.bottom),
      ],
      "platform": "ios",
      "system": "\(UIDevice.current.systemName) \(systemVersion)",
      "model": UIDevice.current.model,
      "brand": "Apple",
      "language": language,
      "version": systemVersion,
      "SDKVersion": "3.0.0",
      "theme": "light",
    ]

    let right = Double(bounds.width) - 8
    let top = Double(statusBarHeight) + 4
    let menuButton: [String: Any] = [
      "width": 87.0,
      "height": 32.0,
      "top": top,
      "right": right,
      "bottom": top + 32,
      "left": right - 87,
    ]

    return HostSystemInfo(
      system: system,
      menuButton: menuButton,
      safeAreaTop: insets.top,
      safeAreaBottom: insets.bottom,
      screenWidth: bounds.width,
    )
  }

  func payload(appId: String, smoke: Bool) -> [String: Any] {
    [
      "appId": appId,
      "smoke": smoke,
      "system": system,
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
