import { ChipsContainer } from '../../../Components/ChipsContainer/ChipsContainer';
import { QueryResultInput } from '../../../Components/QueryResultInput';
import { Selector } from '../../../Components/Selector/Selector';
import './ConditionsView.scss';
import { DATA_ALERT_OPERATORS, NUMBER_TERM_TYPE, QUERY_TERM_TYPE, PERIODIC_TYPE } from 'autoql-fe-utils';

export function ConditionsView({ dataAlert }) {
    //Trigger alert section
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

    const defaultSecondTerm = dataAlert.expression?.[1]?.term_type;
    const termInputType = defaultSecondTerm === NUMBER_TERM_TYPE ? 'number' : 'text';
    const inputDefaultValue = dataAlert.expression?.[1]?.term_value;
    const defaultValueCondition = dataAlert.expression?.[0]?.condition;
    const termInputValue = new QueryResultInput({ termInputType, inputDefaultValue });
    const conditionSelect = new Selector({
        defaultValue: defaultValueCondition,
        options: this.getOperatorSelectValues(),
    });
    const secondTermSelect = new Selector({
        defaultValue: defaultSecondTerm,
        options: this.getSecondTermValues(),
        onChange: this.handleInputType,
    });

    this.createChips = () => {
        this.chipsContainer = new ChipsContainer({ filters: dataAlert.expression[0].session_filter_locks });
        if (dataAlert?.expression?.[0]?.session_filter_locks?.length === 0) return;
        ruleInput.appendChild(this.chipsContainer);
    };

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

    title.textContent = 'Conditions';
    inputLabel.textContent = 'Trigger Alert when this query';
    queryInput.setAttribute('type', 'text');
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

    container.getValues = () => {
        const { expression } = dataAlert;
        if (dataAlert.notification_type !== PERIODIC_TYPE) {
            expression[0].condition = conditionSelect.value;
            expression[1].term_type = secondTermSelect.value;
            expression[1].term_value = termInputValue.getValue();
        }
        return { expression, session_filter_locks: this.chipsContainer.getValues() };
    };

    container.isValid = () => {
        return termInputValue.getValue() !== '';
    };

    if (dataAlert.notification_type !== PERIODIC_TYPE) {
        this.createConditionsSection();
    }
    this.createChips();

    return container;
}
