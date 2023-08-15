import { CALENDAR, VERTICAL_DOTS } from "../../../../Svg";
import { createIcon } from "../../../../Utils";

export function NotificationItem({ itemData }) {
  const item = document.createElement('div');
  item.classList.add('autoql-vanilla-notification-list-item');

  this.createHeader = () => {
    const header = document.createElement('div');
    const displayNameContainer = document.createElement('div');
    const displayName = document.createElement('div');
    const description = document.createElement('div');
    const timestampContainer = document.createElement('div');
    const timestamp = document.createElement('span');

    const btnContainer = document.createElement('div');
    const verticalDots = createIcon(VERTICAL_DOTS);

    const strip = document.createElement('div');

    header.classList.add('autoql-vanilla-notification-list-item-header');
    displayNameContainer.classList.add('autoql-vanilla-notification-display-name-container');
    displayName.classList.add('autoql-vanilla-notification-display-name');
    description.classList.add('autoql-vanilla-notification-description');
    timestampContainer.classList.add('autoql-vanilla-notification-timestamp-container');
    timestamp.classList.add('autoql-vanilla-notification-timestamp');
    btnContainer.classList.add('autoql-vanilla-notification-options-btn-container')
    verticalDots.classList.add('autoql-vanilla-notification-options-btn');
    strip.classList.add('autoql-vanilla-notification-alert-strip')
    displayName.textContent = 'Test1';
    timestamp.appendChild(createIcon(CALENDAR));
    timestamp.appendChild(document.createTextNode(''));

    btnContainer.appendChild(verticalDots);
    timestampContainer.appendChild(timestamp);
    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestampContainer);

    header.appendChild(displayNameContainer);
    header.appendChild(btnContainer);
    item.appendChild(header);
    item.appendChild(strip);
  }

  this.createHeader();

  return item;
}