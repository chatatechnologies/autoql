import './ChataPopover.css';

export function ChataPopover({ baseParent, placement = 'bottom', alignment = 'start', padding = 5, maxHeight } = {}) {
    var obj = document.createElement('div');
    obj.isOpen = false;
    obj.classList.add('autoql-vanilla-popover');

    obj.placement = placement;
    obj.alignment = alignment;

    obj.setPos = () => {
        const parentRect = baseParent.getBoundingClientRect();

        const position = {
            left: 0,
            top: 0,
        };

        if (!parentRect) {
            return;
        }

        parentRect.centerX = parentRect.left + parentRect.width / 2;
        parentRect.centerY = parentRect.top + parentRect.height / 2;

        const boundaryRect = document.documentElement.getBoundingClientRect();

        if (maxHeight && obj.placement === 'bottom' && parentReact.bottom + maxHeight > boundaryRect.bottom) {
            obj.placement = 'top';
        }

        if (obj.placement === 'top' || obj.placement === 'bottom') {
            if (obj.alignment === 'middle') {
                position.left = parentRect.centerX - obj.clientWidth / 2;
            } else if (obj.alignment === 'start') {
                position.left = parentRect.left;
            } else if (obj.alignment === 'end') {
                position.left = parentRect.right - obj.clientWidth;
            }
        } else if (obj.placement === 'left' || obj.placement === 'right') {
            if (obj.alignment === 'middle') {
                position.top = parentRect.centerY - obj.clientHeight / 2;
            } else if (obj.alignment === 'start') {
                position.top = parentRect.top;
            } else if (obj.alignment === 'end') {
                position.top = parentRect.bottom - obj.clientHeight;
            }
        }

        if (obj.placement === 'top') {
            position.top = parentRect.top - obj.clientHeight - padding;
        } else if (obj.placement === 'bottom') {
            position.top = parentRect.bottom + padding;
        } else if (obj.placement === 'right') {
            position.left = parentRect.right + padding;
        } else if (obj.placement === 'left') {
            position.left = parentRect.left - obj.clientWidth - padding;
        }

        const popoverRight = obj.clientWidth + position.left + padding;
        const screenRight = window.innerWidth;
        if (popoverRight > screenRight) {
            position.left = screenRight - obj.clientWidth - padding;
        }

        const popoverBottom = obj.clientHeight + position.top + padding;
        const screenBottom = window.innerHeight;
        if (popoverBottom > screenBottom) {
            position.top = screenBottom - obj.clientHeight - padding;
        }

        obj.position = position;
        obj.style.left = `${position.left}px`;
        obj.style.top = `${position.top}px`;
    };

    obj.show = () => {
        obj.isOpen = true;
        document.body.appendChild(obj);
        obj.setPos();
        return obj;
    };

    obj.close = () => {
        obj.isOpen = false;
        document.body.removeChild(obj);
    };

    return obj;
}
