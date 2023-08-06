import { getTimeOptionArray } from './helpers';
import { createIcon } from "../../../../Utils";
import { Selector } from "../../../Components/Selector/Selector";
import momentTZ from 'moment-timezone'
import { LIVE_ICON, CALENDAR } from '../../../../Svg';
import { 
  SCHEDULED_TYPE,
  CONTINUOUS_TYPE,
  SCHEDULE_INTERVAL_OPTIONS,
  WEEKDAY_NAMES_MON 
} from "autoql-fe-utils";
import './TimingView.scss';

export function TimingView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const settingGroup = document.createElement('div');
  const dataAlertSetting = document.createElement('div');
  const alertTypeWrapper = document.createElement('div');
  const alertTypeInputLabel = document.createElement('div');
  
  const dataAlertSettingGroup = document.createElement('div');
  const dataAlertSettingFrequency = document.createElement('div');
  const frequencyContainer = document.createElement('div');

  this.createSelectorValueWithSubtitle = ({ label, subtitle, icon }) => {
    const span = document.createElement('span');
    const labelContainer = document.createElement('span');
    const menuIcon = document.createElement('span');
    const labelValue = document.createElement('span');
    const subtitleContainer = document.createElement('span');
    
    labelContainer.classList.add('autoql-vanilla-menu-item-title');
    menuIcon.classList.add('autoql-vanilla-menu-icon');
    subtitleContainer.classList.add('autoql-vanilla-select-option-value-subtitle');
    
    labelValue.textContent = label;
    subtitleContainer.textContent = subtitle;
    
    menuIcon.appendChild(createIcon(icon));
    labelContainer.appendChild(menuIcon);
    labelContainer.appendChild(labelValue);
    span.appendChild(labelContainer);
    span.appendChild(subtitleContainer);
    
    return {
      displayName: labelContainer.innerHTML,
      displayText: span.innerHTML,
    }
  }

  this.getScheduleIntervalOptions = () => {
    const keys = Object.keys(SCHEDULE_INTERVAL_OPTIONS);
    return keys.map((key) => {
      const value = SCHEDULE_INTERVAL_OPTIONS[key];

      return {
        displayName: value.displayName,
        value: key,
      }
    });
  }

  this.getDaysOptions = () => {
    return WEEKDAY_NAMES_MON.map((dayName) => {
      return {
        value: dayName,
        displayName: `
        <span>
          on <strong>${dayName}</strong>
        </span>`
      }
    });
  }

  this.getTimeOptions = () => {
    return getTimeOptionArray().map((o) => {
      return {
        value: o.value,
        displayName: `<span>${o.value}</span>`
      }
    });
  }

  this.getTimeZoneOptions = () => {
    return momentTZ.tz.names().map((tz) => {
      return {
        value: tz,
        displayName: `<span>${tz}</span>`,
      }
    });
  }

  this.createConnector = () => {
    const connector = document.createElement('div');
    const t = document.createElement('span');

    connector.classList.add('autoql-vanilla-data-alert-frequency-option');
    connector.classList.add('autoql-vanilla-schedule-builder-at-connector');
    t.textContent = 'at';
    connector.appendChild(t);

    return connector
  }

  this.createFrequencyOption = ({ label, defaultValue, selectorOptions }) => {
    const option = document.createElement('div');
    const wrapperLabel = document.createElement('div');
    const selector = new Selector({
      defaultValue,
      options: selectorOptions,
    })
    
    wrapperLabel.classList.add('autoql-vanilla-select-and-label');
    option.classList.add('autoql-vanilla-data-alert-frequency-option');

    if(label) {
      const labelItem = document.createElement('div');
      labelItem.classList.add('autoql-vanilla-input-label');
      labelItem.textContent = label;
      wrapperLabel.appendChild(labelItem);
    }

    wrapperLabel.appendChild(selector);
    option.appendChild(wrapperLabel);

    return option;
  }
  
  this.getTypeValues = () => {
    const scheduledValues = this.createSelectorValueWithSubtitle({
      icon: CALENDAR,
      label: 'Scheduled',
      subtitle: 'Get notifications at specific times.',
    });
    
    const liveValues = this.createSelectorValueWithSubtitle({
      icon: LIVE_ICON,
      label: 'Live',
      subtitle: 'Get notifications as soon as the conditions are met.',
    });
    
    return [
      {
        value: SCHEDULED_TYPE,
        ...scheduledValues
      },
      {
        value: CONTINUOUS_TYPE,
        ...liveValues
      },
    ]
  }
  
  const typeSelector = new Selector({ defaultValue: 1, options: this.getTypeValues() });
  
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  settingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  dataAlertSetting.classList.add('autoql-vanilla-data-alert-setting');
  alertTypeWrapper.classList.add('autoql-vanilla-select-and-label');
  alertTypeWrapper.classList.add('autoql-vanilla-rule-condition-select');
  alertTypeWrapper.classList.add('autoql-vanilla-select-full-width');
  alertTypeInputLabel.classList.add('autoql-vanilla-input-label');
  dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-frequency-setting-group'); 
  dataAlertSettingFrequency.classList.add('autoql-vanilla-frequency-settings');
  frequencyContainer.classList.add('autoql-vanilla-data-alert-frequency-options-container');

  title.textContent = 'Timing';
  alertTypeInputLabel.textContent = 'Alert Type';

  const intervalContainer = this.createFrequencyOption({
    label: 'Send a Notification',
    defaultValue: 1,
    selectorOptions: this.getScheduleIntervalOptions()
  });

  const daysContainer = this.createFrequencyOption({
    defaultValue: 1,
    selectorOptions: this.getDaysOptions()
  });

  const timeContainer = this.createFrequencyOption({
    defaultValue: 1,
    selectorOptions: this.getTimeOptions()
  });
  
  const timeeZoneContainer = this.createFrequencyOption({
    label: 'Time Zone',
    defaultValue: 1,
    selectorOptions: this.getTimeZoneOptions()
  });

  frequencyContainer.appendChild(intervalContainer);
  frequencyContainer.appendChild(daysContainer);
  frequencyContainer.appendChild(this.createConnector());
  frequencyContainer.appendChild(timeContainer);
  frequencyContainer.appendChild(timeeZoneContainer);
  
  dataAlertSettingFrequency.appendChild(frequencyContainer);
  dataAlertSettingGroup.appendChild(dataAlertSettingFrequency);
  alertTypeWrapper.appendChild(alertTypeInputLabel);
  alertTypeWrapper.appendChild(typeSelector);
  dataAlertSetting.appendChild(alertTypeWrapper);
  settingGroup.appendChild(dataAlertSetting);
  settingGroup.appendChild(dataAlertSettingGroup);
  wrapper.appendChild(settingGroup);
  container.appendChild(title);
  container.appendChild(wrapper);

  return container;
}