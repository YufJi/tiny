const events: Record<string, Array<(options?: any) => void>> = {
  show: [],
  hide: [],
}

export type AppShowOptions = {
  path: string;
  query: Record<string, any>;
}

export function onAppShow(callback: (options: AppShowOptions) => void) {
  events.show.push(callback);
}

export function onAppHide(callback: () => void) {
  events.hide.push(callback);
}

export function offAppShow(callback: (options: AppShowOptions) => void) {
  if (!callback) {
    events.show = [];
    return;
  }

  const index = events.show.indexOf(callback);
  if (index !== -1) {
    events.show.splice(index, 1);
  }
}

export function offAppHide(callback: () => void) {
  if (!callback) {
    events.hide = [];
    return;
  }

  const index = events.hide.indexOf(callback);
  if (index !== -1) {
    events.hide.splice(index, 1);
  }
}

export function triggerAppShow(options: AppShowOptions) {
  events.show.forEach((callback) => {
    callback(options);
  });
}

export function triggerAppHide() {
  events.hide.forEach((callback) => {
    callback();
  });
}