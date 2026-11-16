import React from 'react';
import { SimulatorStage } from '@tiny/devtool-simulator';
import AppLauncher from './AppLauncher';
import HostShareSheet from './HostShareSheet';
import './PreviewRuntime.css';

// Web devtool composition: simulator chrome from the shared package plus the
// app launcher, share sheet, iframe surfaces and devtool-specific overlays.
function PreviewStage({
  surfaceHostRef,
  launcher,
  apps,
  sessions,
  launchingAppId,
  launcherError,
  maxLiveApps,
  maxPageStack,
  onOpenApp,
  onCloseApp,
  loading,
  status,
  error,
  hostNavigation,
  navigation,
  tabBar,
  tabBarAssetBase,
  canGoBack,
  onBack,
  onTabBarTap,
  onBackground,
  onReload,
  onShare,
  shareEnabled,
  shareSheetOpen,
  shareResult,
  onShareSelect,
  onCloseShare,
  refreshing,
  device,
  onStatusBarTap,
  onSurfaceLayout,
}) {
  let overlay = null;
  if (error) {
    overlay = { title: 'Preview unavailable', detail: error };
  } else if (loading) {
    overlay = {
      spinner: true,
      title: 'Loading test apps…',
      detail: 'Reading the generated app registry',
    };
  } else if (!launcher && status === 'connecting') {
    overlay = {
      spinner: true,
      title: 'Booting preview…',
      detail: 'Starting the service and render threads',
    };
  } else if (!launcher && status === 'terminated') {
    overlay = {
      title: 'Runtime terminated',
      detail: 'Use Reload in the toolbar or open the app again',
    };
  } else if (!launcher && status === 'error') {
    overlay = {
      title: 'Preview failed',
      detail: 'Check the runtime error in the toolbar',
    };
  }

  return (
    <SimulatorStage
      surfaceHostRef={surfaceHostRef}
      launcher={launcher}
      launcherContent={(
        <AppLauncher
          apps={apps}
          sessions={sessions}
          launchingAppId={launchingAppId}
          error={launcherError}
          maxLiveApps={maxLiveApps}
          maxPageStack={maxPageStack}
          onOpen={onOpenApp}
          onClose={onCloseApp}
        />
      )}
      screenOverlay={(
        <HostShareSheet
          open={Boolean(shareSheetOpen && !launcher && status === 'running')}
          result={shareResult}
          onSelect={onShareSelect}
          onClose={onCloseShare}
        />
      )}
      status={status}
      hostNavigation={hostNavigation}
      navigation={navigation}
      tabBar={tabBar}
      tabBarAssetBase={tabBarAssetBase}
      canGoBack={canGoBack}
      onBack={onBack}
      onTabBarTap={onTabBarTap}
      onBackground={onBackground}
      onReload={onReload}
      onShare={onShare}
      shareEnabled={shareEnabled}
      refreshing={refreshing}
      device={device}
      onStatusBarTap={onStatusBarTap}
      overlay={overlay}
      onSurfaceLayout={onSurfaceLayout}
    />
  );
}

export default PreviewStage;
