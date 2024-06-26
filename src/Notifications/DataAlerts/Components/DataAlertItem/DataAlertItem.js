import './DataAlertItem.scss';
import {
    CALENDAR,
    CHECK,
    LIVE_ICON,
    SETTINGS,
    TRASH_ICON,
    LIGHTNING_ICON,
    REFRESH_ICON,
    WARNING,
} from '../../../../Svg';
import { createIcon } from '../../../../Utils';
import { StatusSwitch } from '../StatusSwitch';
import {
    updateDataAlertStatus,
    deleteDataAlert,
    formatResetDate,
    formatNextScheduleDate,
    resetDateIsFuture,
    initializeAlert,
    SCHEDULED_TYPE,
    DATA_ALERT_ENABLED_STATUSES,
    CUSTOM_TYPE,
    DATA_ALERT_STATUSES,
    RESET_PERIOD_OPTIONS,
    SCHEDULE_FREQUENCY_OPTIONS,
    CONTINUOUS_TYPE,
    PERIODIC_TYPE,
} from 'autoql-fe-utils';
import { ChataConfirmDialog } from '../../../Components/ChataConfirmDialog/ChataConfirmDialog';
import { AntdMessage } from '../../../../Antd';
import { DataAlertEditModal } from '../DataAlertEditModal/DataAlertEditModal';

const labelsMap = [
    { name: 'Data Alert Name', className: 'autoql-vanilla-notification-setting-display-name-header' },
    { name: 'Notification Frequency', className: 'autoql-vanilla-data-alert-list-item-section-frequency-header' },
    { name: 'State', className: 'autoql-vanilla-data-alert-list-item-section-state-header' },
    { name: 'Next Check', className: 'autoql-vanilla-data-alert-list-item-section-next-check-header' },
    { name: 'Status', className: 'autoql-vanilla-data-alert-list-item-section-status-header' },
    { name: 'Actions', className: 'autoql-vanilla-data-alert-list-item-section-actions-header' },
];

