import { getSupportedDisplayTypes, DisplayTypes, isChartType } from "autoql-fe-utils";
import { createIcon } from "../../../../Utils";
import { 
  BAR_CHART_ICON,
  BUBBLE_CHART_ICON,
  COLUMN_CHART_ICON,
  COLUMN_LINE_ICON,
  FILTER_TABLE,
  HEATMAP_ICON,
  LINE_CHART_ICON,
  MORE_OPTIONS,
  PIE_CHART_ICON,
  STACKED_AREA_CHART_ICON,
  STACKED_BAR_CHART_ICON,
  STACKED_COLUMN_CHART_ICON,
  TABLE_ICON 
} from "../../../../Svg";
import './NotificationVizToolbar.scss';
import { strings } from "../../../../Strings";
import { MoreOptionsVizToolbar } from "../MoreOptionsVizToolbar/MoreOptionsVizToolbar";

export function NotificationVizToolbar({ response, onClick, onClickFilterButton }) {
  const container = document.createElement('div');
  const rightButtons = document.createElement('div');
  const moreOptionsPopup = new MoreOptionsVizToolbar();
  this.displayType = response?.data?.data.display_type;
  this.selectedBtn = undefined;

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

    supportedDisplayTypes.forEach((dType) => {
      let btn;
      switch (dType) {
        case DisplayTypes.TABLE:
          btn = this.createToolbarButton(TABLE_ICON);
          break;
        case DisplayTypes.BAR:
          btn = this.createToolbarButton(BAR_CHART_ICON);
          break;
        case DisplayTypes.COLUMN:
          btn = this.createToolbarButton(COLUMN_CHART_ICON);
        break;
        case DisplayTypes.LINE:
          btn = this.createToolbarButton(LINE_CHART_ICON);
        break;
        case DisplayTypes.PIE:
          btn = this.createToolbarButton(PIE_CHART_ICON);
        break;
        case DisplayTypes.STACKED_BAR:
          btn = this.createToolbarButton(STACKED_BAR_CHART_ICON);
        break;
        case DisplayTypes.STACKED_COLUMN:
          btn = this.createToolbarButton(STACKED_COLUMN_CHART_ICON);
        break;
        case DisplayTypes.STACKED_LINE:
          btn = this.createToolbarButton(STACKED_AREA_CHART_ICON);
        break;
        case DisplayTypes.HEATMAP:
          btn = this.createToolbarButton(HEATMAP_ICON);
        break;
        case DisplayTypes.BUBBLE:
          btn = this.createToolbarButton(BUBBLE_CHART_ICON);
        break;
        case DisplayTypes.COLUMN_LINE:
          btn = this.createToolbarButton(COLUMN_LINE_ICON);
        break;
        case DisplayTypes.COLUMN_LINE:
          btn = this.createToolbarButton(COLUMN_LINE_ICON);
        break;
        case DisplayTypes.COLUMN_LINE:
          btn = this.createToolbarButton(COLUMN_LINE_ICON);
        break;
        default:
          break;
      }

      if(btn) {
        btn.setAttribute('data-tippy-content', strings.displayTypes[dType]);
        btn.onclick = () => {
          this.displayType = dType;
          this.selectedBtn.classList.remove('autoql-vanilla-toolbar-btn-selected');
          btn.classList.add('autoql-vanilla-toolbar-btn-selected');
          this.selectedBtn = btn;
          onClick(dType);
          moreOptionsPopup.close();
        }  
        leftButtons.appendChild(btn);
      }
      if(
        (this.displayType === dType) || 
        (this.displayType === 'data' && dType === DisplayTypes.TABLE)
      ) {
        btn.classList.add('autoql-vanilla-toolbar-btn-selected');
        this.selectedBtn = btn;
      }
    });

    return leftButtons
  }

  this.createRightButtons = () => {
    const rightButtons = this.createToolbar();
    rightButtons.classList.add('autoql-vanilla-options-toolbar');
    const filterButton = this.createToolbarButton(FILTER_TABLE);
    const moreOptionsBtn = this.createToolbarButton(MORE_OPTIONS);
    
    filterButton.onclick = () => {
      moreOptionsPopup.close();
      if(isChartType(this.displayType)) {
        onClick(DisplayTypes.TABLE);
        this.displayType = DisplayTypes.TABLE;
      }
      onClickFilterButton();
    }

    moreOptionsBtn.onclick = () => {
      const right = 200;
      const pos = moreOptionsBtn.getBoundingClientRect();
      moreOptionsPopup.open({
        x: pos.left - right,
        y: pos.top + 2,
        displayType: this.displayType, 
      });
    }

    filterButton.setAttribute('data-tippy-content', strings.filterTable);
    moreOptionsBtn.setAttribute('data-tippy-content', strings.moreOptions);

    rightButtons.appendChild(filterButton);
    rightButtons.appendChild(moreOptionsBtn);

    return rightButtons;
  }

  container.classList.add('autoql-vanilla-notification-toolbar-container');

  container.appendChild(this.createLeftButtons());
  container.appendChild(this.createRightButtons());
  container.appendChild(rightButtons);

  return container;
}