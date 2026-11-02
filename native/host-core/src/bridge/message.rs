use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::error::{BridgeError, BridgeResult};
use super::frame::PROTOCOL_VERSION;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProtocolRole {
    Host,
    Service,
    Render,
    Devtool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProtocolKind {
    Call,
    Reply,
    Event,
    Control,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProtocolDomain {
    Runtime,
    Page,
    Data,
    Event,
    Api,
    Diagnostic,
    Canvas,
    Query,
    Tree,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProtocolMessage {
    pub protocol_version: u32,
    pub message_id: String,
    pub kind: ProtocolKind,
    pub domain: ProtocolDomain,
    pub method: String,
    pub source: ProtocolRole,
    pub target: ProtocolRole,
    #[serde(default)]
    pub payload: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reply_to: Option<String>,
    pub timestamp: i64,
}

impl ProtocolMessage {
    pub fn validate(&self) -> BridgeResult<()> {
        if self.protocol_version != PROTOCOL_VERSION {
            return Err(BridgeError::ProtocolVersionMismatch {
                message: format!(
                    "Expected protocol version {} , received {}",
                    PROTOCOL_VERSION, self.protocol_version
                ),
            });
        }
        if self.message_id.trim().is_empty() {
            return Err(BridgeError::invalid("messageId must be a non-empty string"));
        }
        if self.method.trim().is_empty() {
            return Err(BridgeError::invalid("method must be a non-empty string"));
        }
        if self.payload.is_none() {
            return Err(BridgeError::payload("payload is required"));
        }
        if self
            .page_id
            .as_ref()
            .is_some_and(|value| value.trim().is_empty())
        {
            return Err(BridgeError::invalid(
                "pageId must be a non-empty string when present",
            ));
        }
        if self
            .reply_to
            .as_ref()
            .is_some_and(|value| value.trim().is_empty())
        {
            return Err(BridgeError::invalid(
                "replyTo must be a non-empty string when present",
            ));
        }
        if self.kind == ProtocolKind::Reply && self.reply_to.is_none() {
            return Err(BridgeError::invalid("reply messages require replyTo"));
        }
        Ok(())
    }
}
