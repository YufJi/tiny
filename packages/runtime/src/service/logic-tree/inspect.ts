/** Host-neutral element-tree projection used by the debugger. */
export type InspectNode = {
  id: string
  type: 'component' | 'element' | 'text'
  tag: string
  text?: string
  attributes?: Record<string, string>
  className?: string
  style?: string
  children: InspectNode[]
}
