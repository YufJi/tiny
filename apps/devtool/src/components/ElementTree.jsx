import React from 'react';

function ElementTree({ node, depth = 0 }) {
  if (node.type === 'text') {
    return <div className="td-tree-text">&quot;{node.text}&quot;</div>;
  }
  const meta = [node.className, node.attributes ? JSON.stringify(node.attributes) : '']
    .filter(Boolean)
    .join(' ');
  return (
    <details className="td-tree-node" open={depth < 2}>
      <summary>
        <code className={node.type === 'component' ? 'td-tree-tag td-tree-tag--component' : 'td-tree-tag'}>
          {node.tag}
        </code>
        {meta ? <span className="td-tree-meta">{meta}</span> : null}
      </summary>
      <div className="td-tree-children">
        {node.children.map((child) => <ElementTree key={child.id} node={child} depth={depth + 1} />)}
      </div>
    </details>
  );
}

export default ElementTree;
