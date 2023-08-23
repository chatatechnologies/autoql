import { getSupportedDisplayTypes, DisplayTypes } from "autoql-fe-utils";
import { createIcon } from "../../../../Utils";
import { TABLE_ICON } from "../../../../Svg";

import './NotificationVizToolbar.scss';

export function NotificationVizToolbar({ response }) {
  console.log(response);
  const container = document.createElement('div');
  const rightButtons = document.createElement('div');
  this.displayType = response?.data?.data.display_type;
  console.log(this.displayType);
  this.createToolbarButton = (svg) => {
    const icon = createIcon(svg);
    const button = document.createElement('button');

    button.classList.add('autoql-vanilla-toolbar-btn');
    button.appendChild(icon);
    return button;
  }

  this.createToolbar = () => {
    const toolbar = document.createElement('div');
    toolbar.classList.add('autoql-vanilla-autoql-toolbar');
    return toolbar
  }
  
  this.createLeftButtons = () => {
    const leftButtons = this.createToolbar();
    leftButtons.classList.add('autoql-vanilla-viz-toolbar');
    const supportedDisplayTypes = getSupportedDisplayTypes({
      response,
      collumns: response?.data?.columns
    });
    console.log(supportedDisplayTypes);

    supportedDisplayTypes.forEach((dType) => {
      const btn = this.createToolbarButton(TABLE_ICON);
      leftButtons.appendChild(btn);
      if(
        (this.displayType === dType) || 
        (this.displayType === 'data' && dType === DisplayTypes.TABLE)
      ) {
        btn.classList.add('autoql-vanilla-toolbar-btn-selected');
      } 
    });

    return leftButtons
  }


  container.classList.add('autoql-vanilla-notification-toolbar-container');

  container.appendChild(this.createLeftButtons());
  container.appendChild(rightButtons);

  return container;
}