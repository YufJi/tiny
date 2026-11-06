use serde_json::{json, Value};
use tiny_host_core::{
    encode_frame, HostAction, HostCommand, HostConfig, HostCore, HostEvent, ProtocolDomain,
    ProtocolKind, ProtocolMessage, ProtocolRole, TransportFrame, PROTOCOL_VERSION,
};

fn config() -> HostConfig {
    HostConfig {
        app_id: "demo".to_string(),
        manifest: json!({ "pages": [{ "path": "pages/index" }] }),
        initial_path: "pages/index".to_string(),
        max_page_stack: Some(10),
    }
}

#[allow(clippy::too_many_arguments)]
fn message(
    kind: ProtocolKind,
    domain: ProtocolDomain,
    method: &str,
    source: ProtocolRole,
    target: ProtocolRole,
    payload: Value,
    page_id: Option<&str>,
    reply_to: Option<&str>,
) -> ProtocolMessage {
    ProtocolMessage {
        protocol_version: PROTOCOL_VERSION,
        message_id: format!("msg-{}-{}", method, source as u8),
        kind,
        domain,
        method: method.to_string(),
        source,
        target,
        payload: Some(payload),
        page_id: page_id.map(str::to_string),
        reply_to: reply_to.map(str::to_string),
        timestamp: 1_700_000_000_000,
    }
}

fn frame(messages: Vec<ProtocolMessage>) -> String {
    encode_frame(&TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages,
    })
    .expect("encode frame")
}

fn service_frame(actions: &[HostAction]) -> Option<&TransportFrame> {
    actions.iter().find_map(|action| match action {
        HostAction::SendServiceFrame { frame } => Some(frame),
        _ => None,
    })
}

fn render_frame(actions: &[HostAction]) -> Option<&TransportFrame> {
    actions.iter().find_map(|action| match action {
        HostAction::SendRenderFrame { frame, .. } => Some(frame),
        _ => None,
    })
}

fn only_frame_message(actions: &[HostAction], service: bool) -> &ProtocolMessage {
    let frame = if service {
        service_frame(actions).expect("service frame")
    } else {
        render_frame(actions).expect("render frame")
    };
    frame.messages.first().expect("frame message")
}

#[test]
fn bootstraps_service_then_creates_and_binds_one_page() {
    let mut host = HostCore::new(config());
    let actions = host.start(1_000);
    let hello = only_frame_message(&actions, true);
    assert_eq!(hello.kind, ProtocolKind::Call);
    assert_eq!(hello.method, "hello");

    let ready = service_event_ready();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), 1_010);
    let bootstrap = only_frame_message(&actions, true);
    assert_eq!(bootstrap.kind, ProtocolKind::Control);
    assert_eq!(bootstrap.method, "bootstrap");
    assert_eq!(
        bootstrap.payload.as_ref().unwrap()["initialPath"],
        "pages/index"
    );
    let bootstrap_id = bootstrap.message_id.clone();

    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({
            "ok": true,
            "result": { "pageId": "page-1", "currentPath": "pages/index" }
        }),
        None,
        Some(&bootstrap_id),
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![reply])), 1_020);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CreatePage { page_id, path }
            if page_id == "page-1" && path == "pages/index"
    )));
    assert_eq!(host.page_stack(), &["page-1"]);

    let actions = host.handle_event(
        HostEvent::PageReady {
            page_id: "page-1".to_string(),
        },
        1_030,
    );
    let render_hello = only_frame_message(&actions, false);
    assert_eq!(render_hello.method, "hello");
    assert_eq!(render_hello.target, ProtocolRole::Render);

    let render_ready = message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "protocolVersion": 1 }),
        None,
        None,
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_ready]),
        },
        1_040,
    );
    let render_bootstrap = only_frame_message(&actions, false);
    assert_eq!(render_bootstrap.method, "bootstrap");
    assert_eq!(render_bootstrap.page_id.as_deref(), Some("page-1"));
    let render_bootstrap_id = render_bootstrap.message_id.clone();

    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-1" } }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        1_050,
    );
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::ActivatePage { page_id } if page_id == "page-1"
    )));
    let page_ready = actions
        .iter()
        .find_map(|action| match action {
            HostAction::SendServiceFrame { frame } => frame.messages.iter().find(|message| {
                message.domain == ProtocolDomain::Page && message.method == "ready"
            }),
            _ => None,
        })
        .expect("page.ready control was not emitted");
    assert_eq!(page_ready.kind, ProtocolKind::Control);
    assert_eq!(page_ready.domain, ProtocolDomain::Page);
    assert_eq!(page_ready.method, "ready");
    assert_eq!(host.active_page(), Some("page-1"));
}

