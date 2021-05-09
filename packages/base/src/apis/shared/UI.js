import { mapping } from '@/utils/bridge';

export const alert = {
  b(opt) {
    mapping(opt, {
      content: 'message%s',
      buttonText: 'button%s',
    });
  },
};
export const showLoading = {
  b(opt) {
    mapping(opt, {
      content: 'text%s',
    });
  },
};

export const hideLoading = {};
