
import { mapping } from '../../utils/bridge';

export const alert = {
  b: function b(opt) {
    mapping(opt, {
      content: 'message%s',
      buttonText: 'button%s',
    });
  },
};
export const showLoading = {
  b: function b(opt) {
    mapping(opt, {
      content: 'text%s',
    });
  },
};
export const hideLoading = {};
