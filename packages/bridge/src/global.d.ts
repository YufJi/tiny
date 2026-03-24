declare type NativeCallParams = Record<string, any>;

interface NativeBridge {
  call(requestId: number, method: string, params?: NativeCallParams): any;
}

declare const native: NativeBridge;
