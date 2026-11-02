//! Platform-neutral host core for the Tiny mini-program engine.
//!
//! The crate must stay free of WebKit, UIKit, JSCore, Android and browser
//! dependencies. Platform adapters execute the actions emitted here and feed
//! events back in. See `docs/adr/0009-rust-host-core.md`.

pub mod bridge;
pub mod host;

pub use bridge::{
    decode_frame, encode_frame, now_ms, BridgeConnection, BridgeError, BridgeEvent, ProtocolDomain,
    ProtocolKind, ProtocolMessage, ProtocolRole, TransportFrame, PROTOCOL_VERSION,
};
pub use host::{HostAction, HostConfig, HostCore, HostEvent, PageDescriptor};
