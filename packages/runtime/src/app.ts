import { subscribe } from '@tiny/bridge';
import { type AppLaunchOptions, type AppShowOptions, triggerAppShow, triggerAppHide } from '@tiny/apis';
import { env } from './env';
import { NativeEvent } from './const';

let appInstance: App | null = null;

class App {
  is = 'App';

  public globalData: any;
  onLaunch?: (options: AppLaunchOptions) => void;
  onShow?: (options: AppShowOptions) => void;
  onHide?: () => void;
  onPageNotFound?: (options: AppPageNotFoundOptions) => void;

  constructor(options: AppOptions) {
    const { globalData, onLaunch, onShow, onHide, onPageNotFound } = options;
    this.globalData = globalData;
    this.onLaunch = onLaunch;
    this.onShow = onShow;
    this.onHide = onHide;
    this.onPageNotFound = onPageNotFound;

    this.load();
  }

  private load() {
    this.onLaunch?.(env.appLaunchOptions);
    this.onShow?.(env.appLaunchOptions);

    subscribe(NativeEvent.AppShow, (options: AppShowOptions) => {
      this.onShow?.(options);
      triggerAppShow(options);
    })

    subscribe(NativeEvent.AppHide, () => {
      this.onHide?.();
      triggerAppHide();
    })
  }
}

export function registryApp(options: AppOptions) {
  if (appInstance) {
    return;
  }
  appInstance = new App(options);
}

export function getApp() {
  return appInstance;
}

