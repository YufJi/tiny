import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DevtoolRuntimeClient } from '@tiny/host-browser';
import './runtimePanel.css';
import {
  APPS_REGISTRY_URL,
  DEFAULT_APP_ID,
  DEVICE_SCREEN_HEIGHT,
  DEVICE_SCREEN_WIDTH,
  HOST_CHROME_HEIGHT,
} from './config';
import {
  fetchJson,
  generatedBaseFor,
  normalizeApps,
  resolveNavigationConfig,
} from './appRegistry';
import DebugPanel from './components/DebugPanel';
import DevtoolToolbar from './components/DevtoolToolbar';
import PreviewStage from './components/PreviewStage';

// Controller: loads the app registry, owns the runtime client and composes the panel.
class RuntimePanel extends PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.client = null;
    this.unsubscribe = null;
    this.state = {
      apps: [],
      appId: '',
      manifest: null,
      initialPath: '',
      navPath: '',
      manifestPath: '',
      hostNavigation: false,
      lifecycle: 'foreground',
      loading: true,
      error: '',
      activeTab: 'console',
    };
  }

  async componentDidMount() {
    try {
      const apps = normalizeApps(await fetchJson(APPS_REGISTRY_URL));
      if (apps.length === 0) {
        throw new Error(`no test apps are registered in ${APPS_REGISTRY_URL}`);
      }

      const params = new URLSearchParams(window.location.search);
      const requestedAppId = params.get('app');
      const app = apps.find((candidate) => candidate.id === requestedAppId)
        || apps.find((candidate) => candidate.id === DEFAULT_APP_ID)
        || apps[0];
      // A `path` only belongs to the requested app; when the query points at a
      // different (or unknown) app, boot that app from its first page instead.
      const pathParam = !requestedAppId || requestedAppId === app.id ? params.get('path') : null;
      const generatedBase = generatedBaseFor(app.id);
      const manifest = await fetchJson(`${generatedBase}/manifest.json`);
      const firstPage = Array.isArray(manifest.pages) ? manifest.pages[0]?.path : null;
      if (!firstPage) {
        throw new Error(`${app.label} has no pages in its manifest`);
      }
      const initialPath = pathParam || firstPage;
      // The launch page decides whether the host owns the navigation bar.
      // `navigationStyle: "custom"` pages draw their own bar and need the full screen.
      const initialNavigation = resolveNavigationConfig(manifest, initialPath, app.title);
      const hostNavigation = !initialNavigation.custom;
      const contentHeight = hostNavigation
        ? DEVICE_SCREEN_HEIGHT - HOST_CHROME_HEIGHT
        : DEVICE_SCREEN_HEIGHT;

      const url = new URL(window.location.href);
      if (url.searchParams.get('app') !== app.id) {
        url.searchParams.set('app', app.id);
        if (requestedAppId && requestedAppId !== app.id) url.searchParams.delete('path');
        window.history.replaceState(null, '', url);
      }

      this.setState({
        apps,
        appId: app.id,
        manifest,
        initialPath,
        navPath: initialPath,
        manifestPath: firstPage,
        hostNavigation,
        lifecycle: 'foreground',
        loading: false,
        error: '',
      });

      const threadUrl = (page) => new URL(
        `./${page}?app=${encodeURIComponent(app.id)}`,
        window.location.href,
      ).href;
      this.client = new DevtoolRuntimeClient({
        manifest,
        serviceUrl: threadUrl('next-service.html'),
        renderUrl: threadUrl('next-render.html'),
        initialPath,
        container: this.containerRef.current,
        systemInfo: {
          pixelRatio: window.devicePixelRatio || 1,
          windowWidth: DEVICE_SCREEN_WIDTH,
          windowHeight: contentHeight,
        },
      });
      this.unsubscribe = this.client.subscribe((state) => {
        this.props.setRuntimeState(state);
      });
      window.__tinyDevtool = this.client;
      this.run(() => this.client.launch());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setState({ loading: false, error: message });
      console.error('[devtool] failed to boot the runtime', error);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.client) {
      const client = this.client;
      this.client = null;
      client.terminate().catch(() => {});
    }
  }

  run(action) {
    Promise.resolve()
      .then(action)
      .catch((error) => console.error('[devtool-runtime]', error));
  }

  changeApp(appId) {
    if (!appId || appId === this.state.appId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('app', appId);
    url.searchParams.delete('path');
    window.location.assign(url);
  }

  setRuntimeLifecycle(lifecycle) {
    this.setState({ lifecycle });
    this.run(() => (
      lifecycle === 'background' ? this.client.background() : this.client.foreground()
    ));
  }

  reloadRuntime() {
    this.setState({ lifecycle: 'foreground' });
    this.run(() => this.client.reload());
  }

  terminateRuntime() {
    this.setState({ lifecycle: 'foreground' });
    this.run(() => this.client.terminate());
  }

  render() {
    const { status, currentPage, pageStack, diagnostics, tree, error: runtimeError } = this.props.runtime;
    const {
      apps,
      appId,
      manifest,
      initialPath,
      loading,
      error,
      manifestPath,
      navPath,
      activeTab,
      hostNavigation,
      lifecycle,
    } = this.state;
    const selectedApp = apps.find((app) => app.id === appId);
    const navigation = resolveNavigationConfig(
      manifest,
      currentPage || initialPath,
      selectedApp?.title || '',
    );
    const running = status === 'running';
    const ready = Boolean(this.client);
    const alert = error || runtimeError;

    return (
      <div className="tiny-devtool">
        <PreviewStage
          containerRef={this.containerRef}
          loading={loading}
          status={status}
          error={error}
          hostNavigation={hostNavigation}
          navigation={navigation}
          canGoBack={pageStack.length > 1}
          lifecycle={lifecycle}
          onBack={() => this.run(() => this.client.back())}
          onForeground={() => this.setRuntimeLifecycle('foreground')}
          onBackground={() => this.setRuntimeLifecycle('background')}
          onReload={() => this.reloadRuntime()}
        />

        <aside className="td-side">
          <DevtoolToolbar
            apps={apps}
            appId={appId}
            selectedApp={selectedApp}
            loading={loading}
            alert={alert}
            manifestPath={manifestPath}
            currentPage={currentPage}
            pageStack={pageStack}
            status={status}
            lifecycle={lifecycle}
            running={running}
            ready={ready}
            navPath={navPath}
            onAppChange={(nextAppId) => this.changeApp(nextAppId)}
            onNavPathChange={(nextPath) => this.setState({ navPath: nextPath })}
            onNavigate={() => this.run(() => this.client.navigate(navPath))}
            onReload={() => this.reloadRuntime()}
            onInspect={() => this.run(() => this.client.inspectTree())}
            onForeground={() => this.setRuntimeLifecycle('foreground')}
            onBackground={() => this.setRuntimeLifecycle('background')}
            onBack={() => this.run(() => this.client.back())}
            onTerminate={() => this.terminateRuntime()}
          />
          <DebugPanel
            activeTab={activeTab}
            onTabChange={(nextTab) => this.setState({ activeTab: nextTab })}
            diagnostics={diagnostics}
            tree={tree}
          />
        </aside>
      </div>
    );
  }
}

const mapState = (state) => ({ runtime: state.runtime });
const mapDispatch = (dispatch) => ({
  setRuntimeState: (payload) => dispatch.runtime.setRuntimeState(payload),
});

export default connect(mapState, mapDispatch)(RuntimePanel);
