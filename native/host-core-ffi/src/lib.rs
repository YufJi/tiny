//! UniFFI boundary for the shared Rust HostCore.
//!
//! Swift owns JavaScriptCore/WKWebView; this crate owns only host state and
//! exchanges JSON frames/actions with the native adapter.

use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;
use tiny_host_core::{HostAction, HostCommand, HostConfig, HostCore, HostEvent};

uniffi::setup_scaffolding!();

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum HostCoreError {
    #[error("invalid config: {0}")]
    InvalidConfig(String),
    #[error("invalid event: {0}")]
    InvalidEvent(String),
    #[error("core lock failed: {0}")]
    Lock(String),
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FfiConfig {
    app_id: String,
    manifest: Value,
    initial_path: String,
    #[serde(default)]
    max_page_stack: Option<usize>,
}

#[derive(Debug, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
enum FfiEvent {
    ServiceFrame {
        frame: String,
    },
    RenderFrame {
        page_id: String,
        frame: String,
    },
    PageReady {
        page_id: String,
    },
    PageFailed {
        page_id: String,
        error: String,
    },
    PlatformResult {
        request_id: String,
        #[serde(default)]
        result: Option<Value>,
        #[serde(default)]
        error: Option<String>,
    },
    RenderHostResult {
        request_id: String,
        #[serde(default)]
        result: Option<Value>,
        #[serde(default)]
        error: Option<String>,
    },
    Command {
        command: HostCommand,
    },
    Tick {
        now_ms: u64,
    },
}

#[derive(uniffi::Object)]
pub struct RustHostCore {
    inner: Mutex<HostCore>,
}

#[uniffi::export]
impl RustHostCore {
    #[uniffi::constructor]
    pub fn new(config_json: String) -> Result<Arc<Self>, HostCoreError> {
        let config: FfiConfig = serde_json::from_str(&config_json)
            .map_err(|error| HostCoreError::InvalidConfig(error.to_string()))?;
        Ok(Arc::new(Self {
            inner: Mutex::new(HostCore::new(HostConfig {
                app_id: config.app_id,
                manifest: config.manifest,
                initial_path: config.initial_path,
                max_page_stack: config.max_page_stack,
            })),
        }))
    }

    pub fn start(&self, now_ms: u64) -> Result<String, HostCoreError> {
        let actions = self.with_core(|core| core.start(now_ms))?;
        to_json(actions)
    }

    pub fn handle_event(&self, event_json: String, now_ms: u64) -> Result<String, HostCoreError> {
        let event: FfiEvent = serde_json::from_str(&event_json)
            .map_err(|error| HostCoreError::InvalidEvent(error.to_string()))?;
        let event = match event {
            FfiEvent::ServiceFrame { frame } => HostEvent::ServiceFrame(frame),
            FfiEvent::RenderFrame { page_id, frame } => HostEvent::RenderFrame { page_id, frame },
            FfiEvent::PageReady { page_id } => HostEvent::PageReady { page_id },
            FfiEvent::PageFailed { page_id, error } => HostEvent::PageFailed { page_id, error },
            FfiEvent::PlatformResult {
                request_id,
                result,
                error,
            } => HostEvent::PlatformResult {
                request_id,
                result: match (result, error) {
                    (_, Some(error)) => Err(error),
                    (Some(result), None) => Ok(result),
                    (None, None) => Ok(Value::Null),
                },
            },
            FfiEvent::RenderHostResult {
                request_id,
                result,
                error,
            } => HostEvent::RenderHostResult {
                request_id,
                result: match (result, error) {
                    (_, Some(error)) => Err(error),
                    (Some(result), None) => Ok(result),
                    (None, None) => Ok(Value::Null),
                },
            },
            FfiEvent::Command { command } => HostEvent::Command(command),
            FfiEvent::Tick { now_ms } => HostEvent::Tick { now_ms },
        };
        let actions = self.with_core(|core| core.handle_event(event, now_ms))?;
        to_json(actions)
    }

    pub fn set_app_visible(&self, visible: bool) -> Result<String, HostCoreError> {
        let actions = self.with_core(|core| core.set_app_visible(visible))?;
        to_json(actions)
    }

    pub fn page_stack_json(&self) -> Result<String, HostCoreError> {
        self.with_core(|core| serde_json::to_string(core.page_stack()).unwrap_or_default())
    }

    pub fn diagnostics_json(&self) -> Result<String, HostCoreError> {
        self.with_core(|core| serde_json::to_string(core.diagnostics()).unwrap_or_default())
    }
}

impl RustHostCore {
    fn with_core<T>(&self, f: impl FnOnce(&mut HostCore) -> T) -> Result<T, HostCoreError> {
        let mut core = self
            .inner
            .lock()
            .map_err(|error| HostCoreError::Lock(error.to_string()))?;
        Ok(f(&mut core))
    }
}

fn to_json(actions: Vec<HostAction>) -> Result<String, HostCoreError> {
    serde_json::to_string(&actions).map_err(|error| HostCoreError::Lock(error.to_string()))
}
