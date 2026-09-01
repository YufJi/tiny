# 0003 - Devtool runtime protocol

## Status

Accepted

## Context

The current debugger reaches directly into iframe globals, invokes `executeJavaScript`, passes string-encoded JSON through `JSBridge.subscribeHandler`, and lets React handlers own navigation and lifecycle behavior. That model is coupled to the legacy runtime and makes protocol evolution, diagnostics, and native transport substitution difficult.

## Decision

- Devtool is a host adapter, not the owner of a private runtime protocol. It implements a `HostTransport` and reuses Tiny bridge envelope and command semantics.
- Messages use versioned JSON envelopes:

```ts
type ProtocolMessage = {
  protocolVersion: 1
  messageId: string
  kind: 'call' | 'reply' | 'event' | 'control'
  domain: 'runtime' | 'page' | 'data' | 'event' | 'api' | 'diagnostic'
  method: string
  payload: unknown
  pageId?: string
  timestamp: number
}
```

- The host establishes explicit transports between host, service, and render frames with `postMessage` or `MessageChannel`. New code must not call iframe globals such as `JSBridgeInstance`, `JSBridge.subscribeHandler`, or `executeJavaScript`.
- First-version domains are `runtime`, `page`, `data`, `event`, `api`, and `diagnostic`.
- Devtool control methods include `launch`, `foreground`, `background`, `navigate`, `back`, `reload`, and `terminate`.
- Devtool receives structured diagnostics for logs, page stack, current page path, compiler diagnostics, unsupported capabilities, and transport errors.
- Artifact reload is an explicit `control.reload`. The first implementation bootstraps from the current compiler manifest; HMR is not required.
- React components access runtime only through `DevtoolRuntimeClient` APIs and event subscriptions. Redux stores projections of runtime state; it does not send protocol messages directly.
- The new glass-easel runtime does not need compatibility with the legacy `JSBridge` contract. Legacy devtool bridge code remains reference-only and must not be imported by the new runtime path.

## Alternatives

- Keeping `executeJavaScript` and direct iframe globals would preserve the old debugger but make the same runtime difficult to host natively or test.
- Letting devtool define a separate protocol would duplicate bridge semantics and increase the chance that runtime behavior differs between host environments.
- Using Redux actions as the protocol boundary would couple UI state management to transport and lifecycle semantics.

## Consequences

Devtool and runtime communicate through one versioned, inspectable boundary. The exact message schema, error behavior, and per-domain methods still need to be defined by the bridge transport decision before implementation.
