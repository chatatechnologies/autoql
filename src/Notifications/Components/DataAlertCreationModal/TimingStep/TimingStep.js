import { getTimeOptionArray } from '../../../DataAlerts/Components/TimingView/helpers';
import { createIcon } from "../../../../Utils";
import dayjs from '../../../../Utils/dayjsPlugins';
import { Selector } from "../../../Components/Selector/Selector";
import momentTZ from 'moment-timezone'
import { LIVE_ICON, CALENDAR } from '../../../../Svg';
import { 
  SCHEDULED_TYPE,
  CONTINUOUS_TYPE,
  PERIODIC_TYPE,
  SCHEDULE_INTERVAL_OPTIONS,
  WEEKDAY_NAMES_MON,
  EVALUATION_FREQUENCY_OPTIONS,
  MONTH_DAY_SELECT_OPTIONS,
  RESET_PERIOD_OPTIONS,
} from "autoql-fe-utils";

export function TimingStep() {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const settingGroup = document.createElement('div');
  
  const dataAlertSettingGroup = document.createElement('div');
  const dataAlertSettingFrequency = document.createElement('div');
  const frequencyContainer = document.createElement('div');
  
  this.DEFAULT_EVALUATION_FREQUENCY = 5
  this.DEFAULT_WEEKDAY_SELECT_VALUE = 'Friday'
  this.DEFAULT_MONTH_DAY_SELECT_VALUE = 'LAST'
  this.DEFAULT_MONTH_OF_YEAR_SELECT_VALUE = 'December'
  this.DEFAULT_FREQUENCY_TYPE = SCHEDULED_TYPE
  this.DEFAULT_RESET_PERIOD_SELECT_VALUE = 'MONTH'
  this.DEFAULT_TIME_SELECT_VALUE = {
    ampm: 'pm',
    minute: 0,
    hour: 5,
    hour24: 17,
    value: '5:00pm',
    value24hr: '17:00',
  }

  this.notificationType = SCHEDULED_TYPE;
  this.timezone = dayjs.tz.guess();
  this.evaluationFrequency = this.DEFAULT_EVALUATION_FREQUENCY;
  this.intervalTimeSelectValue = this.DEFAULT_TIME_SELECT_VALUE;
  this.monthDaySelectValue = this.DEFAULT_MONTH_DAY_SELECT_VALUE;
  this.weekDaySelectValue = this.DEFAULT_WEEKDAY_SELECT_VALUE;
  
  this.resetPeriod = this.DEFAULT_RESET_PERIOD_SELECT_VALUE;

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

  this.getLocalStartDate = ({ daysToAdd } = {}) => {
    return SCHEDULE_INTERVAL_OPTIONS[this.resetPeriod]?.getLocalStartDate({
      timeObj: this.intervalTimeSelectValue,
      timezone: this.timezone,
      monthDay: this.monthDaySelectValue,
      weekDay: this.weekDaySelectValue,
      daysToAdd,
    });
  }

  this.getSchedules = () => {
    if (this.notificationType !== SCHEDULED_TYPE) {
      return []
    }

    if (this.resetPeriod === 'DAY') {
      const schedules = []
      WEEKDAY_NAMES_MON.forEach((weekday, i) => {
        schedules.push({
          notification_period: 'WEEK',
          start_date: this.getLocalStartDate({ daysToAdd: i }),
          time_zone: this.timezone,
        })
      })
      
      return schedules
    }

    return [
      {
        notification_period: this.resetPeriod,
        start_date: this.getLocalStartDate(),
        time_zone: this.timezone,
      },
    ]
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

  this.getFrequencyOptions = () => {
    const keys = Object.keys(EVALUATION_FREQUENCY_OPTIONS);
    return keys.map((key) => {
      const value = EVALUATION_FREQUENCY_OPTIONS[key];
      return {
        displayName: value.label,
        value: value.value,
        obj: value,
      }
    });
  }

  this.getResetOptions = () => {
    const keys = Object.keys(RESET_PERIOD_OPTIONS);
    return keys.map((key) => {
      const value = RESET_PERIOD_OPTIONS[key];

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

  this.getMonthDaySelectOptions = () => {
    const keys = Object.keys(MONTH_DAY_SELECT_OPTIONS);
    return keys.map((key) => {
      const value = MONTH_DAY_SELECT_OPTIONS[key];

      return {
        displayName: value,
        value: key,
      }
    });
  }

  this.getTimeOptions = () => {
    return getTimeOptionArray().map((o) => {
      return {
        value: o.value,
        displayName: `<span>${o.value}</span>`,
        obj: o,
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

  this.createFrequencyOption = ({ label, defaultValue, selectorOptions, onChange }) => {
    const option = document.createElement('div');
    const wrapperLabel = document.createElement('div');
    const selector = new Selector({
      defaultValue,
      options: selectorOptions,
      onChange
    })
    
    wrapperLabel.classList.add('autoql-vanilla-select-and-label');
    option.classList.add('autoql-vanilla-data-alert-frequency-option');

    if(label) {
      const labelItem = document.createElement('div');
      labelItem.classList.add('autoql-vanilla-input-label');
      labelItem.textContent = label;
      wrapperLabel.appendChild(labelItem);
    }

    selector.classList.add('autoql-vanilla-full-width');
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

    const values = []

    values.push({
      value: SCHEDULED_TYPE,
      ...scheduledValues
    });

    values.push(
      {
        value: CONTINUOUS_TYPE,
        ...liveValues
      },
    );

/*     if(dataAlert.notification_type !== PERIODIC_TYPE){
      values.push(
        {
          value: CONTINUOUS_TYPE,
          ...liveValues
        },
      )
    } else {
      values.push(
        {
          value: PERIODIC_TYPE,
          ...liveValues
        },
      )
    }
     */
    return values;
  }

  this.handleDayChange = (option) => {
    this.createScheduledView({ notificationPeriod: option.value });
    this.resetPeriod = option.value;
  }

  this.handleTimezoneChange = (option) => {
    this.timezone = option.value;
  }

  this.handleMonthDaySelectValueChange = (option) => {
    this.monthDaySelectValue = option.value
  }
 
  this.createScheduledView = ({ notificationPeriod }) => {
    frequencyContainer.innerHTML = '';

    const intervalContainer = this.createFrequencyOption({
      label: 'Send a Notification',
      defaultValue: notificationPeriod,
      selectorOptions: this.getScheduleIntervalOptions(),
      onChange: this.handleDayChange
    });

    const daysContainer = this.createFrequencyOption({
      defaultValue: this.weekDaySelectValue,
      selectorOptions: this.getDaysOptions()
    });

    const monthContainer = this.createFrequencyOption({
      defaultValue: this.DEFAULT_MONTH_DAY_SELECT_VALUE,
      selectorOptions: this.getMonthDaySelectOptions(),
      onChange: this.handleMonthDaySelectValueChange,
    })
    
    const timeContainer = this.createFrequencyOption({
      defaultValue: this.DEFAULT_TIME_SELECT_VALUE.value,
      selectorOptions: this.getTimeOptions(),
      onChange: this.handleResetEvaluationFrequencyChange,
    });
    
    const timeZoneContainer = this.createFrequencyOption({
      label: 'Time Zone',
      defaultValue: this.timezone,
      selectorOptions: this.getTimeZoneOptions(),
      onChange: this.handleTimezoneChange
    });
    
    frequencyContainer.appendChild(intervalContainer);
    if(notificationPeriod === 'DAY') {
      frequencyContainer.appendChild(this.createConnector());
      frequencyContainer.appendChild(timeContainer);
    }
    else if(notificationPeriod === 'WEEK') {
      frequencyContainer.appendChild(daysContainer);
      frequencyContainer.appendChild(this.createConnector());
      frequencyContainer.appendChild(timeContainer);
    }else if (notificationPeriod === 'MONTH') {
      frequencyContainer.appendChild(monthContainer);
      frequencyContainer.appendChild(this.createConnector());
      frequencyContainer.appendChild(timeContainer);
    }

    frequencyContainer.appendChild(timeZoneContainer);
  }

  this.handleResetPeriodChange = (option) => {
    this.resetPeriod = option.value;
  }

  this.handleResetEvaluationFrequencyChange = (option) => {
    console.log(option);
    this.evaluationFrequency = option.value;
    this.intervalTimeSelectValue = option.obj;
  }

  this.createLiveView = () => {
    const frequencySelectorContainer = this.createFrequencyOption({
      label: 'Check conditions every',
      defaultValue: this.evaluationFrequency,
      selectorOptions: this.getFrequencyOptions(),
      onChange: this.handleResetEvaluationFrequencyChange,
    });
    frequencySelectorContainer.classList.add('autoql-vanilla-time-selector');
    frequencyContainer.appendChild(frequencySelectorContainer);

    if(this.notificationType !== PERIODIC_TYPE) {
      const resetContainer = this.createFrequencyOption({
        label: 'Check conditions every',
        defaultValue: this.resetPeriod,
        selectorOptions: this.getResetOptions(),
        onChange: this.handleResetPeriodChange,
      });
      frequencyContainer.appendChild(resetContainer);
    }
  }

  this.getNotificationType = (value) => {
    if (value === CONTINUOUS_TYPE && value !== 'NONE') {
      return PERIODIC_TYPE
    }

    return value
  }

  this.getResetPeriod = (resetPeriodSelectValue) => {
    if (resetPeriodSelectValue === 'NONE') {
      return null
    }

    return resetPeriodSelectValue
  }

  this.handleTypeChange = (option) => {
    frequencyContainer.innerHTML = '';
    this.notificationType = option.value;
    switch(option.value) {
      case SCHEDULED_TYPE:
        this.createScheduledView({ notificationPeriod: this.resetPeriod });
        break;
      case CONTINUOUS_TYPE:
      case PERIODIC_TYPE:
        this.createLiveView();
        break;
    }
  }
  
/*   const typeSelector = new Selector({ 
    defaultValue: this.notificationType,
    options: this.getTypeValues(),
    onChange: this.handleTypeChange,
  });
   */
  container.classList.add('autoql-vanilla-data-alert-modal-step');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  settingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-frequency-setting-group'); 
  dataAlertSettingFrequency.classList.add('autoql-vanilla-frequency-settings');
  frequencyContainer.classList.add('autoql-vanilla-data-alert-frequency-options-container');

  dataAlertSettingFrequency.appendChild(frequencyContainer);
  dataAlertSettingGroup.appendChild(dataAlertSettingFrequency);
  settingGroup.appendChild(dataAlertSettingGroup);
  wrapper.appendChild(settingGroup);
  container.appendChild(wrapper);

  if(this.notificationType === 'SCHEDULED') {
    this.createScheduledView({ notificationPeriod: this.resetPeriod });
  } else {
    this.createLiveView();
  }

  container.getValues = () => {
    const notificationType = this.getNotificationType(this.notificationType);
    const timezone = this.timezone;
    const evaluationFrequency = this.evaluationFrequency;
    const schedules = this.getSchedules();
    return {
      notification_type: notificationType,
      evaluation_frequency: evaluationFrequency,
      time_zone: timezone,
      schedules,
    }
  }

  return container;
}