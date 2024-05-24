import {
    COMPARE_TYPE,
    CONTINUOUS_TYPE,
    DATA_ALERT_CONDITION_TYPES,
    DATA_ALERT_OPERATORS,
    EXISTS_TYPE,
    NUMBER_TERM_TYPE,
    QUERY_TERM_TYPE,
    SCHEDULED_TYPE,
    getSupportedConditionTypes,
    isColumnNumberType,
} from 'autoql-fe-utils';

import { Select } from '../../../../ChataComponents/Select';
import { Input } from '../../../../ChataComponents/Input';
import { uuidv4 } from '../../../../Utils';

import './ConditionsStep.scss';

const CONDITION_TYPE_LABELS = {
    [EXISTS_TYPE]: '<span>receives <strong>new rows</strong> of data.</span>',
    [COMPARE_TYPE]: '<span>contains data that meets the following <strong>conditions:</strong></span>',
};

const CONDITION_TYPE_LABELS_SCHEDULED = {
    [EXISTS_TYPE]: '<span>with the result of <strong>this query:</strong></span>',
    [COMPARE_TYPE]: '<span>based on the following <strong>conditions:</strong></span>',
};

const getFirstQuerySelectedColumns = (queryResponse, initialData) => {
    const firstQuerySelectedNumberColumnName = initialData?.[0]?.compare_column ?? '';

    let firstQueryCompareColumnIndex;
    if (firstQuerySelectedNumberColumnName) {
        firstQueryCompareColumnIndex = queryResponse?.data?.columns?.findIndex(
            (col) => col.name === firstQuerySelectedNumberColumnName,
        );
    } else {
        firstQueryCompareColumnIndex = queryResponse?.data?.columns?.findIndex(
            (col) => isColumnNumberType(col) && col.is_visible,
        );
    }

    if (firstQueryCompareColumnIndex === -1) {
        firstQueryCompareColumnIndex = undefined;
    }

    const selectedColumns = firstQueryCompareColumnIndex ? [firstQueryCompareColumnIndex] : [];

    return selectedColumns;
};

