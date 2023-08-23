import { getSupportedDisplayTypes } from "autoql-fe-utils";

export function NotificationVizToolbar({ response }) {
  console.log(response);
  const container = document.createElement('div');
  const leftButtons = document.createElement('div');
  const rightButtons = document.createElement('div');
  const supportedDisplayTypes = getSupportedDisplayTypes({
    response,
    collumns: response?.data?.columns
  })

  console.log(supportedDisplayTypes);

  container.classList.add('autoql-vanilla-notification-toolbar-container');

  container.appendChild(leftButtons);
  container.appendChild(rightButtons);

  return container;
}