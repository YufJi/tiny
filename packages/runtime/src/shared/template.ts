import type { WxsModuleTable } from '@tiny/wxs-runtime'

export type TemplateGroupList = Record<string, unknown>

export type TemplateRegistry = {
  groupList: TemplateGroupList
  content: (path: string, name?: string) => unknown
  wxsModules?: WxsModuleTable
}

export type StyleLoader = (path: string) => string
