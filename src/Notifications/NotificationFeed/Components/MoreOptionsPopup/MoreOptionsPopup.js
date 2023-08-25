import { Popup } from "../../../../Popup";
import { DISMISS, ENVELOPE, SETTINGS, TRASH_ICON } from "../../../../Svg";
import { createIcon } from "../../../../Utils";
import './MoreOptionsPopup.scss';

export function MoreOptionsPopup({ notificationItem }) {
  const popup = new Popup();
  const menu = document.createElement('ul');

  this.createOptions = (title, subtitle, svg) => {
    const item = document.createElement('li');
    const container = document.createElement('span');
    const valueContainer = document.createElement('span');
    const titleContainer = document.createElement('span');
    const subTitleContainer = document.createElement('span');

    item.classList.add('autoql-vanilla-option-menu-item');
    container.classList.add('autoql-vanilla-select-option-span');
    valueContainer.classList.add('autoql-vanilla-select-option-value-container');
    titleContainer.classList.add('autoql-vanilla-menu-item-title');
    subTitleContainer.classList.add('autoql-vanilla-select-option-value-subtitle');
    
    titleContainer.appendChild(createIcon(svg));
    titleContainer.appendChild(document.createTextNode(title));
    subTitleContainer.appendChild(document.createTextNode(subtitle));

    valueContainer.appendChild(titleContainer);
    valueContainer.appendChild(subTitleContainer);
    container.appendChild(valueContainer);
    item.appendChild(container);

    return item;
  }

  this.handleDeleteClick = () => {
    notificationItem.delete();
  }

  const settingsBtn = this.createOptions('Settings', 'View and edit this Data Alert', SETTINGS);
  const turnOffBtn = this.createOptions('Turn off', 'Stop receiving notifications for this Data Alert', DISMISS);
  const markAsUnreadButton = this.createOptions('Mark as unread', '', ENVELOPE);
  const deleteBtn = this.createOptions('Delete', '', TRASH_ICON);

  menu.appendChild(settingsBtn);
  menu.appendChild(turnOffBtn);
  menu.appendChild(markAsUnreadButton);
  menu.appendChild(deleteBtn);

  deleteBtn.onclick = this.handleDeleteClick;

  menu.classList.add('autoql-vanilla-notifications-more-options');

  popup.appendChild(menu);

  return popup;
}