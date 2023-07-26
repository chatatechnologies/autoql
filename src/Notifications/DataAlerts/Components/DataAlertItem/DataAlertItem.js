import './DataAlertItem.scss';
import { getScheduleFrequencyObject, formatNextScheduleDate, resetDateIsFuture, SCHEDULED_TYPE } from 'autoql-fe-utils';
import { CALENDAR, CHECK, SETTINGS, TRASH_ICON } from '../../../../Svg';
import { createIcon } from '../../../../Utils';
import { StatusSwitch } from '../StatusSwitch';
import { updateDataAlertStatus, DATA_ALERT_ENABLED_STATUSES } from 'autoql-fe-utils';

export function DataAlertItem({ dataAlert, authentication }) {
  console.log(dataAlert);
  const item = document.createElement('div');
  const row = document.createElement('div');
  item.classList.add('autoql-vanilla-notification-setting-item');
  row.classList.add('autoql-vanilla-notification-setting-item-header');

  const {
    title,
    status,
    id,
    type
  } = dataAlert;

  const isEnabled = (s) => DATA_ALERT_ENABLED_STATUSES.includes(s)
  
  const toggleAlertStatusView = (s) => {
    if(isEnabled(s)) {
      item.classList.remove('autoql-vanilla-data-alert-disabled');
    } else {
      item.classList.add('autoql-vanilla-data-alert-disabled');
    }
    const newState = createCol('autoql-vanilla-data-alert-list-item-section-state', getState());
    row.replaceChild(newState, item.elementState);
    item.elementStatestate = newState;
  }

  const createCol = (className, element) => {
    const section = document.createElement('div');
    const content = document.createElement('div');
    const wrapperContent = document.createElement('span');
    const value = document.createElement('span');

    section.classList.add('autoql-vanilla-data-alert-list-item-section');
    section.classList.add(className);
    content.classList.add('autoql-vanilla-data-alert-section-content');

    if(typeof element === 'string') {
      value.innerHTML = element;
    }else {
      value.appendChild(element);
      console.log(element);
    }

    wrapperContent.appendChild(value);
    content.appendChild(wrapperContent);
    section.appendChild(content);

    row.appendChild(section);

    return section;
  }

  const hasError = () => {
    return (
      dataAlert.status === 'GENERAL_ERROR' ||
      dataAlert.status === 'EVALUATION_ERROR' ||
      dataAlert.status === 'DATA_RETURN_ERROR'
    )
  }

  const createStatusElement = (text, displayIcon, className) => {
    const statusContainer = document.createElement('div');
    const textWrapper = document.createElement('span');
    textWrapper.textContent = text;
    const icon = createIcon(displayIcon);
    statusContainer.appendChild(icon);
    statusContainer.appendChild(textWrapper);
    statusContainer.classList.add('autoql-vanilla-data-alert-state');
    statusContainer.classList.add(className);
    return statusContainer;
  }

  const getState = () => {
    const nextScheduledDate = formatNextScheduleDate(dataAlert.schedules);

    if (dataAlert.status === 'ACTIVE' && dataAlert.notification_type === SCHEDULED_TYPE) {
      let tooltip = 'This Alert runs on a schedule'
      if (nextScheduledDate) {
        tooltip = `${tooltip} - a notification is scheduled for ${nextScheduledDate}. If your data hasn't changed by then, you will not receive a notification.`
      }
      return createStatusElement('Scheduled', CALENDAR, 'autoql-vanilla-data-alert-scheduled');
    }

    return createStatusElement('Ready', CHECK, 'autoql-vanilla-data-alert-ready');
  }

  const getDataAlertCycleStart = () => {
    if (hasError()) {
      return '-';
    }
    if (dataAlert.notification_type === SCHEDULED_TYPE) {
      const nextScheduledDate = formatNextScheduleDate(dataAlert.schedules, true);
      if (!nextScheduledDate) {
        return '-';
      }
      return `<span>${nextScheduledDate}</span>`;
    }

    if (!dataAlert.reset_date || !resetDateIsFuture(dataAlert)) {
      const evaluationFrequency = dataAlert.evaluation_frequency ?? DEFAULT_EVALUATION_FREQUENCY
      return `< ${evaluationFrequency}m`;
    }

    return `<span>${formatResetDate(dataAlert, true)}</span>`;
  }

  const onStatusChange = async ({ status }) => {
    const response = await updateDataAlertStatus({ dataAlertId: id, type, status, ...authentication });
    dataAlert.status = status;
    toggleAlertStatusView(status)
    return response;
  }

  const createActionButton = (icon, className) => {
    const btn = document.createElement('div');
    btn.classList.add('autoql-vanilla-notification-action-btn');
    btn.appendChild(createIcon(icon));
    btn.classList.add(className);

    return btn
  }

  const createActions = () => {
    const actionWrapper = document.createElement('div');
    const settingsButton = createActionButton(SETTINGS, 'autoql-vanilla-notification-action-btn-settings'); 
    const deleteButton = createActionButton(TRASH_ICON, 'autoql-vanilla-notification-action-btn-delete');
    actionWrapper.classList.add('autoql-vanilla-action-buttons-section');
    actionWrapper.appendChild(settingsButton);
    actionWrapper.appendChild(deleteButton);

    item.actionButtons = createCol('autoql-vanilla-data-alert-list-item-section-actions', actionWrapper);
  }

  item.elementTitle = createCol('autoql-vanilla-notification-setting-display-name', title);
  item.elementFrequency = createCol('autoql-vanilla-data-alert-list-item-section-frequency', getScheduleFrequencyObject(dataAlert).displayText);
  item.elementState = createCol('autoql-vanilla-data-alert-list-item-section-state', getState());
  item.elementCycleStart = createCol('autoql-vanilla-data-alert-list-item-section-next-check', getDataAlertCycleStart());
  item.elementStatus = createCol('autoql-vanilla-data-alert-list-item-section-status', new StatusSwitch({ onChange: onStatusChange, status }));

  item.appendChild(row);

  toggleAlertStatusView(status);
  createActions();

  return item;
}