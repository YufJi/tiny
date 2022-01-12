export type ResolveId = number | string;
export type WebviewId = number | string | WebviewIds;
export type WebviewIds = Array<number | string>;

export interface JSCORE {
  call: (method: string, params: any, webviewIds: WebviewIds, resolveId: ResolveId) => any;
  publish: (method: string, params: any, webviewIds: WebviewIds, isService: boolean) => void;
  setTimer: (type: string, id: number | string, delay: number) => void;
  clearTimer: (type: string, id: number | string) => void;
}

export enum EventPrefix {
  CUSTOM = 'custom_event_',
  NATIVE = 'native_event_'
}
