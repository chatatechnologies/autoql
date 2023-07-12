import PerfectScrollbar from 'perfect-scrollbar'

import './Scrollbars.scss'

export function Scrollbars(element, options = {}) {
    const scrollbar = new PerfectScrollbar(element, {
            wheelPropagation: false,
            scrollingThreshold: 200,
            scrollXMarginOffset: 5,
            scrollYMarginOffset: 5,
        ...options,
    })

    return scrollbar
}