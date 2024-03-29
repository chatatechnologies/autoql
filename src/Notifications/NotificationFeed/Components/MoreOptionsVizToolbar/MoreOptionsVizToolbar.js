import { isChartType, svgToPng } from "autoql-fe-utils";
import { Popup } from "../../../../Popup";
import { createIcon } from "../../../../Utils";
import { CLIPBOARD_ICON, EXPORT_PNG_ICON } from "../../../../Svg";
import { strings } from "../../../../Strings";
import './MoreOptionsVizToolbar.scss';
import { ChataUtils } from "../../../../ChataUtils";

export function MoreOptionsVizToolbar({ notificationItem }) {
  const popup = new Popup();
  const menu = document.createElement('ul');

  this.createOption = (svg, title) => {
    const item = document.createElement('li');
    const icon = createIcon(svg);

    item.appendChild(icon);
    item.appendChild(document.createTextNode(title));
    
    return item;
  }

  this.handleCopyTableToClipboard = () => {
    ChataUtils.copyHandler(notificationItem.idRequest);
    popup.close();
  }

  this.handleSaveAsPng = async() => {
    try {
      popup.close(); 
      const svg = notificationItem.chartContainer.children[1];
      if (!svg) {
          console.warn('Unable to download SVG - no svg was found');
      }

      const base64Data = await svgToPng(svg, 2);
      const a = document.createElement('a');
      a.download = 'Chart.png';
      a.href = base64Data;
      a.click();
    } catch (error) {
      console.error(error);
      return;
    }
  }

  menu.classList.add('autoql-vanilla-toolbar-more-options');
  popup.appendChild(menu);

  popup.open = ({ x, y, displayType }) => {
    menu.innerHTML = '';
    if(isChartType(displayType)) {
      const exportAsPng = this.createOption(EXPORT_PNG_ICON, strings.downloadPNG);
      menu.appendChild(exportAsPng);
      exportAsPng.onclick = this.handleSaveAsPng;
    } else {
      const copyTableToClipboard = this.createOption(CLIPBOARD_ICON, strings.copyTable);
      menu.appendChild(copyTableToClipboard);
      copyTableToClipboard.onclick = this.handleCopyTableToClipboard;
    }
    popup.show({ x, y });
  }

  return popup;
}