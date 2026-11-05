import type * as glassEasel from 'glass-easel'

export type HoverTimer = ReturnType<typeof setTimeout>

export type HostEvent = glassEasel.ShadowedEvent<unknown>

export type HostListenable = {
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
}

export type HostClassElement = {
  classList?: {
    add?: (name: string) => void
    remove?: (name: string) => void
    contains?: (name: string) => boolean
    toggle?: (name: string, force?: boolean) => boolean
  }
  setAttribute?: (name: string, value: string) => void
  removeAttribute?: (name: string) => void
}

export type TouchTrackEvent = {
  target: unknown
  currentTarget: unknown
  preventDefault: () => void
  stopPropagation: () => void
  touches: unknown[]
  changedTouches: unknown[]
  detail: {
    state: 'start' | 'move' | 'end' | 'cancel'
    x: number
    y: number
    dx: number
    dy: number
    ddx: number
    ddy: number
    timeStamp: number
  }
}

export type HoverRuntime = {
  _hoverStartTimer?: HoverTimer
  _hoverStayTimer?: HoverTimer
  _hoverStyleTimeId?: HoverTimer
  _hoverStayTimeId?: HoverTimer
  _hostListeners?: Array<{ name: string; listener: (event: HostEvent) => void }>
  _hoverListeners?: Array<{ name: string; listener: (event: HostEvent) => void }>
  _hoverBound?: boolean
  _hovering?: boolean
  _hoverTouch?: boolean
  _defaultHoverClass?: string
  _hoverClass?: string[]
  _hoverClasses?: string[]
  __debouncers?: Record<string, HoverTimer | undefined>
  data: Record<string, unknown>
  setData: (data: Record<string, unknown>) => void
  classList?: { toggle(name: string, force?: boolean): boolean } | null
  getBackendElement?: () => HostClassElement | null
  parentNode?: unknown
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
}

export type AriaRuntime = {
  _ariaRoleDefault?: string
  _ariaRoleApplied?: boolean
  getBackendElement?: () => HostClassElement | null
}

export type ReloadState = Record<string, unknown> & {
  _compVarList?: string[]
  wxComponents?: Record<string, unknown> & { _custom?: Record<string, unknown> }
}

export type LabelAriaRuntime = {
  data: Record<string, unknown>
  is?: string
  getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
  setAriaRoleDefault?: (role: string) => void
  hasBehavior?: (name: string) => boolean
  _relatedLabel?: LabelAriaRuntime
}

export type LabelTargetRuntime = {
  _labelTapListener?: (event: HostEvent) => void
  addListener?: (name: string, listener: (event: HostEvent) => void) => void
  removeListener?: (name: string, listener: (event: HostEvent) => void) => void
  handleLabelTap?: (event: HostEvent) => void
}

/** The group surface an item reports to (implemented by checkbox/radio group). */
export type GroupHandler = {
  addItem?: (item: unknown) => void
  removeItem?: (item: unknown) => void
  renameItem?: (item: unknown, next: string, previous: string) => void
  changed?: (item: unknown) => void
  changedByTap?: () => void
}

export type ItemRuntime = {
  _relatedGroup?: GroupHandler | null
  data: Record<string, unknown>
  setData: (data: Record<string, unknown>) => void
}
