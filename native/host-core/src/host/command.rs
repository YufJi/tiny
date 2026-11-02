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
    Close,
}
