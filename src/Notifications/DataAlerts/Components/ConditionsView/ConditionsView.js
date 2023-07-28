export function ConditionsView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const ruleInput = document.createElement('div');
  const readOnlyContainer = document.createElement('div');
  const labelContainer = document.createElement('div');

  title.textContent = 'Conditions';
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  ruleInput.classList.add('autoql-vanilla-rule-input');
  readOnlyContainer.classList.add('autoql-vanilla-data-alert-rule-query-readonly-container');
  labelContainer.classList.add('autoql-vanilla-input-and-label-container');
  
  container.appendChild(title);
  container.appendChild(wrapper);
  return container;
}