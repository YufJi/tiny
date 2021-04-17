
const app = {
  getCurrentPageImpl,
};
let currentPage;
function App() {
  return app;
}
function setCurrentPageImpl(page) {
  currentPage = page;
}
function getCurrentPageImpl() {
  return currentPage;
}
function getCurrentPagesImpl() {
  return [currentPage];
}
function getApp() {
  return app;
}
function getAppImpl() {
  return app;
}
function getCurrentPages() {
  return null;
}

export {
  App,
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getApp,
  getAppImpl,
  getCurrentPages,
};
