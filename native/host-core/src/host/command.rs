use serde::{Deserialize, Serialize};

/// Host intents arriving from native chrome, the devtool toolbar or the
/// platform. The core translates them into service controls and page-surface
/// actions; it never performs navigation itself.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum HostCommand {
    NavigateTo {
        url: String,
    },
    NavigateBack {
        delta: u32,
    },
    SwitchTab {
        index: Option<u32>,
        url: Option<String>,
    },
    RedirectTo {
        url: String,
    },
    Relaunch {
        url: String,
    },
    InspectTree {
        page_id: Option<String>,
    },
    /// Invoke the active page's share callback.
    Share {
        share_type: Option<String>,
        from: Option<String>,
    },
    SetAppVisible {
        visible: bool,
    },
    SetPageVisible {
        visible: bool,
    },
    Resize {
        width: u32,
        height: u32,
    },
    /// Send a global `wx.onXXX` event to the service thread.
    EmitEvent {
        name: String,
        payload: Option<serde_json::Value>,
    },
    Close,
}


#[cfg(test)]
mod tests {
    use super::HostCommand;

    #[test]
    fn emit_event_deserializes() {
        let command: HostCommand = serde_json::from_value(serde_json::json!({
            "type": "emitEvent",
            "name": "appShow",
            "payload": { "scene": 1001 }
        }))
        .expect("emitEvent command should deserialize");
        match command {
            HostCommand::EmitEvent { name, payload } => {
                assert_eq!(name, "appShow");
                assert_eq!(payload, Some(serde_json::json!({ "scene": 1001 })));
            }
            _ => panic!("expected EmitEvent"),
        }
    }
}
