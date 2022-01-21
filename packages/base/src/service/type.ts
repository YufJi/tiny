export interface Component {
   is: string;
   id: string;
   className: string;

   lifetimes: Record<string, any>;
}

export interface Page {
  implement: any;
  webviewId: string | number;
  route: string;
  query?: Record<string, any>;
  __params__?: Record<string, any>;
  loaded: boolean;
  opener?: any;
}
