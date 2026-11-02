use std::collections::HashMap;

use serde_json::{json, Value};

use crate::bridge::{
    decode_frame, BridgeConnection, BridgeError, BridgeEvent, ProtocolDomain, ProtocolMessage,
    ProtocolRole, TransportFrame,
};

use super::action::{HostAction, PageDescriptor};
use super::command::HostCommand;
use super::event::HostEvent;

#[derive(Debug, Clone)]
pub struct HostConfig {
    pub app_id: String,
    pub manifest: Value,
    pub initial_path: String,
    pub system_info: Value,
    pub storage: Value,
    pub max_page_stack: Option<usize>,
}

struct PageState {
    path: String,
    bridge: BridgeConnection,
    render_ready: bool,
    bootstrap_id: Option<String>,
    inspect_id: Option<String>,
}

#[derive(Debug, Clone)]
enum PendingCommand {
    NavigateTo,
    NavigateBack,
    RedirectTo,
    Relaunch,
    SwitchTab,
    InspectTree { page_id: String },
}

#[derive(Debug, Clone)]
struct PendingEvent {
    domain: ProtocolDomain,
    method: String,
    payload: Value,
    page_id: String,
}

/// Platform-neutral RuntimeHost.
///
/// The core owns the service Bridge connection, one render connection per page,
/// the page stack, bootstrap handshake and tree routing. It emits actions and
/// never calls a platform API directly.
pub struct HostCore {
    config: HostConfig,
    service: BridgeConnection,
    service_ready: bool,
    bootstrap_id: Option<String>,
    pending_commands: HashMap<String, PendingCommand>,
    pages: HashMap<String, PageState>,
    pending_pages: HashMap<String, String>,
    pending_events: HashMap<String, Vec<PendingEvent>>,
    page_stack: Vec<String>,
    active_page: Option<String>,
    app_visible: bool,
    diagnostics: Vec<Value>,
}

impl HostCore {
    pub fn new(config: HostConfig) -> Self {
        Self {
            config,
            service: BridgeConnection::new(
                ProtocolRole::Host,
                ProtocolRole::Service,
                json!({}),
                None,
            ),
            service_ready: false,
            bootstrap_id: None,
            pending_commands: HashMap::new(),
            pages: HashMap::new(),
            pending_pages: HashMap::new(),
            pending_events: HashMap::new(),
            page_stack: Vec::new(),
            active_page: None,
            app_visible: true,
            diagnostics: Vec::new(),
        }
    }

    pub fn start(&mut self, now_ms: u64) -> Vec<HostAction> {
        let mut actions = Vec::new();
        if let Err(error) = self.service.handshake(now_ms) {
            self.diagnostic("error", &error.to_string(), None, &mut actions);
        }
        self.drain_service(&mut actions);
        actions
    }

    pub fn handle_event(&mut self, event: HostEvent, now_ms: u64) -> Vec<HostAction> {
        let mut actions = Vec::new();
        match event {
            HostEvent::ServiceFrame(raw) => self.on_service_frame(&raw, now_ms, &mut actions),
            HostEvent::RenderFrame { page_id, frame } => {
                self.on_render_frame(&page_id, &frame, now_ms, &mut actions)
            }
            HostEvent::PageReady { page_id } => self.on_page_ready(&page_id, now_ms, &mut actions),
            HostEvent::PageFailed { page_id, error } => {
                self.diagnostic(
                    "error",
                    &format!("page {page_id} failed: {error}"),
                    Some(&page_id),
                    &mut actions,
                );
            }
            HostEvent::PlatformResult { .. } => {
                // Platform API dispatch lands in R3; keep the event contract stable.
            }
            HostEvent::Command(command) => self.on_command(command, now_ms, &mut actions),
            HostEvent::Tick { now_ms } => self.on_tick(now_ms, &mut actions),
        }
        self.drain_service(&mut actions);
        self.drain_all_render(&mut actions);
        actions
    }

    pub fn page_stack(&self) -> &[String] {
        &self.page_stack
    }

    pub fn active_page(&self) -> Option<&str> {
        self.active_page.as_deref()
    }

    pub fn diagnostics(&self) -> &[Value] {
        &self.diagnostics
    }

