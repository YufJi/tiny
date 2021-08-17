import { pageInitMap, componentBookmarks } from '../Model/common';

export default function checkIsComponent(route) {
  if (pageInitMap.has(route)) {
    return false;
  }

  if (componentBookmarks.has(route)) {
    return true;
  }

  throw new Error(`Page[${route}] not found. May be caused by: 1. Forgot to add page route in app.json. 2. Invoking Page() in async task.`);
}
