import UIKit

/// Native input proxy for WeChat-style keyboard behavior.
///
/// The page DOM remains the visual source of truth. This host owns the first
/// responder, keyboard configuration and input accessory so WKWebView does not
/// fall back to its default DOM input keyboard.
@MainActor
final class NativeKeyboardHost: NSObject, UITextFieldDelegate, UITextViewDelegate {
  private var container: UIView
  private(set) var ownerId: String
  private var textField: UITextField?
  private var textView: UITextView?
  private var config: [String: Any] = [:]
  private var updating = false
  private var ending = false
  /// WKWebView can steal first responder on a touch that crosses its boundary.
  /// During a retarget keep this native instance and reassert it instead of
  /// dismissing/recreating the keyboard.
  private var retargetProtectionUntil: Date?

  var onValueChange: ((String, Int) -> Void)?
  var onSelectionChange: ((Int, Int) -> Void)?
  var onConfirm: ((String, Int) -> Void)?
  var onBlur: ((String, Int) -> Void)?

  var isActive: Bool {
    textField?.isFirstResponder == true || textView?.isFirstResponder == true
  }

  init(container: UIView, ownerId: String) {
    self.container = container
    self.ownerId = ownerId
    super.init()
  }

  func canReuse(config next: [String: Any]) -> Bool {
    guard isActive else { return false }
    let source = config["source"] as? String ?? ""
    let nextSource = next["source"] as? String ?? ""
    guard source == nextSource else { return false }
    let type = config["type"] as? String ?? "text"
    let nextType = next["type"] as? String ?? "text"
    guard type == nextType else { return false }
    return boolValue(config["password"], fallback: false)
      == boolValue(next["password"], fallback: false)
  }

