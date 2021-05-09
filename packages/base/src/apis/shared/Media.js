import { mapping } from '@/utils/bridge';

export const chooseImage = {
  b: function b(opt) {
    opt.count = opt.count || 1;
    if (typeof opt.sourceType === 'string') {
      opt.sourceType = [opt.sourceType];
    }
  },
  a: function a(res) {
    mapping(res, {
      errorCode: 'error',
      errorDesc: 'errorMessage',
      localIds: 'apFilePaths',
      tempFilePaths: 'apFilePaths',
    });
    // android 返回字符串
    if (typeof res.apFilePaths === 'string') {
      res.apFilePaths = JSON.parse(res.apFilePaths);
    }
    res.tempFilePaths = res.apFilePaths;
  },
};

export const previewImage = {
  m: 'imageViewer',
  b: function b(opt) {
    mapping(opt, {
      current: 'init%d',
    });
    // 处理默认索引
    if (!opt.init) {
      opt.init = 0;
    }
    // 处理图片链接
    opt.images = [];
    (opt.urls || []).forEach((url) => {
      opt.images.push({
        u: url,
      });
    });
    delete opt.urls;
  },
};
