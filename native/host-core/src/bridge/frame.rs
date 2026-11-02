use serde::{Deserialize, Serialize};

use super::error::{BridgeError, BridgeResult};
use super::message::ProtocolMessage;

pub const PROTOCOL_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TransportFrame {
    pub protocol_version: u32,
    pub messages: Vec<ProtocolMessage>,
}

impl TransportFrame {
    pub fn validate(&self) -> BridgeResult<()> {
        if self.protocol_version != PROTOCOL_VERSION {
            return Err(BridgeError::ProtocolVersionMismatch {
                message: format!(
                    "Expected transport protocol version {} , received {}",
                    PROTOCOL_VERSION, self.protocol_version
                ),
            });
        }
        if self.messages.is_empty() {
            return Err(BridgeError::invalid(
                "transport frame must contain a non-empty message array",
            ));
        }
        for message in &self.messages {
            message.validate()?;
        }
        Ok(())
    }
}

pub fn decode_frame(raw: &str) -> BridgeResult<TransportFrame> {
    let frame: TransportFrame =
        serde_json::from_str(raw).map_err(|error| BridgeError::Serialization {
            message: error.to_string(),
        })?;
    frame.validate()?;
    Ok(frame)
}

pub fn encode_frame(frame: &TransportFrame) -> BridgeResult<String> {
    frame.validate()?;
    serde_json::to_string(frame).map_err(|error| BridgeError::Serialization {
        message: error.to_string(),
    })
}
