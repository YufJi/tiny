import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { DevtoolRuntimeClient } from '@tiny/host-browser';
import './runtimePanel.css';
import {
  APPS_REGISTRY_URL,
  DEVICE_SCREEN_HEIGHT,
  DEVICE_SCREEN_WIDTH,
  HOST_CHROME_HEIGHT,
  MAX_LIVE_APPS,
  MAX_PAGE_STACK,
  TAB_BAR_HEIGHT,
} from './config';
import {
  fetchJson,
  generatedBaseFor,
  normalizeApps,
  resolveNavigationConfig,
  resolveTabBarPage,
} from './appRegistry';
import DebugPanel from './components/DebugPanel';
import DevtoolToolbar from './components/DevtoolToolbar';
import PreviewStage from './components/PreviewStage';

const EMPTY_RUNTIME_STATE = {
  status: 'idle',
  currentPage: '',
  pageStack: [],
  pages: [],
  lifecycle: [],
  tabBar: null,
  diagnostics: [],
  tree: null,
  error: '',
};

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// Controller: owns the app registry and a small LRU pool of live mini programs.
class RuntimePanel extends PureComponent {
  constructor(props) {
    super(props);
    this.surfaceHostRef = React.createRef();
    this.sessions = new Map();
    this.manifestPromises = new Map();
    this.appRegistry = [];
    this.activeAppId = '';
    this.opening = false;
    this.maxPageStack = MAX_PAGE_STACK;
    this.maxLiveApps = MAX_LIVE_APPS;
    this.state = {
      apps: [],
      loading: true,
      registryError: '',
      launcherError: '',
      actionError: '',
      activeAppId: '',
      launchingAppId: '',
      sessions: [],
      activeTab: 'console',
      navPath: '',
      manifestPath: '',
      maxLiveApps: MAX_LIVE_APPS,
      maxPageStack: MAX_PAGE_STACK,
    };
  }

  get activeSession() {
    return this.activeAppId ? this.sessions.get(this.activeAppId) ?? null : null;
  }

