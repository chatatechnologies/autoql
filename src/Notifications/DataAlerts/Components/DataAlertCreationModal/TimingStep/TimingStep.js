import {
    SCHEDULED_TYPE,
    CONTINUOUS_TYPE,
    PERIODIC_TYPE,
    SCHEDULE_INTERVAL_OPTIONS,
    WEEKDAY_NAMES_MON,
    EVALUATION_FREQUENCY_OPTIONS,
    MONTH_DAY_SELECT_OPTIONS,
    RESET_PERIOD_OPTIONS,
    EXISTS_TYPE,
    COMPARE_TYPE,
    getTimeObjFromTimeStamp,
    getWeekdayFromTimeStamp,
} from 'autoql-fe-utils';

import momentTZ from 'moment-timezone';
import dayjs from '../../../../../Utils/dayjsPlugins';

import { getTimeOptionArray } from './helpers';
import { CALENDAR, LIVE_ICON } from '../../../../../Svg';
import { Select } from '../../../../../ChataComponents/Select';

import './TimingStep.scss';

export function TimingStep({
    dataAlertType = CONTINUOUS_TYPE,
    conditionType = EXISTS_TYPE,
    showSummaryMessage = true,
    dataAlert,
} = {}) {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const settingGroup = document.createElement('div');
    const frequencyMessageContainer = document.createElement('div');
    const frequencyMessage = document.createElement('span');

    const dataAlertSettingGroup = document.createElement('div');
    const dataAlertSettingFrequency = document.createElement('div');
    const frequencyContainer = document.createElement('div');

    this.dataAlertType = dataAlertType;
    this.conditionType = conditionType;

    if (dataAlert) {
        const dataAlertTypeFromAlert =
            dataAlert?.notification_type === SCHEDULED_TYPE ? SCHEDULED_TYPE : CONTINUOUS_TYPE;
        const conditionTypeFromAlert =
            dataAlert?.expression?.[0]?.condition === EXISTS_TYPE ? EXISTS_TYPE : COMPARE_TYPE;

        this.dataAlertType = dataAlertTypeFromAlert;
        this.conditionType = conditionTypeFromAlert;
    }

    this.DEFAULT_EVALUATION_FREQUENCY = 5;
    this.DEFAULT_WEEKDAY_SELECT_VALUE = 'Friday';
    this.DEFAULT_MONTH_DAY_SELECT_VALUE = 'LAST';
    this.DEFAULT_MONTH_OF_YEAR_SELECT_VALUE = 'December';
    this.DEFAULT_FREQUENCY_TYPE = SCHEDULED_TYPE;
    this.DEFAULT_RESET_PERIOD_SELECT_VALUE = 'MONTH';
    this.DEFAULT_TIME_SELECT_VALUE = {
        ampm: 'pm',
        minute: 0,
        hour: 5,
        hour24: 17,
        value: '5:00pm',
        value24hr: '17:00',
    };

    this.timezone = dayjs.tz.guess();
    this.evaluationFrequency = this.DEFAULT_EVALUATION_FREQUENCY;
    this.intervalTimeSelectValue = this.DEFAULT_TIME_SELECT_VALUE;
    this.monthDaySelectValue = this.DEFAULT_MONTH_DAY_SELECT_VALUE;
    this.weekDaySelectValue = this.DEFAULT_WEEKDAY_SELECT_VALUE;

    this.resetPeriod = this.DEFAULT_RESET_PERIOD_SELECT_VALUE;

    this.setInitialValuesFromDataAlert = () => {
        try {
            const evalFrequency = dataAlert?.evaluation_frequency;

            this.timezone = dataAlert?.time_zone;
            this.resetPeriod = dataAlert?.reset_period;
            this.evaluationFrequencySelectValue = dataAlert?.evaluation_frequency;

            // If evaluation frequency is not in predefined list, then it is a custom value:
            if (!EVALUATION_FREQUENCY_OPTIONS[evalFrequency]) {
                this.evaluationFrequencySelectValue = 'custom';
                this.evaluationFrequencyMins = evalFrequency;
                this.isCustomEvaluationFrequencyInputVisible = true;
            }

            if (
                !this.resetPeriod &&
                this.dataAlertType !== SCHEDULED_TYPE &&
                this.SUPPORTED_CONDITION_TYPES?.includes(COMPARE_TYPE)
            ) {
                // We don't want to support null reset_periods for compare type data alerts
                // To avoid continuous triggering of the alert. Use default value in this case
                this.resetPeriod = this.timeRange ?? this.DEFAULT_RESET_PERIOD_SELECT_VALUE;
            }

            if (this.resetPeriod === null) {
                this.resetPeriod = 'NONE';
            }

            if (this.dataAlertType === SCHEDULED_TYPE) {
                const schedules = dataAlert?.schedules;
                const schedulePeriod = schedules?.[0]?.notification_period ?? this.DEFAULT_RESET_PERIOD_SELECT_VALUE;

                this.timezone = schedules?.[0]?.time_zone;
                this.resetPeriod = schedulePeriod;
                this.intervalTimeSelectValue =
                    getTimeObjFromTimeStamp(schedules?.[0]?.start_date, schedules?.[0]?.time_zone) ??
                    this.DEFAULT_TIME_SELECT_VALUE;

                if (schedulePeriod === 'MONTH_LAST_DAY') {
                    this.resetPeriod = 'MONTH';
                    this.monthDaySelectValue = 'LAST';
                } else if (schedulePeriod === 'MONTH') {
                    this.monthDaySelectValue = 'FIRST'; // For now. Later we want to add month day numbers
                } else if (schedulePeriod === 'WEEK' && dataAlert.schedules.length === 7) {
                    this.resetPeriod = 'DAY';
                } else if (schedulePeriod === 'WEEK') {
                    this.weekDaySelectValue = getWeekdayFromTimeStamp(
                        schedules?.[0]?.start_date,
                        schedules?.[0]?.time_zone,
                    );
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (dataAlert) {
        this.setInitialValuesFromDataAlert();
    }

    this.getLocalStartDate = ({ daysToAdd } = {}) => {
        const params = {
            timeObj: this.intervalTimeSelectValue,
            timezone: this.timezone,
            monthDay: this.monthDaySelectValue,
            weekDay: this.weekDaySelectValue,
            daysToAdd,
        };

        return SCHEDULE_INTERVAL_OPTIONS[this.resetPeriod]?.getLocalStartDate(params);
    };

    this.getSchedules = () => {
        if (this.dataAlertType !== SCHEDULED_TYPE) {
            return [];
        }

        if (this.resetPeriod === 'DAY') {
            const schedules = [];
            WEEKDAY_NAMES_MON.forEach((weekday, i) => {
                schedules.push({
                    notification_period: 'WEEK',
                    start_date: this.getLocalStartDate({ daysToAdd: i }),
                    time_zone: this.timezone,
                });
            });

            return schedules;
        }

        return [
            {
                notification_period: this.resetPeriod,
                start_date: this.getLocalStartDate(),
                time_zone: this.timezone,
            },
        ];
    };

    this.getScheduleIntervalOptions = () => {
        const keys = Object.keys(SCHEDULE_INTERVAL_OPTIONS);
        return keys.map((key) => {
            const value = SCHEDULE_INTERVAL_OPTIONS[key];

            return {
                label: value.displayName,
                value: key,
            };
        });
    };

    this.getFrequencyOptions = () => {
        const keys = Object.keys(EVALUATION_FREQUENCY_OPTIONS);
        return keys.map((key) => {
            const value = EVALUATION_FREQUENCY_OPTIONS[key];
            return {
                label: value.label,
                value: value.value,
                obj: value,
            };
        });
    };

    this.getResetOptions = () => {
        const keys = Object.keys(RESET_PERIOD_OPTIONS);
        let options = keys.map((key) => {
            const value = RESET_PERIOD_OPTIONS[key];
            return {
                label: value.displayName,
                value: key,
            };
        });

        if (this.conditionType !== EXISTS_TYPE) {
            options = options.filter((option) => (option?.value === 'NONE' ? false : true));
        }

        return options;
    };
    this.getDaysOptions = () => {
        return WEEKDAY_NAMES_MON.map((dayName) => {
            return {
                value: dayName,
                label: `
        <span>
          on <strong>${dayName}</strong>
        </span>`,
            };
        });
    };

    this.getMonthDaySelectOptions = () => {
        const keys = Object.keys(MONTH_DAY_SELECT_OPTIONS);
        return keys.map((key) => {
            const value = MONTH_DAY_SELECT_OPTIONS[key];

            return {
                label: value,
                value: key,
            };
        });
    };

    this.getTimeOptions = () => {
        return getTimeOptionArray().map((o) => {
            return {
                value: o.value,
                label: `<span>${o.value}</span>`,
                obj: o,
            };
        });
    };

    this.getTimeZoneOptions = () => {
        return momentTZ.tz.names().map((tz) => {
            return {
                value: tz,
                label: `<span>${tz}</span>`,
            };
        });
    };

    this.createConnector = () => {
        const connector = document.createElement('div');
        const t = document.createElement('span');

        connector.classList.add('autoql-vanilla-data-alert-frequency-option');
        connector.classList.add('autoql-vanilla-schedule-builder-at-connector');
        t.textContent = 'at';
        connector.appendChild(t);

        return connector;
    };

    this.createFrequencyOption = ({ label, initialValue, selectorOptions, onChange = () => {} }) => {
        const option = document.createElement('div');
        const selector = new Select({
            label,
            initialValue,
            options: selectorOptions,
            onChange,
        });

        option.classList.add('autoql-vanilla-data-alert-frequency-option');

        option.appendChild(selector);

        return option;
    };

    this.handleDayChange = (option) => {
        if (this.resetPeriod !== option.value) {
            this.resetPeriod = option.value;
            this.createScheduledView();
        }
    };

    this.handleTimezoneChange = (option) => {
        this.timezone = option.value;
    };

    this.handleWeekDaySelectValueChange = (option) => {
        this.weekDaySelectValue = option.value;
    };

    this.handleMonthDaySelectValueChange = (option) => {
        this.monthDaySelectValue = option.value;
    };

    this.createDataAlertTypeSelector = () => {
        const dataAlertTypeSelectContainer = document.createElement('div');
        dataAlertTypeSelectContainer.classList.add('autoql-vanilla-data-alert-type-selector-container');

        const dataAlertTypeSelect = new Select({
            label: 'Alert Type',
            initialValue: this.dataAlertType,
            onChange: (option) => {
                container.handleTypeChange(option.value);
            },
            options: [
                {
                    value: CONTINUOUS_TYPE,
                    label: 'Live',
                    subtitle: 'Get notifications as soon as the conditions are met.',
                    icon: LIVE_ICON,
                },
                {
                    value: SCHEDULED_TYPE,
                    label: 'Scheduled',
                    subtitle: 'Get notifications at specific times.',
                    icon: CALENDAR,
                },
            ],
        });

        dataAlertTypeSelectContainer.appendChild(dataAlertTypeSelect);
        dataAlertSettingFrequency.appendChild(dataAlertTypeSelectContainer);
    };

    this.createScheduledView = () => {
        frequencyContainer.innerHTML = '';
        frequencyMessage.innerHTML =
            '<span>A notification will be sent with the query result <strong>at the following times:</strong></span>';

        const intervalContainer = this.createFrequencyOption({
            label: 'Send a Notification',
            initialValue: this.resetPeriod,
            selectorOptions: this.getScheduleIntervalOptions(),
            onChange: this.handleDayChange,
        });

        const daysContainer = this.createFrequencyOption({
            initialValue: this.weekDaySelectValue,
            selectorOptions: this.getDaysOptions(),
            onChange: this.handleWeekDaySelectValueChange,
        });

        const monthContainer = this.createFrequencyOption({
            initialValue: this.monthDaySelectValue,
            selectorOptions: this.getMonthDaySelectOptions(),
            onChange: this.handleMonthDaySelectValueChange,
        });

        const timeContainer = this.createFrequencyOption({
            initialValue: this.intervalTimeSelectValue?.value,
            selectorOptions: this.getTimeOptions(),
            onChange: this.handleTimeSelectValueChange,
        });

        const timeZoneContainer = this.createFrequencyOption({
            label: 'Time Zone',
            initialValue: this.timezone,
            selectorOptions: this.getTimeZoneOptions(),
            onChange: this.handleTimezoneChange,
        });

        frequencyContainer.appendChild(intervalContainer);
        if (this.resetPeriod === 'DAY') {
            frequencyContainer.appendChild(this.createConnector());
            frequencyContainer.appendChild(timeContainer);
        } else if (this.resetPeriod === 'WEEK') {
            frequencyContainer.appendChild(daysContainer);
            frequencyContainer.appendChild(this.createConnector());
            frequencyContainer.appendChild(timeContainer);
        } else if (this.resetPeriod === 'MONTH') {
            frequencyContainer.appendChild(monthContainer);
            frequencyContainer.appendChild(this.createConnector());
            frequencyContainer.appendChild(timeContainer);
        }

        frequencyContainer.appendChild(timeZoneContainer);
    };

    this.handleResetPeriodChange = (option) => {
        this.resetPeriod = option.value;
    };

    this.handleResetEvaluationFrequencyChange = (option) => {
        this.evaluationFrequency = option.value;
    };

    this.handleTimeSelectValueChange = (option) => {
        this.intervalTimeSelectValue = option.obj;
    };

    this.createLiveView = () => {
        frequencyContainer.innerHTML = '';

        const frequencySelectorContainer = this.createFrequencyOption({
            label: 'Check conditions every',
            initialValue: this.evaluationFrequency,
            selectorOptions: this.getFrequencyOptions(),
            onChange: this.handleResetEvaluationFrequencyChange,
        });
        frequencySelectorContainer.classList.add('autoql-vanilla-time-selector');
        frequencyContainer.appendChild(frequencySelectorContainer);

        frequencyMessage.innerHTML =
            '<span>A notification will be sent <strong>right away</strong> when the Data Alert conditions are met.</span>';

        const selectorOptions = this.getResetOptions();

        if (!selectorOptions.find((op) => op.value === this.resetPeriod)) {
            this.resetPeriod = selectorOptions[0].value;
        }

        if (this.dataAlertType !== PERIODIC_TYPE) {
            const resetContainer = this.createFrequencyOption({
                label: 'Send a notification',
                initialValue: this.resetPeriod,
                selectorOptions,
                onChange: this.handleResetPeriodChange,
            });
            frequencyContainer.appendChild(resetContainer);
        }

        const timeZoneContainer = this.createFrequencyOption({
            label: 'Time Zone',
            initialValue: this.timezone,
            selectorOptions: this.getTimeZoneOptions(),
            onChange: this.handleTimezoneChange,
        });

        frequencyContainer.appendChild(timeZoneContainer);
    };

    this.getNotificationType = (value) => {
        const resetPeriod = this.getResetPeriod();

        if (this.dataAlertType === SCHEDULED_TYPE) {
            return SCHEDULED_TYPE;
        } else if (!resetPeriod || resetPeriod === 'NONE') {
            return CONTINUOUS_TYPE;
        }

        return PERIODIC_TYPE;
    };

    this.getResetPeriod = (resetPeriodSelectValue) => {
        if (resetPeriodSelectValue === 'NONE') {
            return null;
        }

        return resetPeriodSelectValue;
    };

    container.handleConditionTypeChange = (conditionType) => {
        this.conditionType = conditionType;
        container.handleTypeChange(this.dataAlertType);
    };

    container.handleTypeChange = (type) => {
        frequencyContainer.innerHTML = '';
        this.dataAlertType = type;
        switch (type) {
            case SCHEDULED_TYPE:
                this.createScheduledView();
                break;
            case CONTINUOUS_TYPE:
            case PERIODIC_TYPE:
                this.createLiveView();
                break;
        }
    };

    container.classList.add('autoql-vanilla-data-alert-modal-step');
    wrapper.classList.add('autoql-vanilla-data-alerts-container');
    settingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
    dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
    dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-frequency-setting-group');
    dataAlertSettingFrequency.classList.add('autoql-vanilla-frequency-settings');
    frequencyContainer.classList.add('autoql-vanilla-data-alert-frequency-options-container');
    frequencyMessageContainer.classList.add('autoql-vanilla-frequency-type-container');

    if (dataAlert) {
        this.createDataAlertTypeSelector();
    }

    frequencyMessageContainer.appendChild(frequencyMessage);
    dataAlertSettingFrequency.appendChild(frequencyContainer);
    dataAlertSettingGroup.appendChild(dataAlertSettingFrequency);
    settingGroup.appendChild(dataAlertSettingGroup);

    if (showSummaryMessage) {
        wrapper.appendChild(frequencyMessageContainer);
    }

    wrapper.appendChild(settingGroup);
    container.appendChild(wrapper);

    if (this.dataAlertType === 'SCHEDULED') {
        this.createScheduledView();
    } else {
        this.createLiveView();
    }

    container.isValid = () => {
        return true;
    };

    container.getValues = () => {
        const notificationType = this.getNotificationType(this.dataAlertType);
        const timezone = this.timezone;
        const evaluationFrequency = this.evaluationFrequency;
        const schedules = this.getSchedules();
        const reset_period = notificationType === PERIODIC_TYPE ? this.getResetPeriod(this.resetPeriod) : null;

        const values = {
            notification_type: notificationType,
            evaluation_frequency: evaluationFrequency,
            time_zone: timezone,
            reset_period,
        };

        if (schedules?.length) {
            values.schedules = schedules;
        }

        return values;
    };

    return container;
}