#[test]
fn queues_service_tree_events_until_render_is_ready() {
    let mut host = HostCore::new(config());
    let actions = host.start(2_000);
    let hello = only_frame_message(&actions, true);
    assert_eq!(hello.method, "hello");

    // Bootstrap the service directly to a page, but do not create the render
    // surface yet. The tree event must be parked by page id.
    let ready = service_event_ready();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), 2_010);
    let bootstrap_id = only_frame_message(&actions, true).message_id.clone();
    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-1", "currentPath": "pages/index" } }),
        None,
        Some(&bootstrap_id),
    );
    let _ = host.handle_event(HostEvent::ServiceFrame(frame(vec![reply])), 2_020);

    let flow = message(
        ProtocolKind::Event,
        ProtocolDomain::Tree,
        "flow",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "nodes": [], "pageId": "page-1" }),
        None,
        None,
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![flow])), 2_030);
    assert!(render_frame(&actions).is_none());

    let actions = host.handle_event(
        HostEvent::PageReady {
            page_id: "page-1".to_string(),
        },
        2_040,
    );
    assert!(render_frame(&actions).is_some());
    let render_ready = message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "protocolVersion": 1 }),
        None,
        None,
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_ready]),
        },
        2_050,
    );
    let render_bootstrap_id = only_frame_message(&actions, false).message_id.clone();
    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": {} }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        2_060,
    );
    let frame = render_frame(&actions).expect("queued tree flow should flush");
    assert_eq!(frame.messages[0].method, "flow");
}

fn service_event_ready() -> ProtocolMessage {
    message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "protocolVersion": 1 }),
        None,
        None,
    )
}

#[test]
fn navigation_updates_the_page_stack_and_emits_surface_actions() {
    let mut host = HostCore::new(config());
    let actions = host.start(9_000);
    let hello = only_frame_message(&actions, true);
    assert_eq!(hello.method, "hello");
    let ready = service_event_ready();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), 9_010);
    let bootstrap_id = only_frame_message(&actions, true).message_id.clone();
    let bootstrap_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-1", "currentPath": "pages/index" } }),
        None,
        Some(&bootstrap_id),
    );
    let _ = host.handle_event(HostEvent::ServiceFrame(frame(vec![bootstrap_reply])), 9_020);
    assert_eq!(host.page_stack(), &["page-1"]);

    let actions = host.handle_event(
        HostEvent::Command(HostCommand::NavigateTo {
            url: "/pages/detail".to_string(),
        }),
        9_030,
    );
    let navigate_id = only_frame_message(&actions, true).message_id.clone();
    let navigate_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Page,
        "navigateTo",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({
            "ok": true,
            "result": { "pageId": "page-2", "path": "pages/detail" }
        }),
        Some("page-1"),
        Some(&navigate_id),
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![navigate_reply])), 9_040);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CreatePage { page_id, path }
            if page_id == "page-2" && path == "pages/detail"
    )));
    assert_eq!(host.page_stack(), &["page-1", "page-2"]);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CommandResult { command, result }
            if command == "navigateTo" && result["pageId"] == "page-2"
    )));

    let actions = host.handle_event(
        HostEvent::Command(HostCommand::NavigateBack { delta: 1 }),
        9_050,
    );
    let back_id = only_frame_message(&actions, true).message_id.clone();
    let back_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Page,
        "navigateBack",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({
            "ok": true,
            "result": {
                "pageId": "page-1",
                "path": "pages/index",
                "unloadedPageIds": ["page-2"]
            }
        }),
        Some("page-2"),
        Some(&back_id),
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![back_reply])), 9_060);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::DestroyPage { page_id } if page_id == "page-2"
    )));
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::ActivatePage { page_id } if page_id == "page-1"
    )));
    assert_eq!(host.page_stack(), &["page-1"]);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CommandResult { command, result }
            if command == "navigateBack" && result["pageId"] == "page-1"
    )));
}

#[test]
fn system_info_is_a_platform_call() {
    // The host owns the facts: system.info goes to the platform instead of a
    // core-side snapshot, so the service always observes live host state.
    let mut host = HostCore::new(config());
    let _ = host.start(10_000);
    let call = message(
        ProtocolKind::Call,
        ProtocolDomain::Api,
        "system.info",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({}),
        Some("page-1"),
        None,
    );
    let request_id = call.message_id.clone();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![call])), 10_010);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::PlatformCall { request_id: id, method, .. }
            if id == &request_id && method == "system.info"
    )));
}

