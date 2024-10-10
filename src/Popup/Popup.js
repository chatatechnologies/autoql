import { uuidv4 } from '../Utils';
import './Popup.scss';

export function Popup() {
    const popup = document.createElement('div');
    popup.ID = `autoql-vanilla-select-popup-${uuidv4()}`;
    popup.classList.add('autoql-vanilla-select-popup');
    popup.classList.add(popup.ID);

    const clickedOutsideBounds = (e, popover) => {
        const popoverPosition = popover?.getBoundingClientRect();

        if (!popoverPosition) {
            return false;
        }

        if (e.x < popoverPosition.left) {
            return true;
        }
        if (e.y < popoverPosition.top) {
            return true;
        }
        if (e.x > popoverPosition.left + popover.clientWidth) {
            return true;
        }
        if (e.y > popoverPosition.top + popover.clientHeight) {
            return true;
        }
        return false;
    };

    const checkClickBounds = (e) => {
        try {
            if (popup.visible) {
                const isOutsideBounds = clickedOutsideBounds(e, popup);

                if (isOutsideBounds) {
                    e.stopPropagation();
                    popup?.close();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    popup.show = ({ x, y }) => {
        try {
            popup.visible = true;
            popup.style.transform = `translate(${x}px, ${y}px)`;
            popup.style.visibility = 'visible';
            document.body.appendChild(popup);

            document.addEventListener('mousedown', checkClickBounds);
        } catch (error) {
            console.error(error);
        }
    };

    popup.close = () => {
        try {
            document.removeEventListener('mousedown', checkClickBounds);

            popup.visible = false;
            popup.style.visibility = 'hidden';
            popup.remove();
        } catch (error) {
            console.error(error);
        }
    };

    return popup;
}
