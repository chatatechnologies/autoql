import tippy, { delegate } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const maxWidth = 300

export function refreshDelegate(parent, target){
    delegate(parent, {
        target: target,
        theme: 'chata-theme',
        allowHTML: true,
        delay: [500],
        maxWidth,
    });
}

export function refreshTooltips(){
    tippy('[data-tippy-content]', {
        theme: 'chata-theme',
        allowHTML: true,
        delay: [500],
        dynamicTitle: true,
        maxWidth,
    })
}
