import { uuidv4 } from '../Utils';

import '../../css/PopoverChartSelector.css';

const clickedOutsideBounds = (e, popover) => {
    if (!popover?.position) {
        return false;
    }

    if (e.x < popover.position.left) {
        return true;
    }
    if (e.y < popover.position.top) {
        return true;
    }
    if (e.x > popover.position.left + popover.clientWidth) {
        return true;
    }
    if (e.y > popover.position.top + popover.clientHeight) {
        return true;
    }
    return false;
};

export function PopoverChartSelector(
    evt,
    placement = 'bottom',
    alignment = 'start',
    padding = 5,
    className,
    maxHeight,
) {
    this.popoverID = uuidv4();

    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');
    popover.classList.add(this.popoverID);

    if (className) {
        popover.classList.add(className);
    }

    popover.target = evt.srcElement;

    popover.placement = placement.toLowerCase?.();
    if (!['top', 'bottom', 'left', 'right'].includes(popover.placement)) {
        popover.placement = 'bottom';
    }

    popover.alignment = alignment.toLocaleLowerCase?.();
    if (!['start', 'middle', 'end'].includes(popover.alignment)) {
        popover.alignment = 'start';
    }

    popover.position = {
        left: 0,
        top: 0,
    };

    popover.setPosition = () => {
        var bbox = popover.target?.getBoundingClientRect?.();

        var position = {
            left: 0,
            top: 0,
        };

        if (!bbox) {
            return;
        }

        bbox.centerX = bbox.left + bbox.width / 2;
        bbox.centerY = bbox.top + bbox.height / 2;

        const boundaryRect = document.documentElement.getBoundingClientRect();

        if (maxHeight && popover.placement === 'bottom' && bbox.bottom + maxHeight > boundaryRect.bottom) {
            popover.placement = 'top';
        }

        if (popover.placement === 'top' || popover.placement === 'bottom') {
            if (popover.alignment === 'middle') {
                position.left = bbox.centerX - popover.clientWidth / 2;
            } else if (popover.alignment === 'start') {
                position.left = bbox.left;
            } else if (popover.alignment === 'end') {
                position.left = bbox.right - popover.clientWidth;
            }
        } else if (popover.placement === 'left' || popover.placement === 'right') {
            if (popover.alignment === 'middle') {
                position.top = bbox.centerY - popover.clientHeight / 2;
            } else if (popover.alignment === 'start') {
                position.top = bbox.top;
            } else if (popover.alignment === 'end') {
                position.top = bbox.bottom - popover.clientHeight;
            }
        }

        if (popover.placement === 'top') {
            position.top = bbox.top - popover.clientHeight - padding;
        } else if (popover.placement === 'bottom') {
            position.top = bbox.bottom + padding;
        } else if (popover.placement === 'right') {
            position.left = bbox.right + padding;
        } else if (popover.placement === 'left') {
            position.left = bbox.left - popover.clientWidth - padding;
        }

        const popoverRight = popover.clientWidth + position.left + padding;
        const screenRight = window.innerWidth;
        if (popoverRight > screenRight) {
            position.left = screenRight - popover.clientWidth - padding;
        }

        const popoverBottom = popover.clientHeight + position.top + padding;
        const screenBottom = window.innerHeight;
        if (popoverBottom > screenBottom) {
            position.top = screenBottom - popover.clientHeight - padding;
        }

        popover.classList.remove('autoql-vanilla-popover-selector--top');
        popover.classList.remove('autoql-vanilla-popover-selector--bottom');
        popover.classList.add(`autoql-vanilla-popover-selector--${popover.placement}`);

        popover.position = position;
        popover.style.left = `${position.left}px`;
        popover.style.top = `${position.top}px`;
    };

    popover.show = () => {
        popover.style.visibility = 'visible';
        popover.classList.remove('autoql-vanilla-popover-selector-hidden');
        popover.setPosition();

        setTimeout(() => {
            document.body.addEventListener('click', popover.onClickOutside);
            popover.setPosition();
        }, 100);

        return popover;
    };

    popover.onClickOutside = (e) => {
        if (clickedOutsideBounds(e, popover)) {
            popover.close();
        }
    };

    popover.toggleVisibility = () => {
        if (popover.style.visibility === 'visible') {
            popover.close();
        } else {
            popover.show();
        }
    };

    popover.close = () => {
        popover.style.visibility = 'hidden';
        popover.classList.add('autoql-vanilla-popover-selector-hidden');
        document.body.removeEventListener('click', popover.onClickOutside);
    };

    popover.destroy = () => {
        popover.parentElement?.removeChild?.(popover);
        document.body.removeEventListener('click', popover.onClickOutside);
    };

    popover.appendContent = (elem) => {
        popover.appendChild(elem);
        popover.setPosition();
    };

    popover.style.opacity = 1;

    document.body.appendChild(popover);

    return popover;
}
