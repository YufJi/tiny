import UIKit

/// Native host picker used by the render-side `<picker>` through
/// `tree.hostRequest`. The WebView never draws its own overlay on iOS.
@MainActor
final class NativePickerController: UIViewController, UIPickerViewDataSource, UIPickerViewDelegate {
  typealias Completion = ([String: Any]) -> Void

  private let payload: [String: Any]
  private let completion: Completion
  private let mode: String
  private let rangeKey: String?
  private let fields: String
  private var columns: [[String]] = []
  private var selected: [Int] = []
  var onColumnChange: ((Int, Int) -> Void)?
  private var pickerView: UIPickerView?
  private var datePicker: UIDatePicker?
  private let overlay = UIView()
  private let panel = UIView()
  private let header = UIView()
  private let titleLabel = UILabel()
  private let cancelButton = UIButton(type: .system)
  private let confirmButton = UIButton(type: .system)

  init(payload: [String: Any], completion: @escaping Completion) {
    self.payload = payload
    self.completion = completion
    self.mode = payload["mode"] as? String ?? "selector"
    self.rangeKey = payload["rangeKey"] as? String
    self.fields = payload["fields"] as? String ?? "day"
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .overFullScreen
    modalTransitionStyle = .crossDissolve
    buildColumns()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func loadView() {
    let root = UIView()
    root.backgroundColor = .clear
    view = root

    overlay.backgroundColor = UIColor.black.withAlphaComponent(0.45)
    overlay.translatesAutoresizingMaskIntoConstraints = false
    root.addSubview(overlay)

    panel.backgroundColor = .white
    panel.layer.cornerRadius = 14
    panel.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
    panel.translatesAutoresizingMaskIntoConstraints = false
    root.addSubview(panel)

    header.backgroundColor = .white
    header.translatesAutoresizingMaskIntoConstraints = false
    panel.addSubview(header)

    titleLabel.text = (payload["headerText"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? "请选择"
    titleLabel.font = .systemFont(ofSize: 16, weight: .medium)
    titleLabel.textAlignment = .center
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    header.addSubview(titleLabel)

    cancelButton.setTitle("取消", for: .normal)
    cancelButton.setTitleColor(UIColor(red: 0.34, green: 0.42, blue: 0.58, alpha: 1), for: .normal)
    cancelButton.titleLabel?.font = .systemFont(ofSize: 16)
    cancelButton.addTarget(self, action: #selector(cancel), for: .touchUpInside)
    cancelButton.translatesAutoresizingMaskIntoConstraints = false
    header.addSubview(cancelButton)

    confirmButton.setTitle("确定", for: .normal)
    confirmButton.setTitleColor(UIColor(red: 0.03, green: 0.76, blue: 0.38, alpha: 1), for: .normal)
    confirmButton.titleLabel?.font = .systemFont(ofSize: 16, weight: .semibold)
    confirmButton.addTarget(self, action: #selector(confirm), for: .touchUpInside)
    confirmButton.translatesAutoresizingMaskIntoConstraints = false
    header.addSubview(confirmButton)

    if mode == "date" || mode == "time" {
      let picker = UIDatePicker()
      picker.datePickerMode = mode == "date" ? .date : .time
      picker.preferredDatePickerStyle = .wheels
      picker.locale = Locale(identifier: "zh_CN")
      applyDateValue(picker)
      picker.translatesAutoresizingMaskIntoConstraints = false
      panel.addSubview(picker)
      datePicker = picker
    } else {
      let picker = UIPickerView()
      picker.dataSource = self
      picker.delegate = self
      picker.translatesAutoresizingMaskIntoConstraints = false
      panel.addSubview(picker)
      pickerView = picker
    }

    NSLayoutConstraint.activate([
      overlay.leadingAnchor.constraint(equalTo: root.leadingAnchor),
      overlay.trailingAnchor.constraint(equalTo: root.trailingAnchor),
      overlay.topAnchor.constraint(equalTo: root.topAnchor),
      overlay.bottomAnchor.constraint(equalTo: root.bottomAnchor),
      panel.leadingAnchor.constraint(equalTo: root.leadingAnchor),
      panel.trailingAnchor.constraint(equalTo: root.trailingAnchor),
      panel.bottomAnchor.constraint(equalTo: root.bottomAnchor),
      header.leadingAnchor.constraint(equalTo: panel.leadingAnchor),
      header.trailingAnchor.constraint(equalTo: panel.trailingAnchor),
      header.topAnchor.constraint(equalTo: panel.topAnchor),
      header.heightAnchor.constraint(equalToConstant: 48),
      cancelButton.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: 16),
      cancelButton.centerYAnchor.constraint(equalTo: header.centerYAnchor),
      confirmButton.trailingAnchor.constraint(equalTo: header.trailingAnchor, constant: -16),
      confirmButton.centerYAnchor.constraint(equalTo: header.centerYAnchor),
      titleLabel.centerXAnchor.constraint(equalTo: header.centerXAnchor),
      titleLabel.centerYAnchor.constraint(equalTo: header.centerYAnchor),
    ])

    if let picker = pickerView {
      NSLayoutConstraint.activate([
        picker.leadingAnchor.constraint(equalTo: panel.leadingAnchor),
        picker.trailingAnchor.constraint(equalTo: panel.trailingAnchor),
        picker.topAnchor.constraint(equalTo: header.bottomAnchor),
        picker.heightAnchor.constraint(equalToConstant: 216),
        picker.bottomAnchor.constraint(equalTo: panel.safeAreaLayoutGuide.bottomAnchor, constant: -8),
      ])
      for (component, index) in selected.enumerated() where component < picker.numberOfComponents {
        picker.selectRow(index, inComponent: component, animated: false)
      }
    }
    if let picker = datePicker {
      NSLayoutConstraint.activate([
        picker.leadingAnchor.constraint(equalTo: panel.leadingAnchor, constant: 8),
        picker.trailingAnchor.constraint(equalTo: panel.trailingAnchor, constant: -8),
        picker.topAnchor.constraint(equalTo: header.bottomAnchor),
        picker.heightAnchor.constraint(equalToConstant: 216),
        picker.bottomAnchor.constraint(equalTo: panel.safeAreaLayoutGuide.bottomAnchor, constant: -8),
      ])
    }
  }

  private func buildColumns() {
    let range = payload["range"] as? [Any] ?? []
    if mode == "multiSelector" {
      columns = range.map { item in
        (item as? [Any] ?? []).map(label)
      }
    } else {
      columns = [range.map(label)]
    }
    let raw = payload["value"]
    if mode == "multiSelector" {
      let values = raw as? [Any] ?? []
      selected = columns.enumerated().map { index, column in
        let number = values.indices.contains(index) ? (values[index] as? NSNumber)?.intValue ?? Int(String(describing: values[index])) ?? 0 : 0
        return max(0, min(column.count - 1, number))
      }
    } else {
      let number = (raw as? NSNumber)?.intValue ?? Int(String(describing: raw ?? "0")) ?? 0
      selected = [max(0, min(max(0, columns.first?.count ?? 1) - 1, number))]
    }
  }

  private func label(_ item: Any) -> String {
    if let key = rangeKey, let dictionary = item as? [String: Any] {
      return String(describing: dictionary[key] ?? "")
    }
    return String(describing: item)
  }

  private func applyDateValue(_ picker: UIDatePicker) {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = .current
    formatter.dateFormat = mode == "date" ? "yyyy-MM-dd" : "HH:mm"
    if let text = payload["value"] as? String, let date = formatter.date(from: text) {
      picker.date = date
    } else if let text = payload["value"] as? String, mode == "date" {
      formatter.dateFormat = "yyyy-MM"
      if let date = formatter.date(from: text) { picker.date = date }
    } else if mode == "time" {
      let calendar = Calendar.current
      let now = Date()
      if let text = payload["value"] as? String {
        let parts = text.split(separator: ":")
        if parts.count == 2, let hour = Int(parts[0]), let minute = Int(parts[1]) {
          picker.date = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: now) ?? now
        }
      }
    }
    let start = payload["start"] as? String
    let end = payload["end"] as? String
    if mode == "date" {
      if let start, let date = formatter.date(from: start) { picker.minimumDate = date }
      if let end, let date = formatter.date(from: end) { picker.maximumDate = date }
    }
  }

  func numberOfComponents(in pickerView: UIPickerView) -> Int {
    columns.count
  }

  func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
    columns.indices.contains(component) ? columns[component].count : 0
  }

  func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
    guard columns.indices.contains(component), columns[component].indices.contains(row) else { return nil }
    return columns[component][row]
  }

  func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
    guard selected.indices.contains(component) else { return }
    selected[component] = row
    if mode == "multiSelector" {
      onColumnChange?(component, row)
    }
  }

