import { dismissNotification, fetchNotificationData } from "autoql-fe-utils";
import { CALENDAR, CARET_DOWN_ICON, VERTICAL_DOTS, WARNING_TRIANGLE, REFRESH_ICON } from "../../../../Svg";
import { createIcon } from "../../../../Utils";
import dayjs from '../../../../Utils/dayjsPlugins';
import './NotificationItem.scss';
import { isEmpty } from "lodash";

const dataAlertErrorName = 'Data Alert Error';
const DELAY = 0.08;

export function NotificationItem({ itemData, authentication, index, onClick }) {
  const item = document.createElement('div');
  
  this.queryResponse = undefined;
  this.isOpen = false;

  this.getLoadingDots = () => {
    const loading = document.createElement('div');
    const dotsContainer = document.createElement('div');
    loading.classList.add('autoql-vanilla-loading-wrapper');
    loading.classList.add('autoql-vanilla-notification-content-loading');
    dotsContainer.classList.add('autoql-vanilla-response-loading');

    
    for (let index = 0; index < 4; index++) {
      dotsContainer.appendChild(document.createElement('div'))
    }
    
    loading.appendChild(dotsContainer);
    return loading;
  }

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

  
  this.createMessageError = () => {
    const messageContainer = document.createElement('div');
    const wrapper = document.createElement('div');
    const refreshButton = document.createElement('button');
    const message = `This Data Alert encountered an error on ${this.getFormattedTimestamp()}.`;
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

    refreshButton.classList.add('autoql-vanilla-chata-btn');
    refreshButton.classList.add('autoql-vanilla-primary');
    refreshButton.classList.add('autoql-vanilla-large');
    refreshButton.classList.add('autoql-vanilla-notification-error-reinitialize-btn');

    messageContainer.classList.add('autoql-vanilla-notification-error-message-container');
    messageContainer.appendChild(wrapper);

    return messageContainer;
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

  this.createExpandArrow = () => {
    const expandArrow = document.createElement('div');
    const caredDown = createIcon(CARET_DOWN_ICON);

    expandArrow.classList.add('autoql-vanilla-notification-item-expand-arrow');
    expandArrow.appendChild(caredDown);

    return expandArrow;
  }
  
  this.dismissNotification = async () => {
    const response = await dismissNotification({
      notificationId: itemData.id,
      ...authentication,
    });

    return response;
  }

  this.hasError = () => {
    return itemData.outcome === 'ERROR';
  }

  this.isUnread = () => {
    return itemData.state === 'ACKNOWLEDGED';
  }

  this.createContent = () => {
    const content = document.createElement('div');
    const contentContainer = document.createElement('div');
    const loading = this.getLoadingDots();

    content.classList.add('autoql-vanilla-notification-expanded-content');
    content.classList.add('autoql-vanilla-notification-content-collapsed');
    contentContainer.classList.add('autoql-vanilla-notification-content-container');

    content.appendChild(contentContainer);
    content.appendChild(loading);

    this.content = content;
    this.contentContainer = contentContainer;
  
    this.loading = loading;

    return content;
  }

  this.fetchNotification = async() => {
    const response = await fetchNotificationData({ ...authentication, id: itemData.id });
    return response
  }

  this.handleExpand = async() => {
    onClick(item);
    if(this.isOpen) {
      item.collapse();
    } else {
      item.expand();
    }
    item.toggleOpen();
  }

  this.createItem = () => {
    const {
      title,
      message,
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
    header.appendChild(this.createExpandArrow());
    item.appendChild(header);
    item.appendChild(this.createContent());
    
    if(this.isUnread()) {
      item.appendChild(this.createStrip());
    }

    item.appendChild(this.createHoverOverlay());
    this.header = header;
    this.header.onclick = this.handleExpand;
  }
  
  if(this.hasError()) {
    item.classList.add('autoql-vanilla-notification-error');
  }
  
  if(this.isUnread()) {
    item.classList.add('autoql-vanilla-notification-unread');
  }
  
  item.expand = async() => {
    this.content.classList.remove('autoql-vanilla-notification-content-collapsed');
    this.content.classList.add('autoql-vanilla-notification-expanded');
    item.classList.remove('autoql-vanilla-notification-collapsed');
    if(this.isUnread()) {
      const response = await this.dismissNotification();
      if(response.status === 200) {
        item.classList.remove('autoql-vanilla-notification-unread')
        itemData.state = 'DISMISSED';
      }
    }

    this.createContentResponse();
  }

  this.createContentResponse = async() => {
    if(this.queryResponse !== undefined) return;

    const response = await this.fetchNotification()
    this.queryResponse = response.data;

    if(this.hasError()) {
      this.loading.remove();
      this.contentContainer.appendChild(this.createMessageError());
    }
  }
  
  item.collapse = () => {
    this.content.classList.add('autoql-vanilla-notification-content-collapsed');
    this.content.classList.remove('autoql-vanilla-notification-expanded');
    item.classList.add('autoql-vanilla-notification-collapsed');
  }
  
  item.toggleOpen = () => {
    this.isOpen = !this.isOpen;
  }
  
  item.setIsOpen = (val) => {
    this.isOpen = val;
  }
  
  console.log(itemData)
  
  this.createItem();
  item.classList.add('autoql-vanilla-notification-list-item');
  item.classList.add('autoql-vanilla-notification-collapsed');
  item.style.animationDelay = DELAY * index + 's';

  
  return item;
}
