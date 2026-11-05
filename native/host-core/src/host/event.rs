use serde_json::Value;

use super::command::HostCommand;

#[derive(Debug, Clone, PartialEq)]
pub enum HostEvent {
    /// A raw JSON transport frame from the JavaScriptCore/QuickJS service.
    ServiceFrame(String),
    /// A raw JSON transport frame from one page render surface.
    RenderFrame {
        page_id: String,
        frame: String,
    },
    /// The platform created the page surface and its render document is ready
    /// to receive a Bridge handshake.
    PageReady {
        page_id: String,
    },
    PageFailed {
        page_id: String,
        error: String,
    },
    /// A platform-backed host API call completed.
    PlatformResult {
        request_id: String,
        result: Result<Value, String>,
    },
    /// The platform finished a render-surface host request.
    RenderHostResult {
        request_id: String,
        result: Result<Value, String>,
    },
    /// A platform/native-chrome command.
    Command(HostCommand),
    /// Drive Bridge timeouts and other deadline work.
    Tick {
        now_ms: u64,
    },
}
