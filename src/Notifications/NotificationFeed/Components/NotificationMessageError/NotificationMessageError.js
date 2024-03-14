import { initializeAlert } from 'autoql-fe-utils';
import { AntdMessage } from '../../../../Antd';
import { REFRESH_ICON, CHECK } from '../../../../Svg';
import { createIcon, getFormattedTimestamp } from '../../../../Utils';
import './NotificationMessageError.scss';

export function NotificationMessageError({ itemData, authentication }) {
    const messageContainer = document.createElement('div');
    const wrapper = document.createElement('div');
    const refreshButton = document.createElement('button');
    const message = `This Data Alert encountered an error on ${getFormattedTimestamp()}.`;
    const secondMessage = 'To resolve this issue, try restarting the Alert by clicking the button below.';
    const instructions = `
    If the problem persists, you may need to create a new Data Alert."
  `;
    const btnIcon = createIcon(REFRESH_ICON);
    const spinner = document.createElement('div');
    const btnString = document.createTextNode('Restart Alert');
    spinner.classList.add('autoql-vanilla-spinner-loader');

    refreshButton.appendChild(btnIcon);
    refreshButton.appendChild(btnString);
    wrapper.appendChild(document.createTextNode(message));
    wrapper.appendChild(document.createElement('br'));
    wrapper.appendChild(document.createTextNode(secondMessage));
    wrapper.appendChild(document.createElement('br'));
    wrapper.appendChild(refreshButton);
    wrapper.appendChild(document.createElement('br'));
    wrapper.appendChild(document.createTextNode(instructions));

    refreshButton.onclick = async () => {
        btnIcon.innerHTML = '';
        btnIcon.appendChild(spinner);
        const response = await initializeAlert({ id: itemData.data_alert_id, ...authentication });
        if (response) {
            spinner.remove();
            refreshButton.classList.remove('autoql-vanilla-primary');
            refreshButton.classList.add('restart-success');
            btnIcon.innerHTML = CHECK;
            btnString.textContent = 'Restarted';
            new AntdMessage('Restart successful! Your Data Alert is now active.', 4000);
        }
    };

    refreshButton.classList.add('autoql-vanilla-primary');
    refreshButton.classList.add('autoql-vanilla-chata-btn');
    refreshButton.classList.add('autoql-vanilla-large');
    refreshButton.classList.add('autoql-vanilla-notification-error-reinitialize-btn');

    messageContainer.classList.add('autoql-vanilla-notification-error-message-container');
    messageContainer.appendChild(wrapper);

    return messageContainer;
}
