# Vant Weapp example

Test fixture derived from
[didi/dimina `examples/miniprogram/vant`](https://github.com/didi/dimina/tree/main/examples/miniprogram/vant)
(Apache-2.0), which mirrors the official
[@vant/weapp](https://github.com/youzan/vant-weapp) example project (MIT).

## Scope

- `pages/` and `components/` are the Vant Weapp demo pages.
- `miniprogram_npm/@vant/weapp/` is the pre-built Vant component package, kept
  verbatim so `usingComponents: "@vant/weapp/button/index"` proves the
  compiler's `miniprogram_npm` resolution path.
- `functions/` is a cloud-function sample kept for source fidelity; the runtime
  gate does not invoke it.

## Adaptations for Tiny

None: the example compiles as-is. The compiler resolves bare npm-style
`usingComponents` entries through `miniprogram_npm/`, and the service thread
provides the `wx` API surface Vant needs (`getSystemInfoSync().SDKVersion`,
`Behavior`, `this.createSelectorQuery`, `groupSetData`, ...).

## Licenses

- Example sources: Apache-2.0, see the `didi/dimina` repository.
- `miniprogram_npm/@vant/weapp`: MIT, see [LICENSE](./LICENSE).
