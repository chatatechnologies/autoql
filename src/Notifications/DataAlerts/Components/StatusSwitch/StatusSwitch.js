import './StatusSwitch.scss';
import { ChataSlider } from '../../../../ChataComponents';

export function StatusSwitch({ status }) {
  console.log(status);
  const slider = new ChataSlider();
  const textStatus = document.createElement('span');
  textStatus.classList.add('autql-vanilla-switch-text');
  slider.classList.add('autoql-vanilla-switcher-status');
  textStatus.textContent = status;
  slider.appendChild(textStatus);

  slider.setOnChange(() => {
    if(slider.isChecked()) {
      textStatus.classList.add('left');
      textStatus.classList.remove('right');
    } else {
      textStatus.classList.add('right');
      textStatus.classList.remove('left');
    }
  })

  if(status === 'ACTIVE') {
    slider.setChecked(true);
    textStatus.classList.add('left');
  } else {
    slider.setChecked(false);
    textStatus.classList.add('right');
  }

  return slider;
}