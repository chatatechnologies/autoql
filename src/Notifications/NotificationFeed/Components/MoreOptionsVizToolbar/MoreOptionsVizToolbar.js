import { isChartType } from "autoql-fe-utils";
import { Popup } from "../../../../Popup";
import { createIcon } from "../../../../Utils";
import { CLIPBOARD_ICON, EXPORT_PNG_ICON } from "../../../../Svg";
import { strings } from "../../../../Strings";

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
    menu.innerHTML = '';
    if(isChartType(displayType)) {
      const exportAsPng = this.createOption(EXPORT_PNG_ICON, strings.downloadPNG);
      menu.appendChild(exportAsPng);
    } else {
      const copyTableToClipboard = this.createOption(CLIPBOARD_ICON, strings.copyTable);
      menu.appendChild(copyTableToClipboard);
    }
    popup.show({ x, y });
  }

  return popup;
}