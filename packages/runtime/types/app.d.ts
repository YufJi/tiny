import type { AppLaunchOptions, AppShowOptions } from '@tiny/apis';

declare global {
  type AppOptions = {
    globalData: any;
    onLaunch?: (options: AppLaunchOptions) => void;
    onShow?: (options: AppShowOptions) => void;
    onHide?: () => void;
    onPageNotFound?: (options: AppPageNotFoundOptions) => void;
  }

  type AppPageNotFoundOptions = {
    path: string;
    query: Record<string, any>;
    isEntryPage: boolean;
  }
}