import './StatusSwitch.scss';
import { ChataSlider } from '../../../../ChataComponents';

export function StatusSwitch({ status }) {
  console.log(status);
  const slider = new ChataSlider();
  const textStatus = document.createElement('span');
  textStatus.classList.add('autql-vanilla-switch-text');
  slider.classList.add('autoql-vanilla-switcher-status');
  textStatus.textContent = 'Active';
  slider.appendChild(textStatus);
  return slider;
}