import './DataAlertHeader.scss';

export function DataAlertHeader() {
  const labelsMap = [
    {name: 'Data Alert Name', className: 'autoql-vanilla-notification-setting-display-name-header'},
    {name: 'Notification Frequency', className: 'autoql-vanilla-data-alert-list-item-section-frequency-header'},
    {name: 'State', className: 'autoql-vanilla-data-alert-list-item-section-state-header'},
    {name: 'Next Check', className: 'autoql-vanilla-data-alert-list-item-section-next-check-header'},
    {name: 'Status', className: 'autoql-vanilla-data-alert-list-item-section-status-header'},
    {name: 'Actions', className: 'autoql-vanilla-data-alert-list-item-section-actions-header'}
  ];
  const item = document.createElement('div');
  const row = document.createElement('div');
  item.classList.add('autoql-vanilla-notification-setting-item');
  row.classList.add('autoql-vanilla-notification-setting-item-header');

  const createCol = (className, element) => {
    const section = document.createElement('div');
    const content = document.createElement('div');
    const wrapperContent = document.createElement('span');
    const value = document.createElement('span');

    section.classList.add('autoql-vanilla-data-alert-list-item-section');
    section.classList.add(className);
    content.classList.add('autoql-vanilla-data-alert-section-content');

    value.textContent = element;
    wrapperContent.appendChild(value);
    content.appendChild(wrapperContent);
    section.appendChild(content);

    row.appendChild(section);

    return section;
  }

  labelsMap.forEach((label) => {
    createCol(label.className, label.name);
  });

  item.appendChild(row);

  return item;
}