export function DataAlertItem({ dataAlert, authentication, showHeader = false, fetchAlerts = () => {} }) {
    const item = document.createElement('div');
    const row = document.createElement('div');
    item.classList.add('autoql-vanilla-notification-setting-item');
    row.classList.add('autoql-vanilla-notification-setting-item-header');
    this.dataAlert = dataAlert;

    const { title, status, id, type } = this.dataAlert;

    const isEnabled = (s) => DATA_ALERT_ENABLED_STATUSES.includes(s);

    const toggleAlertStatusView = (s) => {
        if (isEnabled(s)) {
            item.classList.remove('autoql-vanilla-data-alert-disabled');
        } else {
            item.classList.add('autoql-vanilla-data-alert-disabled');
        }
        const newState = createCol('autoql-vanilla-data-alert-list-item-section-state', getState(), 2);
        row.replaceChild(newState, item.elementState);
        item.elementState = newState;
    };

    const createHeaderValue = ({ className, name }) => {
        const headerCol = document.createElement('div');
        const value = document.createElement('span');

        headerCol.classList.add('autoql-vanilla-data-alert-header-item');
        headerCol.classList.add(className);

        value.textContent = name;
        headerCol.appendChild(value);

        return headerCol;
    };

    const createCol = (className, element, index) => {
        const section = document.createElement('div');
        const content = document.createElement('div');
        const wrapperContent = document.createElement('span');
        const value = document.createElement('span');

        section.classList.add('autoql-vanilla-data-alert-list-item-section');
        section.classList.add(className);
        content.classList.add('autoql-vanilla-data-alert-section-content');

        if (showHeader) {
            const labelValue = labelsMap[index];
            const headerCol = createHeaderValue({ ...labelValue });
            section.appendChild(headerCol);
        }

        if (typeof element === 'string') {
            value.innerHTML = element;
        } else if (element) {
            value.appendChild(element);
        }

        wrapperContent.appendChild(value);
        content.appendChild(wrapperContent);
        section.appendChild(content);

        row.appendChild(section);

        return section;
    };

    const hasError = () => {
        return (
            this.dataAlert.status === 'GENERAL_ERROR' ||
            this.dataAlert.status === 'EVALUATION_ERROR' ||
            this.dataAlert.status === 'DATA_RETURN_ERROR'
        );
    };

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
    };

    const createRefreshIcon = () => {
        const refreshIcon = createIcon(REFRESH_ICON);
        refreshIcon.classList.add('autoql-vanilla-notification-state-action-btn');
        refreshIcon.onclick = async () => {
            refreshIcon.classList.add('autoql-vanilla-spinning');
            await initializeAlert({ id, ...authentication });
            this.dataAlert.status = DATA_ALERT_STATUSES.ACTIVE;
            this.dataAlert.reset_date = null;
            toggleAlertStatusView(this.dataAlert.status);
            refreshIcon.onclick = () => {};
        };

        return refreshIcon;
    };

    const getState = () => {
        const nextScheduledDate = formatNextScheduleDate(this.dataAlert.schedules);
        const enabled = isEnabled(this.dataAlert.status);
        const resetDateFormatted = formatResetDate(this.dataAlert);
        const isCustom = this.dataAlert.type === CUSTOM_TYPE;
        const error = hasError();

        if (error) {
            const errorStatus = createStatusElement('Error', WARNING, 'autoql-vanilla-data-alert-error');
            if (isCustom) {
                const refreshIcon = createRefreshIcon();
                errorStatus.appendChild(refreshIcon);
            }
            return errorStatus;
        }

        if (this.dataAlert.reset_date && resetDateIsFuture(this.dataAlert)) {
            const tooltip = `This Alert has been triggered for this cycle. You will not receive notifications until the start of the next cycle, ${resetDateFormatted}.<br/>You can edit this in the <em>Data Alert Settings</em>`;
            const triggeredStatus = createStatusElement(
                'Triggered',
                LIGHTNING_ICON,
                'autoql-vanilla-data-alert-triggered',
            );
            if (isCustom) {
                const refreshIcon = createRefreshIcon();
                triggeredStatus.appendChild(refreshIcon);
            }

            return triggeredStatus;
        }

        if (this.dataAlert.status === 'ACTIVE' && this.dataAlert.notification_type === SCHEDULED_TYPE) {
            let tooltip = 'This Alert runs on a schedule';
            if (nextScheduledDate) {
                tooltip = `${tooltip} - a notification is scheduled for ${nextScheduledDate}. If your data hasn't changed by then, you will not receive a notification.`;
            }
            return createStatusElement('Scheduled', CALENDAR, 'autoql-vanilla-data-alert-scheduled');
        }

        if (enabled) {
            const tooltip = 'This Alert is live - Whenever the conditions are met, you will be notified.';
            return createStatusElement('Live', LIVE_ICON, 'autoql-vanilla-data-alert-live');
        }

        return createStatusElement('Ready', CHECK, 'autoql-vanilla-data-alert-ready');
    };

    const getDataAlertCycleStart = () => {
        if (hasError()) {
            return '-';
        }
        if (this.dataAlert.notification_type === SCHEDULED_TYPE) {
            const nextScheduledDate = formatNextScheduleDate(this.dataAlert.schedules, true);
            if (!nextScheduledDate) {
                return '-';
            }
            return `<span>${nextScheduledDate}</span>`;
        }

        if (!this.dataAlert.reset_date || !resetDateIsFuture(this.dataAlert)) {
            const evaluationFrequency = this.dataAlert.evaluation_frequency ?? DEFAULT_EVALUATION_FREQUENCY;
            return `< ${evaluationFrequency}m`;
        }

        return `<span>${formatResetDate(this.dataAlert, true)}</span>`;
    };

    const onStatusChange = async ({ status }) => {
        const response = await updateDataAlertStatus({ dataAlertId: id, type, status, ...authentication });
        this.dataAlert.status = status;
        toggleAlertStatusView(status);
        return response;
    };

    const deleteDataAlertItemHandler = async () => {
        return new Promise((res, rej) => {
            ChataConfirmDialog({
                title: 'Are you sure you want to delete this Data Alert?',
                message: 'You will no longer be notified about these changes in your data.',
                cancelString: 'Go Back',
                discardString: 'Delete',
                onDiscard: async () => {
                    const response = await deleteDataAlert(id, authentication);
                    if (response.status === 200) {
                        item.parentElement.removeChild(item);
                        new AntdMessage('Data Alert was successfully deleted.', 3000);
                    } else {
                        new AntdMessage('Error', 3000);
                    }
                    return res();
                },
            });
        });
    };

    const editDataAlertItemHandler = () => {
        const modal = new DataAlertEditModal({
            dataAlertItem: item,
            dataAlert,
            authentication,
            onDeleteClick: deleteDataAlertItemHandler,
            fetchAlerts,
        });
        modal.show();
    };

    const createActionButton = (icon, className) => {
        const btn = document.createElement('div');
        btn.classList.add('autoql-vanilla-notification-action-btn');
        btn.appendChild(createIcon(icon));
        btn.classList.add(className);

        return btn;
    };

    const getCycleFromResetPeriod = (resetPeriod) => {
        if (!resetPeriod) {
            return 'Continuous';
        }

        return RESET_PERIOD_OPTIONS[resetPeriod]?.displayText ?? '-';
    };

    const getCycle = (dataAlert) => {
        const frequencyType = dataAlert?.notification_type;

        let cycle = '-';

        if (frequencyType === SCHEDULED_TYPE) {
            const schedules = dataAlert?.schedules;
            if (schedules?.length === 7) {
                cycle = SCHEDULE_FREQUENCY_OPTIONS['DAY']?.displayText;
            } else {
                cycle = SCHEDULE_FREQUENCY_OPTIONS[schedules?.[0]?.notification_period]?.displayText ?? '-';
            }
        } else if (frequencyType === CONTINUOUS_TYPE || frequencyType === PERIODIC_TYPE) {
            cycle = getCycleFromResetPeriod(dataAlert.reset_period);
        }

        return cycle;
    };

    const createActions = () => {
        const actionWrapper = document.createElement('div');
        const settingsButton = createActionButton(SETTINGS, 'autoql-vanilla-notification-action-btn-settings');
        const deleteButton = createActionButton(TRASH_ICON, 'autoql-vanilla-notification-action-btn-delete');
        actionWrapper.classList.add('autoql-vanilla-action-buttons-section');
        actionWrapper.appendChild(settingsButton);
        actionWrapper.appendChild(deleteButton);

        deleteButton.onclick = deleteDataAlertItemHandler;
        settingsButton.onclick = editDataAlertItemHandler;

        item.actionButtons = createCol('autoql-vanilla-data-alert-list-item-section-actions', actionWrapper, 5);
    };

    item.elementTitle = createCol('autoql-vanilla-notification-setting-display-name', title, 0);
    item.elementFrequency = createCol('autoql-vanilla-data-alert-list-item-section-frequency', getCycle(dataAlert), 1);
    item.elementState = createCol('autoql-vanilla-data-alert-list-item-section-state', getState(), 2);
    item.elementCycleStart = createCol(
        'autoql-vanilla-data-alert-list-item-section-next-check',
        getDataAlertCycleStart(),
        3,
    );
    item.elementStatus = createCol(
        'autoql-vanilla-data-alert-list-item-section-status',
        new StatusSwitch({ onChange: onStatusChange, status }),
        4,
    );

    item.appendChild(row);

    toggleAlertStatusView(status);
    createActions();

    item.setDataAlert = ({ newValues }) => {};

    return item;
}