  async componentDidMount() {
    try {
      const apps = normalizeApps(await fetchJson(APPS_REGISTRY_URL));
      if (apps.length === 0) {
        throw new Error(`no test apps are registered in ${APPS_REGISTRY_URL}`);
      }
      this.appRegistry = apps;
      const params = new URLSearchParams(window.location.search);
      const maxPageStack = positiveInteger(params.get('maxPageStack'), MAX_PAGE_STACK);
      this.maxPageStack = maxPageStack;
      this.setState({
        apps,
        loading: false,
        registryError: '',
        maxPageStack,
      });
      this.exposeManager();
      window.__tinyDevtool = null;

      const requestedAppId = params.get('app');
      if (requestedAppId) {
        const requestedApp = apps.find((app) => app.id === requestedAppId);
        if (!requestedApp) {
          this.setState({ launcherError: `Unknown test app: ${requestedAppId}` });
          this.clearUrl();
          return;
        }
        const path = params.get('path') || undefined;
        await this.openApp(requestedApp.id, { initialPath: path, updateUrl: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setState({ loading: false, registryError: message });
      console.error('[devtool] failed to load the app registry', error);
    }
  }

  componentDidUpdate(prevProps) {
    const session = this.activeSession;
    if (!session) return;
    const runtime = this.props.runtime;
    const page = runtime.currentPage;
    const tabBarVisible = Boolean(runtime.tabBar?.visible);
    const tabBarChanged = tabBarVisible !== Boolean(prevProps.runtime.tabBar?.visible);
    if (!page) return;
    if (page === prevProps.runtime.currentPage && !tabBarChanged) return;
    this.syncSessionLayout(session, runtime);
    if (this.state.navPath !== page || this.state.manifestPath !== page) {
      this.setState({ navPath: page, manifestPath: page });
    }
  }

  componentWillUnmount() {
    for (const session of this.sessions.values()) {
      session.unsubscribe?.();
      session.client.terminate().catch(() => {});
      session.surface.remove();
    }
    this.sessions.clear();
    window.__tinyDevtool = null;
    window.__tinyDevtoolApps = null;
  }

  exposeManager() {
    window.__tinyDevtoolApps = {
      getApps: () => this.state.apps,
      getActiveAppId: () => this.activeAppId || null,
      getActiveClient: () => this.activeSession?.client ?? null,
      getSessions: () => this.sessionSummaries(),
      getMaxLiveApps: () => this.state.maxLiveApps,
      getMaxPageStack: () => this.state.maxPageStack,
      openApp: (appId, options) => this.openApp(appId, options),
      background: () => this.backgroundToLauncher(),
      closeApp: (appId) => this.closeApp(appId),
    };
  }

  run(action) {
    Promise.resolve()
      .then(action)
      .catch((error) => console.error('[devtool-runtime]', error));
  }

  sessionSummaries() {
    return [...this.sessions.values()].map((session) => {
      const state = session.client.getState();
      return {
        appId: session.appId,
        status: state.status,
        currentPage: state.currentPage,
        lastUsed: session.lastUsed,
        active: session.appId === this.activeAppId,
      };
    });
  }

  syncSessionList() {
    this.setState({ sessions: this.sessionSummaries() });
  }

  onSessionState(session, state) {
    session.state = state;
    if (this.activeAppId === session.appId) {
      this.props.setRuntimeState(state);
    }
    if (session.reloadPending && this.activeAppId === session.appId && state.status === 'running') {
      session.reloadPending = false;
      this.syncSessionLayout(session, state, true);
    }
    const signature = [
      state.status,
      state.currentPage,
      state.pageStack.length,
      state.tabBar?.visible ? '1' : '0',
      state.error ?? '',
    ].join('|');
    if (session.signature !== signature) {
      session.signature = signature;
      this.syncSessionList();
    }
  }

  syncSessionLayout(session, state, force = false) {
    if (state.status !== 'running' || !state.currentPage) return;
    const navigation = resolveNavigationConfig(
      session.manifest,
      state.currentPage,
      session.app.title || '',
    );
    const tabBarVisible = Boolean(state.tabBar?.visible);
    const height = DEVICE_SCREEN_HEIGHT
      - (navigation.custom ? 0 : HOST_CHROME_HEIGHT)
      - (tabBarVisible ? TAB_BAR_HEIGHT : 0);
    if (force || height !== session.lastContentHeight) {
      session.lastContentHeight = height;
      this.run(() => session.client.resize(DEVICE_SCREEN_WIDTH, height));
    }
  }

  async loadManifest(app) {
    if (!this.manifestPromises.has(app.id)) {
      const url = `${generatedBaseFor(app.id)}/manifest.json`;
      this.manifestPromises.set(app.id, fetchJson(url));
    }
    return this.manifestPromises.get(app.id);
  }

  initialContentHeight(app, manifest, initialPath) {
    const navigation = resolveNavigationConfig(manifest, initialPath, app.title || '');
    const tabBar = resolveTabBarPage(manifest, initialPath);
    return DEVICE_SCREEN_HEIGHT
      - (navigation.custom ? 0 : HOST_CHROME_HEIGHT)
      - (tabBar ? TAB_BAR_HEIGHT : 0);
  }

  createSurface(appId) {
    const surface = document.createElement('div');
    surface.className = 'td-app-surface';
    surface.dataset.appId = appId;
    surface.dataset.state = 'hidden';
    this.surfaceHostRef.current?.appendChild(surface);
    return surface;
  }

  updateSurfaces() {
    for (const [appId, session] of this.sessions) {
      const visible = appId === this.activeAppId;
      session.surface.dataset.state = visible ? 'active' : 'hidden';
      session.surface.style.visibility = visible ? 'visible' : 'hidden';
      session.surface.style.pointerEvents = visible ? 'auto' : 'none';
      session.surface.style.zIndex = visible ? '1' : '0';
    }
  }

  async openApp(appId, options = {}) {
    if (this.opening) return;
    const app = this.appRegistry.find((candidate) => candidate.id === appId);
    if (!app) {
      this.setState({ launcherError: `Unknown test app: ${appId}` });
      return;
    }
    if (this.activeAppId === appId) return;
    this.opening = true;
    const existing = this.sessions.get(appId);
    try {
      if (existing) {
        if (this.activeAppId) await this.backgroundActive({ toLauncher: false });
        await this.activateSession(existing);
        return;
      }

      if (this.activeAppId) await this.backgroundActive({ toLauncher: false });
      while (this.sessions.size >= this.state.maxLiveApps) {
        const victim = this.leastRecentlyUsedSession();
        if (!victim) break;
        await this.closeSession(victim);
      }

      this.setState({ launchingAppId: appId, launcherError: '', actionError: '' });
      const manifest = await this.loadManifest(app);
      const firstPage = Array.isArray(manifest.pages) ? manifest.pages[0]?.path : null;
      if (!firstPage) throw new Error(`${app.label} has no pages in its manifest`);
      const requestedPath = options.initialPath;
      const initialPath = requestedPath && manifest.pages.some((page) => page.path === requestedPath)
        ? requestedPath
        : firstPage;
      const contentHeight = this.initialContentHeight(app, manifest, initialPath);
      const threadUrl = (page) => new URL(
        `./${page}?app=${encodeURIComponent(app.id)}`,
        window.location.href,
      ).href;
      const surface = this.createSurface(app.id);
      const client = new DevtoolRuntimeClient({
        manifest,
        serviceUrl: threadUrl('service.html'),
        renderUrl: threadUrl('render.html'),
        initialPath,
        container: surface,
        systemInfo: {
          pixelRatio: window.devicePixelRatio || 1,
          windowWidth: DEVICE_SCREEN_WIDTH,
          windowHeight: contentHeight,
        },
        maxPageStack: this.maxPageStack,
      });
      const session = {
        appId: app.id,
        app,
        manifest,
        client,
        surface,
        initialPath,
        lastUsed: Date.now(),
        lastContentHeight: contentHeight,
        backgrounded: false,
        reloadPending: false,
        state: client.getState(),
        signature: '',
        unsubscribe: null,
      };
      session.unsubscribe = client.subscribe((state) => this.onSessionState(session, state));
      this.sessions.set(app.id, session);
      this.syncSessionList();
      await client.launch();
      await this.activateSession(session);
      if (options.updateUrl !== false) this.updateUrl(session);
      this.setState({ launchingAppId: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const failed = this.sessions.get(appId);
      if (failed) await this.closeSession(failed);
      this.setState({ launchingAppId: '', launcherError: message });
      if (!this.activeAppId) this.clearUrl();
      console.error('[devtool] failed to launch app', appId, error);
    } finally {
      this.opening = false;
    }
  }

  leastRecentlyUsedSession() {
    return [...this.sessions.values()]
      .filter((session) => session.appId !== this.activeAppId)
      .sort((a, b) => a.lastUsed - b.lastUsed)[0];
  }

  async activateSession(session) {
    if (!this.sessions.has(session.appId)) return;
    const wasBackgrounded = session.backgrounded;
    this.activeAppId = session.appId;
    session.backgrounded = false;
    session.lastUsed = Date.now();
    this.updateSurfaces();
    window.__tinyDevtool = session.client;
    const state = session.client.getState();
    this.props.setRuntimeState(state);
    this.setState({
      activeAppId: session.appId,
      launchingAppId: '',
      launcherError: '',
      actionError: '',
      activeTab: 'console',
      navPath: state.currentPage || session.initialPath,
      manifestPath: state.currentPage || session.initialPath,
    });
    this.updateUrl(session);
    if (wasBackgrounded) {
      await session.client.foreground();
    }
    this.syncSessionList();
    this.syncSessionLayout(session, session.client.getState());
  }

  async backgroundActive({ toLauncher = true } = {}) {
    const session = this.activeSession;
    this.activeAppId = '';
    if (!session) {
      if (toLauncher) this.clearUrl();
      return;
    }
    session.backgrounded = true;
    session.lastUsed = Date.now();
    try {
      await session.client.background();
    } catch (error) {
      console.error('[devtool] failed to background app', error);
    }
    session.surface.dataset.state = 'hidden';
    session.surface.style.visibility = 'hidden';
    session.surface.style.pointerEvents = 'none';
    session.surface.style.zIndex = '0';
    this.props.setRuntimeState(EMPTY_RUNTIME_STATE);
    this.setState({
      activeAppId: '',
      launchingAppId: '',
      actionError: '',
      navPath: '',
      manifestPath: '',
      activeTab: 'console',
    });
    window.__tinyDevtool = null;
    if (toLauncher) this.clearUrl();
    this.syncSessionList();
  }

  async backgroundToLauncher() {
    await this.backgroundActive({ toLauncher: true });
  }

  async closeSession(session) {
    if (!this.sessions.has(session.appId)) return;
    this.sessions.delete(session.appId);
    session.unsubscribe?.();
    if (this.activeAppId === session.appId) {
      this.activeAppId = '';
      window.__tinyDevtool = null;
      this.props.setRuntimeState(EMPTY_RUNTIME_STATE);
      this.setState({
        activeAppId: '',
        launchingAppId: '',
        actionError: '',
        navPath: '',
        manifestPath: '',
        activeTab: 'console',
      });
      this.clearUrl();
    }
    try {
      await session.client.terminate();
    } catch {
      // The app may have failed before its threads were ready.
    }
    session.surface.remove();
    this.syncSessionList();
  }

  async closeApp(appId) {
    const session = this.sessions.get(appId);
    if (session) await this.closeSession(session);
  }

  async closeActiveApp() {
    const session = this.activeSession;
    if (session) await this.closeSession(session);
  }

  reloadActiveApp() {
    const session = this.activeSession;
    if (!session) return;
    session.reloadPending = true;
    this.run(() => session.client.reload());
  }

  reportActionError(error) {
    this.setState({ actionError: error instanceof Error ? error.message : String(error) });
  }

  navigateActive(path) {
    const session = this.activeSession;
    if (!session || !path) return;
    this.setState({ actionError: '' });
    this.run(() => session.client.navigate(path).catch((error) => this.reportActionError(error)));
  }

  backActive() {
    const session = this.activeSession;
    if (session) {
      this.setState({ actionError: '' });
      this.run(() => session.client.back().catch((error) => this.reportActionError(error)));
    }
  }

  inspectActive() {
    const session = this.activeSession;
    if (session) this.run(() => session.client.inspectTree());
  }

  tapTab(index) {
    const session = this.activeSession;
    if (session) this.run(() => session.client.tapTab(index));
  }

  updateUrl(session) {
    const url = new URL(window.location.href);
    url.searchParams.set('app', session.appId);
    const firstPage = session.manifest.pages[0]?.path;
    if (session.initialPath && session.initialPath !== firstPage) {
      url.searchParams.set('path', session.initialPath);
    } else {
      url.searchParams.delete('path');
    }
    window.history.replaceState(null, '', url);
  }

  clearUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('app');
    url.searchParams.delete('path');
    window.history.replaceState(null, '', url);
  }

  render() {
    const {
      status,
      currentPage,
      pageStack,
      pages,
      lifecycle: lifecycleEvents,
      diagnostics,
      tree,
      tabBar,
      error: runtimeError,
    } = this.props.runtime;
    const {
      apps,
      loading,
      registryError,
      launcherError,
      actionError,
      activeAppId,
      launchingAppId,
      sessions,
      activeTab,
      navPath,
      manifestPath,
      maxLiveApps,
      maxPageStack,
    } = this.state;
    const session = this.activeSession;
    const selectedApp = session?.app ?? null;
    const launcher = !activeAppId;
    const navigation = session
      ? resolveNavigationConfig(
          session.manifest,
          currentPage || session.initialPath,
          selectedApp?.title || '',
        )
      : {
          title: 'Test apps',
          backgroundColor: '#f5f6f8',
          textStyle: 'black',
          custom: false,
        };
    const hostNavigation = launcher || !navigation.custom;
    const running = status === 'running';
    const ready = Boolean(session);
    const alert = registryError || actionError || runtimeError || launcherError;

    return (
      <div className="tiny-devtool">
        <PreviewStage
          surfaceHostRef={this.surfaceHostRef}
          launcher={launcher}
          apps={apps}
          sessions={sessions}
          launchingAppId={launchingAppId}
          launcherError={launcherError}
          maxLiveApps={maxLiveApps}
          maxPageStack={maxPageStack}
          onOpenApp={(appId) => this.run(() => this.openApp(appId))}
          onCloseApp={(appId) => this.run(() => this.closeApp(appId))}
          loading={loading}
          status={status}
          error={registryError}
          hostNavigation={hostNavigation}
          navigation={navigation}
          tabBar={launcher ? null : tabBar}
          tabBarAssetBase={activeAppId ? generatedBaseFor(activeAppId) : ''}
          canGoBack={pageStack.length > 1}
          onBack={() => this.backActive()}
          onTabBarTap={(index) => this.tapTab(index)}
          onBackground={() => this.run(() => this.backgroundToLauncher())}
          onReload={() => this.reloadActiveApp()}
        />

        <aside className="td-side">
          <DevtoolToolbar
            selectedApp={selectedApp}
            sessionCount={sessions.length}
            maxLiveApps={maxLiveApps}
            maxPageStack={maxPageStack}
            loading={loading}
            alert={alert}
            manifestPath={manifestPath}
            currentPage={currentPage}
            pageStack={pageStack}
            pages={pages}
            status={launcher ? 'idle' : status}
            running={running}
            ready={ready}
            navPath={navPath}
            onOpenApps={() => this.run(() => this.backgroundToLauncher())}
            onNavPathChange={(nextPath) => this.setState({ navPath: nextPath, actionError: '' })}
            onNavigate={() => this.navigateActive(navPath)}
            onReload={() => this.reloadActiveApp()}
            onInspect={() => this.inspectActive()}
            onBack={() => this.backActive()}
            onCloseApp={() => this.run(() => this.closeActiveApp())}
          />
          <DebugPanel
            activeTab={activeTab}
            onTabChange={(nextTab) => this.setState({ activeTab: nextTab })}
            diagnostics={launcher ? [] : diagnostics}
            lifecycleEvents={launcher ? [] : lifecycleEvents}
            pages={launcher ? [] : pages}
            tree={launcher ? null : tree}
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
