import { Popup } from "../../../../Popup";
import { createIcon } from "../../../../Utils";

export function MoreOptionsVizToolbar() {
  const popup = new Popup();
  const menu = document.createElement('ul');

  this.createOption = (svg, title) => {
    const item = document.createElement('li');
    const icon = createIcon(svg);

    item.appendChild(icon);
    item.appendChild(document.createTextNode(title));
    
    return item;
  }

  menu.classList.add('autoql-vanilla-more-options');
  popup.appendChild(menu);

  popup.open = ({ x, y, displayType }) => {
    popup.show({ x, y });
  }

  return popup;
}