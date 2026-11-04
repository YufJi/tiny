use serde::Serialize;
use serde_json::Value;

use crate::bridge::TransportFrame;

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageDescriptor {
    pub page_id: String,
    pub path: String,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum HostAction {
    SendServiceFrame {
        frame: TransportFrame,
    },
    SendRenderFrame {
        page_id: String,
        frame: TransportFrame,
    },
    CreatePage {
        page_id: String,
        path: String,
    },
    ActivatePage {
        page_id: String,
    },
    DestroyPage {
        page_id: String,
    },
    SetAppVisible {
        visible: bool,
    },
    UpdateUIState {
        state: Value,
    },
    CommandResult {
        command: String,
        result: Value,
    },
    PlatformCall {
        request_id: String,
        method: String,
        params: Value,
        page_id: Option<String>,
    },
    /// A render surface asked the host for a value (picker, native dialog, …).
    RenderHostRequest {
        request_id: String,
        page_id: String,
        method: String,
        payload: Value,
    },
    Diagnostic {
        level: String,
        payload: Value,
    },
}
