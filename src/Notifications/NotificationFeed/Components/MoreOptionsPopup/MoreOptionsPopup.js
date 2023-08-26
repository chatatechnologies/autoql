import { Popup } from "../../../../Popup";
import { DISMISS, ENVELOPE, ENVELOPE_OPEN, SETTINGS, TRASH_ICON } from "../../../../Svg";
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

  this.handleSettingsClick = () => {
    notificationItem.showEditDataAlertModal();
  }

  this.handleMarkAsUnreadClick = () => {
    notificationItem.handleMarkAsUnreadClick();
    popup.close();
  }

  this.handleDismissClick = () => {
    notificationItem.handleDismissClick(); 
    popup.close(); 
  }

  menu.classList.add('autoql-vanilla-notifications-more-options');

  popup.appendChild(menu);

  popup.open = ({ x, y }) => {
    menu.innerHTML = '';
    const settingsBtn = this.createOptions(
      'Settings',
      'View and edit this Data Alert',
      SETTINGS
    );
    const turnOffBtn = this.createOptions(
      'Turn off',
      'Stop receiving notifications for this Data Alert',
      DISMISS
    );
    const deleteBtn = this.createOptions('Delete', '', TRASH_ICON);
    settingsBtn.onclick = this.handleSettingsClick;
    deleteBtn.onclick = this.handleDeleteClick;
    
    menu.appendChild(settingsBtn);
    
    if(notificationItem.isUnread()) {
      const markAsReadButton = this.createOptions('Mark as read', '', ENVELOPE_OPEN);
      menu.appendChild(markAsReadButton);  
      markAsReadButton.onclick = this.handleDismissClick;    
    } else {
      const markAsUnreadButton = this.createOptions('Mark as unread', '', ENVELOPE);
      menu.appendChild(markAsUnreadButton);
      markAsUnreadButton.onclick = this.handleMarkAsUnreadClick;
    }



    menu.appendChild(turnOffBtn);
    menu.appendChild(deleteBtn);

    popup.show({ x, y });
  }

  return popup;
}