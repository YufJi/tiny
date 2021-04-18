
import React from 'react';
import { createComponent } from '@/framework/';

export default createComponent({
    pure: false,
    name: 'swiper-item'
})(function SwiperItem({ children, style, className, id }) {

    return React.createElement(
        'div',
        { style: style, className: className, id: id },
        children
    );
});

