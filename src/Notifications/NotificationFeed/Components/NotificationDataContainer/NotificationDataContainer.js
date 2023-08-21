import './NotificationDataContainer.scss';

export function NotificationDataContainer({ queryResponse }) {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const responseContentContainer = document.createElement('div');
  
  responseContentContainer.classList.add('autoql-vanilla-response-content-container');
  wrapper.classList.add('autoql-vanilla-notification-chart-container');
  container.classList.add('autoql-vanilla-notification-data-container');
 
  wrapper.appendChild(responseContentContainer);
  container.appendChild(wrapper);
  return container;
}