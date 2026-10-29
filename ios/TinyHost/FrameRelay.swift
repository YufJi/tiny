import Foundation

/// Ordered frame relay between the WebView host and the JavaScriptCore service.
///
/// Both sides may become ready in either order, so inbound frames are queued
/// until the peer is available. The queue is bounded: a broken peer must not
/// grow memory without limit.
@MainActor
final class FrameRelay {
  var deliverToService: ((String) -> Void)?
  var deliverToHost: ((String) -> Void)?

  private var serviceReady = false
  private var hostReady = false
  private var pendingToService: [String] = []
  private var pendingToHost: [String] = []
  private let limit = 512

  func markServiceReady(_ ready: Bool) {
    serviceReady = ready
    if ready {
      flushToService()
    }
  }

  func markHostReady(_ ready: Bool) {
    hostReady = ready
    if ready {
      flushToHost()
    }
  }

  func fromHost(_ frame: String) {
    if serviceReady {
      deliverToService?(frame)
    } else {
      pendingToService.append(frame)
      trim(&pendingToService, label: "service")
    }
  }

  func fromService(_ frame: String) {
    if hostReady {
      deliverToHost?(frame)
    } else {
      pendingToHost.append(frame)
      trim(&pendingToHost, label: "host")
    }
  }

  func reset() {
    pendingToService.removeAll()
    pendingToHost.removeAll()
    serviceReady = false
    hostReady = false
  }

  private func flushToService() {
    let frames = pendingToService
    pendingToService.removeAll()
    for frame in frames {
      deliverToService?(frame)
    }
  }

  private func flushToHost() {
    let frames = pendingToHost
    pendingToHost.removeAll()
    for frame in frames {
      deliverToHost?(frame)
    }
  }

  private func trim(_ frames: inout [String], label: String) {
    guard frames.count > limit else { return }
    let overflow = frames.count - limit
    frames.removeFirst(overflow)
    print("[tiny ios] dropped \(overflow) \(label) frames while the peer was not ready")
  }
}