    pub fn set_app_visible(&mut self, visible: bool) -> Vec<HostAction> {
        self.app_visible = visible;
        vec![HostAction::SetAppVisible { visible }]
    }

    pub fn descriptor(&self, page_id: &str) -> Option<PageDescriptor> {
        self.pages.get(page_id).map(|page| PageDescriptor {
            page_id: page_id.to_string(),
            path: page.path.clone(),
        })
    }

    fn on_command(&mut self, command: HostCommand, now_ms: u64, actions: &mut Vec<HostAction>) {
        match command {
            HostCommand::NavigateTo { url } => {
                self.send_navigation(
                    PendingCommand::NavigateTo,
                    "navigateTo",
                    json!({ "url": url }),
                    now_ms,
                    actions,
                );
            }
            HostCommand::NavigateBack { delta } => {
                self.send_navigation(
                    PendingCommand::NavigateBack,
                    "navigateBack",
                    json!({ "delta": delta.max(1) }),
                    now_ms,
                    actions,
                );
            }
            HostCommand::SwitchTab { index, url } => {
                self.send_navigation(
                    PendingCommand::SwitchTab,
                    "switchTab",
                    json!({ "index": index, "url": url }),
                    now_ms,
                    actions,
                );
            }
            HostCommand::RedirectTo { url } => {
                self.send_navigation(
                    PendingCommand::RedirectTo,
                    "redirectTo",
                    json!({ "url": url }),
                    now_ms,
                    actions,
                );
            }
            HostCommand::Relaunch { url } => {
                self.send_navigation(
                    PendingCommand::Relaunch,
                    "reLaunch",
                    json!({ "url": url }),
                    now_ms,
                    actions,
                );
            }
            HostCommand::InspectTree { page_id } => {
                let Some(page_id) = page_id.or_else(|| self.active_page.clone()) else {
                    self.diagnostic("warn", "inspectTree has no active page", None, actions);
                    return;
                };
                let Some(page) = self.pages.get_mut(&page_id) else {
                    self.diagnostic(
                        "warn",
                        &format!("inspectTree page is not connected: {page_id}"),
                        Some(&page_id),
                        actions,
                    );
                    return;
                };
                match page.bridge.control(
                    ProtocolDomain::Runtime,
                    "inspectTree",
                    json!({ "pageId": page_id }),
                    Some(page_id.clone()),
                    now_ms,
                ) {
                    Ok(id) => {
                        page.inspect_id = Some(id.clone());
                        self.pending_commands
                            .insert(id, PendingCommand::InspectTree { page_id });
                    }
                    Err(error) => {
                        self.diagnostic("error", &error.to_string(), Some(&page_id), actions);
                    }
                }
            }
            HostCommand::SetAppVisible { visible } => {
                self.app_visible = visible;
                actions.push(HostAction::SetAppVisible { visible });
            }
            HostCommand::Resize { width, height } => {
                let _ = self.service.control(
                    ProtocolDomain::Runtime,
                    "resize",
                    json!({ "windowWidth": width, "windowHeight": height }),
                    None,
                    now_ms,
                );
            }
            HostCommand::Close => {
                let page_ids: Vec<String> = self.pages.keys().cloned().collect();
                for page_id in page_ids {
                    self.destroy_page(&page_id, actions);
                }
                self.service.close();
            }
        }
    }

    fn send_navigation(
        &mut self,
        pending: PendingCommand,
        method: &str,
        payload: Value,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let page_id = self.active_page.clone();
        match self
            .service
            .control(ProtocolDomain::Page, method, payload, page_id, now_ms)
        {
            Ok(id) => {
                self.pending_commands.insert(id, pending);
            }
            Err(error) => self.diagnostic("error", &error.to_string(), None, actions),
        }
    }

