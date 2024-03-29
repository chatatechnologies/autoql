import { DATA_ALERT_OPERATORS, NUMBER_TERM_TYPE, QUERY_TERM_TYPE } from 'autoql-fe-utils';
import { QueryResultInput } from '../../QueryResultInput';
import { Selector } from '../../Selector/Selector';
import { uuidv4 } from '../../../../Utils';

export function ConditionsStep({ queryResponse }) {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const ruleInput = document.createElement('div');
    const readOnlyContainer = document.createElement('div');
    const labelContainer = document.createElement('div');
    const inputLabel = document.createElement('div');
    const inputContainer = document.createElement('div');
    const wrapperInputContainer = document.createElement('div');
    const queryInput = document.createElement('input');

    this.handleInputType = (option) => {
        const type = option.value === NUMBER_TERM_TYPE ? 'number' : 'text';
        termInputValue.setInputType(type);
    };

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
            };
        });
    };

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
            },
        ];
    };

    const termInputValue = new QueryResultInput({ termInputType: NUMBER_TERM_TYPE, inputDefaultValue: '' });
    const conditionSelect = new Selector({ defaultValue: 'GREATER_THAN', options: this.getOperatorSelectValues() });
    const secondTermSelect = new Selector({
        defaultValue: NUMBER_TERM_TYPE,
        options: this.getSecondTermValues(),
        onChange: this.handleInputType,
    });

    this.createConditionsSection = () => {
        const conditionWrapper = document.createElement('div');
        const conditionLabel = document.createElement('div');
        const ruleContainer = document.createElement('div');
        const secondInputContainer = document.createElement('div');
        const ruleSecondInputContainer = document.createElement('div');
        const secondRuleInput = document.createElement('div');
        const secondLabelContainer = document.createElement('div');

        conditionLabel.textContent = 'Meets this condition';

        conditionLabel.classList.add('autoql-vanilla-input-label');
        conditionWrapper.classList.add('autoql-vanilla-select-and-label');
        conditionWrapper.classList.add('autoql-vanilla-rule-condition-select');
        ruleContainer.classList.add('autoql-vanilla-notification-rule-container');
        secondInputContainer.classList.add('autoql-vanilla-input-container');
        secondInputContainer.classList.add('autoql-vanilla-input-large');
        secondInputContainer.classList.add('autoql-vanilla-input-number');
        ruleSecondInputContainer.classList.add('autoql-vanilla-rule-second-input-container');
        secondRuleInput.classList.add('autoql-vanilla-rule-input');
        secondLabelContainer.classList.add('autoql-vanilla-input-and-label-container');

        conditionWrapper.appendChild(conditionLabel);
        conditionWrapper.appendChild(conditionSelect);
        secondInputContainer.appendChild(secondTermSelect);
        secondInputContainer.appendChild(termInputValue);
        secondLabelContainer.appendChild(secondInputContainer);
        secondRuleInput.appendChild(secondLabelContainer);
        ruleSecondInputContainer.appendChild(secondRuleInput);
        ruleContainer.appendChild(conditionWrapper);
        ruleContainer.appendChild(ruleSecondInputContainer);
        wrapper.appendChild(ruleContainer);
    };

    inputLabel.textContent = 'Trigger Alert when this query';
    queryInput.setAttribute('type', 'text');
    queryInput.setAttribute('value', queryResponse.data.text);
    queryInput.setAttribute('disabled', 'true');
    queryInput.setAttribute('readonly', 'true');

    wrapper.classList.add('autoql-vanilla-data-alerts-container');
    container.classList.add('autoql-vanilla-data-alert-setting-section');
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
    container.appendChild(wrapper);

    this.buildExpression = () => {
        const expression = [];
        const { text } = queryResponse.data;

        expression.push({
            condition: conditionSelect.value,
            filters: [],
            id: uuidv4(),
            session_filter_locks: [],
            term_type: 'QUERY',
            term_value: text,
            user_selection: [],
        });

        expression.push({
            condition: 'TERMINATOR',
            filters: [],
            id: uuidv4(),
            session_filter_locks: [],
            term_type: secondTermSelect.value,
            term_value: termInputValue.getValue(),
            user_selection: [],
        });

        return expression;
    };

    container.getValues = () => {
        return {
            expression: this.buildExpression(),
        };
    };

    container.isValid = () => {
        return termInputValue.getValue() !== '';
    };

    this.createConditionsSection();

    container.classList.add('autoql-vanilla-data-alert-modal-step');
    return container;
}