export function ConditionsStep({ queryResponse, initialData, dataAlertType = CONTINUOUS_TYPE, onChange = () => {} }) {
    const SUPPORTED_CONDITION_TYPES = getSupportedConditionTypes(undefined, queryResponse);

    this.conditionType = SUPPORTED_CONDITION_TYPES[0];
    this.dataAlertType = dataAlertType;
    this.firstQuerySelectedColumns = getFirstQuerySelectedColumns(queryResponse, initialData);

    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-conditions-step-container');
    container.classList.add('autoql-vanilla-data-alert-setting-section');

    const ruleContainer = document.createElement('div');

    this.createQueryInput = () => {
        const queryInputContainer = document.createElement('div');
        queryInputContainer.classList.add('autoql-vanilla-data-alert-rule-query-readonly-container');

        const queryInput = new Input({
            label: 'Query',
            value: queryResponse.data.text,
            readOnly: true,
            disabled: true,
            fullWidth: true,
        });

        queryInputContainer.appendChild(queryInput);

        return queryInputContainer;
    };

    this.createColumnSelectMessage = () => {
        const columnValueMessageAndSelector = document.createElement('div');
        columnValueMessageAndSelector.classList.add('autoql-vanilla-condition-type-container');

        const columnValueMessage = document.createElement('span');
        columnValueMessage.innerHTML = 'Any value from';
        columnValueMessageAndSelector.appendChild(columnValueMessage);

        const columnValueSelector = new Select({
            outlined: false,
            showArrow: false,
            initialValue: this.firstQuerySelectedColumns[0],
            onChange: (col) => (this.firstQuerySelectedColumns = [col]),
            options: queryResponse?.data?.columns
                ?.filter(
                    (col) =>
                        col.is_visible &&
                        isColumnNumberType(col) &&
                        !queryResponse?.data?.fe_req?.additional_selects?.find(
                            (select) => select.columns[0] === col.name,
                        ),
                )
                ?.map((col) => {
                    return {
                        value: col.index,
                        label: col.display_name,
                    };
                }),
        });
        columnValueMessageAndSelector.appendChild(columnValueSelector);
        return columnValueMessageAndSelector;
    };

    this.handleInputType = (option) => {
        const type = option.value === NUMBER_TERM_TYPE ? 'number' : 'text';
        termInputValue.setInputType(type);
    };

    this.getOperatorSelectValues = () => {
        const keys = Object.keys(DATA_ALERT_OPERATORS);
        return keys.map((key) => {
            const value = DATA_ALERT_OPERATORS[key];
            const { displayName, symbol } = value;
            const listLabel = `${displayName} (${symbol})`;
            return {
                label: displayName,
                listLabel,
                value: key,
            };
        });
    };

    const termInputValue = new Input({
        value: '',
        type: 'number',
        hasSelect: true,
        showSpinWheel: false,
        selectInitialValue: NUMBER_TERM_TYPE,
        placeholder: 'Type a number',
        onChange: onChange,
        selectOnChange: onChange,
        selectOptions: [
            {
                value: NUMBER_TERM_TYPE,
                label: '<span>this <strong>number:</strong></span>',
                inputType: 'number',
                inputPlaceholder: 'Type a number',
            },
            {
                value: QUERY_TERM_TYPE,
                label: '<span>the result of this <strong>query:</strong></span>',
                inputType: 'text',
                inputPlaceholder: 'Type a query',
            },
        ],
    });

    const conditionSelect = new Select({
        initialValue: 'GREATER_THAN',
        options: this.getOperatorSelectValues(),
    });

    conditionSelect.classList.add('autoql-vanilla-condition-select');

    this.createConditionTypeMessage = () => {
        const conditionWrapper = document.createElement('div');
        conditionWrapper.classList.add('autoql-vanilla-select-and-label');
        conditionWrapper.classList.add('autoql-vanilla-rule-condition-select');

        const conditionTypeSelectMessageContainer = document.createElement('div');
        conditionTypeSelectMessageContainer.classList.add('autoql-vanilla-condition-type-container');

        const conditionTypeSelectMessage = document.createElement('span');
        conditionTypeSelectMessage.textContent = 'Send a notification when your query';

        const conditionTypeSelector = new Select({
            outlined: false,
            showArrow: false,
            initialValue: this.conditionType,
            options: Object.keys(DATA_ALERT_CONDITION_TYPES).map((type) => {
                const disabled = !SUPPORTED_CONDITION_TYPES.includes(type);

                return {
                    value: type,
                    label:
                        this.dataAlertType === SCHEDULED_TYPE
                            ? CONDITION_TYPE_LABELS_SCHEDULED[type]
                            : CONDITION_TYPE_LABELS[type],
                    disabled,
                    tooltip: disabled ? 'Your query is not eligible for this option.' : undefined,
                };
            }),
            onChange: (option) => {
                this.conditionType = option.value;

                if (option.value === EXISTS_TYPE) {
                    if (this.existsTypeContent) this.existsTypeContent.style.display = 'block';
                    if (this.compareTypeContent) this.compareTypeContent.style.display = 'none';
                } else if (option.value === COMPARE_TYPE) {
                    if (this.compareTypeContent) this.compareTypeContent.style.display = 'block';
                    if (this.existsTypeContent) this.existsTypeContent.style.display = 'none';
                }

                onChange();
            },
        });

        conditionTypeSelectMessageContainer.appendChild(conditionTypeSelectMessage);
        conditionTypeSelectMessageContainer.appendChild(conditionTypeSelector);

        conditionWrapper.appendChild(conditionSelect);
        ruleContainer.appendChild(conditionWrapper);

        container.appendChild(conditionTypeSelectMessageContainer);
    };

    this.createConditionBuilder = () => {
        const conditionBuilderContainer = document.createElement('div');

        const secondInputContainer = document.createElement('div');
        const ruleSecondInputContainer = document.createElement('div');
        const secondRuleInput = document.createElement('div');
        const secondLabelContainer = document.createElement('div');

        conditionBuilderContainer.classList.add('autoql-vanilla-notification-rule-container');
        secondInputContainer.classList.add('autoql-vanilla-input-container');
        secondInputContainer.classList.add('autoql-vanilla-input-large');
        secondInputContainer.classList.add('autoql-vanilla-input-number');
        ruleSecondInputContainer.classList.add('autoql-vanilla-rule-second-input-container');
        secondRuleInput.classList.add('autoql-vanilla-rule-input');
        secondLabelContainer.classList.add('autoql-vanilla-input-and-label-container');

        ruleSecondInputContainer.appendChild(conditionSelect);

        secondInputContainer.appendChild(termInputValue);
        secondLabelContainer.appendChild(secondInputContainer);
        secondRuleInput.appendChild(secondLabelContainer);
        ruleSecondInputContainer.appendChild(secondRuleInput);
        conditionBuilderContainer.appendChild(ruleSecondInputContainer);

        return conditionBuilderContainer;
    };

    this.createCompareTypeContent = () => {
        const compareTypeContent = document.createElement('div');
        this.compareTypeContent = compareTypeContent;

        if (this.conditionType !== COMPARE_TYPE) {
            compareTypeContent.style.display = 'none';
        }

        const queryInput = this.createQueryInput();
        const columnValueMessage = this.createColumnSelectMessage();
        const conditionBuilder = this.createConditionBuilder();

        compareTypeContent.appendChild(queryInput);
        compareTypeContent.appendChild(columnValueMessage);
        compareTypeContent.appendChild(conditionBuilder);

        ruleContainer.appendChild(compareTypeContent);
    };

    this.createExistsTypeContent = () => {
        const existsTypeContent = document.createElement('div');
        this.existsTypeContent = existsTypeContent;

        if (this.conditionType !== EXISTS_TYPE) {
            existsTypeContent.style.display = 'none';
        }

        const queryInput = this.createQueryInput();

        existsTypeContent.appendChild(queryInput);
        ruleContainer.appendChild(existsTypeContent);
    };

    this.createConditionsSection = () => {
        ruleContainer.innerHTML = '';

        // Render both, but hide the inactive one
        // This persists the settings when switching between the 2 options
        if (SUPPORTED_CONDITION_TYPES.includes(COMPARE_TYPE)) {
            this.createCompareTypeContent();
        }

        if (SUPPORTED_CONDITION_TYPES.includes(EXISTS_TYPE)) {
            this.createExistsTypeContent();
        }
    };

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
        if (this.conditionType === EXISTS_TYPE) {
            return true;
        } else if (this.conditionType === COMPARE_TYPE) {
            return termInputValue.getValue() !== '';
        }
    };

    this.createConditionTypeMessage();

    container.appendChild(ruleContainer);

    this.createConditionsSection();

    container.classList.add('autoql-vanilla-data-alert-modal-step');
    return container;
}
