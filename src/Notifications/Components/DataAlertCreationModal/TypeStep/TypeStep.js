import { CONTINUOUS_TYPE, SCHEDULED_TYPE } from 'autoql-fe-utils';

import { CALENDAR, LIVE_ICON } from '../../../../Svg';
import { MultiLineButton } from '../../../../ChataComponents/MultiLineButton';

import './TypeStep.scss';

export function TypeStep({ dataAlertType = CONTINUOUS_TYPE, onChange = () => {} } = {}) {
    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-data-alert-modal-step');

    container.dataAlertType = dataAlertType;

    const onButtonClick = (type) => {
        if (type === CONTINUOUS_TYPE) {
            container.dataAlertType = CONTINUOUS_TYPE;
            this.scheduledBtn.setActive(false);
            this.liveBtn.setActive(true);
        } else {
            container.dataAlertType = SCHEDULED_TYPE;
            this.scheduledBtn.setActive(true);
            this.liveBtn.setActive(false);
        }

        onChange(container.dataAlertType);
    };

    this.createTypeSection = () => {
        this.liveBtn = new MultiLineButton({
            icon: LIVE_ICON,
            title: 'Live Alert',
            subtitle: 'Get notifications when the data for this query meets certain conditions.',
            active: container.dataAlertType === CONTINUOUS_TYPE,
            onClick: () => onButtonClick(CONTINUOUS_TYPE),
        });

        this.scheduledBtn = new MultiLineButton({
            icon: CALENDAR,
            title: 'Scheduled Alert',
            subtitle: 'Get notifications with the result of this query at specific times.',
            active: container.dataAlertType === SCHEDULED_TYPE,
            onClick: () => onButtonClick(SCHEDULED_TYPE),
        });

        container.isValid = () => {
            return true;
        };

        container.appendChild(this.liveBtn);
        container.appendChild(this.scheduledBtn);
    };

    this.createTypeSection();

    return container;
}