  func move(to nextContainer: UIView) {
    guard nextContainer !== container else {
      updateGeometry()
      return
    }
    let fieldWasFirstResponder = textField?.isFirstResponder == true
    let viewWasFirstResponder = textView?.isFirstResponder == true
    textField?.removeFromSuperview()
    textView?.removeFromSuperview()
    container = nextContainer
    if let textField {
      nextContainer.addSubview(textField)
    }
    if let textView {
      nextContainer.addSubview(textView)
    }
    nextContainer.isUserInteractionEnabled = true
    updateGeometry()
    if fieldWasFirstResponder || viewWasFirstResponder {
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        if fieldWasFirstResponder {
          self.textField?.becomeFirstResponder()
        }
        if viewWasFirstResponder {
          self.textView?.becomeFirstResponder()
        }
      }
    }
  }

  func snapshot() -> (value: String, cursor: Int) {
    (currentText(), currentCursor())
  }

  @discardableResult
  func retarget(
    ownerId nextOwnerId: String,
    config next: [String: Any],
    value: String,
    cursor: Int,
    selectionStart: Int,
    selectionEnd: Int
  ) -> Bool {
    guard isActive else { return false }
    retargetProtectionUntil = Date().addingTimeInterval(0.8)
    ownerId = nextOwnerId
    config = next
    let fontSize = CGFloat(numberValue(next["style"], key: "fontSize", fallback: 17))
    let isTextarea = (next["source"] as? String) == "textarea"
    let frame = keyboardFrame()
    textField?.frame = frame
    textView?.frame = frame
    textField?.font = UIFont.systemFont(ofSize: fontSize)
    textView?.font = UIFont.systemFont(ofSize: fontSize)
    textField?.keyboardAppearance = keyboardAppearance(next["keyboardAppearance"])
    textView?.keyboardAppearance = keyboardAppearance(next["keyboardAppearance"])
    textField?.returnKeyType = returnKeyType(next["confirmType"] as? String)
    textView?.returnKeyType = returnKeyType(next["confirmType"] as? String)
    if isTextarea {
      let showConfirmBar = boolValue(next["showConfirmBar"], fallback: true)
      textView?.inputAccessoryView = showConfirmBar ? makeAccessoryView(config: next) : nil
    }
    updating = true
    textField?.text = value
    textView?.text = value
    applySelection(
      value: value,
      cursor: cursor,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      textField: textField,
      textView: textView
    )
    updating = false
    applyStyle()
    updateAccessibility()
    return true
  }

  @discardableResult
  func begin(config: [String: Any]) -> Bool {
    dismiss(suppressBlur: true)
    self.config = config
    let isTextarea = (config["source"] as? String) == "textarea"
    let text = config["value"] as? String ?? ""
    // WeChat exposes `show-confirm-bar` on textarea only; input has no bar.
    let showConfirmBar = isTextarea
      && boolValue(config["showConfirmBar"], fallback: true)
    let accessory = showConfirmBar ? makeAccessoryView(config: config) : nil
    let frame = keyboardFrame()
    let fontSize = CGFloat(numberValue(config["style"], key: "fontSize", fallback: 17))
    ending = false
    retargetProtectionUntil = Date().addingTimeInterval(0.8)

    if isTextarea {
      let view = UITextView(frame: frame)
      view.delegate = self
      view.text = text
      view.backgroundColor = .clear
      view.isScrollEnabled = true
      view.showsVerticalScrollIndicator = false
      view.textContainerInset = .zero
      view.textContainer.lineFragmentPadding = 0
      view.font = UIFont.systemFont(ofSize: fontSize)
      view.autocorrectionType = .no
      view.spellCheckingType = .no
      view.smartQuotesType = .no
      view.smartDashesType = .no
      view.keyboardAppearance = keyboardAppearance(config["keyboardAppearance"])
      view.keyboardType = keyboardType(config)
      view.returnKeyType = returnKeyType(config["confirmType"] as? String)
      view.inputAccessoryView = accessory
      view.alpha = 1
      view.isHidden = false
      view.isAccessibilityElement = true
      container.addSubview(view)
      container.isUserInteractionEnabled = true
      textView = view
      applyStyle()
      updateAccessibility()
      DispatchQueue.main.async { [weak self, weak view] in
        guard let self, let view, self.textView === view else { return }
        view.becomeFirstResponder()
        self.applySelection(
          value: text,
          cursor: self.intValue(config["cursor"], fallback: -1),
          selectionStart: self.intValue(config["selectionStart"], fallback: -1),
          selectionEnd: self.intValue(config["selectionEnd"], fallback: -1),
          textField: nil,
          textView: view
        )
      }
      return true
    }

    let field = UITextField(frame: frame)
    field.delegate = self
    field.text = text
    field.backgroundColor = .clear
    field.font = UIFont.systemFont(ofSize: fontSize)
    field.borderStyle = .none
    field.isSecureTextEntry = boolValue(config["password"], fallback: false)
    field.autocorrectionType = .no
    field.spellCheckingType = .no
    field.smartQuotesType = .no
    field.smartDashesType = .no
    field.textContentType = nil
    field.keyboardAppearance = keyboardAppearance(config["keyboardAppearance"])
    field.keyboardType = keyboardType(config)
    if (config["type"] as? String) == "idcard" {
      field.inputView = makeIDCardKeyboard()
    }
    field.returnKeyType = returnKeyType(config["confirmType"] as? String)
    field.inputAccessoryView = accessory
    field.addTarget(self, action: #selector(textFieldChanged), for: .editingChanged)
    field.isAccessibilityElement = true
    field.alpha = 1
    field.isHidden = false
    container.addSubview(field)
    container.isUserInteractionEnabled = true
    textField = field
    applyStyle()
    updateAccessibility()
    DispatchQueue.main.async { [weak self, weak field] in
      guard let self, let field, self.textField === field else { return }
      field.becomeFirstResponder()
      self.applySelection(
        value: text,
        cursor: self.intValue(config["cursor"], fallback: -1),
        selectionStart: self.intValue(config["selectionStart"], fallback: -1),
        selectionEnd: self.intValue(config["selectionEnd"], fallback: -1),
        textField: field,
        textView: nil
      )
    }
    return true
  }

  func endEditing() {
    retargetProtectionUntil = nil
    textField?.resignFirstResponder()
    textView?.resignFirstResponder()
    if textField?.isFirstResponder != true, textView?.isFirstResponder != true {
      cleanup()
    }
  }

  func dismiss(suppressBlur: Bool = false) {
    retargetProtectionUntil = nil
    if suppressBlur {
      updating = true
      textField?.resignFirstResponder()
      textView?.resignFirstResponder()
      cleanup()
      updating = false
      return
    }
    let wasFirstResponder = textField?.isFirstResponder == true || textView?.isFirstResponder == true
    textField?.resignFirstResponder()
    textView?.resignFirstResponder()
    if !wasFirstResponder {
      cleanup()
    }
  }

  @discardableResult
  func update(value: String, cursor: Int, selectionStart: Int = -1, selectionEnd: Int = -1) -> Bool {
    guard textField?.isFirstResponder == true || textView?.isFirstResponder == true else {
      return false
    }
    let changed = currentText() != value
    if changed {
      let preserved = (start: currentSelectionStart(), end: currentSelectionEnd())
      updating = true
      textField?.text = value
      textView?.text = value
      if cursor >= 0 || selectionStart >= 0 || selectionEnd >= 0 {
        applySelection(
          value: value,
          cursor: cursor,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
          textField: textField,
          textView: textView
        )
      } else if preserved.start >= 0 {
        applySelection(
          value: value,
          cursor: -1,
          selectionStart: preserved.start,
          selectionEnd: preserved.end,
          textField: textField,
          textView: textView
        )
      }
      updating = false
    } else if cursor >= 0 || selectionStart >= 0 || selectionEnd >= 0 {
      updating = true
      applySelection(
        value: value,
        cursor: cursor,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
        textField: textField,
        textView: textView
      )
      updating = false
    }
    updateAccessibility()
    return true
  }

  @discardableResult
  func updateGeometry(style: [String: Any]? = nil) -> Bool {
    if let style {
      config["style"] = style
    }
    let frame = keyboardFrame()
    textField?.frame = frame
    textView?.frame = frame
    applyStyle()
    textField?.isHidden = false
    textView?.isHidden = false
    return true
  }

  private func cleanup() {
    textField?.delegate = nil
    textView?.delegate = nil
    textField?.removeFromSuperview()
    textView?.removeFromSuperview()
    textField = nil
    textView = nil
    container.isUserInteractionEnabled = false
  }

  private func keyboardFrame() -> CGRect {
    if container.bounds.width > 1, container.bounds.height > 1 {
      return CGRect(origin: .zero, size: container.bounds.size)
    }
    let style = config["style"] as? [String: Any]
    let width = max(1, CGFloat(numberValue(style, key: "width", fallback: 1)))
    let height = max(1, CGFloat(numberValue(style, key: "height", fallback: 1)))
    return CGRect(x: 0, y: 0, width: width, height: height)
  }

  private func applyStyle() {
    let style = config["style"] as? [String: Any]
    let fontSize = CGFloat(numberValue(style, key: "fontSize", fallback: 17))
    let font = uiFont(style: style, size: fontSize)
    let color = uiColor(style?["color"]) ?? .label
    let tint = uiColor(style?["tintColor"]) ?? .systemBlue
    let alignment = textAlignment(style?["textAlign"] as? String)
    if let textField {
      textField.font = font
      textField.textColor = color
      textField.tintColor = tint
      textField.textAlignment = alignment
      textField.contentVerticalAlignment = .center
    }
    if let textView {
      textView.font = font
      textView.textColor = color
      textView.tintColor = tint
      textView.textAlignment = alignment
      textView.textContainerInset = .zero
      textView.textContainer.lineFragmentPadding = 0
      let paragraph = NSMutableParagraphStyle()
      paragraph.alignment = alignment
      let lineHeight = CGFloat(numberValue(style, key: "lineHeight", fallback: Double(fontSize * 1.2)))
      paragraph.minimumLineHeight = lineHeight
      paragraph.maximumLineHeight = lineHeight
      textView.typingAttributes = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph,
      ]
    }
  }

  private func uiFont(style: [String: Any]?, size: CGFloat) -> UIFont {
    let raw = style?["fontFamily"] as? String ?? ""
    let family = raw
      .split(separator: ",")
      .first
      .map(String.init)?
      .trimmingCharacters(in: CharacterSet(charactersIn: " \"'"))
      ?? ""
    if !family.isEmpty, let font = UIFont(name: family, size: size) {
      return font
    }
    return UIFont.systemFont(ofSize: size)
  }

  private func textAlignment(_ value: String?) -> NSTextAlignment {
    switch value {
    case "center": return .center
    case "right", "end": return .right
    case "justify": return .justified
    default: return .left
    }
  }

  private func uiColor(_ value: Any?) -> UIColor? {
    guard let raw = value as? String else { return nil }
    let string = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    if string.hasPrefix("#") {
      var hex = String(string.dropFirst())
      if hex.count == 3 {
        hex = hex.map { "\($0)\($0)" }.joined()
      }
      guard hex.count == 6 || hex.count == 8,
            let number = UInt64(hex, radix: 16)
      else { return nil }
      let red = CGFloat((number >> 16) & 0xFF) / 255
      let green = CGFloat((number >> 8) & 0xFF) / 255
      let blue = CGFloat(number & 0xFF) / 255
      let alpha = hex.count == 8 ? CGFloat((number >> 24) & 0xFF) / 255 : 1
      return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }
    let pattern = try? NSRegularExpression(pattern: "rgba?\\(([^)]+)\\)")
    let range = NSRange(string.startIndex..<string.endIndex, in: string)
    guard let match = pattern?.firstMatch(in: string, range: range),
          let contentRange = Range(match.range(at: 1), in: string)
    else { return nil }
    let parts = string[contentRange]
      .split(separator: ",")
      .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
    guard parts.count >= 3,
          let red = Double(parts[0]),
          let green = Double(parts[1]),
          let blue = Double(parts[2])
    else { return nil }
    let alpha = parts.count > 3 ? Double(parts[3]) ?? 1 : 1
    return UIColor(
      red: red / 255,
      green: green / 255,
      blue: blue / 255,
      alpha: alpha
    )
  }

  private func currentText() -> String {
    textView?.text ?? textField?.text ?? ""
  }

  private func updateAccessibility() {
    let value = currentText()
    let label = config["placeholder"] as? String ?? ""
    let accessibilityLabel = label.isEmpty ? nil : label
    textField?.accessibilityLabel = accessibilityLabel
    textField?.accessibilityValue = value
    textView?.accessibilityLabel = accessibilityLabel
    textView?.accessibilityValue = value
  }

  private func currentCursor() -> Int {
    if let textView,
       let range = textView.selectedTextRange {
      return textView.offset(from: textView.beginningOfDocument, to: range.start)
    }
    if let textField,
       let range = textField.selectedTextRange {
      return textField.offset(from: textField.beginningOfDocument, to: range.start)
    }
    return -1
  }

  private func applySelection(
    value: String,
    cursor: Int,
    selectionStart: Int,
    selectionEnd: Int,
    textField: UITextField?,
    textView: UITextView?
  ) {
    let start = cursor >= 0 ? cursor : selectionStart
    let end = cursor >= 0 ? cursor : selectionEnd
    guard start >= 0 else { return }
    let safeStart = min(max(0, start), value.utf16.count)
    let safeEnd = min(max(safeStart, end < 0 ? safeStart : end), value.utf16.count)
    if let textField {
      guard let from = textField.position(from: textField.beginningOfDocument, offset: safeStart),
            let to = textField.position(from: textField.beginningOfDocument, offset: safeEnd)
      else { return }
      textField.selectedTextRange = textField.textRange(from: from, to: to)
    } else if let textView {
      guard let from = textView.position(from: textView.beginningOfDocument, offset: safeStart),
            let to = textView.position(from: textView.beginningOfDocument, offset: safeEnd)
      else { return }
      textView.selectedTextRange = textView.textRange(from: from, to: to)
    }
  }

  private func notifyValue() {
    guard !updating else { return }
    let value = currentText()
    let cursor = currentCursor()
    updateAccessibility()
    onValueChange?(value, cursor)
    onSelectionChange?(currentSelectionStart(), currentSelectionEnd())
  }

  private func currentSelectionStart() -> Int {
    if let textView,
       let range = textView.selectedTextRange {
      return textView.offset(from: textView.beginningOfDocument, to: range.start)
    }
    if let textField,
       let range = textField.selectedTextRange {
      return textField.offset(from: textField.beginningOfDocument, to: range.start)
    }
    return -1
  }

  private func currentSelectionEnd() -> Int {
    if let textView,
       let range = textView.selectedTextRange {
      return textView.offset(from: textView.beginningOfDocument, to: range.end)
    }
    if let textField,
       let range = textField.selectedTextRange {
      return textField.offset(from: textField.beginningOfDocument, to: range.end)
    }
    return -1
  }

  private func clampMaxLength() {
    let maxLength = intValue(config["maxlength"], fallback: 0)
    guard maxLength > 0 else { return }
    let value = currentText()
    if value.utf16.count <= maxLength { return }
    updating = true
    let next = String(decoding: Array(value.utf16.prefix(maxLength)), as: UTF16.self)
    textField?.text = next
    textView?.text = next
    updating = false
  }

  @objc private func textFieldChanged() {
    clampMaxLength()
    notifyValue()
  }

  func textFieldDidChangeSelection(_ textField: UITextField) {
    guard !updating else { return }
    onSelectionChange?(currentSelectionStart(), currentSelectionEnd())
  }

  func textFieldDidEndEditing(
    _ textField: UITextField,
    reason: UITextField.DidEndEditingReason
  ) {
    if let until = retargetProtectionUntil, Date() < until {
      DispatchQueue.main.async { [weak self, weak textField] in
        guard let self, let textField, self.textField === textField else { return }
        if !textField.isFirstResponder {
          textField.becomeFirstResponder()
        }
      }
      return
    }
    guard !updating else { return }
    finishEditing(value: textField.text ?? "", cursor: currentCursor())
  }

  func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    confirm()
    return false
  }

  func textField(
    _ textField: UITextField,
    shouldChangeCharactersIn range: NSRange,
    replacementString string: String
  ) -> Bool {
    guard (config["type"] as? String) == "idcard" else { return true }
    return string.unicodeScalars.allSatisfy {
      CharacterSet.decimalDigits.contains($0)
        || $0 == "x"
        || $0 == "X"
    }
  }

  func textViewDidChange(_ textView: UITextView) {
    clampMaxLength()
    notifyValue()
  }

  func textViewDidChangeSelection(_ textView: UITextView) {
    guard !updating else { return }
    onSelectionChange?(currentSelectionStart(), currentSelectionEnd())
  }

  func textViewDidEndEditing(_ textView: UITextView) {
    if let until = retargetProtectionUntil, Date() < until {
      DispatchQueue.main.async { [weak self, weak textView] in
        guard let self, let textView, self.textView === textView else { return }
        if !textView.isFirstResponder {
          textView.becomeFirstResponder()
        }
      }
      return
    }
    guard !updating else { return }
    finishEditing(value: textView.text ?? "", cursor: currentCursor())
  }

  func textView(
    _ textView: UITextView,
    shouldChangeTextIn range: NSRange,
    replacementText text: String
  ) -> Bool {
    if text == "\n" && (config["confirmType"] as? String ?? "return") != "return" {
      confirm()
      return false
    }
    return true
  }

  @objc private func accessoryDone() {
    confirm()
  }

  @objc private func idcardKey(_ sender: UIButton) {
    guard let key = sender.title(for: .normal) else { return }
    if key == "⌫" {
      textField?.deleteBackward()
      textView?.deleteBackward()
    } else {
      textField?.insertText(key)
      textView?.insertText(key)
    }
  }

  @objc private func idcardDone() {
    confirm()
  }

  private func confirm() {
    guard !ending else { return }
    ending = true
    defer { ending = false }
    let value = currentText()
    let cursor = currentCursor()
    onConfirm?(value, cursor)
    if !boolValue(config["confirmHold"], fallback: false) {
      endEditing()
    }
  }

  private func finishEditing(value: String, cursor: Int) {
    onBlur?(value, cursor)
    cleanup()
  }

  private func makeAccessoryView(config: [String: Any]) -> UIToolbar {
    let bar = UIToolbar(frame: CGRect(x: 0, y: 0, width: 0, height: 44))
    bar.sizeToFit()
    let button = UIBarButtonItem(
      title: confirmLabel(config["confirmType"] as? String),
      style: .plain,
      target: self,
      action: #selector(accessoryDone)
    )
    bar.items = [
      UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
      button,
    ]
    return bar
  }

  private func makeIDCardKeyboard() -> UIView {
    let keyboard = UIInputView(
      frame: CGRect(x: 0, y: 0, width: 0, height: 292),
      inputViewStyle: .keyboard
    )
    let stack = UIStackView()
    stack.axis = .vertical
    stack.spacing = 6
    stack.distribution = .fillEqually
    stack.translatesAutoresizingMaskIntoConstraints = false
    keyboard.addSubview(stack)
    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: keyboard.leadingAnchor, constant: 6),
      stack.trailingAnchor.constraint(equalTo: keyboard.trailingAnchor, constant: -6),
      stack.topAnchor.constraint(equalTo: keyboard.topAnchor, constant: 6),
      stack.bottomAnchor.constraint(equalTo: keyboard.bottomAnchor, constant: -6),
    ])

    for row in [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["X", "0", "⌫"]] {
      let rowStack = UIStackView()
      rowStack.axis = .horizontal
      rowStack.spacing = 6
      rowStack.distribution = .fillEqually
      for key in row {
        let button = UIButton(type: .system)
        button.setTitle(key, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 24, weight: .regular)
        button.setTitleColor(.label, for: .normal)
        button.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.92)
        button.layer.cornerRadius = 6
        button.addTarget(self, action: #selector(idcardKey(_:)), for: .touchUpInside)
        rowStack.addArrangedSubview(button)
      }
      stack.addArrangedSubview(rowStack)
    }

    let done = UIButton(type: .system)
    done.setTitle("完成", for: .normal)
    done.titleLabel?.font = UIFont.systemFont(ofSize: 17, weight: .medium)
    done.setTitleColor(.white, for: .normal)
    done.backgroundColor = .systemBlue
    done.layer.cornerRadius = 6
    done.addTarget(self, action: #selector(idcardDone), for: .touchUpInside)
    stack.addArrangedSubview(done)
    return keyboard
  }

  private func confirmLabel(_ type: String?) -> String {
    switch type {
    case "search": return "搜索"
    case "next": return "下一项"
    case "go": return "前往"
    case "send": return "发送"
    default: return "完成"
    }
  }

  private func intValue(_ value: Any?, fallback: Int) -> Int {
    if let number = value as? NSNumber { return number.intValue }
    if let value = value as? Int { return value }
    if let value = value as? String, let number = Int(value) { return number }
    return fallback
  }

  private func numberValue(_ value: Any?, key: String, fallback: Double) -> Double {
    guard let dictionary = value as? [String: Any],
          let raw = dictionary[key] as? NSNumber
    else { return fallback }
    return raw.doubleValue
  }

  private func boolValue(_ value: Any?, fallback: Bool) -> Bool {
    if let number = value as? NSNumber { return number.boolValue }
    if let value = value as? Bool { return value }
    if let value = value as? String {
      switch value.lowercased() {
      case "true", "1": return true
      case "false", "0": return false
      default: return fallback
      }
    }
    return fallback
  }

  private func keyboardAppearance(_ value: Any?) -> UIKeyboardAppearance {
    switch value as? String {
    case "light": return .light
    case "dark": return .dark
    default: return .default
    }
  }

  private func keyboardType(_ config: [String: Any]) -> UIKeyboardType {
    if boolValue(config["password"], fallback: false) { return .asciiCapable }
    switch config["type"] as? String {
    case "number": return .asciiCapableNumberPad
    case "digit": return .decimalPad
    case "idcard": return .numbersAndPunctuation
    case "email": return .emailAddress
    default: return .default
    }
  }

  private func returnKeyType(_ type: String?) -> UIReturnKeyType {
    switch type {
    case "search": return .search
    case "next": return .next
    case "go": return .go
    case "send": return .send
    case "return": return .default
    default: return .done
    }
  }
}
