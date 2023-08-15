import { MARK_ALL } from "../../Svg";
import { checkAndApplyTheme, createIcon } from "../../Utils";

export function NotificationFeed(selector) {
  checkAndApplyTheme();
  const container = document.createElement('div');
  const parent = document.querySelector(selector);

  this.createTopOptions = () => {
    const optionsContainer = document.createElement('div');
    const confirmPopoverButton = document.createElement('div');
    const markAllButton = document.createElement('div');
  
    markAllButton.classList.add('autoql-vanilla-notification-mark-all');
    confirmPopoverButton.classList.add('autoql-vanilla-confirm-popover-click-wrapper');
    optionsContainer.classList.add('autoql-vanilla-notification-feed-top-options-container');

    markAllButton.appendChild(createIcon(MARK_ALL));
    markAllButton.appendChild(document.createTextNode('Mark all as read'));

    confirmPopoverButton.appendChild(markAllButton);
    optionsContainer.appendChild(confirmPopoverButton);

    return optionsContainer;
  }

  container.classList.add('autoql-vanila-notification-list-container');

  container.appendChild(this.createTopOptions());

  if(parent) parent.appendChild(container);

  return container;
}