  @objc private func cancel() {
    finish(["status": "cancel"])
  }

  @objc private func confirm() {
    if let picker = pickerView {
      for component in 0..<picker.numberOfComponents {
        selected[component] = picker.selectedRow(inComponent: component)
      }
    }
    switch mode {
    case "selector":
      finish(["status": "ok", "value": String(selected.first ?? 0)])
    case "multiSelector":
      finish(["status": "ok", "value": selected])
    case "date":
      finish(["status": "ok", "value": formatDate()])
    case "time":
      finish(["status": "ok", "value": formatTime()])
    default:
      finish(["status": "error", "errMsg": "showPickerView:fail unsupported picker mode \(mode)"])
    }
  }

  private func formatDate() -> String {
    guard let picker = datePicker else { return "" }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = .current
    switch fields {
    case "year": formatter.dateFormat = "yyyy"
    case "month": formatter.dateFormat = "yyyy-MM"
    default: formatter.dateFormat = "yyyy-MM-dd"
    }
    return formatter.string(from: picker.date)
  }

  private func formatTime() -> String {
    guard let picker = datePicker else { return "" }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = .current
    formatter.dateFormat = "HH:mm"
    return formatter.string(from: picker.date)
  }

  private func finish(_ result: [String: Any]) {
    let completion = self.completion
    dismiss(animated: true) {
      completion(result)
    }
  }
}
