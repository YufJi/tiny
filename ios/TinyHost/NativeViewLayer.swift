import UIKit

/// Transparent container that only receives hits on real descendant controls.
@MainActor
final class NativePassthroughView: UIView {
  override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    let hit = super.hitTest(point, with: event)
    return hit === self ? nil : hit
  }
}

/// A page-scoped native view layer placed above the page WebView.
///
/// A slot owns two views: the clipped slot frame and the content container.
/// Native controls are added to the content container, so a scroll-view or
/// page clip can move the slot without moving the control's own coordinate
/// system.
@MainActor
final class NativeViewSlot {
  let view = NativePassthroughView()
  let container = UIView()
  private let maskLayer = CAShapeLayer()

  init() {
    view.clipsToBounds = true
    view.backgroundColor = .clear
    container.backgroundColor = .clear
    container.isUserInteractionEnabled = false
    container.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    view.addSubview(container)
    maskLayer.fillColor = UIColor.black.cgColor
    maskLayer.fillRule = .nonZero
    view.layer.mask = maskLayer
  }

  func update(
    frame: CGRect,
    clip: CGRect?,
    mask: [CGRect]?,
    zIndex: Int,
    visible: Bool
  ) {
    let candidate = clip.map { frame.intersection($0) } ?? frame
    let clipFrame = candidate.isNull || candidate.width <= 0 || candidate.height <= 0
      ? CGRect(x: frame.minX, y: frame.minY, width: 0, height: 0)
      : candidate
    view.frame = clipFrame
    container.frame = CGRect(
      x: frame.minX - clipFrame.minX,
      y: frame.minY - clipFrame.minY,
      width: frame.width,
      height: frame.height
    )
    let maskRects = mask ?? [clipFrame]
    let path = UIBezierPath()
    for rect in maskRects {
      let local = rect.intersection(clipFrame)
      guard !local.isNull, local.width > 0, local.height > 0 else { continue }
      path.append(UIBezierPath(rect: CGRect(
        x: local.minX - clipFrame.minX,
        y: local.minY - clipFrame.minY,
        width: local.width,
        height: local.height
      )))
    }
    maskLayer.frame = view.bounds
    maskLayer.path = path.cgPath
    view.isHidden = !visible
      || clipFrame.width <= 0
      || clipFrame.height <= 0
      || path.isEmpty
    view.layer.zPosition = CGFloat(zIndex)
  }
}

@MainActor
final class NativeViewLayer {
  let view = NativePassthroughView()
  private var slots: [String: NativeViewSlot] = [:]

  init() {
    view.backgroundColor = .clear
    view.clipsToBounds = true
  }

  func slot(for id: String) -> NativeViewSlot {
    if let slot = slots[id] { return slot }
    let slot = NativeViewSlot()
    slots[id] = slot
    view.addSubview(slot.view)
    return slot
  }

  func update(
    id: String,
    frame: CGRect,
    clip: CGRect?,
    mask: [CGRect]?,
    zIndex: Int,
    visible: Bool
  ) {
    slot(for: id).update(
      frame: frame,
      clip: clip,
      mask: mask,
      zIndex: zIndex,
      visible: visible
    )
  }

  func detach(id: String) {
    guard let slot = slots.removeValue(forKey: id) else { return }
    slot.container.subviews.forEach { $0.removeFromSuperview() }
    slot.view.removeFromSuperview()
  }

  func hideAll() {
    for slot in slots.values {
      slot.view.isHidden = true
    }
  }

  func detachAll() {
    for id in Array(slots.keys) {
      detach(id: id)
    }
  }
}
