import { Popup } from "../../../../Popup";
import { SETTINGS } from "../../../../Svg";
import { createIcon } from "../../../../Utils";
import './MoreOptionsPopup.scss';

export function MoreOptionsPopup() {
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
  }

  menu.classList.add('autoql-vanilla-notifications-more-options');

  popup.appendChild(menu);

  return popup;
}