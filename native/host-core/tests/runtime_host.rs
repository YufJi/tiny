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
        system_info: json!({ "pixelRatio": 2 }),
        storage: json!({}),
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
    let page_ready = only_frame_message(&actions, true);
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
        json!({ "nodes": [] }),
        Some("page-1"),
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
}

#[test]
fn system_info_api_is_answered_by_the_host_core() {
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
    let actions = host.handle_event(HostEvent::ServiceFrame(frame(vec![call])), 10_010);
    let reply = only_frame_message(&actions, true);
    assert_eq!(reply.kind, ProtocolKind::Reply);
    assert_eq!(reply.method, "system.info");
    assert_eq!(reply.payload.as_ref().unwrap()["ok"], true);
    assert_eq!(reply.payload.as_ref().unwrap()["result"]["pixelRatio"], 2);
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
