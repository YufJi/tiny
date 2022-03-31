import { set, toPath } from 'lodash';
import { CustomEvent } from 'shared';
import { invokeWebview } from '../bridge';

const { ComponentDataChange, AppDataChange } = CustomEvent;
const setDataTask = new WeakMap();

export function afterSetData(model, callback) {
  const task = setDataTask.get(model);

  if (task) {
    task.queue.push(callback);
  } else {
    callback.call(model);
  }
}

export function addSetDataTask(model, data, userCallback) {
  let task = setDataTask.get(model);

  if (!task) {
    const updateData = () => {
      const current = setDataTask.get(model);

      if (current) {
        setDataTask.delete(model);

        let updateTask;

        if (model.__nodeId__) {
          updateTask = invokeWebview(ComponentDataChange, {
            data: current.data,
            nodeId: model.__nodeId__,
          }, model.__webviewId__);
        } else {
          updateTask = invokeWebview(AppDataChange, {
            data: current.data,
            options: {},
          }, model.__webviewId__);
        }

        current.queue.forEach((callback) => {
          return callback.call(model);
        });

        updateTask.then(() => {
          current.userCallbacks.forEach((userCallback) => {
            return userCallback.call(model);
          });
        });
      }
    };

    task = {
      data: {},
      promise: microTask().then(updateData),
      queue: [],
      userCallbacks: [],
    };
    setDataTask.set(model, task);
  }

  for (let i = 0; i < Object.entries(data).length; i+=1) {
    const [key, value] = Object.entries(data)[i];
    // data的细微变动传入任务中
    task.data[key] = value;

    set(model.data, key, value);
  }

  if (userCallback) {
    task.userCallbacks.push(userCallback);
  }

  return task.promise;
}

function microTask(cb?) {
  if (cb) {
    Promise.resolve().then(cb);
  } else {
    return Promise.resolve();
  }
}
