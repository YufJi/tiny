use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::{json, Value};

use super::error::{BridgeError, BridgeResult};
use super::frame::{TransportFrame, PROTOCOL_VERSION};
use super::message::{ProtocolDomain, ProtocolKind, ProtocolMessage, ProtocolRole};

const DEFAULT_TIMEOUT_MS: u64 = 30_000;

static MESSAGE_SEQUENCE: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone, PartialEq)]
pub enum BridgeEvent {
    /// The peer answered the host's `runtime.hello` with `runtime.ready`.
    Ready {
        payload: Value,
    },
    /// An outbound call/control completed successfully.
    Reply {
        message_id: String,
        result: Value,
    },
    /// An outbound call/control returned a protocol error.
    CallFailed {
        message_id: String,
        code: String,
        message: String,
    },
    /// The peer sent a call/control that the host core must handle.
    Call(ProtocolMessage),
    Control(ProtocolMessage),
    /// The peer sent an event.
    Event(ProtocolMessage),
    /// An outbound call/control exceeded its deadline.
    Timeout {
        message_id: String,
        domain: ProtocolDomain,
        method: String,
    },
    /// A malformed frame/message or a protocol mismatch.
    Error(BridgeError),
}

#[derive(Debug, Clone)]
struct PendingCall {
    deadline_ms: u64,
    domain: ProtocolDomain,
    method: String,
}

/// Host-side state machine for the versioned Tiny Bridge protocol.
///
/// It owns message ids, pending calls and outbound frames. It never calls a
/// platform transport directly: the caller drains `take_outbound_frames()` and
/// feeds inbound frames through `receive_frame()`. This is the seam the iOS,
/// browser and future Android adapters share.
pub struct BridgeConnection {
    local_role: ProtocolRole,
    peer_role: ProtocolRole,
    default_timeout_ms: u64,
    capabilities: Value,
    pending_calls: HashMap<String, PendingCall>,
    outbox: Vec<TransportFrame>,
    handshake_started: bool,
    ready: bool,
}

impl BridgeConnection {
    pub fn new(
        local_role: ProtocolRole,
        peer_role: ProtocolRole,
        capabilities: Value,
        default_timeout_ms: Option<u64>,
    ) -> Self {
        Self {
            local_role,
            peer_role,
            default_timeout_ms: default_timeout_ms.unwrap_or(DEFAULT_TIMEOUT_MS),
            capabilities,
            pending_calls: HashMap::new(),
            outbox: Vec::new(),
            handshake_started: false,
            ready: false,
        }
    }

    pub fn local_role(&self) -> ProtocolRole {
        self.local_role
    }

    pub fn peer_role(&self) -> ProtocolRole {
        self.peer_role
    }

    pub fn is_ready(&self) -> bool {
        self.ready
    }

    pub fn pending_call_count(&self) -> usize {
        self.pending_calls.len()
    }

    /// Begin the host handshake. The returned message id can be used to
    /// correlate diagnostics; the actual completion arrives as
    /// `BridgeEvent::Ready`.
    pub fn handshake(&mut self, now_ms: u64) -> BridgeResult<String> {
        if self.local_role != ProtocolRole::Host {
            return Err(BridgeError::invalid(
                "only the host role can initiate a handshake",
            ));
        }
        if self.handshake_started {
            return Err(BridgeError::invalid("handshake already started"));
        }
        self.handshake_started = true;
        let payload = json!({
            "protocolVersion": PROTOCOL_VERSION,
            "role": self.local_role,
            "capabilities": self.capabilities,
        });
        self.request(
            ProtocolKind::Call,
            ProtocolDomain::Runtime,
            "hello",
            payload,
            None,
            self.default_timeout_ms,
            now_ms,
        )
    }

    pub fn call(
        &mut self,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        page_id: Option<String>,
        now_ms: u64,
    ) -> BridgeResult<String> {
        self.request(
            ProtocolKind::Call,
            domain,
            method,
            payload,
            page_id,
            self.default_timeout_ms,
            now_ms,
        )
    }

