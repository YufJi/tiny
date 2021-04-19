
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

    this.loadConfigJson()

    this.state = {
      navConfig: this.initNav()
    }
  }

  componentDidMount() {
    this.initWorker()
    this.initPage()
  }

  loadConfigJson() {
    const config = requireFile('/biz/appConfig.json')
    global.APPCONFIG = config;
    console.log('APPCONFIG', global.APPCONFIG);
  }

  initNav() {
    const { window } = global.APPCONFIG

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
    const src = '/worker.html'
    const guid = createGuid('worker')
    global.worker = createWorkerIframe(guid, src, (iframe) => {
      EventHub.emit(WORKERLOADED)
    })
  }

  initPage() {
    const { pages, launchParams } = global.APPCONFIG
    const homePage = pages[0]

    this.pushPage(homePage, launchParams[homePage])
  }

  pushPage(pagePath, pageConfig) {
    const src = `/render.html#${pagePath}`
    const guid = createGuid('render')
    const pageIframe = createRenderIframe(guid, src, (iframe) => {})
    global.renders[guid] = pageIframe
    global.pagesStack.push(guid);

    this.setNav({
      title: pageConfig.defaultTitle
    })
  }

  render() {
    const { navConfig } = this.state;

    const isShowBackIcon = global.pagesStack.length > 1

    return (
      <div className={`${style.app} f-page flex-c`}>
        <StatusBar></StatusBar>
        <div className={`${style.nav} flex-r`}>
          <div className={`${style.left} flex-r`}>
            {isShowBackIcon && <div className={`${style.back} ic`}>&#xe641;</div>}
          </div>
          <div className={`${style.title} flex-1`}>{navConfig.title}</div>
          <div className={`${style.right} flex-r`}>
            <div className={`${style.more} ic`}>&#xe648;</div>
            <div className={`${style.close} ic`}>&#xe649;</div>
          </div>
        </div>
        <div id="pageFrames" className={`${style.pageFrames} flex-1`}>
        </div>
        <div className="tabs"></div>

        <div id="workerFrame" className={style.workerFrame}></div>
      </div>
    )
  }
}
