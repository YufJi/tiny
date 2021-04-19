
import React, { Component } from 'react';
import StatusBar from '@/components/statusBar'

import { createWorkerIframe, createRenderIframe } from '@/utils/createIframe';
import global from '@/utils/global'
import requireFile from '@/utils/requireFile';
import EventHub, { WORKERLOADED } from '@/utils/EventHub';
import style from './app.module.less';
import { createGuid } from './utils';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.loadAppConfig()
    this.loadTabBarConfig()

    this.state = {
      navConfig: this.initNav(),
      mpVisible: true,
    }
  }

  componentDidMount() {
    this.initWorker()
    this.initPage()
  }

  loadAppConfig() {
    const config = requireFile('/biz/appConfig.json')
    global.appConfig = config;
    console.log('appConfig', global.appConfig);
  }

  loadTabBarConfig() {
    const config = requireFile('/biz/tabBar.json')
    global.tabBarConfig = config;
    console.log('tabBarConfig', global.tabBarConfig);
  }

  initNav() {
    const { window } = global.appConfig

    return {
      title: window.defaultTitle
    }
  }

  setNav(config) {
    const { navConfig } = this.state

    this.setState({
      navConfig: {
        ...navConfig,
        ...config,
      }
    })
  }

  initWorker() {
    const src = 'worker.html'
    const guid = createGuid('worker')
    global.worker = createWorkerIframe({
      guid, 
      src, 
      onload: (iframe) => {
        EventHub.emit(WORKERLOADED)
      },
    })
  }

  initPage() {
    const { pages, launchParams } = global.appConfig
    const homePage = pages[0]

    this.pushPage(homePage, launchParams[homePage])
  }

  pushPage(pagePath, pageConfig) {
    const src = `render.html#${pagePath}`
    const guid = createGuid('render')
    const pageIframe = createRenderIframe({
      guid, 
      src, 
      onload: (iframe) => {
        iframe.setAttribute('path', pagePath)
        iframe.path = pagePath;
      },
    })
    global.currentRender = pageIframe
    global.renders[guid] = pageIframe
    global.pagesStack.push(guid);

    this.setNav({
      title: pageConfig.navigationBarTitleText,
      backgroundColor: pageConfig.navigationBarBackgroundColor ? `#${pageConfig.navigationBarBackgroundColor.toString(16)}` : '#fff',
    })
  }

  hideMP = () => {
    this.setState({
      mpVisible: false,
    })
    // 触发一些事件
  }

  showMP = () => {
    this.setState({
      mpVisible: true,
    })
    // 触发一些事件
  }

  render() {
    const { navConfig, mpVisible } = this.state;

    const isShowBackIcon = global.pagesStack.length > 1

    return (
      <div className={`${style.app} f-page flex-c`}>
        <StatusBar></StatusBar>
        <div className={`${style.MPContainer} ${mpVisible ? '' : style.hide} flex-1 flex-c`}>
          <div 
            className={`${style.nav} flex-r`}
            style={{
              backgroundColor: navConfig.backgroundColor,
            }}
          >
            <div className={`${style.left} flex-r`}>
              {isShowBackIcon && <div className={`${style.back} ic`}>&#xe641;</div>}
            </div>
            <div className={`${style.title} flex-1`}>
              {navConfig.title}
            </div>
            <div className={`${style.right} flex-r`}>
              <div className={`${style.more} ic`}>&#xe648;</div>
              <div className={`${style.close} ic`} onClick={this.hideMP}>&#xe649;</div>
            </div>
          </div>
          <div id="pageFrames" className={`${style.pageFrames} flex-1 flex-c`}>
            <div id="tabFrames" className={`${style.tabFrames} flex-1`}></div>
            <div className="tabs" className={`${style.tabs} flex-r`}>
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

          <div id="workerFrame" className={style.workerFrame}></div>
        </div>
        {!mpVisible && (
          <div className={`${style.openMP} flex-r`} onClick={this.showMP}></div>
        )}
      </div>
    )
  }
}
