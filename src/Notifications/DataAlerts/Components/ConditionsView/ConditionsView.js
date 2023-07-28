export function ConditionsView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const ruleInput = document.createElement('div');
  const readOnlyContainer = document.createElement('div');
  const labelContainer = document.createElement('div');
  const inputLabel = document.createElement('div');
  const inputContainer = document.createElement('div');
  const wrapperInputContainer = document.createElement('div');
  const queryInput = document.createElement('input');
  
  title.textContent = 'Conditions';
  inputLabel.textContent = 'Trigger Alert when this query';
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
  inputContainer.classList.add('autoql-vanilla-input-container');
  inputContainer.classList.add('autoql-vanilla-input-large');
  wrapperInputContainer.classList.add('autoql-vanilla-input-and-icon');
  queryInput.classList.add('autoql-vanilla-input');

  wrapperInputContainer.appendChild(queryInput);
  inputContainer.appendChild(wrapperInputContainer);
  labelContainer.appendChild(inputLabel);
  labelContainer.appendChild(inputContainer);
  readOnlyContainer.appendChild(labelContainer);
  ruleInput.appendChild(readOnlyContainer);
  wrapper.appendChild(ruleInput);
  container.appendChild(title);
  container.appendChild(wrapper);

  return container;
}