import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DevtoolRuntimeClient } from '@tiny/runtime';

const STATUS_COLORS = {
  idle: '#94a3b8',
  connecting: '#fbbf24',
  running: '#34d399',
  terminated: '#94a3b8',
  error: '#f87171',
};

const SEVERITY_COLORS = {
  error: '#f87171',
  warning: '#fbbf24',
  info: '#93c5fd',
  state: '#a78bfa',
};

class RuntimePanel extends PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.client = null;
    this.unsubscribe = null;
    this.state = {
      navPath: '',
      manifestPath: '',
    };
  }

  async componentDidMount() {
    const manifest = await fetch('/runtime/generated/manifest.json').then((response) => response.json());
    const initialPath = new URLSearchParams(window.location.search).get('path') || manifest.pages[0].path;
    this.setState({ navPath: initialPath, manifestPath: manifest.pages[0].path });
    this.client = new DevtoolRuntimeClient({
      manifest,
      serviceUrl: '/next-service.html',
      renderUrl: '/next-render.html',
      initialPath,
      container: this.containerRef.current,
      systemInfo: {
        pixelRatio: window.devicePixelRatio,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      },
    });
    this.unsubscribe = this.client.subscribe((state) => {
      this.props.setRuntimeState(state);
    });
    window.__tinyDevtool = this.client;
    this.run(() => this.client.launch());
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.client) this.client.terminate().catch(() => {});
  }

  run(action) {
    Promise.resolve()
      .then(action)
      .catch((error) => console.error('[devtool-runtime]', error));
  }

  renderStatus() {
    const { status, currentPage, error } = this.props.runtime;
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 5,
          background: STATUS_COLORS[status] || '#94a3b8',
        }}
        />
        <strong>{status}</strong>
        <span style={{ color: '#64748b' }}>{currentPage || '-'}</span>
        {error ? <span style={{ color: '#f87171' }}>{error}</span> : null}
      </div>
    );
  }

  renderControls() {
    const { status } = this.props.runtime;
    const running = status === 'running';
    const buttonStyle = { padding: '6px 10px', cursor: 'pointer' };
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button type="button" style={buttonStyle} disabled={status === 'connecting'} onClick={() => this.run(() => this.client.reload())}>Reload</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.foreground())}>Foreground</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.background())}>Background</button>
        <button type="button" style={buttonStyle} disabled={!running} onClick={() => this.run(() => this.client.back())}>Back</button>
        <input
          style={{ flex: 1, minWidth: 160, padding: '6px 8px' }}
          value={this.state.navPath}
          onChange={(event) => this.setState({ navPath: event.target.value })}
          placeholder="pages/..."
        />
        <button
          type="button"
          style={buttonStyle}
          disabled={!running}
          onClick={() => this.run(() => this.client.navigate(this.state.navPath))}
        >
          Navigate
        </button>
        <button type="button" style={buttonStyle} disabled={status !== 'running'} onClick={() => this.run(() => this.client.terminate())}>Terminate</button>
      </div>
    );
  }

  render() {
    const { pageStack, diagnostics } = this.props.runtime;
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ width: 380, padding: 16, boxSizing: 'border-box', borderRight: '1px solid #1e293b', overflow: 'auto' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Tiny Runtime</h2>
          {this.renderStatus()}
          {this.renderControls()}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>page stack</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {pageStack.length === 0 ? <span style={{ color: '#64748b' }}>empty</span> : pageStack.map((pageId) => (
                <code key={pageId} style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>{pageId}</code>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>diagnostics ({diagnostics.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diagnostics.slice(-80).reverse().map((diagnostic, index) => (
              <div
                key={`${diagnostic.timestamp}-${index}`}
                style={{ fontSize: 12, borderLeft: `3px solid ${SEVERITY_COLORS[diagnostic.severity] || '#64748b'}`, paddingLeft: 8 }}
              >
                <div style={{ color: SEVERITY_COLORS[diagnostic.severity] || '#64748b' }}>
                  {diagnostic.severity} · {diagnostic.code}
                </div>
                <div style={{ color: '#cbd5e1' }}>{diagnostic.message}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
          <div ref={this.containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }
}

const mapState = (state) => ({ runtime: state.runtime });
const mapDispatch = (dispatch) => ({
  setRuntimeState: (payload) => dispatch.runtime.setRuntimeState(payload),
});

export default connect(mapState, mapDispatch)(RuntimePanel);
