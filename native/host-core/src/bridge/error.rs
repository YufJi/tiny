use thiserror::Error;

pub type BridgeResult<T> = Result<T, BridgeError>;

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum BridgeError {
    #[error("{message}")]
    InvalidEnvelope { message: String },
    #[error("{message}")]
    InvalidPayload { message: String },
    #[error("{message}")]
    ProtocolVersionMismatch { message: String },
    #[error("{message}")]
    Serialization { message: String },
}

impl BridgeError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::InvalidEnvelope { .. } => "INVALID_ENVELOPE",
            Self::InvalidPayload { .. } => "INVALID_PAYLOAD",
            Self::ProtocolVersionMismatch { .. } => "PROTOCOL_VERSION_MISMATCH",
            Self::Serialization { .. } => "INVALID_PAYLOAD",
        }
    }

    pub fn invalid(message: impl Into<String>) -> Self {
        Self::InvalidEnvelope {
            message: message.into(),
        }
    }

    pub fn payload(message: impl Into<String>) -> Self {
        Self::InvalidPayload {
            message: message.into(),
        }
    }
}