    pub fn control(
        &mut self,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        page_id: Option<String>,
        now_ms: u64,
    ) -> BridgeResult<String> {
        self.request(
            ProtocolKind::Control,
            domain,
            method,
            payload,
            page_id,
            self.default_timeout_ms,
            now_ms,
        )
    }

    pub fn send_event(
        &mut self,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        page_id: Option<String>,
        now_ms: u64,
    ) -> BridgeResult<String> {
        let message = self.message(
            ProtocolKind::Event,
            domain,
            method,
            payload,
            page_id,
            None,
            now_ms,
        )?;
        let id = message.message_id.clone();
        self.send_messages(vec![message]);
        Ok(id)
    }

    pub fn send_diagnostic(
        &mut self,
        level: &str,
        payload: Value,
        page_id: Option<String>,
        now_ms: u64,
    ) -> BridgeResult<String> {
        self.send_event(
            ProtocolDomain::Diagnostic,
            &format!("diagnostic.{level}"),
            payload,
            page_id,
            now_ms,
        )
    }

    pub fn reply(
        &mut self,
        request: &ProtocolMessage,
        result: Option<Value>,
        error: Option<(String, String)>,
        now_ms: u64,
    ) -> BridgeResult<String> {
        let payload = match (result, error) {
            (_, Some((code, message))) => json!({
                "ok": false,
                "error": { "code": code, "message": message },
            }),
            (result, None) => json!({
                "ok": true,
                "result": result.unwrap_or(Value::Null),
            }),
        };
        let reply = self.message(
            ProtocolKind::Reply,
            request.domain,
            &request.method,
            payload,
            request.page_id.clone(),
            Some(request.message_id.clone()),
            now_ms,
        )?;
        let id = reply.message_id.clone();
        self.send_messages(vec![reply]);
        Ok(id)
    }

    pub fn receive_frame(&mut self, frame: TransportFrame, now_ms: u64) -> Vec<BridgeEvent> {
        let mut events = Vec::new();
        if let Err(error) = frame.validate() {
            events.push(BridgeEvent::Error(error));
            return events;
        }
        for message in frame.messages {
            match self.receive_message(message, now_ms) {
                Ok(mut next) => events.append(&mut next),
                Err(error) => events.push(BridgeEvent::Error(error)),
            }
        }
        events
    }

    /// Resolve pending calls whose deadlines have passed. HostCore maps these
    /// events to diagnostics and aborts the corresponding navigation/API work.
    pub fn expire(&mut self, now_ms: u64) -> Vec<BridgeEvent> {
        let expired: Vec<String> = self
            .pending_calls
            .iter()
            .filter(|(_, call)| call.deadline_ms <= now_ms)
            .map(|(id, _)| id.clone())
            .collect();
        let mut events = Vec::new();
        for id in expired {
            if let Some(call) = self.pending_calls.remove(&id) {
                events.push(BridgeEvent::Timeout {
                    message_id: id,
                    domain: call.domain,
                    method: call.method,
                });
            }
        }
        events
    }

    pub fn take_outbound_frames(&mut self) -> Vec<TransportFrame> {
        std::mem::take(&mut self.outbox)
    }

    pub fn close(&mut self) {
        self.outbox.clear();
        self.pending_calls.clear();
        self.ready = false;
    }

