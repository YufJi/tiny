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
    /// Capture page data and saved exit state for a host-level reload.
    SnapshotPageState,
    /// Restore page data and saved exit state after a page is recreated.
    RestorePageState {
        page_id: String,
        data: serde_json::Value,
        saved_exit_state: Option<serde_json::Value>,
        #[serde(default)]
        exit_state: Option<serde_json::Value>,
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

    #[test]
    fn page_state_commands_deserialize() {
        let snapshot: HostCommand = serde_json::from_value(serde_json::json!({
            "type": "snapshotPageState"
        }))
        .expect("snapshotPageState command should deserialize");
        assert_eq!(snapshot, HostCommand::SnapshotPageState);

        let restore: HostCommand = serde_json::from_value(serde_json::json!({
            "type": "restorePageState",
            "pageId": "page-1",
            "data": { "count": 2 },
            "savedExitState": { "scrollTop": 12 },
            "exitState": { "draft": "kept" }
        }))
        .expect("restorePageState command should deserialize");
        match restore {
            HostCommand::RestorePageState {
                page_id,
                data,
                saved_exit_state,
                exit_state,
            } => {
                assert_eq!(page_id, "page-1");
                assert_eq!(data, serde_json::json!({ "count": 2 }));
                assert_eq!(saved_exit_state, Some(serde_json::json!({ "scrollTop": 12 })));
                assert_eq!(exit_state, Some(serde_json::json!({ "draft": "kept" })));
            }
            _ => panic!("expected RestorePageState"),
        }
    }
}
