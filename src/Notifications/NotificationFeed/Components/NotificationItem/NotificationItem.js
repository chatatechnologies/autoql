import { CALENDAR, VERTICAL_DOTS } from "../../../../Svg";
import { createIcon } from "../../../../Utils";
import dayjs from '../../../../Utils/dayjsPlugins';
import './NotificationItem.scss';

export function NotificationItem({ itemData }) {
  console.log(itemData);
  const item = document.createElement('div');
  item.classList.add('autoql-vanilla-notification-list-item');

  this.getFormattedTimestamp = () => {
    const timestamp = itemData.created_at;

    const dateDayJS = dayjs.unix(timestamp)

    const time = dateDayJS.format('h:mma')
    const day = dateDayJS.format('MM-DD-YY')

    const today = dayjs().format('MM-DD-YY')
    const yesterday = dayjs().subtract(1, 'd').format('MM-DD-YY')

    if (day === today) {
      return `Today at ${time}`
    } else if (day === yesterday) {
      return `Yesterday at ${time}`
    } else if (dayjs().isSame(dateDayJS, 'year')) {
      return `${dateDayJS.format('MMMM Do')} at ${time}`
    }
    return `${dateDayJS.format('MMMM Do, YYYY')} at ${time}`
  }

  this.createStrip = () => {
    const strip = document.createElement('div');
    strip.classList.add('autoql-vanilla-notification-alert-strip');

    return strip;
  }

  this.createBtnContainer = () => {
    const btnContainer = document.createElement('div');
    const verticalDots = createIcon(VERTICAL_DOTS);

    btnContainer.classList.add('autoql-vanilla-notification-options-btn-container');
    verticalDots.classList.add('autoql-vanilla-notification-options-btn');
    btnContainer.appendChild(verticalDots);

    return btnContainer;
  }

  this.createHeader = () => {
    const {
      title,
      message,
      state
    } = itemData;
    const header = document.createElement('div');
    const displayNameContainer = document.createElement('div');
    const displayName = document.createElement('div');
    const description = document.createElement('div');
    const timestampContainer = document.createElement('div');
    const timestamp = document.createElement('span');

    header.classList.add('autoql-vanilla-notification-list-item-header');
    displayNameContainer.classList.add('autoql-vanilla-notification-display-name-container');
    displayName.classList.add('autoql-vanilla-notification-display-name');
    description.classList.add('autoql-vanilla-notification-description');
    timestampContainer.classList.add('autoql-vanilla-notification-timestamp-container');
    timestamp.classList.add('autoql-vanilla-notification-timestamp');
    
    displayName.textContent = title;
    description.textContent = message;

    timestamp.appendChild(createIcon(CALENDAR));
    timestamp.appendChild(document.createTextNode(this.getFormattedTimestamp()));

    timestampContainer.appendChild(timestamp);
    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestampContainer);

    header.appendChild(displayNameContainer);
    header.appendChild(this.createBtnContainer());
    item.appendChild(header);

    if(state === 'ACKNOWLEDGED') {
      item.appendChild(this.createStrip());
    }
  }

  this.createHeader();

  return item;
}