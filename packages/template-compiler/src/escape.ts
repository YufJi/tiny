export function escapeHtmlBody(s: string): string {
  return s.replace(/[<"&]/g, (match) => {
    switch (match) {
      case '<':
        return '&lt;';
      case '"':
        return '&quot;';
      case '&':
        return '&amp;';
      default:
        return match;
    }
  });
}

export function escapeHtmlQuote(s: string): string {
  return s.replace(/["&]/g, (match) => {
    switch (match) {
      case '"':
        return '&quot;';
      case '&':
        return '&amp;';
      default:
        return match;
    }
  });
}

export function genLitStr(s: string): string {
  return genLitStrWithQuotes(s, false);
}

export function genLitStrWithQuotes(s: string, useSingleQuote: boolean): string {
  const quoteChar = useSingleQuote ? "'" : '"';
  let result = quoteChar;

  for (const ch of s) {
    switch (ch) {
      case '\\':
        result += '\\\\';
        break;
      case '\n':
        result += '\\n';
        break;
      case '\r':
        result += '\\r';
        break;
      case '\t':
        result += '\\t';
        break;
      case '\0':
        result += '\\0';
        break;
      default:
        if (ch.charCodeAt(0) <= 31) {
          result += `\\x${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`;
        } else if (ch === quoteChar) {
          result += `\\${ch}`;
        } else {
          result += ch;
        }
    }
  }

  result += quoteChar;
  return result;
}

export function dashToCamel(s: string): string {
  let result = '';
  let nextUpper = false;

  for (const c of s) {
    if (c === '-') {
      nextUpper = true;
    } else if (nextUpper) {
      nextUpper = false;
      result += c.toUpperCase();
    } else {
      result += c;
    }
  }

  return result;
}

export function camelToDash(s: string): string {
  let result = '';

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= 'A' && c <= 'Z') {
      if (i > 0) {
        result += '-';
      }
      result += c.toLowerCase();
    } else {
      result += c;
    }
  }

  return result;
}
