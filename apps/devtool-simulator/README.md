# @tiny/devtool-simulator

Host-independent simulator UI and geometry for Tiny mini-programs.

- `device.ts` owns device profiles, safe areas, orientation and host chrome geometry.
- `styles.ts` resolves simulated safe-area CSS.
- `components/` owns the device shell and host chrome.
- `runtime-port.ts` defines the adapter boundary for Web iframes, Electron
  `WebContentsView`, or future native surfaces.

When consuming the built package, import the extracted stylesheet explicitly:

```ts
import '@tiny/devtool-simulator/styles.css'
```

The package must not import `@tiny/host-web`, Electron, or devtool app state.
Keep app registries, launchers, debugger panels and concrete runtime boot code
in the consuming application.
