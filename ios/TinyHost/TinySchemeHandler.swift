import Foundation
import WebKit

/// Serves the generated host, render and asset files from the app bundle over
/// `tinyapp://app/...`. WKWebView cannot use `file://` iframes reliably, and a
/// custom scheme gives every page frame one stable origin.
final class TinySchemeHandler: NSObject, WKURLSchemeHandler {
  private let root: URL
  private let rootPrefix: String

  init(root: URL) {
    let standardized = root.standardizedFileURL
    self.root = standardized
    self.rootPrefix = standardized.path.hasSuffix("/")
      ? standardized.path
      : standardized.path + "/"
    super.init()
  }

  func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
    guard let url = urlSchemeTask.request.url else {
      respond(urlSchemeTask, url: URL(string: "tinyapp://app/")!, status: 400, body: Data("Bad request".utf8))
      return
    }
    guard url.host == "app" else {
      respond(urlSchemeTask, url: url, status: 404, body: Data("Not found".utf8))
      return
    }

    var relative = url.path
    if relative.hasPrefix("/") {
      relative.removeFirst()
    }
    if relative.isEmpty {
      relative = "www/host.html"
    }
    if relative.hasSuffix("/") {
      relative += "index.html"
    }

    let fileURL = root.appendingPathComponent(relative).standardizedFileURL
    guard fileURL.path.hasPrefix(rootPrefix) else {
      respond(urlSchemeTask, url: url, status: 403, body: Data("Forbidden".utf8))
      return
    }

    var isDirectory: ObjCBool = false
    guard FileManager.default.fileExists(atPath: fileURL.path, isDirectory: &isDirectory),
          !isDirectory.boolValue
    else {
      respond(urlSchemeTask, url: url, status: 404, body: Data("Not found: \(relative)".utf8))
      return
    }

    do {
      let data = try Data(contentsOf: fileURL)
      let response = HTTPURLResponse(
        url: url,
        statusCode: 200,
        httpVersion: "HTTP/1.1",
        headerFields: [
          "Content-Type": mimeType(for: fileURL.pathExtension),
          "Content-Length": String(data.count),
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        ]
      )!
      urlSchemeTask.didReceive(response)
      urlSchemeTask.didReceive(data)
      urlSchemeTask.didFinish()
    } catch {
      respond(urlSchemeTask, url: url, status: 500, body: Data("Failed to read \(relative)".utf8))
    }
  }

  func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
    // Every task is completed synchronously above; nothing to cancel.
  }

  private func respond(_ task: WKURLSchemeTask, url: URL, status: Int, body: Data) {
    let response = HTTPURLResponse(
      url: url,
      statusCode: status,
      httpVersion: "HTTP/1.1",
      headerFields: [
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": String(body.count),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      ]
    )!
    task.didReceive(response)
    task.didReceive(body)
    task.didFinish()
  }

  private func mimeType(for extensionName: String) -> String {
    switch extensionName.lowercased() {
    case "html", "htm":
      return "text/html; charset=utf-8"
    case "js", "mjs":
      return "text/javascript; charset=utf-8"
    case "css":
      return "text/css; charset=utf-8"
    case "json":
      return "application/json; charset=utf-8"
    case "svg":
      return "image/svg+xml"
    case "png":
      return "image/png"
    case "jpg", "jpeg":
      return "image/jpeg"
    case "gif":
      return "image/gif"
    case "webp":
      return "image/webp"
    case "ico":
      return "image/x-icon"
    case "woff":
      return "font/woff"
    case "woff2":
      return "font/woff2"
    case "ttf":
      return "font/ttf"
    case "otf":
      return "font/otf"
    case "mp3":
      return "audio/mpeg"
    case "mp4":
      return "video/mp4"
    default:
      return "application/octet-stream"
    }
  }
}
