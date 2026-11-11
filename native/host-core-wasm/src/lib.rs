//! WebAssembly bindings for the shared Tiny HostCore.
//!
//! The browser adapter owns iframes, MessageChannel and Canvas handoff. This
//! wrapper only translates JSON events/actions, so the web devtool can drive the
//! same Rust state machine as the iOS/Android adapters.

use serde::Deserialize;
use serde_json::{json, Value};
use wasm_bindgen::prelude::*;

use tiny_host_core::{HostAction, HostCommand, HostConfig, HostCore, HostEvent};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WasmConfig {
    app_id: String,
    manifest: Value,
    initial_path: String,
    max_page_stack: Option<usize>,
    #[serde(default)]
    initial_exit_state: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
enum WasmEvent {
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

impl From<WasmEvent> for HostEvent {
    fn from(event: WasmEvent) -> Self {
        match event {
            WasmEvent::ServiceFrame { frame } => HostEvent::ServiceFrame(frame),
            WasmEvent::RenderFrame { page_id, frame } => HostEvent::RenderFrame { page_id, frame },
            WasmEvent::PageReady { page_id } => HostEvent::PageReady { page_id },
            WasmEvent::PageFailed { page_id, error } => HostEvent::PageFailed { page_id, error },
            WasmEvent::PlatformResult {
                request_id,
                result,
                error,
            } => HostEvent::PlatformResult {
                request_id,
                result: match error {
                    Some(error) => Err(error),
                    None => Ok(result.unwrap_or(Value::Null)),
                },
            },
            WasmEvent::RenderHostResult {
                request_id,
                result,
                error,
            } => HostEvent::RenderHostResult {
                request_id,
                result: match error {
                    Some(error) => Err(error),
                    None => Ok(result.unwrap_or(Value::Null)),
                },
            },
            WasmEvent::Command { command } => HostEvent::Command(command),
            WasmEvent::Tick { now_ms } => HostEvent::Tick { now_ms },
        }
    }
}

#[wasm_bindgen]
pub struct WasmHostCore {
    core: HostCore,
}

#[wasm_bindgen]
impl WasmHostCore {
    #[wasm_bindgen(constructor)]
    pub fn new(config_json: &str) -> Result<WasmHostCore, JsValue> {
        let config: WasmConfig = serde_json::from_str(config_json)
            .map_err(|error| JsValue::from_str(&format!("invalid host config: {error}")))?;
        Ok(Self {
            core: HostCore::new(HostConfig {
                app_id: config.app_id,
                manifest: config.manifest,
                initial_path: config.initial_path,
                max_page_stack: config.max_page_stack,
                initial_exit_state: config.initial_exit_state,
            }),
        })
    }

    pub fn start(&mut self, now_ms: f64) -> Result<String, JsValue> {
        to_actions(self.core.start(now_ms.max(0.0) as u64))
    }

    pub fn handle_event(&mut self, event_json: &str, now_ms: f64) -> Result<String, JsValue> {
        let event: WasmEvent = serde_json::from_str(event_json)
            .map_err(|error| JsValue::from_str(&format!("invalid host event: {error}")))?;
        to_actions(self.core.handle_event(event.into(), now_ms.max(0.0) as u64))
    }

    pub fn set_app_visible(&mut self, visible: bool) -> Result<String, JsValue> {
        to_actions(self.core.set_app_visible(visible))
    }

    pub fn page_stack_json(&self) -> String {
        serde_json::to_string(&json!({
            "stack": self.core.page_stack(),
            "active": self.core.active_page(),
        }))
        .unwrap_or_else(|_| "{\"stack\":[],\"active\":null}".to_string())
    }

    pub fn diagnostics_json(&self) -> String {
        serde_json::to_string(self.core.diagnostics()).unwrap_or_else(|_| "[]".to_string())
    }
}

fn to_actions(actions: Vec<HostAction>) -> Result<String, JsValue> {
    serde_json::to_string(&actions)
        .map_err(|error| JsValue::from_str(&format!("failed to encode host actions: {error}")))
}
