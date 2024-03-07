import { uuidv4 } from '../Utils';
import './Popup.scss';

export function Popup() {
    const popup = document.createElement('div');
    popup.ID = `autoql-vanilla-select-popup-${uuidv4()}`;
    popup.classList.add('autoql-vanilla-select-popup');
    popup.classList.add(popup.ID);

    popup.show = ({ x, y }) => {
        popup.style.transform = `translate(${x}px, ${y}px)`;
        popup.style.visibility = 'visible';
        document.body.appendChild(popup);
    };

    popup.close = () => {
        popup.style.visibility = 'hidden';
        popup.remove();
    };

    return popup;
}
