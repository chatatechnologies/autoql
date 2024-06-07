import { isSingleValueResponse } from 'autoql-fe-utils';

import { ChataUtils } from '../../../../ChataUtils';
import { uuidv4 } from '../../../../Utils';
import { NotificationVizToolbar } from '../NotificationVizToolbar';
import { DataLimitWarningIcon } from '../../../../DataLimitWarningIcon';
import { QueryOutput } from '../../../../QueryOutput';

import './NotificationDataContainer.scss';

export function NotificationDataContainer({ queryResponse, widgetOptions }) {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const responseContentContainer = document.createElement('div');
    this.idRequest = uuidv4();
    ChataUtils.responses[this.idRequest] = queryResponse.data;

    responseContentContainer.classList.add('autoql-vanilla-response-content-container');
    wrapper.classList.add('autoql-vanilla-notification-chart-container');
    container.classList.add('autoql-vanilla-notification-data-container');

    this.createVizToolbar = () => {
        return new NotificationVizToolbar({
            response: queryResponse,
            notificationItem: this,
        });
    };

    this.handleFilterClick = () => {
        this.queryOutput?.toggleTableFiltering();
    };

    this.showDataLimitWarning = () => {
        return queryResponse?.data?.data?.rows?.length >= 500;
    };

    this.showResponse = (displayType) => {
        const queryOuptut = new QueryOutput(responseContentContainer, {
            authentication: widgetOptions.authentication,
            displayType,
            height: 300,
            queryResponse: queryResponse?.data,
            showSingleValueResponseTitle: true,
        });

        this.queryOutput = queryOuptut;
    };

    this.createFooter = () => {
        const footer = document.createElement('div');

        footer.classList.add('autoql-vanilla-output-footer');
        footer.appendChild(new DataLimitWarningIcon());

        return footer;
    };

    const displayType = queryResponse.data.data.display_type;

    wrapper.appendChild(responseContentContainer);
    container.appendChild(wrapper);

    setTimeout(() => {
        this.showResponse(displayType);
    }, 100);

    if (!isSingleValueResponse(queryResponse)) {
        wrapper.appendChild(this.createVizToolbar());
    }

    return container;
}
