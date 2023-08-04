import { createIcon } from "../../../../Utils";
import { Selector } from "../../../Components/Selector/Selector";
import { LIVE_ICON, CALENDAR } from '../../../../Svg';
import { SCHEDULED_TYPE, CONTINUOUS_TYPE} from "autoql-fe-utils";
import './TimingView.scss';

export function TimingView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const settingGroup = document.createElement('div');
  const dataAlertSetting = document.createElement('div');
  const alertTypeWrapper = document.createElement('div');
  const alertTypeInputLabel = document.createElement('div');

  const dataAlertSettingGroup = document.createElement('div');
  
  this.createSelectorValueWithSubtitle = ({ label, subtitle, icon }) => {
    const span = document.createElement('span');
    const labelContainer = document.createElement('span');
    const menuIcon = document.createElement('span');
    const labelValue = document.createElement('span');
    const subtitleContainer = document.createElement('span');
    
    labelContainer.classList.add('autoql-vanilla-menu-item-title');
    menuIcon.classList.add('autoql-vanilla-menu-icon');
    subtitleContainer.classList.add('autoql-vanilla-select-option-value-subtitle');
    
    labelValue.textContent = label;
    subtitleContainer.textContent = subtitle;
    
    menuIcon.appendChild(createIcon(icon));
    labelContainer.appendChild(menuIcon);
    labelContainer.appendChild(labelValue);
    span.appendChild(labelContainer);
    span.appendChild(subtitleContainer);
    
    return {
      displayName: labelContainer.innerHTML,
      displayText: span.innerHTML,
    }
  }
  
  this.getTypeValues = () => {
    const scheduledValues = this.createSelectorValueWithSubtitle({
      icon: CALENDAR,
      label: 'Scheduled',
      subtitle: 'Get notifications at specific times.',
    });
    
    const liveValues = this.createSelectorValueWithSubtitle({
      icon: LIVE_ICON,
      label: 'Live',
      subtitle: 'Get notifications as soon as the conditions are met.',
    });
    
    return [
      {
        value: SCHEDULED_TYPE,
        ...scheduledValues
      },
      {
        value: CONTINUOUS_TYPE,
        ...liveValues
      },
    ]
  }
  
  
  const typeSelector = new Selector({ defaultValue: 1, options: this.getTypeValues() });
  
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  settingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  dataAlertSetting.classList.add('autoql-vanilla-data-alert-setting');
  alertTypeWrapper.classList.add('autoql-vanilla-select-and-label');
  alertTypeWrapper.classList.add('autoql-vanilla-rule-condition-select');
  alertTypeWrapper.classList.add('autoql-vanilla-select-full-width');
  alertTypeInputLabel.classList.add('autoql-vanilla-input-label');
  dataAlertSettingGroup.classList.add('autoql-vanilla-data-alert-setting-group');
  
  title.textContent = 'Timing';
  alertTypeInputLabel.textContent = 'Alert Type';
  
  
  alertTypeWrapper.appendChild(alertTypeInputLabel);
  alertTypeWrapper.appendChild(typeSelector);
  dataAlertSetting.appendChild(alertTypeWrapper);
  settingGroup.appendChild(dataAlertSetting);
  settingGroup.appendChild(dataAlertSettingGroup);
  wrapper.appendChild(settingGroup);
  container.appendChild(title);
  container.appendChild(wrapper);

  return container;
}