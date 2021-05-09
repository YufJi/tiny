const g = self;

export default function gerror(e) {
  if (!e.message) {
    e = new Error(e);
  }
  if (g.onerror) {
    g.onerror(e.message, e.sourceURL, e.line, e.column, e);
  } else {
    console.error(e);
  }
}
