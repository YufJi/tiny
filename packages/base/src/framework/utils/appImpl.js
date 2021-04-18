
let appImpl;
const g = self;

export function setAppImpl(app) {
  appImpl = app;
  g.__appImpl = appImpl;
}

export function getAppImpl() {
  return appImpl;
}
