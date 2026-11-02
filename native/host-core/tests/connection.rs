use serde_json::{json, Value};
use tiny_host_core::{
    BridgeConnection, BridgeError, BridgeEvent, ProtocolDomain, ProtocolKind, ProtocolMessage,
    ProtocolRole, TransportFrame, PROTOCOL_VERSION,
};

fn message(
    kind: ProtocolKind,
    domain: ProtocolDomain,
    method: &str,
    source: ProtocolRole,
    target: ProtocolRole,
    payload: Value,
    reply_to: Option<&str>,
) -> ProtocolMessage {
    ProtocolMessage {
        protocol_version: PROTOCOL_VERSION,
        message_id: format!("msg-test-{}", method),
        kind,
        domain,
        method: method.to_string(),
        source,
        target,
        payload: Some(payload),
        page_id: None,
        reply_to: reply_to.map(str::to_string),
        timestamp: 1_700_000_000_000,
    }
}

fn frame(messages: Vec<ProtocolMessage>) -> TransportFrame {
    TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages,
    }
}

#[test]
fn handshake_emits_hello_and_waits_for_ready() {
    let mut host = BridgeConnection::new(
        ProtocolRole::Host,
        ProtocolRole::Service,
        json!({ "canvas": true }),
        Some(30_000),
    );
    host.handshake(1_000).expect("handshake starts");
    let frames = host.take_outbound_frames();
    assert_eq!(frames.len(), 1);
    let hello = &frames[0].messages[0];
    assert_eq!(hello.kind, ProtocolKind::Call);
    assert_eq!(hello.domain, ProtocolDomain::Runtime);
    assert_eq!(hello.method, "hello");
    assert_eq!(hello.source, ProtocolRole::Host);
    assert_eq!(hello.target, ProtocolRole::Service);

    let ready = message(
        ProtocolKind::Control,
        ProtocolDomain::Runtime,
        "ready",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "protocolVersion": 1 }),
        None,
    );
    let events = host.receive_frame(frame(vec![ready]), 1_010);
    assert!(host.is_ready());
    assert!(matches!(events.as_slice(), [BridgeEvent::Ready { .. }]));
}

#[test]
fn call_reply_resolves_the_pending_call() {
    let mut host =
        BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Service, Value::Null, None);
    let call_id = host
        .call(
            ProtocolDomain::Page,
            "navigateTo",
            json!({ "url": "/pages/a" }),
            None,
            2_000,
        )
        .expect("call queued");
    let frames = host.take_outbound_frames();
    assert_eq!(host.pending_call_count(), 1);
    assert_eq!(frames[0].messages[0].message_id, call_id);

    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Page,
        "navigateTo",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": true, "result": { "pageId": "page-2" } }),
        Some(&call_id),
    );
    let events = host.receive_frame(frame(vec![reply]), 2_010);
    assert_eq!(host.pending_call_count(), 0);
    assert!(matches!(
        events.as_slice(),
        [BridgeEvent::Reply { result, .. }] if result["pageId"] == "page-2"
    ));
}

#[test]
fn failed_reply_is_reported() {
    let mut host =
        BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Service, Value::Null, None);
    let call_id = host
        .control(ProtocolDomain::Runtime, "bootstrap", json!({}), None, 3_000)
        .expect("control queued");
    let _ = host.take_outbound_frames();
    let reply = message(
        ProtocolKind::Reply,
        ProtocolDomain::Runtime,
        "bootstrap",
        ProtocolRole::Service,
        ProtocolRole::Host,
        json!({ "ok": false, "error": { "code": "HANDLER_ERROR", "message": "boom" } }),
        Some(&call_id),
    );
    let events = host.receive_frame(frame(vec![reply]), 3_010);
    assert!(matches!(
        events.as_slice(),
        [BridgeEvent::CallFailed { code, message, .. }]
            if code == "HANDLER_ERROR" && message == "boom"
    ));
}

#[test]
fn inbound_call_can_be_replied() {
    let mut host =
        BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Render, Value::Null, None);
    let call = message(
        ProtocolKind::Call,
        ProtocolDomain::Canvas,
        "measure",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({ "selector": ".chart" }),
        None,
    );
    let events = host.receive_frame(frame(vec![call]), 4_000);
    let BridgeEvent::Call(request) = &events[0] else {
        panic!("expected a call event");
    };
    host.reply(
        request,
        Some(json!({ "width": 300, "height": 150 })),
        None,
        4_010,
    )
    .expect("reply queued");
    let frames = host.take_outbound_frames();
    let reply = &frames[0].messages[0];
    assert_eq!(reply.kind, ProtocolKind::Reply);
    assert_eq!(reply.reply_to.as_deref(), Some("msg-test-measure"));
    assert_eq!(reply.payload.as_ref().unwrap()["ok"], true);
}

#[test]
fn expire_returns_timed_out_calls_once() {
    let mut host = BridgeConnection::new(
        ProtocolRole::Host,
        ProtocolRole::Service,
        Value::Null,
        Some(100),
    );
    let call_id = host
        .call(
            ProtocolDomain::Page,
            "navigateTo",
            json!({ "url": "/pages/a" }),
            None,
            5_000,
        )
        .expect("call queued");
    let _ = host.take_outbound_frames();
    assert!(host.expire(5_050).is_empty());
    let events = host.expire(5_200);
    assert!(matches!(
        events.as_slice(),
        [BridgeEvent::Timeout { message_id, .. }] if message_id == &call_id
    ));
    assert_eq!(host.pending_call_count(), 0);
    assert!(host.expire(5_300).is_empty());
}

#[test]
fn rejects_messages_for_another_role() {
    let mut host =
        BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Service, Value::Null, None);
    let wrong = message(
        ProtocolKind::Event,
        ProtocolDomain::Page,
        "scroll",
        ProtocolRole::Render,
        ProtocolRole::Host,
        json!({}),
        None,
    );
    let events = host.receive_frame(frame(vec![wrong]), 6_000);
    assert!(matches!(
        events.as_slice(),
        [BridgeEvent::Error(BridgeError::InvalidEnvelope { .. })]
    ));
}

#[test]
fn events_are_queued_as_frames() {
    let mut host =
        BridgeConnection::new(ProtocolRole::Host, ProtocolRole::Service, Value::Null, None);
    host.send_event(
        ProtocolDomain::Tree,
        "event",
        json!({ "name": "tap" }),
        Some("page-1".to_string()),
        7_000,
    )
    .expect("event queued");
    let frames = host.take_outbound_frames();
    let event = &frames[0].messages[0];
    assert_eq!(event.kind, ProtocolKind::Event);
    assert_eq!(event.domain, ProtocolDomain::Tree);
    assert_eq!(event.page_id.as_deref(), Some("page-1"));
}

#[test]
fn decodes_a_frame_generated_by_the_javascript_bridge() {
    let raw = include_str!("fixtures/js-bridge-handshake.json");
    let frame = tiny_host_core::decode_frame(raw).expect("JS frame should decode");
    assert_eq!(frame.messages.len(), 3);
    assert_eq!(frame.messages[0].method, "hello");
    assert_eq!(frame.messages[1].kind, ProtocolKind::Control);
    assert_eq!(frame.messages[2].kind, ProtocolKind::Reply);
    assert_eq!(
        frame.messages[2].reply_to.as_deref(),
        Some(frame.messages[0].message_id.as_str())
    );
}
