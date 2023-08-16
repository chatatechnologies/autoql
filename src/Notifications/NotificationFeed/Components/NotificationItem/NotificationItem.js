import { CALENDAR, VERTICAL_DOTS, WARNING_TRIANGLE } from "../../../../Svg";
import { createIcon } from "../../../../Utils";
import dayjs from '../../../../Utils/dayjsPlugins';
import './NotificationItem.scss';

const dataAlertErrorName = 'Data Alert Error';

export function NotificationItem({ itemData }) {
  console.log(itemData);
  const item = document.createElement('div');
  
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

  this.createHoverOverlay = () => {
    const overlay = document.createElement('div');
    overlay.classList.add('autoql-vanilla-notification-item-hover-overlay');
    
    return overlay;
  }

  this.createBtnContainer = () => {
    const btnContainer = document.createElement('div');
    const verticalDots = createIcon(VERTICAL_DOTS);
    
    btnContainer.classList.add('autoql-vanilla-notification-options-btn-container');
    verticalDots.classList.add('autoql-vanilla-notification-options-btn');
    btnContainer.appendChild(verticalDots);
    
    return btnContainer;
  }
  
  this.hasError = () => {
    return itemData.outcome === 'ERROR';
  }

  this.isUnread = () => {
    return itemData.state === 'ACKNOWLEDGED';
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
    
    if(!this.hasError()){
      displayName.textContent = title;
      description.textContent = message;
    } else {
      displayName.appendChild(createIcon(WARNING_TRIANGLE));
      displayName.appendChild(document.createTextNode(dataAlertErrorName));
      description.textContent = `Your Data Alert "${title}" encountered a problem. Click for more information.`;
    }
    
    timestamp.appendChild(createIcon(CALENDAR));
    timestamp.appendChild(document.createTextNode(this.getFormattedTimestamp()));
    
    timestampContainer.appendChild(timestamp);
    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestampContainer);
    
    header.appendChild(displayNameContainer);
    header.appendChild(this.createBtnContainer());
    item.appendChild(header);
    
    if(this.isUnread()) {
      item.appendChild(this.createStrip());
    }

    item.appendChild(this.createHoverOverlay());
  }
  
  this.createHeader();
  item.classList.add('autoql-vanilla-notification-list-item');
  item.classList.add('autoql-vanilla-notification-collapsed');
  
  if(this.hasError()) {
    item.classList.add('autoql-vanilla-notification-error');
  }

  if(this.isUnread()) {
    item.classList.add('autoql-vanilla-notification-unread');
  }

  return item;
}