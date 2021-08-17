/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import StatusBar from '@/components/statusBar';
import Nav from '@/components/nav';

import jsbridge from '@/utils/jsbridge';
import { createWorkerIframe } from '@/utils/createIframe';
import global from '@/utils/global';
import requireFile from '@/utils/requireFile';
import EventHub, { WORKERLOADED } from '@/utils/EventHub';
import { createGuid } from '@/utils/';
import { doPushWindow } from '@/utils/jsbridge/API/navigation';
import style from './app.module.less';

class App extends Component {
  constructor(props) {
    super(props);

    this.loadAppConfig();
    this.loadTabBarConfig();

    this.jsbridge = jsbridge;
    window.JSBridgeInstance = this.jsbridge;

    this.state = {
      mpVisible: true,
    };
  }

  componentDidMount() {
    this.initNav();
    this.launchTiny();
  }

  loadAppConfig() {
    const config = requireFile('/biz/appConfig.json');
    global.appConfig = config;
    console.log('appConfig', global.appConfig);
  }

  loadTabBarConfig() {
    const config = requireFile('/biz/tabBar.json');
    global.tabBarConfig = config;
    console.log('tabBarConfig', global.tabBarConfig);
  }

  initNav() {
    const { window } = global.appConfig;

    this.props.setNavConfig({
      title: window.defaultTitle,
    });
  }

  launchTiny() {
    const guid = createGuid('worker');
    const src = 'worker.html';
    const { pages } = global.appConfig;
    const homePage = pages[0];

    // global.worker = await createWorkerIframe({
    //   guid,
    //   src,
    // });

    // doPushWindow(homePage, (iframe) => {
    //   global.worker.contentWindow.JSBridge.subscribeHandler('onAppRoute', JSON.stringify({
    //     path: homePage,
    //     openType: 'appLaunch',
    //   }), iframe.id);
    // })

    Promise.all([
      createWorkerIframe({
        guid,
        src,
      }),
      doPushWindow(homePage),
    ]).then((iframes) => {
      const [worker, renderIframe] = iframes;
      global.worker = worker;

      global.worker.contentWindow.JSBridge.subscribeHandler('onAppRoute', JSON.stringify({
        path: homePage,
        openType: 'appLaunch',
      }), renderIframe.id);
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

  render() {
    const { mpVisible } = this.state;

    return (
      <div className={`${style.app} f-page flex-c`}>
        <StatusBar />
        <div className={`${style.MPContainer} ${mpVisible ? '' : style.hide} flex-1 flex-c`}>

          <Nav hideMP={this.hideMP} />
          <div id="pageFrames" className={`${style.pageFrames} flex-1 flex-c`}>
            <div id="tabFrames" className={`${style.tabFrames} flex-1`} />
            <div className={`${style.tabs} flex-r`}>
              {/* <div>
                <div>icon</div>
                <div>text</div>
              </div>
              <div>
                <div>icon</div>
                <div>text</div>
              </div> */}
            </div>
          </div>

          <div id="workerFrame" className={style.workerFrame} />
        </div>
        {!mpVisible && (
          <div className={`${style.openMP} flex-r`} onClick={this.showMP} />
        )}
      </div>
    );
  }
}

const mapState = (state) => {
  const { nav } = state;
  return {
    navConfig: nav,
  };
};

const mapDispatch = (dispatch) => ({
  setNavConfig: (config) => dispatch.nav.setNavConfig(config),
});

export default connect(
  mapState,
  mapDispatch,
)(App);