#[test]
fn platform_api_results_are_replied_to_the_service() {
    let mut host = HostCore::new(config());
    let _ = host.start(11_000);
    let call = message(
        ProtocolKind::Call,
        ProtocolDomain::Api,
        "storage.get",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "key": "name" }),
        Some("page-1"),
        None,
    );
    let request_id = call.message_id.clone();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![call])), 11_010);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::PlatformCall { request_id: id, method, .. }
            if id == &request_id && method == "storage.get"
    )));

    let actions = host.handle_event(
        HostEvent::PlatformResult {
            request_id,
            result: Ok(json!({ "value": "Tiny" })),
        },
        11_020,
    );
    let reply = only_frame_message(&actions, true);
    assert_eq!(reply.kind, ProtocolKind::Reply);
    assert_eq!(reply.method, "storage.get");
    assert_eq!(reply.payload.as_ref().unwrap()["result"]["value"], "Tiny");
}

#[test]
fn navigation_api_controls_are_replied_after_the_page_result() {
    let mut host = HostCore::new(config());
    let _ = host.start(12_000);
    let ready = service_event_ready();
    let _ = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), 12_010);

    let call = message(
        ProtocolKind::Call,
        ProtocolDomain::Api,
        "navigate.to",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "url": "/pages/detail" }),
        Some("page-1"),
        None,
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![call])), 12_020);
    let control = only_frame_message(&actions, true);
    assert_eq!(control.domain, ProtocolDomain::Page);
    assert_eq!(control.method, "navigateTo");
    let control_id = control.message_id.clone();

    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Page,
        "navigateTo",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({
            "ok": true,
            "result": { "pageId": "page-2", "path": "pages/detail" }
        }),
        Some("page-1"),
        Some(&control_id),
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![reply])), 12_030);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CreatePage { page_id, .. } if page_id == "page-2"
    )));
    let api_reply = actions.iter().find_map(|action| match action {
        HostAction::SendServiceFrame { frame } => frame
            .messages
            .iter()
            .find(|message| message.kind == ProtocolKind::Reply && message.method == "navigate.to"),
        _ => None,
    });
    let api_reply = api_reply.expect("navigation API reply");
    assert_eq!(
        api_reply.payload.as_ref().unwrap()["result"]["pageId"],
        "page-2"
    );
}

#[test]
fn inspect_tree_routes_through_the_render_bridge() {
    let mut host = HostCore::new(config());
    let _ = host.start(13_000);
    let ready = service_event_ready();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), 13_010);
    let bootstrap_id = only_frame_message(&actions, true).message_id.clone();
    let bootstrap_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-1", "currentPath": "pages/index" } }),
        None,
        Some(&bootstrap_id),
    );
    let _ = host.handle_event(
        HostEvent::ServiceFrame(frame(vec![bootstrap_reply])),
        13_020,
    );
    let _ = host.handle_event(
        HostEvent::PageReady {
            page_id: "page-1".to_string(),
        },
        13_030,
    );
    let render_ready = message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({}),
        None,
        None,
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_ready]),
        },
        13_040,
    );
    let render_bootstrap_id = only_frame_message(&actions, false).message_id.clone();
    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": {} }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let _ = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        13_050,
    );

    let actions = host.handle_event(
        HostEvent::Command(HostCommand::InspectTree {
            page_id: Some("page-1".to_string()),
        }),
        13_060,
    );
    let inspect = only_frame_message(&actions, false);
    assert_eq!(inspect.domain, ProtocolDomain::Runtime);
    assert_eq!(inspect.method, "inspectTree");
    let inspect_id = inspect.message_id.clone();
    let inspect_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "inspectTree",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "tree": "ok" } }),
        Some("page-1"),
        Some(&inspect_id),
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![inspect_reply]),
        },
        13_070,
    );
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CommandResult { command, result }
            if command == "inspectTree" && result["tree"] == "ok"
    )));
}

fn reach_render_bootstrap(host: &mut HostCore, now: u64) -> String {
    let _ = host.start(now);
    let ready = service_event_ready();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![ready])), now + 10);
    let bootstrap_id = only_frame_message(&actions, true).message_id.clone();
    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-1", "currentPath": "pages/index" } }),
        None,
        Some(&bootstrap_id),
    );
    let _ = host.handle_event(HostEvent::ServiceFrame(frame(vec![reply])), now + 20);
    let _ = host.handle_event(
        HostEvent::PageReady {
            page_id: "page-1".to_string(),
        },
        now + 30,
    );
    let render_ready = message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({}),
        None,
        None,
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_ready]),
        },
        now + 40,
    );
    only_frame_message(&actions, false).message_id.clone()
}

