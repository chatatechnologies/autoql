import { NumberInput } from '../../../Components/NumberInput';
import { Selector } from '../../../Components/Selector/Selector';
import './ConditionsView.scss';
import { DATA_ALERT_OPERATORS, NUMBER_TERM_TYPE, QUERY_TERM_TYPE } from 'autoql-fe-utils';

export function ConditionsView({ dataAlert }) {
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
  const ruleSecondInputContainer = document.createElement('div');
  const secondRuleInput = document.createElement('div');
  const secondInputContainer = document.createElement('div');
  const secondLabelContainer = document.createElement('div');
  
  let defaultValue = undefined;
  if(dataAlert?.expression) {
    defaultValue = dataAlert.expression[0].condition;
  }

  this.getOperatorSelectValues = () => {
    const keys = Object.keys(DATA_ALERT_OPERATORS);
    return keys.map((key) => {
      const value = DATA_ALERT_OPERATORS[key];
      const { displayName, symbol } = value;
      const displayText = `${displayName} (${symbol})`;
      return {
        displayName,
        displayText,
        value: key,
      }
    })
  }

  this.getSecondTermValues = () => {
    return [
      {
        value: NUMBER_TERM_TYPE,
        displayName: `
          <span>
            this <strong>number:</strong>
          </span>
        `,
      },
      {
        value: QUERY_TERM_TYPE,
        displayName: `
          <span>
            the result of this <strong>query:</strong>
          </span>
        `,
      }
    ]
  }

  const conditionSelect = new Selector({ defaultValue, options: this.getOperatorSelectValues() });
  const secondTermSelect = new Selector({ defaultValue, options: this.getSecondTermValues() });
  const termInputValue = new NumberInput();

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
  secondRuleInput.classList.add('autoql-vanilla-rule-input');
  readOnlyContainer.classList.add('autoql-vanilla-data-alert-rule-query-readonly-container');
  labelContainer.classList.add('autoql-vanilla-input-and-label-container');
  secondLabelContainer.classList.add('autoql-vanilla-input-and-label-container');
  inputLabel.classList.add('autoql-vanilla-input-label');
  conditionLabel.classList.add('autoql-vanilla-input-label');
  inputContainer.classList.add('autoql-vanilla-input-container');
  inputContainer.classList.add('autoql-vanilla-input-large');
  secondInputContainer.classList.add('autoql-vanilla-input-container');
  secondInputContainer.classList.add('autoql-vanilla-input-large');
  secondInputContainer.classList.add('autoql-vanilla-input-number');
  wrapperInputContainer.classList.add('autoql-vanilla-input-and-icon');
  queryInput.classList.add('autoql-vanilla-input');
  ruleContainer.classList.add('autoql-vanilla-notification-rule-container');
  conditionWrapper.classList.add('autoql-vanilla-select-and-label');
  conditionWrapper.classList.add('autoql-vanilla-rule-condition-select');
  ruleSecondInputContainer.classList.add('autoql-vanilla-rule-second-input-container');

  secondInputContainer.appendChild(secondTermSelect);
  secondInputContainer.appendChild(termInputValue);
  secondLabelContainer.appendChild(secondInputContainer);
  secondRuleInput.appendChild(secondLabelContainer);
  ruleSecondInputContainer.appendChild(secondRuleInput);
  conditionWrapper.appendChild(conditionLabel);
  conditionWrapper.appendChild(conditionSelect);
  ruleContainer.appendChild(conditionWrapper);
  ruleContainer.appendChild(ruleSecondInputContainer);
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