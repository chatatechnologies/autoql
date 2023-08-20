import { REFRESH_ICON } from "../../../../Svg";
import { createIcon, getFormattedTimestamp } from "../../../../Utils";
import './NotificationMessageError.scss';

export function NotificationMessageError({ itemData }) {
  const messageContainer = document.createElement('div');
  const wrapper = document.createElement('div');
  const refreshButton = document.createElement('button');
  const message = `This Data Alert encountered an error on ${getFormattedTimestamp()}.`;
  const secondMessage = 'To resolve this issue, try restarting the Alert by clicking the button below.';
  const instructions = `
    If the problem persists, you may need to create a new Data Alert from the query "${itemData.data_return_query}"
    `;
  refreshButton.appendChild(createIcon(REFRESH_ICON));
  refreshButton.appendChild(document.createTextNode('Restart Alert'));
  wrapper.appendChild(document.createTextNode(message));
  wrapper.appendChild(document.createElement('br'));
  wrapper.appendChild(document.createTextNode(secondMessage));
  wrapper.appendChild(document.createElement('br'));
  wrapper.appendChild(refreshButton);
  wrapper.appendChild(document.createElement('br'));
  wrapper.appendChild(document.createTextNode(instructions));

  refreshButton.classList.add('autoql-vanilla-primary');
  refreshButton.classList.add('autoql-vanilla-chata-btn');
  refreshButton.classList.add('autoql-vanilla-large');
  refreshButton.classList.add('autoql-vanilla-notification-error-reinitialize-btn');
  
  messageContainer.classList.add('autoql-vanilla-notification-error-message-container');
  messageContainer.appendChild(wrapper);
  
  return messageContainer;
}