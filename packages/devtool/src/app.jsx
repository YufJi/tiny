/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import StatusBar from '@/components/statusBar';
import Nav from '@/components/nav';

import jsbridge from '@/utils/jsbridge';
import { createWorkerIframe } from '@/utils/createIframe';
import global from '@/utils/global';
import requireFile from '@/utils/requireFile';
import { createGuid, query, delay } from '@/utils';
import { pushWindow, navigateBack } from '@/utils/jsbridge/API/navigation';

import style from './app.module.less';

class App extends PureComponent {
  constructor(props) {
    super(props);

    window.JSBridgeInstance = jsbridge;

    this.state = {
      mpVisible: true,
    };
  }

  componentDidMount() {
    const { setAppConfig, setTabBarConfig } = this.props;
    const appConfig = requireFile('/biz/appConfig.json');

    this.initNav(appConfig);
    this.launchTinyApp(appConfig);

    setAppConfig(appConfig);
    console.log('appConfig', appConfig);
    setTabBarConfig(appConfig.tabBar);
    console.log('tabBarConfig', appConfig.tabBar);
  }

  initNav(appConfig) {
    const { window = {} } = appConfig;

    this.props.setNavConfig({
      title: window.defaultTitle,
    });
  }

  async launchTinyApp(appConfig) {
    const { pages } = appConfig;

    const src = 'biz/service.html';
    const homePage = query('path') || pages[0];

    Promise.all([
      createWorkerIframe({
        src,
      }),
      pushWindow(homePage),
    ]).then((iframes) => {
      const [serviceIframe, renderIframe] = iframes;

      /* 这个事件没啥用 */
      renderIframe.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onLoadApp', '${JSON.stringify({})}')`);

      // 冷启动
      global.service.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onAppEnterForeground', '${JSON.stringify({

      })}')`);

      serviceIframe.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('appRoute', '${JSON.stringify({
        path: homePage,
        openType: 'appLaunch',
      })}', '${renderIframe.id}')`);
    });
  }

  hideMP = () => {
    this.setState({
      mpVisible: false,
    });
    // 触发切后台事件
    global.service.contentWindow.executeJavaScript('JSBridge.subscribeHandler(\'onAppEnterBackground\')');
  }

  showMP = () => {
    this.setState({
      mpVisible: true,
    });
    // 触发切前台事件
    global.service.contentWindow.executeJavaScript(`JSBridge.subscribeHandler(\'onAppEnterForeground\', '${JSON.stringify({

    })}')`);
  }

  handleNavBack = () => {
    navigateBack();
  }

  render() {
    const { mpVisible } = this.state;

    const MPContainerCls = classnames({
      [style.MPContainer]: true,
      [style.hide]: !mpVisible,
    });

    return (
      <div id="app" className={`${style.app}`}>
        <StatusBar />

        <div className={`${MPContainerCls} f-page flex-c`}>
          <Nav
            navBack={this.handleNavBack}
            hideMP={this.hideMP}
          />
          <div id="pageFrames" className={`${style.pageFrames} flex-1 flex-c`}>
            <div id="tabFrames" className={`${style.tabFrames} flex-1`} />
            <div className={`${style.tabs} flex-r`} />
          </div>
          <div id="serviceFrame" className={style.serviceFrame} />
        </div>
        {!mpVisible && (
          <div className={`${style.openMP} flex-r`} onClick={this.showMP} />
        )}

        {/* 用于canvas api调用返回结果 */}
        <canvas id="canvas" width="500" height="100" />
      </div>
    );
  }
}

const mapState = (state) => {
  const { nav, global } = state;
  return {
    navConfig: nav,
    ...global,
  };
};

const mapDispatch = (dispatch) => ({
  setAppConfig: (config) => dispatch.global.setAppConfig(config),
  setTabBarConfig: (config) => dispatch.global.setTabBarConfig(config),
  setNavConfig: (config) => dispatch.nav.setNavConfig(config),
});

export default connect(
  mapState,
  mapDispatch,
)(App);
