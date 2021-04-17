
import React, { Component } from 'react';

import { createWorkerIframe, createRenderIframe } from '@/utils/createIframe';
import global from '@/utils/global'
import requireFile from '@/utils/requireFile';
import EventHub, { WORKERLOADED } from '@/utils/EventHub';
import style from './app.module.less';
import { createGuid } from './utils';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navConfig: {}
    }
  }

  componentDidMount() {
    this.loadConfigJson()
    this.initNav()
    this.initWorker()
    this.initPage()
  }

  loadConfigJson() {
    const config = requireFile('/biz/appConfig.json')
    global.APPCONFIG = config;
    console.log('APPCONFIG', APPCONFIG);
  }

  initNav() {
    const { window } = global.APPCONFIG

    this.setState({
      navConfig: {
        title: window.defaultTitle
      }
    })
  }

  initPage() {
    const { pages, launchParams } = global.APPCONFIG
    const homePage = pages[0]

    this.pushPage(homePage, launchParams[homePage])
  }

  initWorker() {
    const src = 'http://localhost:8000/worker.html'
    const guid = createGuid('worker')
    global.worker = createWorkerIframe(guid, src, (iframe) => {
      EventHub.emit(WORKERLOADED)
    })
  }

  pushPage(pagePath, pageConfig) {
    const src = `http://localhost:8000/render.html#${pagePath}`
    const guid = createGuid('render')
    const pageIframe = createRenderIframe(guid, src, iframe => {
      iframe.contentWindow.document.dispatchEvent(new CustomEvent('JSBridgeReady', {
        detail: {
          guid
        }
      }))
    })

    global.renders[guid] = pageIframe
    global.pagesStack.push(guid);

    this.setState({
      navConfig: {
        title: pageConfig.defaultTitle
      }
    })
  }


  render() {
    const { navConfig } = this.state;

    const isShowBackIcon = global.pagesStack.length > 1

    return (
      <div className={`${style.app} f-page flex-c`}>
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

        <div id="workerIframe" className={style.workerIframe}></div>
      </div>
    )
  }
}
