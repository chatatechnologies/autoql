import './DataAlertItem.scss';

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
    value.textContent = text;

    wrapperContent.appendChild(value);
    content.appendChild(wrapperContent);
    section.appendChild(content);

    row.appendChild(section);
  }

  createCol('autoql-vanilla-notification-setting-display-name', title)
  createCol('autoql-vanilla-data-alert-list-item-section-frequency', title)
  createCol('autoql-vanilla-data-alert-list-item-section-state', title)
  createCol('autoql-vanilla-data-alert-list-item-section-next-check', title)
  createCol('autoql-vanilla-data-alert-list-item-section-status', status)

  item.appendChild(row);

  return item;
}