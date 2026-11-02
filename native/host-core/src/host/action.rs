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
#[serde(tag = "type", rename_all = "camelCase")]
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
    Diagnostic {
        level: String,
        payload: Value,
    },
}
