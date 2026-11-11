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
    pub max_page_stack: Option<usize>,
    pub initial_exit_state: Option<Value>,
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
    Share,
    SnapshotPageState,
    RestorePageState,
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
    pending_api_navigation: HashMap<String, ProtocolMessage>,
    pending_api_control: HashMap<String, ProtocolMessage>,
    pending_platform_calls: HashMap<String, ProtocolMessage>,
    pending_render_calls: HashMap<String, ProtocolMessage>,
    pending_render_host_requests: HashMap<String, ProtocolMessage>,
    pending_service_calls: HashMap<String, Vec<ProtocolMessage>>,
    pages: HashMap<String, PageState>,
    pending_pages: HashMap<String, String>,
    pending_initial_data: HashMap<String, Value>,
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
            pending_api_navigation: HashMap::new(),
            pending_api_control: HashMap::new(),
            pending_platform_calls: HashMap::new(),
            pending_render_calls: HashMap::new(),
            pending_render_host_requests: HashMap::new(),
            pending_service_calls: HashMap::new(),
            pages: HashMap::new(),
            pending_pages: HashMap::new(),
            pending_initial_data: HashMap::new(),
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
            HostEvent::PlatformResult { request_id, result } => {
                self.on_platform_result(&request_id, result, now_ms, &mut actions)
            }
            HostEvent::RenderHostResult { request_id, result } => {
                self.on_render_host_result(&request_id, result, now_ms, &mut actions)
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
                    None,
                    actions,
                );
            }
            HostCommand::NavigateBack { delta } => {
                self.send_navigation(
                    PendingCommand::NavigateBack,
                    "navigateBack",
                    json!({ "delta": delta.max(1) }),
                    now_ms,
                    None,
                    actions,
                );
            }
            HostCommand::SwitchTab { index, url } => {
                self.send_navigation(
                    PendingCommand::SwitchTab,
                    "switchTab",
                    json!({ "index": index, "url": url }),
                    now_ms,
                    None,
                    actions,
                );
            }
            HostCommand::RedirectTo { url } => {
                self.send_navigation(
                    PendingCommand::RedirectTo,
                    "redirectTo",
                    json!({ "url": url }),
                    now_ms,
                    None,
                    actions,
                );
            }
            HostCommand::Relaunch { url } => {
                self.send_navigation(
                    PendingCommand::Relaunch,
                    "reLaunch",
                    json!({ "url": url }),
                    now_ms,
                    None,
                    actions,
                );
            }
            HostCommand::Share { share_type, from } => {
                let Some(page_id) = self.active_page.clone() else {
                    self.diagnostic("warn", "share has no active page", None, actions);
                    return;
                };
                let payload = json!({
                    "type": share_type.unwrap_or_else(|| "appMessage".to_string()),
                    "from": from.unwrap_or_else(|| "menu".to_string()),
                });
                match self.service.control(
                    ProtocolDomain::Page,
                    "share",
                    payload,
                    Some(page_id.clone()),
                    now_ms,
                ) {
                    Ok(id) => {
                        self.pending_commands.insert(id, PendingCommand::Share);
                    }
                    Err(error) => {
                        self.diagnostic("error", &error.to_string(), Some(&page_id), actions);
                    }
                }
            }
            HostCommand::SnapshotPageState => {
                match self.service.control(
                    ProtocolDomain::Page,
                    "snapshotState",
                    json!({}),
                    None,
                    now_ms,
                ) {
                    Ok(id) => {
                        self.pending_commands
                            .insert(id, PendingCommand::SnapshotPageState);
                    }
                    Err(error) => {
                        self.diagnostic("error", &error.to_string(), None, actions);
                    }
                }
            }
            HostCommand::RestorePageState {
                page_id,
                data,
                saved_exit_state,
                exit_state,
            } => {
                match self.service.control(
                    ProtocolDomain::Page,
                    "restoreState",
                    json!({
                        "pageId": page_id,
                        "data": data,
                        "savedExitState": saved_exit_state,
                        "exitState": exit_state,
                    }),
                    Some(page_id),
                    now_ms,
                ) {
                    Ok(id) => {
                        self.pending_commands
                            .insert(id, PendingCommand::RestorePageState);
                    }
                    Err(error) => {
                        self.diagnostic("error", &error.to_string(), None, actions);
                    }
                }
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
            HostCommand::SetPageVisible { visible } => {
                if let Some(page_id) = self.active_page.clone() {
                    let method = if visible { "show" } else { "hide" };
                    let _ = self.service.control(
                        ProtocolDomain::Page,
                        method,
                        json!({}),
                        Some(page_id),
                        now_ms,
                    );
                }
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
            HostCommand::EmitEvent { name, payload } => {
                let _ = self.service.send_event(
                    ProtocolDomain::Event,
                    "global",
                    json!({ "name": name, "payload": payload.unwrap_or(Value::Null) }),
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
        api_request: Option<ProtocolMessage>,
        actions: &mut Vec<HostAction>,
    ) {
        let page_id = self.active_page.clone();
        match self
            .service
            .control(ProtocolDomain::Page, method, payload, page_id, now_ms)
        {
            Ok(id) => {
                self.pending_commands.insert(id.clone(), pending);
                if let Some(request) = api_request {
                    self.pending_api_navigation.insert(id, request);
                }
            }
            Err(error) => {
                self.diagnostic("error", &error.to_string(), None, actions);
                if let Some(request) = api_request {
                    let _ = self.service.reply(
                        &request,
                        None,
                        Some(("HANDLER_ERROR".to_string(), error.to_string())),
                        now_ms,
                    );
                }
            }
        }
    }

    fn on_command_reply(
        &mut self,
        message_id: &str,
        result: Value,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let Some(command) = self.pending_commands.remove(message_id) else {
            return;
        };
        let command_name = command_name(&command).to_string();
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
        if matches!(
            &command,
            PendingCommand::SnapshotPageState | PendingCommand::RestorePageState
        ) {
            actions.push(HostAction::CommandResult {
                command: command_name,
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
        if let (Some(page_id), Some(initial_data)) = (page_id.as_ref(), result.get("initialData")) {
            self.pending_initial_data
                .insert(page_id.clone(), initial_data.clone());
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
            PendingCommand::InspectTree { .. }
            | PendingCommand::Share
            | PendingCommand::SnapshotPageState
            | PendingCommand::RestorePageState => {}
        }
        actions.push(HostAction::CommandResult {
            command: command_name,
            result: result.clone(),
        });
        if let Some(request) = self.pending_api_navigation.remove(message_id) {
            let _ = self.service.reply(&request, Some(result), None, now_ms);
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
        self.pending_initial_data.remove(page_id);
        self.pending_service_calls.remove(page_id);
        self.pending_events.remove(page_id);
        self.pending_render_host_requests
            .retain(|_, request| request.page_id.as_deref() != Some(page_id));
        self.page_stack.retain(|id| id != page_id);
        if self.active_page.as_deref() == Some(page_id) {
            self.active_page = self.page_stack.last().cloned();
        }
        actions.push(HostAction::DestroyPage {
            page_id: page_id.to_string(),
        });
    }

    fn on_api_call(
        &mut self,
        request: ProtocolMessage,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let method = request.method.clone();
        let params = request.payload.clone().unwrap_or_else(|| json!({}));
        let navigation = match method.as_str() {
            "navigate.to" => Some(("navigateTo", PendingCommand::NavigateTo)),
            "navigate.back" => Some(("navigateBack", PendingCommand::NavigateBack)),
            "navigate.switchTab" => Some(("switchTab", PendingCommand::SwitchTab)),
            "navigate.redirectTo" => Some(("redirectTo", PendingCommand::RedirectTo)),
            "navigate.reLaunch" => Some(("reLaunch", PendingCommand::Relaunch)),
            _ => None,
        };
        if let Some((control_method, pending)) = navigation {
            self.send_navigation(
                pending,
                control_method,
                params,
                now_ms,
                Some(request),
                actions,
            );
            return;
        }
        if method == "page.pullDownRefresh" {
            let page_id = request.page_id.clone();
            match self.service.control(
                ProtocolDomain::Page,
                "pullDownRefresh",
                json!({}),
                page_id,
                now_ms,
            ) {
                Ok(id) => {
                    self.pending_api_control.insert(id, request);
                }
                Err(error) => {
                    let _ = self.service.reply(
                        &request,
                        None,
                        Some(("HANDLER_ERROR".to_string(), error.to_string())),
                        now_ms,
                    );
                }
            }
            return;
        }
        if method == "page.stopPullDownRefresh" {
            let _ =
                self.service
                    .reply(&request, Some(json!({ "status": "stopped" })), None, now_ms);
            actions.push(HostAction::Diagnostic {
                level: "log".to_string(),
                payload: json!({
                    "code": "PULL_DOWN_REFRESH_STOPPED",
                    "message": "pull-down refresh stopped",
                    "pageId": request.page_id,
                }),
            });
            return;
        }

        let request_id = request.message_id.clone();
        let page_id = request.page_id.clone();
        self.pending_platform_calls
            .insert(request_id.clone(), request);
        actions.push(HostAction::PlatformCall {
            request_id,
            method,
            params,
            page_id,
        });
    }

    fn on_platform_result(
        &mut self,
        request_id: &str,
        result: Result<Value, String>,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let Some(request) = self.pending_platform_calls.remove(request_id) else {
            return;
        };
        match result {
            Ok(value) => {
                let _ = self.service.reply(&request, Some(value), None, now_ms);
            }
            Err(error) => {
                let _ = self.service.reply(
                    &request,
                    None,
                    Some(("HANDLER_ERROR".to_string(), error)),
                    now_ms,
                );
            }
        }
        self.drain_service(actions);
    }

    fn fail_api_request(
        &mut self,
        message_id: &str,
        code: &str,
        message: &str,
        now_ms: u64,
        _actions: &mut Vec<HostAction>,
    ) {
        if let Some(request) = self.pending_api_navigation.remove(message_id) {
            let _ = self.service.reply(
                &request,
                None,
                Some((code.to_string(), message.to_string())),
                now_ms,
            );
        }
        if let Some(request) = self.pending_api_control.remove(message_id) {
            let _ = self.service.reply(
                &request,
                None,
                Some((code.to_string(), message.to_string())),
                now_ms,
            );
        }
        if let Some(request) = self.pending_platform_calls.remove(message_id) {
            let _ = self.service.reply(
                &request,
                None,
                Some((code.to_string(), message.to_string())),
                now_ms,
            );
        }
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
                        self.on_command_reply(&message_id, result, now_ms, actions);
                    } else if let Some(request) = self.pending_api_control.remove(&message_id) {
                        let _ = self.service.reply(&request, Some(result), None, now_ms);
                    }
                }
                BridgeEvent::CallFailed {
                    message_id,
                    code,
                    message,
                } => {
                    if let Some(command) = self.pending_commands.remove(&message_id) {
                        actions.push(HostAction::CommandResult {
                            command: command_name(&command).to_string(),
                            result: json!({
                                "ok": false,
                                "error": { "code": code, "message": message },
                            }),
                        });
                    }
                    if let Some(request) = self.pending_render_calls.remove(&message_id) {
                        let _ = self.service.reply(
                            &request,
                            None,
                            Some((code.clone(), message.clone())),
                            now_ms,
                        );
                    }
                    self.fail_api_request(&message_id, &code, &message, now_ms, actions);
                    self.diagnostic(
                        "error",
                        &format!("bridge call {message_id} failed: {code}: {message}"),
                        None,
                        actions,
                    );
                }
                BridgeEvent::Call(message) => {
                    if message.domain == ProtocolDomain::Api {
                        self.on_api_call(message, now_ms, actions);
                    } else {
                        self.forward_service_call(message, now_ms, actions);
                    }
                }
                BridgeEvent::Control(message) => {
                    self.unhandled_message("service", &message, actions);
                }
                BridgeEvent::Event(message) => {
                    if message.domain == ProtocolDomain::Diagnostic {
                        self.on_diagnostic(&message, actions);
                    } else {
                        self.route_service_event(message, actions);
                    }
                }
                BridgeEvent::Timeout {
                    message_id,
                    domain,
                    method,
                } => {
                    self.pending_commands.remove(&message_id);
                    self.fail_api_request(
                        &message_id,
                        "TIMEOUT",
                        &format!("{domain:?}.{method} timed out"),
                        now_ms,
                        actions,
                    );
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
        if let Some(initial_data) = result.get("initialData") {
            self.pending_initial_data
                .insert(page_id.clone(), initial_data.clone());
        }
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
                    let mut payload = json!({
                        "initialPath": page.path,
                        "pageId": page_id,
                    });
                    if let Some(initial_data) = self.pending_initial_data.remove(page_id) {
                        payload["initialData"] = initial_data;
                    }
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
                    } else if let Some(request) = self.pending_render_calls.remove(&message_id) {
                        let _ = self.service.reply(&request, Some(result), None, now_ms);
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
                BridgeEvent::Event(message) => {
                    if message.domain == ProtocolDomain::Diagnostic {
                        self.on_diagnostic(&message, actions);
                    } else if message.domain == ProtocolDomain::Tree
                        && message.method == "hostAction"
                    {
                        self.on_render_host_action(&message, now_ms, actions);
                    } else {
                        self.forward_render_event(message);
                    }
                }
                BridgeEvent::Call(message) => {
                    if message.domain == ProtocolDomain::Tree && message.method == "hostRequest" {
                        self.on_render_host_request(&message, now_ms, actions);
                    } else {
                        self.unhandled_message("render", &message, actions);
                    }
                }
                BridgeEvent::Control(message) => {
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
        let _ = self.service.send_event(
            ProtocolDomain::Tree,
            "ready",
            json!({ "pageId": page_id }),
            Some(page_id.to_string()),
            now_ms,
        );
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
        self.forward_pending_service_calls(page_id, now_ms, actions);
    }

    fn forward_pending_service_calls(
        &mut self,
        page_id: &str,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let Some(calls) = self.pending_service_calls.remove(page_id) else {
            return;
        };
        for call in calls {
            self.forward_service_call(call, now_ms, actions);
        }
        self.drain_render(page_id, actions);
    }

    fn on_diagnostic(&mut self, message: &ProtocolMessage, actions: &mut Vec<HostAction>) {
        let level = message
            .method
            .strip_prefix("diagnostic.")
            .unwrap_or("log")
            .to_string();
        let payload = message.payload.clone().unwrap_or(Value::Null);
        if message.method == "diagnostic.state" {
            actions.push(HostAction::UpdateUIState { state: payload });
        } else {
            actions.push(HostAction::Diagnostic { level, payload });
        }
    }

    fn route_service_event(&mut self, message: ProtocolMessage, actions: &mut Vec<HostAction>) {
        let payload = message.payload.unwrap_or(Value::Null);
        // Tree flow events from the service carry their pageId inside the
        // payload, unlike most other events. Accept both shapes.
        let page_id = message
            .page_id
            .clone()
            .or_else(|| {
                payload
                    .get("pageId")
                    .and_then(Value::as_str)
                    .map(str::to_string)
            })
            .or_else(|| self.pending_pages.keys().next().cloned())
            .or_else(|| self.page_stack.last().cloned())
            .or_else(|| self.active_page.clone());
        let Some(page_id) = page_id else {
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

    fn forward_service_call(
        &mut self,
        message: ProtocolMessage,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let payload = message.payload.clone().unwrap_or(Value::Null);
        let page_id = message
            .page_id
            .clone()
            .or_else(|| {
                payload
                    .get("pageId")
                    .and_then(Value::as_str)
                    .map(str::to_string)
            })
            .or_else(|| self.pending_pages.keys().next().cloned())
            .or_else(|| self.page_stack.last().cloned())
            .or_else(|| self.active_page.clone());
        let Some(page_id) = page_id else {
            self.unhandled_message("service", &message, actions);
            return;
        };
        let render_ready = self
            .pages
            .get(&page_id)
            .is_some_and(|page| page.render_ready && page.bootstrap_id.is_none());
        if !render_ready {
            self.pending_service_calls
                .entry(page_id)
                .or_default()
                .push(message);
            return;
        }
        let Some(page) = self.pages.get_mut(&page_id) else {
            return;
        };
        match page.bridge.control(
            message.domain,
            &message.method,
            payload,
            Some(page_id.clone()),
            now_ms,
        ) {
            Ok(id) => {
                self.pending_render_calls.insert(id, message);
            }
            Err(error) => {
                self.diagnostic("error", &error.to_string(), Some(&page_id), actions);
            }
        }
    }

    fn on_render_host_request(
        &mut self,
        message: &ProtocolMessage,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let payload = message.payload.clone().unwrap_or(Value::Null);
        let method = payload
            .get("method")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();
        let params = payload.get("payload").cloned().unwrap_or(Value::Null);
        if method.is_empty() {
            if let Some(page) = self
                .pages
                .get_mut(message.page_id.as_deref().unwrap_or(""))
            {
                let _ = page.bridge.reply(
                    message,
                    None,
                    Some((
                        "HANDLER_ERROR".to_string(),
                        "missing host request method".to_string(),
                    )),
                    now_ms,
                );
            }
            return;
        }
        self.pending_render_host_requests
            .insert(message.message_id.clone(), message.clone());
        actions.push(HostAction::RenderHostRequest {
            request_id: message.message_id.clone(),
            page_id: message.page_id.clone().unwrap_or_default(),
            method,
            payload: params,
        });
    }

    fn on_render_host_result(
        &mut self,
        request_id: &str,
        result: Result<Value, String>,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let Some(request) = self.pending_render_host_requests.remove(request_id) else {
            return;
        };
        let Some(page_id) = request.page_id.clone() else {
            return;
        };
        let Some(page) = self.pages.get_mut(&page_id) else {
            self.diagnostic(
                "error",
                &format!("render host request page {page_id} is gone"),
                Some(&page_id),
                actions,
            );
            return;
        };
        let (value, error) = match result {
            Ok(value) => (Some(value), None),
            Err(error) => (
                None,
                Some(("HANDLER_ERROR".to_string(), error)),
            ),
        };
        if let Err(error) = page.bridge.reply(&request, value, error, now_ms) {
            self.diagnostic(
                "error",
                &format!("render host reply failed: {error}"),
                Some(&page_id),
                actions,
            );
        }
    }

    fn on_render_host_action(
        &mut self,
        message: &ProtocolMessage,
        now_ms: u64,
        actions: &mut Vec<HostAction>,
    ) {
        let payload = message.payload.clone().unwrap_or(Value::Null);
        let action = payload.get("action").and_then(Value::as_str);
        let command = match action {
            Some("navigateTo") => Some(HostCommand::NavigateTo {
                url: payload
                    .get("url")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string(),
            }),
            Some("redirectTo") => Some(HostCommand::RedirectTo {
                url: payload
                    .get("url")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string(),
            }),
            Some("switchTab") => Some(HostCommand::SwitchTab {
                index: None,
                url: Some(
                    payload
                        .get("url")
                        .and_then(Value::as_str)
                        .unwrap_or("")
                        .to_string(),
                ),
            }),
            Some("reLaunch") => Some(HostCommand::Relaunch {
                url: payload
                    .get("url")
                    .and_then(Value::as_str)
                    .unwrap_or("")
                    .to_string(),
            }),
            Some("navigateBack") => Some(HostCommand::NavigateBack {
                delta: payload.get("delta").and_then(Value::as_u64).unwrap_or(1) as u32,
            }),
            Some("exit") => {
                self.diagnostic(
                    "info",
                    "exitMiniProgram is not supported by this host",
                    message.page_id.as_deref(),
                    actions,
                );
                return;
            }
            _ => None,
        };
        if let Some(command) = command {
            self.on_command(command, now_ms, actions);
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
        let mut payload = json!({
            "manifest": self.config.manifest,
            "initialPath": self.config.initial_path,
            "maxPageStack": self.config.max_page_stack.unwrap_or(10),
        });
        if let Some(initial_exit_state) = &self.config.initial_exit_state {
            payload["initialExitState"] = initial_exit_state.clone();
        }
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

fn command_name(command: &PendingCommand) -> &'static str {
    match command {
        PendingCommand::NavigateTo => "navigateTo",
        PendingCommand::NavigateBack => "navigateBack",
        PendingCommand::RedirectTo => "redirectTo",
        PendingCommand::Relaunch => "reLaunch",
        PendingCommand::SwitchTab => "switchTab",
        PendingCommand::InspectTree { .. } => "inspectTree",
        PendingCommand::Share => "share",
        PendingCommand::SnapshotPageState => "snapshotPageState",
        PendingCommand::RestorePageState => "restorePageState",
    }
}

#[allow(dead_code)]
fn _transport_frame_marker(_frame: &TransportFrame) {}
