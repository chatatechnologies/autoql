import { Selector } from '../../../Components/Selector/Selector';
import './ConditionsView.scss';

export function ConditionsView() {
  //Trigger alert section
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const ruleInput = document.createElement('div');
  const readOnlyContainer = document.createElement('div');
  const labelContainer = document.createElement('div');
  const inputLabel = document.createElement('div');
  const conditionWrapper = document.createElement('div');
  const conditionLabel = document.createElement('div');

  // Meets this condition section
  const inputContainer = document.createElement('div');
  const wrapperInputContainer = document.createElement('div');
  const queryInput = document.createElement('input');
  const ruleContainer = document.createElement('div');
  const conditionSelect = new Selector({ defaultIndex: 0, options: [] });

  title.textContent = 'Conditions';
  inputLabel.textContent = 'Trigger Alert when this query';
  conditionLabel.textContent = 'Meets this condition';
  queryInput.setAttribute('type', 'text');
  queryInput.setAttribute('value', 'Total trade size this year');
  queryInput.setAttribute('disabled', 'true');
  queryInput.setAttribute('readonly', 'true');

  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  ruleInput.classList.add('autoql-vanilla-rule-input');
  readOnlyContainer.classList.add('autoql-vanilla-data-alert-rule-query-readonly-container');
  labelContainer.classList.add('autoql-vanilla-input-and-label-container');
  inputLabel.classList.add('autoql-vanilla-input-label');
  conditionLabel.classList.add('autoql-vanilla-input-label');
  inputContainer.classList.add('autoql-vanilla-input-container');
  inputContainer.classList.add('autoql-vanilla-input-large');
  wrapperInputContainer.classList.add('autoql-vanilla-input-and-icon');
  queryInput.classList.add('autoql-vanilla-input');
  ruleContainer.classList.add('autoql-vanilla-notification-rule-container');
  conditionWrapper.classList.add('autoql-vanilla-select-and-label');
  conditionWrapper.classList.add('autoql-vanilla-rule-condition-select')

  conditionWrapper.appendChild(conditionLabel);
  conditionWrapper.appendChild(conditionSelect);
  ruleContainer.appendChild(conditionWrapper);
  wrapperInputContainer.appendChild(queryInput);
  inputContainer.appendChild(wrapperInputContainer);
  labelContainer.appendChild(inputLabel);
  labelContainer.appendChild(inputContainer);
  readOnlyContainer.appendChild(labelContainer);
  ruleInput.appendChild(readOnlyContainer);
  wrapper.appendChild(ruleInput);
  wrapper.appendChild(ruleContainer);
  container.appendChild(title);
  container.appendChild(wrapper);

  return container;
}