    fn on_command_reply(&mut self, message_id: &str, result: Value, actions: &mut Vec<HostAction>) {
        let Some(command) = self.pending_commands.remove(message_id) else {
            return;
        };
        if let PendingCommand::InspectTree { page_id } = command {
            if let Some(page) = self.pages.get_mut(&page_id) {
                page.inspect_id = None;
            }
            actions.push(HostAction::CommandResult {
                command: "inspectTree".to_string(),
                result,
            });
            return;
        }
        let page_id = result
            .get("pageId")
            .and_then(Value::as_str)
            .map(str::to_string);
        let path = result
            .get("path")
            .and_then(Value::as_str)
            .map(str::to_string);
        let unloaded_page_ids = result
            .get("unloadedPageIds")
            .and_then(Value::as_array)
            .map(|values| {
                values
                    .iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();

        for unloaded in unloaded_page_ids {
            self.destroy_page(&unloaded, actions);
        }

        match command {
            PendingCommand::NavigateBack => {
                if let Some(page_id) = page_id.clone() {
                    if let Some(index) = self.page_stack.iter().position(|id| id == &page_id) {
                        self.page_stack.truncate(index + 1);
                    } else {
                        self.page_stack.push(page_id.clone());
                    }
                    self.activate_page(&page_id, actions);
                }
            }
            PendingCommand::SwitchTab => {
                if let Some(page_id) = page_id.clone() {
                    self.page_stack.clear();
                    self.page_stack.push(page_id.clone());
                    if self.pages.contains_key(&page_id) {
                        self.activate_page(&page_id, actions);
                    } else if let Some(path) = path {
                        self.create_page(page_id, path, actions);
                    }
                }
            }
            PendingCommand::RedirectTo | PendingCommand::Relaunch => {
                if command_matches_relaunch(&command) {
                    let page_ids: Vec<String> = self.pages.keys().cloned().collect();
                    for page in page_ids {
                        self.destroy_page(&page, actions);
                    }
                    self.page_stack.clear();
                }
                if let Some(page_id) = page_id {
                    self.page_stack.retain(|id| id != &page_id);
                    self.page_stack.push(page_id.clone());
                    if let Some(path) = path {
                        self.create_page(page_id, path, actions);
                    } else {
                        self.activate_page(&page_id, actions);
                    }
                }
            }
            PendingCommand::NavigateTo => {
                if let Some(page_id) = page_id {
                    self.page_stack.retain(|id| id != &page_id);
                    self.page_stack.push(page_id.clone());
                    if let Some(path) = path {
                        self.create_page(page_id, path, actions);
                    }
                }
            }
            PendingCommand::InspectTree { .. } => {}
        }
        self.emit_ui_state(actions);
    }

    fn create_page(&mut self, page_id: String, path: String, actions: &mut Vec<HostAction>) {
        if self.pages.contains_key(&page_id) || self.pending_pages.contains_key(&page_id) {
            self.activate_page(&page_id, actions);
            return;
        }
        self.pending_pages.insert(page_id.clone(), path.clone());
        actions.push(HostAction::CreatePage { page_id, path });
    }

    fn activate_page(&mut self, page_id: &str, actions: &mut Vec<HostAction>) {
        self.active_page = Some(page_id.to_string());
        actions.push(HostAction::ActivatePage {
            page_id: page_id.to_string(),
        });
    }

    fn destroy_page(&mut self, page_id: &str, actions: &mut Vec<HostAction>) {
        self.pages.remove(page_id);
        self.pending_pages.remove(page_id);
        self.pending_events.remove(page_id);
        self.page_stack.retain(|id| id != page_id);
        if self.active_page.as_deref() == Some(page_id) {
            self.active_page = self.page_stack.last().cloned();
        }
        actions.push(HostAction::DestroyPage {
            page_id: page_id.to_string(),
        });
    }

    fn on_service_frame(&mut self, raw: &str, now_ms: u64, actions: &mut Vec<HostAction>) {
        let frame = match decode_frame(raw) {
            Ok(frame) => frame,
            Err(error) => {
                self.diagnostic("error", &error.to_string(), None, actions);
                return;
            }
        };
        for event in self.service.receive_frame(frame, now_ms) {
            match event {
                BridgeEvent::Ready { .. } => {
                    self.service_ready = true;
                    self.start_bootstrap(now_ms, actions);
                }
                BridgeEvent::Reply { message_id, result } => {
                    if self.bootstrap_id.as_deref() == Some(&message_id) {
                        self.bootstrap_id = None;
                        self.on_bootstrap_reply(result, actions);
                    } else if self.pending_commands.contains_key(&message_id) {
                        self.on_command_reply(&message_id, result, actions);
                    }
                }
                BridgeEvent::CallFailed {
                    message_id,
                    code,
                    message,
                } => {
                    self.pending_commands.remove(&message_id);
                    self.diagnostic(
                        "error",
                        &format!("bridge call {message_id} failed: {code}: {message}"),
                        None,
                        actions,
                    );
                }
                BridgeEvent::Call(message) | BridgeEvent::Control(message) => {
                    self.unhandled_message("service", &message, actions);
                }
                BridgeEvent::Event(message) => self.route_service_event(message, actions),
                BridgeEvent::Timeout {
                    message_id,
                    domain,
                    method,
                } => {
                    self.pending_commands.remove(&message_id);
                    self.diagnostic(
                        "error",
                        &format!("{domain:?}.{method} timed out ({message_id})"),
                        None,
                        actions,
                    );
                }
                BridgeEvent::Error(error) => {
                    self.diagnostic("error", &error.to_string(), None, actions);
                }
            }
        }
        self.drain_service(actions);
    }

    fn on_bootstrap_reply(&mut self, result: Value, actions: &mut Vec<HostAction>) {
        let page_id = result
            .get("pageId")
            .and_then(Value::as_str)
            .map(str::to_string);
        let path = result
            .get("currentPath")
            .and_then(Value::as_str)
            .unwrap_or(&self.config.initial_path)
            .to_string();
        let Some(page_id) = page_id else {
            self.diagnostic(
                "error",
                "service bootstrap did not return a pageId",
                None,
                actions,
            );
            return;
        };
        self.pending_pages.insert(page_id.clone(), path.clone());
        self.page_stack.push(page_id.clone());
        actions.push(HostAction::CreatePage {
            page_id: page_id.clone(),
            path: path.clone(),
        });
        self.emit_ui_state(actions);
    }

    fn on_page_ready(&mut self, page_id: &str, now_ms: u64, actions: &mut Vec<HostAction>) {
        if self.pages.contains_key(page_id) {
            self.diagnostic(
                "warn",
                &format!("page {page_id} is already connected"),
                Some(page_id),
                actions,
            );
            return;
        }
        let Some(path) = self.pending_pages.remove(page_id) else {
            self.diagnostic(
                "error",
                &format!("page {page_id} has no pending path"),
                Some(page_id),
                actions,
            );
            return;
        };
        let mut bridge =
            BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Render, json!({}), None);
        if let Err(error) = bridge.handshake(now_ms) {
            self.diagnostic("error", &error.to_string(), Some(page_id), actions);
            return;
        }
        self.pages.insert(
            page_id.to_string(),
            PageState {
                path,
                bridge,
                render_ready: false,
                bootstrap_id: None,
                inspect_id: None,
            },
        );
        self.drain_render(page_id, actions);
    }

    fn on_render_frame(
        &mut self,
        page_id: &str,
        raw: &str,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let Some(mut page) = self.pages.remove(page_id) else {
            self.diagnostic(
                "warn",
                &format!("render frame for an unknown page {page_id}"),
                Some(page_id),
                actions,
            );
            return;
        };
        let frame = match decode_frame(raw) {
            Ok(frame) => frame,
            Err(error) => {
                self.pages.insert(page_id.to_string(), page);
                self.diagnostic("error", &error.to_string(), Some(page_id), actions);
                return;
            }
        };
        let events = page.bridge.receive_frame(frame, now_ms);
        let mut finish = false;
        for event in events {
            match event {
                BridgeEvent::Ready { .. } => {
                    page.render_ready = true;
                    let payload = json!({
                        "initialPath": page.path,
                        "pageId": page_id,
                    });
                    match page.bridge.control(
                        ProtocolDomain::Runtime,
                        "bootstrap",
                        payload,
                        Some(page_id.to_string()),
                        now_ms,
                    ) {
                        Ok(id) => page.bootstrap_id = Some(id),
                        Err(error) => {
                            self.diagnostic("error", &error.to_string(), Some(page_id), actions);
                        }
                    }
                }
                BridgeEvent::Reply { message_id, result } => {
                    if page.bootstrap_id.as_deref() == Some(&message_id) {
                        page.bootstrap_id = None;
                        finish = true;
                    } else if page.inspect_id.as_deref() == Some(&message_id) {
                        page.inspect_id = None;
                        actions.push(HostAction::CommandResult {
                            command: "inspectTree".to_string(),
                            result,
                        });
                    }
                }
                BridgeEvent::CallFailed {
                    message_id,
                    code,
                    message,
                } => {
                    self.diagnostic(
                        "error",
                        &format!("render call {message_id} failed: {code}: {message}"),
                        Some(page_id),
                        actions,
                    );
                }
                BridgeEvent::Event(message) => self.forward_render_event(message),
                BridgeEvent::Call(message) | BridgeEvent::Control(message) => {
                    self.unhandled_message("render", &message, actions);
                }
                BridgeEvent::Timeout {
                    message_id,
                    domain,
                    method,
                } => {
                    self.diagnostic(
                        "error",
                        &format!("{domain:?}.{method} timed out ({message_id})"),
                        Some(page_id),
                        actions,
                    );
                }
                BridgeEvent::Error(error) => {
                    self.diagnostic("error", &error.to_string(), Some(page_id), actions);
                }
            }
        }
        self.pages.insert(page_id.to_string(), page);
        if finish {
            self.finish_page(page_id, now_ms, actions);
        } else {
            self.drain_render(page_id, actions);
        }
    }

    fn finish_page(&mut self, page_id: &str, now_ms: u64, actions: &mut Vec<HostAction>) {
        self.flush_pending_events(page_id);
        let _ = self.service.control(
            ProtocolDomain::Page,
            "ready",
            json!({ "pageId": page_id }),
            Some(page_id.to_string()),
            now_ms,
        );
        self.active_page = Some(page_id.to_string());
        actions.push(HostAction::ActivatePage {
            page_id: page_id.to_string(),
        });
        self.emit_ui_state(actions);
        self.drain_service(actions);
        self.drain_render(page_id, actions);
    }

    fn route_service_event(&mut self, message: ProtocolMessage, actions: &mut Vec<HostAction>) {
        let Some(page_id) = message.page_id.clone() else {
            self.diagnostic(
                "warning",
                &format!(
                    "page-scoped service event {} without pageId",
                    message.method
                ),
                None,
                actions,
            );
            return;
        };
        let payload = message.payload.unwrap_or(Value::Null);
        if self
            .pages
            .get(&page_id)
            .is_some_and(|page| page.render_ready && page.bootstrap_id.is_none())
        {
            self.send_render_event(&page_id, message.domain, &message.method, payload, actions);
            return;
        }
        let queue = self.pending_events.entry(page_id.clone()).or_default();
        queue.push(PendingEvent {
            domain: message.domain,
            method: message.method,
            payload,
            page_id,
        });
        if queue.len() > 256 {
            queue.remove(0);
            self.diagnostic("warn", "pending render event queue overflow", None, actions);
        }
    }

    fn forward_render_event(&mut self, message: ProtocolMessage) {
        let page_id = message.page_id.clone();
        let payload = message.payload.unwrap_or(Value::Null);
        let _ = self
            .service
            .send_event(message.domain, &message.method, payload, page_id, 0);
    }

    fn flush_pending_events(&mut self, page_id: &str) {
        let Some(events) = self.pending_events.remove(page_id) else {
            return;
        };
        for event in events {
            if let Some(page) = self.pages.get_mut(page_id) {
                let _ = page.bridge.send_event(
                    event.domain,
                    &event.method,
                    event.payload,
                    Some(event.page_id),
                    0,
                );
            }
        }
    }

    fn send_render_event(
        &mut self,
        page_id: &str,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        actions: &mut Vec<HostAction>,
    ) {
        if let Some(page) = self.pages.get_mut(page_id) {
            if let Err(error) =
                page.bridge
                    .send_event(domain, method, payload, Some(page_id.to_string()), 0)
            {
                self.diagnostic("error", &error.to_string(), Some(page_id), actions);
            }
        }
    }

    fn start_bootstrap(&mut self, now_ms: u64, actions: &mut Vec<HostAction>) {
        if self.bootstrap_id.is_some() {
            return;
        }
        let payload = json!({
            "manifest": self.config.manifest,
            "initialPath": self.config.initial_path,
            "systemInfo": self.config.system_info,
            "storage": self.config.storage,
            "maxPageStack": self.config.max_page_stack.unwrap_or(10),
        });
        match self
            .service
            .control(ProtocolDomain::Runtime, "bootstrap", payload, None, now_ms)
        {
            Ok(id) => self.bootstrap_id = Some(id),
            Err(error) => self.diagnostic("error", &error.to_string(), None, actions),
        }
    }

    fn on_tick(&mut self, now_ms: u64, actions: &mut Vec<HostAction>) {
        for event in self.service.expire(now_ms) {
            if let BridgeEvent::Timeout {
                message_id,
                domain,
                method,
            } = event
            {
                self.diagnostic(
                    "error",
                    &format!("service {domain:?}.{method} timed out ({message_id})"),
                    None,
                    actions,
                );
            }
        }
        let mut timeouts = Vec::new();
        for (page_id, page) in &mut self.pages {
            for event in page.bridge.expire(now_ms) {
                if let BridgeEvent::Timeout {
                    message_id,
                    domain,
                    method,
                } = event
                {
                    timeouts.push((
                        page_id.clone(),
                        format!("{page_id} {domain:?}.{method} timed out ({message_id})"),
                    ));
                }
            }
        }
        for (page_id, message) in timeouts {
            self.diagnostic("error", &message, Some(&page_id), actions);
        }
        self.drain_service(actions);
    }

    fn unhandled_message(
        &mut self,
        source: &str,
        message: &ProtocolMessage,
        actions: &mut Vec<HostAction>,
    ) {
        self.diagnostic(
            "warn",
            &format!(
                "unhandled {source} {:?} {:?}.{}",
                message.kind, message.domain, message.method
            ),
            message.page_id.as_deref(),
            actions,
        );
    }

    fn emit_ui_state(&mut self, actions: &mut Vec<HostAction>) {
        let Some(page_id) = self.active_page.clone() else {
            return;
        };
        let Some(page) = self.pages.get(&page_id) else {
            return;
        };
        actions.push(HostAction::UpdateUIState {
            state: json!({
                "appId": self.config.app_id,
                "pageId": page_id,
                "path": page.path,
                "pageStack": self.page_stack,
                "appVisible": self.app_visible,
            }),
        });
    }

    fn diagnostic(
        &mut self,
        level: &str,
        message: &str,
        page_id: Option<&str>,
        actions: &mut Vec<HostAction>,
    ) {
        let payload = json!({
            "code": "HOST_CORE",
            "message": message,
            "pageId": page_id,
        });
        self.diagnostics.push(payload.clone());
        actions.push(HostAction::Diagnostic {
            level: level.to_string(),
            payload,
        });
    }

    fn drain_service(&mut self, actions: &mut Vec<HostAction>) {
        for frame in self.service.take_outbound_frames() {
            actions.push(HostAction::SendServiceFrame { frame });
        }
    }

    fn drain_render(&mut self, page_id: &str, actions: &mut Vec<HostAction>) {
        if let Some(page) = self.pages.get_mut(page_id) {
            let frames = page.bridge.take_outbound_frames();
            for frame in frames {
                actions.push(HostAction::SendRenderFrame {
                    page_id: page_id.to_string(),
                    frame,
                });
            }
        }
    }

    fn drain_all_render(&mut self, actions: &mut Vec<HostAction>) {
        let page_ids: Vec<String> = self.pages.keys().cloned().collect();
        for page_id in page_ids {
            self.drain_render(&page_id, actions);
        }
    }

    #[allow(dead_code)]
    fn bridge_error(&self, error: BridgeError) -> Value {
        json!({ "code": error.code(), "message": error.to_string() })
    }
}

#[allow(dead_code)]
fn command_matches_relaunch(command: &PendingCommand) -> bool {
    matches!(command, PendingCommand::Relaunch)
}

#[allow(dead_code)]
fn _transport_frame_marker(_frame: &TransportFrame) {}
