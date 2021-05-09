import React from 'react';
import { createComponent } from '@/framework/';

export default createComponent({
  pure: false,
  name: 'swiper-item',
})(({ children, style, className, id }) => {
  return React.createElement(
    'div',
    { style, className, id },
    children,
  );
});
