import { startTinyService, type TinyIOSApp } from './start'

type HostGlobal = {
  __TINY_IOS_APP__?: TinyIOSApp
  __tinyError?: (message: string) => void
}

const host = globalThis as unknown as HostGlobal

if (!host.__TINY_IOS_APP__) {
  host.__tinyError?.('iOS service engine started without __TINY_IOS_APP__')
} else {
  startTinyService(host.__TINY_IOS_APP__)
}
