import trackerStore from './trackerStore';
import startsWith from './startsWith';
import getData from './getData';
import objectKeys from './objectKeys';

const DATASET_KEY = '$DATASET.';
function matchElement(view, element) {
  if (element.charAt(0) === '.') {
    const className = element.slice(1);
    const cs = view.props.className && view.props.className.trim().split(/\s+/);
    return cs && cs.indexOf(className) !== -1;
  } else if (element.charAt(0) === '#') {
    const viewId = view.props.id;
    const id = element.slice(1);
    return viewId === id;
  }
  return false;
}

export default function trackTap(instance) {
  const { trackerConfig } = trackerStore;

  if (trackerConfig) {
    // click
    const dataset = instance.props.$mp.getDataset();
    const $bridge = instance.props.$mp.bridge;
    trackerConfig.forEach((event) => {
      const { eventCode } = event;

      event.eventTarget.forEach(({ data, action, element }) => {
        if (matchElement(instance, element)) {
          const dataConfig = {};
          const datasetConfig = {};
          objectKeys(data).forEach((k) => {
            const c = data[k];
            if (startsWith(c, DATASET_KEY)) {
              datasetConfig[k] = c.slice(DATASET_KEY.length);
            } else {
              dataConfig[k] = c;
            }
          });
          const params = getData(dataset, datasetConfig);
          const method = action === 'collect' ? 'collectRemoteTrackerData' : 'reportRemoteTrackerData';
          $bridge[method](eventCode, {
            dataConfig,
            params,
          });
        }
      });
    });
  }
}
