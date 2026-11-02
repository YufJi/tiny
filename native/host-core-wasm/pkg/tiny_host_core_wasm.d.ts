/* tslint:disable */
/* eslint-disable */

export class WasmHostCore {
    free(): void;
    [Symbol.dispose](): void;
    diagnostics_json(): string;
    handle_event(event_json: string, now_ms: number): string;
    constructor(config_json: string);
    page_stack_json(): string;
    set_app_visible(visible: boolean): string;
    start(now_ms: number): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmhostcore_free: (a: number, b: number) => void;
    readonly wasmhostcore_diagnostics_json: (a: number) => [number, number];
    readonly wasmhostcore_handle_event: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly wasmhostcore_new: (a: number, b: number) => [number, number, number];
    readonly wasmhostcore_page_stack_json: (a: number) => [number, number];
    readonly wasmhostcore_set_app_visible: (a: number, b: number) => [number, number, number, number];
    readonly wasmhostcore_start: (a: number, b: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
