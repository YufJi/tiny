import React from 'react';
import ElementTree from './ElementTree';
import './DebugPanel.css';

// Right-bottom panel: structured diagnostics and the projected element tree.
function DebugPanel({ activeTab, onTabChange, diagnostics, tree }) {
  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;
  const warningCount = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length;

  return (
    <section className="td-debug">
      <div className="td-debug-head">
        <div className="td-tabs" role="tablist" aria-label="Debug output">
          <button
            type="button"
            role="tab"
            id="td-console-tab"
            aria-controls="td-console-panel"
            aria-selected={activeTab === 'console'}
            className={activeTab === 'console' ? 'td-tab td-tab--active' : 'td-tab'}
            onClick={() => onTabChange('console')}
          >
            Console
            <span className="td-count">{diagnostics.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            id="td-elements-tab"
            aria-controls="td-elements-panel"
            aria-selected={activeTab === 'elements'}
            className={activeTab === 'elements' ? 'td-tab td-tab--active' : 'td-tab'}
            onClick={() => onTabChange('elements')}
          >
            Elements
          </button>
        </div>
        <div className="td-debug-summary">
          {errorCount > 0 ? (
            <span className="td-sev td-sev--error">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'}
            </span>
          ) : null}
          {warningCount > 0 ? (
            <span className="td-sev td-sev--warning">
              {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
            </span>
          ) : null}
        </div>
      </div>

      {activeTab === 'console' ? (
        <div
          className="td-debug-body td-scroll"
          id="td-console-panel"
          role="tabpanel"
          aria-labelledby="td-console-tab"
        >
          {diagnostics.length === 0 ? (
            <div className="td-empty-state">
              <div className="td-empty-glyph">⌁</div>
              <div className="td-empty-title">No diagnostics yet</div>
              <div className="td-empty-hint">
                Runtime logs, state changes and compiler diagnostics will show up here.
              </div>
            </div>
          ) : diagnostics.slice(-80).reverse().map((diagnostic, index) => (
            <div
              key={`${diagnostic.timestamp}-${index}`}
              className={`td-diagnostic td-diagnostic--${diagnostic.severity}`}
            >
              <span className="td-diagnostic-rail" />
              <div className="td-diagnostic-body">
                <div className="td-diagnostic-meta">
                  <span className="td-diagnostic-severity">{diagnostic.severity}</span>
                  <code className="td-diagnostic-code">{diagnostic.code}</code>
                </div>
                <div className="td-diagnostic-message">{diagnostic.message}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="td-debug-body td-scroll"
          id="td-elements-panel"
          role="tabpanel"
          aria-labelledby="td-elements-tab"
        >
          {tree ? (
            <div className="td-tree">
              <ElementTree node={tree} />
            </div>
          ) : (
            <div className="td-empty-state">
              <div className="td-empty-glyph">◇</div>
              <div className="td-empty-title">No element tree</div>
              <div className="td-empty-hint">
                Launch or inspect the app to project its page tree.
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default DebugPanel;