    fn receive_message(
        &mut self,
        message: ProtocolMessage,
        _now_ms: u64,
    ) -> BridgeResult<Vec<BridgeEvent>> {
        if message.validate().is_err() {
            return Err(BridgeError::invalid("invalid protocol message"));
        }
        if message.target != self.local_role || message.source != self.peer_role {
            return Err(BridgeError::invalid(
                "message source or target does not match the connection",
            ));
        }

        if message.kind == ProtocolKind::Reply {
            return Ok(vec![self.resolve_reply(message)?]);
        }

        // The JS peer sends `runtime.ready` as a control; accept an event as
        // well so adapters that model the handshake as an event remain valid.
        if message.domain == ProtocolDomain::Runtime
            && message.method == "ready"
            && matches!(message.kind, ProtocolKind::Control | ProtocolKind::Event)
        {
            self.ready = true;
            return Ok(vec![BridgeEvent::Ready {
                payload: message.payload.unwrap_or(Value::Null),
            }]);
        }

        if message.kind == ProtocolKind::Event {
            return Ok(vec![BridgeEvent::Event(message)]);
        }

        Ok(vec![match message.kind {
            ProtocolKind::Call => BridgeEvent::Call(message),
            ProtocolKind::Control => BridgeEvent::Control(message),
            ProtocolKind::Event | ProtocolKind::Reply => unreachable!(),
        }])
    }

    fn resolve_reply(&mut self, message: ProtocolMessage) -> BridgeResult<BridgeEvent> {
        let reply_to = message
            .reply_to
            .clone()
            .ok_or_else(|| BridgeError::invalid("reply is missing replyTo"))?;
        if self.pending_calls.remove(&reply_to).is_none() {
            return Err(BridgeError::invalid(format!(
                "reply targets an unknown call: {reply_to}"
            )));
        }
        let payload = message.payload.unwrap_or(Value::Null);
        let object = payload
            .as_object()
            .ok_or_else(|| BridgeError::payload("reply payload must be an object"))?;
        match object.get("ok").and_then(Value::as_bool) {
            Some(true) => Ok(BridgeEvent::Reply {
                message_id: reply_to,
                result: object.get("result").cloned().unwrap_or(Value::Null),
            }),
            Some(false) => {
                let error = object
                    .get("error")
                    .and_then(Value::as_object)
                    .ok_or_else(|| BridgeError::payload("failed reply is missing error"))?;
                let code = error
                    .get("code")
                    .and_then(Value::as_str)
                    .unwrap_or("HANDLER_ERROR")
                    .to_string();
                let text = error
                    .get("message")
                    .and_then(Value::as_str)
                    .unwrap_or("unknown error")
                    .to_string();
                Ok(BridgeEvent::CallFailed {
                    message_id: reply_to,
                    code,
                    message: text,
                })
            }
            None => Err(BridgeError::payload("reply payload is missing the ok flag")),
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn request(
        &mut self,
        kind: ProtocolKind,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        page_id: Option<String>,
        timeout_ms: u64,
        now_ms: u64,
    ) -> BridgeResult<String> {
        let message = self.message(kind, domain, method, payload, page_id, None, now_ms)?;
        let message_id = message.message_id.clone();
        self.pending_calls.insert(
            message_id.clone(),
            PendingCall {
                deadline_ms: now_ms.saturating_add(timeout_ms),
                domain,
                method: method.to_string(),
            },
        );
        self.send_messages(vec![message]);
        Ok(message_id)
    }

    #[allow(clippy::too_many_arguments)]
    fn message(
        &self,
        kind: ProtocolKind,
        domain: ProtocolDomain,
        method: &str,
        payload: Value,
        page_id: Option<String>,
        reply_to: Option<String>,
        now_ms: u64,
    ) -> BridgeResult<ProtocolMessage> {
        let message = ProtocolMessage {
            protocol_version: PROTOCOL_VERSION,
            message_id: next_message_id(now_ms),
            kind,
            domain,
            method: method.to_string(),
            source: self.local_role,
            target: self.peer_role,
            payload: Some(payload),
            page_id,
            reply_to,
            timestamp: now_ms as i64,
        };
        message.validate()?;
        Ok(message)
    }

    fn send_messages(&mut self, messages: Vec<ProtocolMessage>) {
        self.outbox.push(TransportFrame {
            protocol_version: PROTOCOL_VERSION,
            messages,
        });
    }
}

fn next_message_id(now_ms: u64) -> String {
    let sequence = MESSAGE_SEQUENCE.fetch_add(1, Ordering::Relaxed) + 1;
    format!("msg-{now_ms}-{sequence}")
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}