#[test]
fn queues_service_query_calls_until_render_is_ready() {
    let mut host = HostCore::new(config());
    let render_bootstrap_id = reach_render_bootstrap(&mut host, 15_000);

    let query = message(
        ProtocolKind::Call,
        ProtocolDomain::Query,
        "select",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "pageId": "page-1", "selector": ".chart", "all": false }),
        Some("page-1"),
        None,
    );
    let query_id = query.message_id.clone();
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![query])), 15_050);
    assert!(
        render_frame(&actions).is_none(),
        "query must wait for the render bootstrap reply"
    );

    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": {} }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        15_060,
    );
    let query_control =
        render_frame(&actions).expect("queued query should be forwarded after render bootstrap");
    assert_eq!(query_control.messages[0].kind, ProtocolKind::Control);
    assert_eq!(query_control.messages[0].domain, ProtocolDomain::Query);
    assert_eq!(query_control.messages[0].method, "select");
    let query_control_id = query_control.messages[0].message_id.clone();

    let query_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Query,
        "select",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "nodes": [] } }),
        Some("page-1"),
        Some(&query_control_id),
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![query_reply]),
        },
        15_070,
    );
    let replied = actions.iter().any(|action| match action {
        HostAction::SendServiceFrame { frame } => frame.messages.iter().any(|message| {
            message.kind == ProtocolKind::Reply && message.reply_to.as_deref() == Some(&query_id)
        }),
        _ => false,
    });
    assert!(
        replied,
        "render query reply was not returned to the service"
    );
}

#[test]
fn render_host_request_round_trips() {
    let mut host = HostCore::new(config());
    let render_bootstrap_id = reach_render_bootstrap(&mut host, 17_000);
    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": {} }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let _ = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        17_050,
    );

    let request = message(
        ProtocolKind::Call,
        ProtocolDomain::Tree,
        "hostRequest",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "method": "showPicker", "payload": { "mode": "selector" } }),
        Some("page-1"),
        None,
    );
    let request_id = request.message_id.clone();
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![request]),
        },
        17_060,
    );
    let host_request = actions.iter().find_map(|action| match action {
        HostAction::RenderHostRequest {
            request_id,
            page_id,
            method,
            payload,
        } => Some((request_id, page_id, method, payload)),
        _ => None,
    });
    let (action_request_id, page_id, method, payload) =
        host_request.expect("render host request action");
    assert_eq!(action_request_id, &request_id);
    assert_eq!(page_id, "page-1");
    assert_eq!(method, "showPicker");
    assert_eq!(payload["mode"], "selector");

    let result = json!({ "status": "ok", "value": "1" });
    let actions = host.handle_event(
        HostEvent::RenderHostResult {
            request_id: request_id.clone(),
            result: Ok(result.clone()),
        },
        17_070,
    );
    let reply = actions.iter().find_map(|action| match action {
        HostAction::SendRenderFrame { page_id, frame } => frame
            .messages
            .iter()
            .find(|message| {
                message.kind == ProtocolKind::Reply
                    && message.reply_to.as_deref() == Some(&request_id)
            })
            .map(|message| (page_id, message)),
        _ => None,
    });
    let (page_id, reply) = reply.expect("render host request reply");
    assert_eq!(page_id, "page-1");
    assert_eq!(reply.payload.as_ref().and_then(|value| value.get("result")), Some(&result));
}

#[test]
fn render_host_action_runs_navigation() {
    let mut host = HostCore::new(config());
    let render_bootstrap_id = reach_render_bootstrap(&mut host, 16_000);
    let render_reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "ok": true, "result": {} }),
        Some("page-1"),
        Some(&render_bootstrap_id),
    );
    let _ = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![render_reply]),
        },
        16_050,
    );

    let host_action = message(
        ProtocolKind::Event,
        ProtocolDomain::Tree,
        "hostAction",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "action": "navigateTo", "url": "/pages/detail" }),
        Some("page-1"),
        None,
    );
    let actions = host.handle_event(
        HostEvent::RenderFrame {
            page_id: "page-1".to_string(),
            frame: frame(vec![host_action]),
        },
        16_060,
    );
    let navigation = only_frame_message(&actions, true);
    assert_eq!(navigation.domain, ProtocolDomain::Page);
    assert_eq!(navigation.method, "navigateTo");
    let navigation_id = navigation.message_id.clone();
    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Page,
        "navigateTo",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-2", "path": "pages/detail" } }),
        Some("page-1"),
        Some(&navigation_id),
    );
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![reply])), 16_070);
    assert!(actions.iter().any(|action| matches!(
        action,
        HostAction::CreatePage { page_id, path }
            if page_id == "page-2" && path == "pages/detail"
    )));
}
