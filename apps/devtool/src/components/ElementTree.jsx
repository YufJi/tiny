import React from 'react';

/** Depth kept expanded on the first render; the rest is one click away. */
const OPEN_DEPTH = 3;
const ATTRIBUTE_VALUE_LIMIT = 48;

function formatAttribute(name, value) {
  const text = String(value);
  return `${name}="${text.length > ATTRIBUTE_VALUE_LIMIT ? `${text.slice(0, ATTRIBUTE_VALUE_LIMIT)}…` : text}"`;
}

function nodeMeta(node) {
  const attributes = node.attributes
    ? Object.entries(node.attributes).map(([name, value]) => formatAttribute(name, value)).join(' ')
    : '';
  const style = node.style ? formatAttribute('style', node.style) : '';
  return [node.className, attributes, style].filter(Boolean).join(' ');
}

// One glass component (or a text leaf) of the page component tree. Kept open
// state is local so runtime state updates do not collapse what the user opened.
function ElementTree({ node, depth = 0 }) {
  const [open, setOpen] = React.useState(depth < OPEN_DEPTH);

  if (node.type === 'text') {
    const text = (node.text || '').trim();
    return text ? <div className="td-tree-text">&quot;{text}&quot;</div> : null;
  }

  const meta = nodeMeta(node);
  const hasChildren = node.children.length > 0;
  return (
    <details
      className={hasChildren ? 'td-tree-node' : 'td-tree-node td-tree-node--leaf'}
      open={hasChildren ? open : undefined}
      onToggle={hasChildren ? (event) => setOpen(event.currentTarget.open) : undefined}
    >
      <summary>
        <code className="td-tree-tag td-tree-tag--component">{node.tag}</code>
        {meta ? <span className="td-tree-meta" title={meta}>{meta}</span> : null}
      </summary>
      {hasChildren ? (
        <div className="td-tree-children">
          {/* Render-side text nodes carry no node id, so the index keeps keys unique. */}
          {node.children.map((child, index) => (
            <ElementTree key={`${child.id}:${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </details>
  );
}

export default ElementTree;
