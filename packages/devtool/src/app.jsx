/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
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
      global.service = serviceIframe;

      renderIframe.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onLoadApp', '${JSON.stringify({})}')`);

      serviceIframe.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onAppRoute', '${JSON.stringify({
        path: homePage,
        openType: 'appLaunch',
      })}', '${renderIframe.id}')`);
    });
  }

  hideMP = () => {
    this.setState({
      mpVisible: false,
    });
    // 触发一些事件
  }

  showMP = () => {
    this.setState({
      mpVisible: true,
    });
    // 触发一些事件
  }

  handleNavBack = () => {
    navigateBack();
  }

  render() {
    const { mpVisible } = this.state;

    return (
      <div id="app" className={`${style.app}`}>
        <StatusBar />
        <div id="serviceFrame" className={style.serviceFrame} />
        <div className={`${style.MPContainer} ${mpVisible ? '' : style.hide} f-page flex-c`}>
          <Nav
            navBack={this.handleNavBack}
            hideMP={this.hideMP}
          />
          <div id="pageFrames" className={`${style.pageFrames} flex-1 flex-c`}>
            <div id="tabFrames" className={`${style.tabFrames} flex-1`} />
            <div className={`${style.tabs} flex-r`} />
          </div>
        </div>
        {!mpVisible && (
          <div className={`${style.openMP} flex-r`} onClick={this.showMP} />
        )}
      </div>
    );
  }
}

const mapState = (state) => {
  const { nav, route } = state;
  return {
    navConfig: nav,
    ...route,
  };
};

const mapDispatch = (dispatch) => ({
  setAppConfig: (config) => dispatch.route.setAppConfig(config),
  setTabBarConfig: (config) => dispatch.route.setTabBarConfig(config),
  setNavConfig: (config) => dispatch.nav.setNavConfig(config),
});

export default connect(
  mapState,
  mapDispatch,
)(App);
