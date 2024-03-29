import './StatusSwitch.scss';
import { ChataSlider } from '../../../../ChataComponents';
import { DATA_ALERT_STATUSES } from 'autoql-fe-utils';

const statusMap = {
  [DATA_ALERT_STATUSES.ACTIVE]: 'Active',
  [DATA_ALERT_STATUSES.WAITING]: 'Active', 
  [DATA_ALERT_STATUSES.RETRY]: 'Active', 
  [DATA_ALERT_STATUSES.INACTIVE]: 'Inactive',
  [DATA_ALERT_STATUSES.EVALUATION_ERROR]: 'Inactive',
  [DATA_ALERT_STATUSES.GENERAL_ERROR]: 'Inactive',
}

export function StatusSwitch({ status, onChange }) {
  const slider = new ChataSlider();
  const textStatus = document.createElement('span');
  textStatus.classList.add('autql-vanilla-switch-text');
  slider.classList.add('autoql-vanilla-switcher-status');
  textStatus.textContent = statusMap[status];
  slider.appendChild(textStatus);

  slider.setOnChange(async () => {
    if(slider.isChecked()) {
      textStatus.classList.add('left');
      textStatus.classList.remove('right');
      textStatus.textContent = 'Active';
      await onChange({ status: DATA_ALERT_STATUSES.ACTIVE });
    } else {
      textStatus.classList.add('right');
      textStatus.classList.remove('left');
      textStatus.textContent = 'Inactive';
      await onChange({ status: DATA_ALERT_STATUSES.INACTIVE });
    }
  })

  if(['ACTIVE', 'WAITING', 'RETRY'].includes(status)) {
    slider.setChecked(true);
    textStatus.classList.add('left');
  } else {
    slider.setChecked(false);
    textStatus.classList.add('right');
  }

  return slider;
}