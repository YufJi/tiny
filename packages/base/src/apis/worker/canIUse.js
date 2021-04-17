
import {
  isNativeComponent,
  compareSystemVersion,
} from '@/utils/system';
import objectKeys from '@/utils/objectKeys';
import upperFirstChar from '@/utils/upperFirstChar';
import loadExtraRes from '@/utils/loadExtraRes';
import extraComponentMap from '@/utils/extraComponentMap';
import extraAPIMap from '@/utils/extraAPIMap';

const g10135 = Object(compareSystemVersion)('10.1.35') >= 0;
const g10138 = Object(compareSystemVersion)('10.1.38') >= 0;
const g10150 = Object(compareSystemVersion)('10.1.50') >= 0;
const uses = {
  alert: {
    object: {
      confirmColor: g10138,
    },
  },
  confirm: {
    object: {
      cancelColor: g10138,
      confirmColor: g10138,
    },
  },
  prompt: {
    object: {
      cancelColor: g10138,
      confirmColor: g10138,
    },
  },
  navigateToMiniProgram: {
    object: {
      envVersion: 1,
      version: g10135,
    },
  },
  navigateToMiniService: {
    object: {
      servicePage: 1,
    },
  },
  showActionSheet: {
    object: {
      badges: 1,
    },
  },
  camera: g10135 && isNativeComponent,
  createCanvasContext: {
    return: {
      measureText: 1,
      getImageData: 1,
      putImageData: 1,
      globalCompositeOperation: 1,
      draw: {
        callback: 1,
      },
    },
  },
  createVideoContext: {
    return: {
      mute: 1,
      stop: 1,
    },
  },
  chooseImage: {
    object: {
      sizeType: 1,
    },
    return: {
      tempFiles: 1,
    },
  },
  component: 1,
  cdp: isNativeComponent,
  page: {
    onOptionMenuClick: 1,
    setData: {
      callback: 1,
    },
    $spliceData: 1,
    onPopMenuClick: g10135,
    onTabItemTap: g10135,
  },
  getLocation: {
    object: {
      type: 1,
    },
  },
  button: {
    'open-type': {
      share: 1,
      lifestyle: g10135,
      launchApp: g10135,
      getAuthorize: g10135,
      contactShare: g10135,
    },
  },
  datePicker: {
    object: {
      format: {
        yyyy: 1,
        'yyyy-MM': 1,
      },
    },
  },
  getImageInfo: {
    return: {
      orientation: 1,
      type: 1,
    },
  },
  getSystemInfo: {
    return: {
      storage: 1,
      currentBattery: 1,
      brand: 1,
      fontSizeSetting: 1,
    },
  },
  getRecorderManager: {
    onFrameRecorded: g10138,
    offFrameRecorded: g10138,
    pause: g10150,
    resume: g10150,
    onPause: g10150,
    offPause: g10150,
    onResume: g10150,
    offResume: g10150,
  },
  favorite: 1,
  form: {
    'report-submit': 1,
  },
  lifestyle: 1,
  'live-player': g10135 && isNativeComponent,
  'live-pusher': g10135 && isNativeComponent,
  lottie: g10135 && isNativeComponent,
  connectSocket: {
    object: {
      protocols: 1,
      multiple: g10135,
    },
    return: {
      send: g10135,
      close: g10135,
      onMessage: g10135,
      onOpen: g10135,
      onClose: g10135,
      onError: g10135,
      offMessage: g10135,
      offOpen: g10135,
      offClose: g10135,
      offError: g10135,
    },
  },
  closeSocket: {
    object: {
      code: 1,
      reason: 1,
    },
  },
  scan: {
    object: {
      hideAlbum: 1,
    },
  },
  'contact-button': {
    'ext-info': 1,
    size: 1,
    color: 1,
    icon: 1,
  },
  'web-view': {
    'app-id': 1,
  },
  input: {
    controlled: 1,
    'random-number': 1,
    'confirm-type': isNativeComponent,
    'confirm-hold': isNativeComponent,
    cursor: isNativeComponent,
    'selection-start': isNativeComponent,
    'selection-end': isNativeComponent,
  },
  switch: {
    controlled: 1,
  },
  textarea: {
    controlled: 1,
    fixed: g10135 && isNativeComponent,
    cursorSpacing: g10135 && isNativeComponent,
    cursor: g10135 && isNativeComponent,
    showConfirmBar: g10135 && isNativeComponent,
    selectionStart: g10135 && isNativeComponent,
    selectionEnd: g10135 && isNativeComponent,
    adjustPosition: g10135 && isNativeComponent,
  },
  checkbox: {
    controlled: 1,
  },
  video: {
    'initial-time': isNativeComponent,
    loop: isNativeComponent,
    muted: isNativeComponent,
    'show-fullscreen-btn': isNativeComponent,
    'show-center-play-btn': isNativeComponent,
    onLoading: isNativeComponent,
    onStop: isNativeComponent,
    direction: g10138 && isNativeComponent,
    onFullScreenChange: g10138 && isNativeComponent,
  },
  view: {
    onTransitionEnd: 1,
    onAnimationStart: 1,
    onAnimationIteration: 1,
    onAnimationEnd: 1,
    onAppear: 1,
    onDisappear: 1,
    onFirstAppear: 1,
  },
  'scroll-view': {
    'enable-back-to-top': g10135,
  },
  'cover-view': isNativeComponent,
  'cover-image': isNativeComponent,
  createWorker: g10135,
  downloadFile: {
    return: {
      abort: g10135,
      onProgressUpdate: g10135,
    },
  },
  uploadFile: {
    return: {
      abort: g10135,
      onProgressUpdate: g10135,
    },
  },
  'rich-text': 1,
};
function canIUse(bridge, name) {
  const parts = name.split('.');
  if (parts.length === 1 && bridge[parts[0]]) {
    return true;
  }
  let end = uses;
  // 动态挂载二方组件caniuse配置
  if (!uses[parts[0]] && objectKeys(extraComponentMap).indexOf(parts[0]) > -1) {
    loadExtraRes(extraComponentMap[parts[0]]);
    const extraComponentName = parts[0].split('-').map((item) => {
      return upperFirstChar(item);
    }).join('');
    // 挂载到global下
    if (global[`MP${extraComponentName}`]) {
      uses[parts[0]] = global[`MP${extraComponentName}`].canIUse;
    } else {
      console.error(`component ${parts[0]}'s canIUse is invalid`);
    }
  }
  // 动态加载二方API的caniuse配置
  // 还需要考虑ns，目前只考虑ap这个命名空间
  let extraAPIName = parts[0];
  let needLoadExtraAPICanIUse = false;
  if (['ap'].indexOf(parts[0]) > -1 && parts.length > 1) {
    uses[parts[0]] = uses[parts[0]] || {};
    extraAPIName = `${parts[0]}.${parts[1]}`;
    needLoadExtraAPICanIUse = !uses[parts[0]][parts[1]];
  } else {
    needLoadExtraAPICanIUse = !uses[parts[0]];
  }
  if (needLoadExtraAPICanIUse && objectKeys(extraAPIMap).indexOf(extraAPIName) > -1) {
    loadExtraRes(extraAPIMap[extraAPIName]);
    const realExtraAPIName = extraAPIName.split('.')[extraAPIName.split('.').length - 1];
    // 挂载到global下
    const realExtraAPI = global[`MP${upperFirstChar(realExtraAPIName)}`];
    if (realExtraAPI) {
      if (parts.length > 1) {
        uses[parts[0]][parts[1]] = realExtraAPI.canIUse;
      } else {
        uses[parts[0]] = realExtraAPI.canIUse;
      }
    } else {
      console.error(`API ${extraAPIName}'s canIUse is invalid`);
    }
  }
  for (let i = 0; i < parts.length; i++) {
    end = end[parts[i]];
    if (!end) {
      return false;
    }
  }
  return true;
}

export default canIUse;
