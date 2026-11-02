mod error;
mod frame;
mod message;

pub use error::{BridgeError, BridgeResult};
pub use frame::{decode_frame, encode_frame, TransportFrame, PROTOCOL_VERSION};
pub use message::{ProtocolDomain, ProtocolKind, ProtocolMessage, ProtocolRole};
