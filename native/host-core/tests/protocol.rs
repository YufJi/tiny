use serde_json::{json, Value};
use tiny_host_core::{
    decode_frame, encode_frame, BridgeError, ProtocolDomain, ProtocolKind, ProtocolMessage,
    ProtocolRole, TransportFrame, PROTOCOL_VERSION,
};

fn message(kind: ProtocolKind, method: &str) -> ProtocolMessage {
    ProtocolMessage {
        protocol_version: PROTOCOL_VERSION,
        message_id: "msg-test-1".to_string(),
        kind,
        domain: ProtocolDomain::Runtime,
        method: method.to_string(),
        source: ProtocolRole::Host,
        target: ProtocolRole::Service,
        payload: Some(json!({ "protocolVersion": 1 })),
        page_id: None,
        reply_to: None,
        timestamp: 1_700_000_000_000,
    }
}

#[test]
fn encodes_the_existing_bridge_envelope_shape() {
    let frame = TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages: vec![message(ProtocolKind::Call, "hello")],
    };
    let encoded = encode_frame(&frame).expect("frame should encode");
    let value: Value = serde_json::from_str(&encoded).expect("valid json");
    assert_eq!(value["protocolVersion"], 1);
    assert_eq!(value["messages"][0]["kind"], "call");
    assert_eq!(value["messages"][0]["source"], "host");
    assert_eq!(value["messages"][0]["target"], "service");
    assert_eq!(value["messages"][0]["payload"]["protocolVersion"], 1);
}

#[test]
fn round_trips_a_frame() {
    let frame = TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages: vec![message(ProtocolKind::Call, "hello")],
    };
    let encoded = encode_frame(&frame).expect("encode");
    let decoded = decode_frame(&encoded).expect("decode");
    assert_eq!(frame, decoded);
}

#[test]
fn rejects_an_empty_frame() {
    let frame = TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages: vec![],
    };
    let error =
        decode_frame(&serde_json::to_string(&frame).expect("json")).expect_err("empty frame");
    assert!(matches!(error, BridgeError::InvalidEnvelope { .. }));
}

#[test]
fn rejects_replies_without_reply_to() {
    let mut reply = message(ProtocolKind::Reply, "ready");
    reply.reply_to = None;
    let frame = TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages: vec![reply],
    };
    let error = frame.validate().expect_err("reply requires replyTo");
    assert!(matches!(error, BridgeError::InvalidEnvelope { .. }));
}

#[test]
fn rejects_protocol_version_mismatch() {
    let mut hello = message(ProtocolKind::Call, "hello");
    hello.protocol_version = 2;
    let frame = TransportFrame {
        protocol_version: PROTOCOL_VERSION,
        messages: vec![hello],
    };
    let error = frame.validate().expect_err("version mismatch");
    assert!(matches!(error, BridgeError::ProtocolVersionMismatch { .. }));
}

#[test]
fn rejects_missing_payload() {
    let mut hello = message(ProtocolKind::Event, "flow");
    hello.payload = None;
    let error = hello.validate().expect_err("payload required");
    assert!(matches!(error, BridgeError::InvalidPayload { .. }));
}
