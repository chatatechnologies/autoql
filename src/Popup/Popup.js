import { uuidv4 } from '../Utils';
import './Popup.scss';

export function Popup() {
    const popup = document.createElement('div');
    popup.ID = `autoql-vanilla-select-popup-${uuidv4()}`;
    popup.classList.add('autoql-vanilla-select-popup');
    popup.classList.add(popup.ID);

    const checkClickBounds = (e) => {
        console.log(e);
    };

    popup.show = ({ x, y }) => {
        document.addEventListener('click', checkClickBounds);
        popup.style.transform = `translate(${x}px, ${y}px)`;
        popup.style.visibility = 'visible';
        document.body.appendChild(popup);
    };

    popup.close = () => {
        document.removeEventListener('click', checkClickBounds);
        popup.style.visibility = 'hidden';
        popup.remove();
    };

    return popup;
}
