/** WeChat's `text` replaces spaces with a fixed-width space before decoding. */
const SPACE_CHARACTERS: Record<string, string> = {
  nbsp: '\u00A0',
  ensp: '\u2002',
  emsp: '\u2003',
}

export type TextContentOptions = {
  space?: unknown
  decode?: unknown
}

/**
 * WeChat's `text` semantics: `space` replaces every ASCII space with the
 * selected fixed-width space, then `decode` expands the HTML entities it
 * supports. Line breaks are handled separately by the renderer (`\n`→`<br>`).
 */
export function transformTextContent(text: string, options: TextContentOptions): string {
  let value = text
  const space = SPACE_CHARACTERS[String(options.space ?? '')]
  if (space) value = value.replace(/ /g, space)
  if (options.decode) {
    value = value
      .replace(/&nbsp;/g, ' ')
      .replace(/&ensp;/g, '\u2002')
      .replace(/&emsp;/g, '\u2003')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
  }
  return value
}
