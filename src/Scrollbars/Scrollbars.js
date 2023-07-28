import PerfectScrollbar from 'perfect-scrollbar';

import './Scrollbars.scss';

export function Scrollbars(element, options = {}) {
    const scrollbar = new PerfectScrollbar(element, {
        wheelPropagation: false,
        scrollXMarginOffset: 5,
        scrollYMarginOffset: 5,
        minScrollbarLength: 10,
        ...options,
    });

    return scrollbar;
}
