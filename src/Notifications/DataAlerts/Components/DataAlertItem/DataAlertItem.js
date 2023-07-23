import './DataAlertItem.scss';
import { getScheduleFrequencyObject, formatNextScheduleDate } from 'autoql-fe-utils';

export function DataAlertItem({ dataAlert }) {
  console.log(dataAlert);
  const item = document.createElement('div');
  const row = document.createElement('div');
  item.classList.add('autoql-vanilla-notification-setting-item');
  row.classList.add('autoql-vanilla-notification-setting-item-header');

  const {
    title,
    schedules,
    status,
  } = dataAlert;

  const createCol = (className, text) => {
    const section = document.createElement('div');
    const content = document.createElement('div');
    const wrapperContent = document.createElement('span');
    const value = document.createElement('span');

    section.classList.add('autoql-vanilla-data-alert-list-item-section');
    section.classList.add(className);
    content.classList.add('autoql-vanilla-data-alert-section-content');
    value.innerHTML = text;

    wrapperContent.appendChild(value);
    content.appendChild(wrapperContent);
    section.appendChild(content);

    row.appendChild(section);
  }

  const renderDataAlertCycleStart = () => {
    
  }

  createCol('autoql-vanilla-notification-setting-display-name', title);
  createCol('autoql-vanilla-data-alert-list-item-section-frequency', getScheduleFrequencyObject(dataAlert).displayText);
  createCol('autoql-vanilla-data-alert-list-item-section-state', title);
  createCol('autoql-vanilla-data-alert-list-item-section-next-check', formatNextScheduleDate(dataAlert.schedules, true));
  createCol('autoql-vanilla-data-alert-list-item-section-status', status);

  item.appendChild(row);

  return item;
}