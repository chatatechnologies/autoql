import './Popup.scss'

export function Popup() {
  const popup = document.createElement('div');
  popup.classList.add('autoql-vanilla-select-popup');

  popup.show = ({ x,  y}) => {
    popup.style.transform = `translate(${x}px, ${y}px)`;
    popup.style.visibility = 'visible';
    document.body.appendChild(popup);
  }

  popup.close = () => {
    popup.style.visibility = 'hidden';
    document.body.removeChild(popup);
  }

  return popup;
}