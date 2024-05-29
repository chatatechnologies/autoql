import {
    COMPARE_TYPE,
    CONTINUOUS_TYPE,
    DATA_ALERT_CONDITION_TYPES,
    DATA_ALERT_OPERATORS,
    EXISTS_TYPE,
    NUMBER_TERM_TYPE,
    QUERY_TERM_TYPE,
    SCHEDULED_TYPE,
    getColumnTypeAmounts,
    getGroupableColumns,
    getStringColumnIndices,
    getSupportedConditionTypes,
    isColumnNumberType,
    runQueryOnly,
    getAuthentication,
    getAutoQLConfig,
    REQUEST_CANCELLED_ERROR,
    isSingleValueResponse,
    isListQuery,
} from 'autoql-fe-utils';

import axios from 'axios';
import isEqual from 'lodash.isequal';

import { Input } from '../../../../../ChataComponents/Input';
import { Select } from '../../../../../ChataComponents/Select';
import { SelectableTable } from '../../../../../SelectableTable';
import { createIcon, uuidv4 } from '../../../../../Utils';
import { CHECK, WARNING_TRIANGLE } from '../../../../../Svg';

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

export function ConditionsStep({
    queryResponse,
    dataAlert,
    dataAlertType = CONTINUOUS_TYPE,
    onChange = () => {},
    options = {},
}) {
    const initialData = dataAlert?.expression;
    const queryText = dataAlert?.expression?.[0]?.term_value ?? queryResponse?.data?.text;

    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-conditions-step-container');
    container.classList.add('autoql-vanilla-data-alert-setting-section');

    const SUPPORTED_CONDITION_TYPES = getSupportedConditionTypes(undefined, queryResponse);
    const PREVIEW_ROWS = 20;

    const isFirstQuerySingleValue = isSingleValueResponse(queryResponse);
    const firstQueryGroupables = getGroupableColumns(queryResponse?.data?.columns)?.map(
        (i) => queryResponse?.data?.columns?.find((col) => col.index === i)?.name,
    );

    this.dataAlertType = dataAlertType;
    this.firstQuerySelectedColumns = getFirstQuerySelectedColumns(queryResponse, initialData);
    this.firstQueryJoinColumns = firstQueryGroupables ?? [];
    this.secondQuerySelectedColumns = [];
    this.secondTermType = NUMBER_TERM_TYPE;

    container.conditionType = SUPPORTED_CONDITION_TYPES[0];

    const ruleContainer = document.createElement('div');

    container.setDataAlertType = (type) => {
        if (type === SCHEDULED_TYPE || type === CONTINUOUS_TYPE) {
            this.dataAlertType = type;
            this.renderView();
        }
    };

    this.clearValidationMessage = () => {
        if (this.validationMessageContainer) {
            this.validationMessageContainer.innerHTML = '';
        }
    };

    this.showValidationMessage = (state, error) => {
        if (!this.validationMessageContainer) {
            return;
        }

        this.validationMessageContainer.innerHTML = '';

        if (state === 'loading') {
            const loadingText = document.createElement('span');
            loadingText.innerHTML = 'Validating...';
            loadingText.style.color = 'var(--autoql-vanilla-text-color-placeholder)';
            this.validationMessageContainer.appendChild(loadingText);
        } else if (state === 'valid') {
            const validText = document.createElement('span');
            const validTextSpan = document.createElement('span');
            validTextSpan.innerHTML = '<span> Valid</span>';
            const validTextIcon = createIcon(CHECK);
            validText.appendChild(validTextIcon);
            validText.appendChild(validTextSpan);
            validText.style.color = 'var(--autoql-vanilla-success-color)';
            this.validationMessageContainer.appendChild(validText);
        } else if (state === 'error') {
            const errorText = document.createElement('span');
            const errorTextSpan = document.createElement('span');
            errorText.style.color = 'var(--autoql-vanilla-warning-color)';
            errorTextSpan.innerHTML = error ?? '<span> That query is invalid. Try entering a different query.</span>';
            const errorTextIcon = createIcon(WARNING_TRIANGLE);
            errorText.appendChild(errorTextIcon);
            errorText.appendChild(errorTextSpan);
            this.validationMessageContainer.appendChild(errorText);
        }
    };

    this.cancelSecondValidation = () => {
        this.axiosSource?.cancel(REQUEST_CANCELLED_ERROR);
    };

    this.isSecondQueryValid = (response) => {
        if (!response) {
            return { isValid: false };
        }

        // const firstColumns = queryResponse?.data?.columns;
        const secondColumns = response?.data?.data?.columns;

        // const isFirstQuerySingleValue = isSingleValueResponse(queryResponse);
        const isSecondQuerySingleValue = isSingleValueResponse(response);
        const isSecondQueryListQuery = isListQuery(secondColumns) && !isSecondQuerySingleValue;

        // const firstQueryGroupables = getGroupableColumns(firstColumns)?.map(
        //     (i) => firstColumns.find((col) => col.index === i)?.name,
        // );

        const secondQueryGroupables = getGroupableColumns(secondColumns)?.map(
            (i) => secondColumns.find((col) => col.index === i)?.name,
        );

        // this.firstQueryJoinColumns = firstQueryGroupables ?? [];
        this.secondQueryJoinColumns = secondQueryGroupables ?? [];

        const areGroupablesSameAsFirstQuery = isEqual(firstQueryGroupables, secondQueryGroupables);

        if (!areGroupablesSameAsFirstQuery) {
            return {
                isValid: false,
                error: `<span>The groupby columns in this query do not match the groupby columns in the initial query.</span>`,
            };
        }

        if (
            (isFirstQuerySingleValue && !isSecondQuerySingleValue) ||
            (!queryResponse &&
                initialData?.length === 2 &&
                this.firstQueryJoinColumns?.length === 0 &&
                !isSecondQuerySingleValue)
        ) {
            return { isValid: false, error: `<span>The result of this query must be a single value.</span>` };
        }

        if (isSecondQueryListQuery && !isFirstQuerySingleValue) {
            return {
                isValid: false,
                error: `<span> Unsupported comparison query: Please use a query with a cumulative amount.</span>`,
            };
        }

        return { isValid: true };
    };

    this.onValidationResponse = (response) => {
        const { isValid, error } = this.isSecondQueryValid(response);

        if (!isValid) {
            this.showValidationMessage('error', error);
            return;
        }

        this.createSecondColumnSelectionTableContent();
        this.showValidationMessage('valid');
        return;
    };

    this.runSecondValidation = (query) => {
        this.axiosSource = axios.CancelToken?.source();
        this.secondQueryResponse = undefined;

        if (!query) {
            this.clearValidationMessage();
            return;
        }

        runQueryOnly({
            ...getAuthentication(options.authentication),
            ...getAutoQLConfig(options.autoQLConfig),
            query,
            source: 'data_alert_validation',
            pageSize: PREVIEW_ROWS,
            cancelToken: this.axiosSource?.token,
            allowSuggestions: false,
        })
            .then((response) => {
                this.isValidating = false;
                this.secondQueryResponse = response;
                this.onValidationResponse(response);
            })
            .catch((error) => {
                if (error?.data?.message !== REQUEST_CANCELLED_ERROR) {
                    this.isValidating = false;
                    this.showValidationMessage('error');
                }
            });
    };

    this.clearSecondQueryColumnSelectionTable = () => {
        if (this.secondColumnSelectionTableContainer) {
            this.secondColumnSelectionTableContainer.innerHTML = '';
        }
    };

    this.validateSecondQuery = (query) => {
        this.cancelSecondValidation();
        this.clearSecondQueryColumnSelectionTable();

        if (query) {
            this.showValidationMessage('loading');
        } else {
            this.showValidationMessage();
            return;
        }

        clearTimeout(this.secondValidationTimeout);
        this.secondValidationTimeout = setTimeout(() => {
            this.isValidating = true;
            this.runSecondValidation(query);
        }, 500);
    };

    this.createQueryInput = () => {
        const queryInputContainer = document.createElement('div');
        queryInputContainer.classList.add('autoql-vanilla-data-alert-rule-query-readonly-container');

        const queryInput = new Input({
            label: 'Query',
            value: queryText,
            readOnly: true,
            disabled: true,
            fullWidth: true,
        });

        queryInputContainer.appendChild(queryInput);

        return queryInputContainer;
    };

    this.onColumnSelectionFromTable = (columns) => {
        const columnIndex = columns[0];
        this.columnValueSelector?.setValue(columnIndex, true);
        this.firstQuerySelectedColumns = columns;
    };

    this.onSecondColumnSelectionFromTable = (columns) => {
        this.secondQuerySelectedColumns = columns;
    };

    this.onColumnSelectionFromSelect = (columnIndex) => {
        if (columnIndex >= 0) {
            this.columnSelectionTable?.onColumnHeaderClick(columnIndex, true);
            this.firstQuerySelectedColumns = [columnIndex];
        }
    };

    this.shouldRenderSecondFieldSelectionGrid = () => {
        if (initialData?.length > 0 && !queryResponse && this.firstQueryJoinColumns.length === 0) {
            return false;
        }

        const amountOfNumberColumns = getColumnTypeAmounts(
            this.secondQueryResponse?.data?.data?.columns,
        )?.amountOfNumberColumns;
        const isSecondQueryListQuery = isListQuery(this.secondQueryResponse?.data?.data?.columns);
        const isSecondQueryValid = this.isSecondQueryValid(this.secondQueryResponse)?.isValid;

        const shouldRender =
            !isSingleValueResponse(this.secondQueryResponse) &&
            amountOfNumberColumns >= 1 &&
            this.termInputValue?.selectValue === QUERY_TERM_TYPE &&
            !this.isValidating &&
            isSecondQueryValid &&
            !isSecondQueryListQuery;

        return shouldRender;
    };

    this.createSecondColumnSelectionTableContent = () => {
        if (!this.secondColumnSelectionTableContainer) {
            return;
        }

        if (this.shouldRenderSecondFieldSelectionGrid()) {
            const columns = this.secondQueryResponse?.data?.data?.columns;
            const additionalSelects = this.secondQueryResponse?.data?.data?.fe_req?.additional_selects;
            const groupableColumns = getGroupableColumns(columns);
            const { stringColumnIndices } = getStringColumnIndices(columns);
            const additionalSelectColumns =
                columns
                    ?.filter((col) => !!additionalSelects?.find((select) => select.columns[0] === col.name))
                    ?.map((col) => col.index) ?? [];

            const disabledColumns = Array.from(
                new Set([...groupableColumns, ...stringColumnIndices, ...additionalSelectColumns]),
            );

            const initialSelectedColumn = columns?.find(
                (col) =>
                    col.is_visible &&
                    isColumnNumberType(col) &&
                    !disabledColumns.find((columnIndex) => col.index === columnIndex),
            )?.index;
            if (initialSelectedColumn >= 0) this.secondQuerySelectedColumns = [initialSelectedColumn];

            const columnSelectionTable = new SelectableTable({
                options,
                queryResponse: this.secondQueryResponse?.data?.data,
                selectedColumns: this.secondQuerySelectedColumns,
                onColumnSelection: (columns) => this.onSecondColumnSelectionFromTable(columns),
                showEndOfPreviewMessage: true,
                disabledColumns,
                rowLimit: PREVIEW_ROWS,
                radio: true,
            });

            this.secondColumnSelectionTable = columnSelectionTable;

            this.secondColumnSelectionTableContainer.appendChild(columnSelectionTable.selectableTable);
        } else {
            this.clearSecondQueryColumnSelectionTable();
        }
    };

    this.createSecondColumnSelectionTable = () => {
        if (this.secondColumnSelectionTableContainer) {
            this.clearSecondQueryColumnSelectionTable();
        } else {
            this.secondColumnSelectionTableContainer = document.createElement('div');
            this.secondColumnSelectionTableContainer.classList.add('autoql-vanilla-column-selection-table-container');
        }

        this.createSecondColumnSelectionTableContent();

        return this.secondColumnSelectionTableContainer;
    };

    this.createColumnSelectionTable = () => {
        const shouldRenderColumnSelectionTablePreview =
            getColumnTypeAmounts(queryResponse?.data?.columns)['amountOfNumberColumns'] >= 2;

        if (shouldRenderColumnSelectionTablePreview) {
            const columnSelectionTableContainer = document.createElement('div');
            columnSelectionTableContainer.classList.add('autoql-vanilla-column-selection-table-container');

            const columns = queryResponse?.data?.columns;
            const additionalSelects = queryResponse?.data?.fe_req?.additional_selects;
            const groupableColumns = getGroupableColumns(columns);
            const { stringColumnIndices } = getStringColumnIndices(columns);
            const additionalSelectColumns =
                columns
                    ?.filter((col) => !!additionalSelects?.find((select) => select.columns[0] === col.name))
                    ?.map((col) => col.index) ?? [];

            const disabledColumns = Array.from(
                new Set([...groupableColumns, ...stringColumnIndices, ...additionalSelectColumns]),
            );

            const columnSelectionTable = new SelectableTable({
                options,
                queryResponse: queryResponse?.data,
                selectedColumns: this.firstQuerySelectedColumns,
                onColumnSelection: (columns) => this.onColumnSelectionFromTable(columns),
                showEndOfPreviewMessage: true,
                disabledColumns,
                rowLimit: PREVIEW_ROWS,
                radio: true,
            });

            this.columnSelectionTable = columnSelectionTable;

            columnSelectionTableContainer.appendChild(columnSelectionTable.selectableTable);

            return columnSelectionTableContainer;
        }
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
            onChange: (col) => {
                this.firstQuerySelectedColumns = [col.value];
                this.onColumnSelectionFromSelect(col.value);
            },
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

        this.columnValueSelector = columnValueSelector;

        columnValueMessageAndSelector.appendChild(columnValueSelector);
        return columnValueMessageAndSelector;
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

    this.termInputValue = new Input({
        value: '',
        type: 'number',
        hasSelect: true,
        showSpinWheel: false,
        selectInitialValue: this.secondTermType,
        placeholder: 'Type a number',
        onChange: (e) => {
            if (this.secondTermType === QUERY_TERM_TYPE) {
                this.validateSecondQuery(e.target.value);
            }

            onChange({ secondTermValue: e.target.value });
        },
        selectOnChange: (option) => {
            this.secondTermType = option.value;
            this.cancelSecondValidation();
            this.clearValidationMessage();
            this.clearSecondQueryColumnSelectionTable();
            onChange({ secondTermType: option.value });
        },
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

    this.createConditionTypeMessage = () => {
        if (container.conditionTypeSelectMessageContainer) {
            container.conditionTypeSelectMessageContainer.innerHTML = '';
        }

        const conditionTypeSelectMessageContainer = document.createElement('div');
        conditionTypeSelectMessageContainer.classList.add('autoql-vanilla-condition-type-container');

        container.conditionTypeSelectMessageContainer = conditionTypeSelectMessageContainer;

        const conditionTypeSelectMessage = document.createElement('span');

        if (this.dataAlertType === SCHEDULED_TYPE) {
            conditionTypeSelectMessage.textContent = 'Schedule a notification';
        } else {
            conditionTypeSelectMessage.textContent = 'Send a notification when your query';
        }

        const conditionTypeSelector = new Select({
            outlined: false,
            showArrow: false,
            initialValue: container.conditionType,
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
                container.conditionType = option.value;

                if (option.value === EXISTS_TYPE) {
                    if (this.existsTypeContent) this.existsTypeContent.style.display = 'block';
                    if (this.compareTypeContent) this.compareTypeContent.style.display = 'none';
                } else if (option.value === COMPARE_TYPE) {
                    if (this.compareTypeContent) this.compareTypeContent.style.display = 'block';
                    if (this.existsTypeContent) this.existsTypeContent.style.display = 'none';
                }

                onChange({ conditionType: option.value });
            },
        });

        conditionTypeSelectMessageContainer.appendChild(conditionTypeSelectMessage);
        conditionTypeSelectMessageContainer.appendChild(conditionTypeSelector);

        container.appendChild(conditionTypeSelectMessageContainer);
    };

    this.createConditionBuilder = () => {
        const conditionBuilderContainer = document.createElement('div');

        const secondInputContainer = document.createElement('div');
        const ruleSecondInputContainer = document.createElement('div');
        const secondRuleInput = document.createElement('div');
        const secondLabelContainer = document.createElement('div');
        const conditionSelect = new Select({
            initialValue: 'GREATER_THAN',
            options: this.getOperatorSelectValues(),
        });

        this.conditionSelect = conditionSelect;

        conditionBuilderContainer.classList.add('autoql-vanilla-notification-rule-container');
        secondInputContainer.classList.add('autoql-vanilla-input-container');
        secondInputContainer.classList.add('autoql-vanilla-input-large');
        secondInputContainer.classList.add('autoql-vanilla-input-number');
        ruleSecondInputContainer.classList.add('autoql-vanilla-rule-second-input-container');
        secondRuleInput.classList.add('autoql-vanilla-rule-input');
        secondLabelContainer.classList.add('autoql-vanilla-input-and-label-container');
        conditionSelect.classList.add('autoql-vanilla-condition-select');

        ruleSecondInputContainer.appendChild(conditionSelect);

        secondInputContainer.appendChild(this.termInputValue);
        secondLabelContainer.appendChild(secondInputContainer);
        secondRuleInput.appendChild(secondLabelContainer);

        ruleSecondInputContainer.appendChild(secondRuleInput);
        conditionBuilderContainer.appendChild(ruleSecondInputContainer);

        const validationMessageContainer = document.createElement('div');
        validationMessageContainer.classList.add('autoql-vanilla-term-validation-message-container');
        conditionBuilderContainer.appendChild(validationMessageContainer);
        this.validationMessageContainer = validationMessageContainer;

        return conditionBuilderContainer;
    };

    this.createCompareTypeContent = () => {
        const compareTypeContent = document.createElement('div');
        this.compareTypeContent = compareTypeContent;

        if (container.conditionType !== COMPARE_TYPE) {
            compareTypeContent.style.display = 'none';
        }

        const queryInput = this.createQueryInput();

        const columnSelectionTable = this.createColumnSelectionTable();
        const secondColumnSelectionTable = this.createSecondColumnSelectionTable();
        const columnValueMessage = this.createColumnSelectMessage();
        const conditionBuilder = this.createConditionBuilder();

        compareTypeContent.appendChild(queryInput);
        if (columnSelectionTable) compareTypeContent.appendChild(columnSelectionTable);
        compareTypeContent.appendChild(columnValueMessage);

        compareTypeContent.appendChild(conditionBuilder);

        if (secondColumnSelectionTable) compareTypeContent.appendChild(secondColumnSelectionTable);

        ruleContainer.appendChild(compareTypeContent);
    };

    this.createExistsTypeContent = () => {
        const existsTypeContent = document.createElement('div');
        this.existsTypeContent = existsTypeContent;

        if (container.conditionType !== EXISTS_TYPE) {
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

        const condition = container.conditionType === COMPARE_TYPE ? this.conditionSelect?.selectedValue : EXISTS_TYPE;

        const firstTerm = {
            id: uuidv4(),
            condition,
            term_type: 'QUERY',
            term_value: queryText,
            join_columns: this.firstQueryJoinColumns ?? [],
            filters: [], // TODO: APPLY TABLE FILTERS FROM DM
            session_filter_locks: [], // TODO: APPLY FILTER LOCKS FROM DM
            user_selection: [], // TODO: APPLY USER SELECTION FROM VALIDATION RESPONSE
        };

        if (container.conditionType !== EXISTS_TYPE) {
            const firstQueryCompareColumnIndex = this.firstQuerySelectedColumns?.[0];
            const firstQueryCompareColumnName = queryResponse?.data?.columns?.find(
                (col) => col.index === firstQueryCompareColumnIndex,
            )?.name;

            firstTerm.compare_column = firstQueryCompareColumnName;
        }

        expression.push(firstTerm);

        if (container.conditionType !== EXISTS_TYPE) {
            const secondQueryCompareColumnIndex = this.secondQuerySelectedColumns?.[0];
            const secondQueryCompareColumnName = this.secondQueryResponse?.data?.data?.columns?.find(
                (col) => col.index === secondQueryCompareColumnIndex,
            )?.name;

            expression.push({
                id: uuidv4(),
                condition: 'TERMINATOR',
                term_type: this.termInputValue?.selectValue,
                term_value: this.termInputValue.getValue(),
                join_columns: this.secondQueryJoinColumns,
                compare_column: secondQueryCompareColumnName,
                filters: [],
                session_filter_locks: [],
                user_selection: [],
            });
        }

        return expression;
    };

    container.getValues = () => {
        return {
            expression: this.buildExpression(),
        };
    };

    container.isValid = () => {
        if (container.conditionType === EXISTS_TYPE) {
            return true;
        } else if (container.conditionType === COMPARE_TYPE) {
            return this.termInputValue.getValue() !== '';
        }
    };

    this.renderView = () => {
        this.createConditionTypeMessage();

        container.appendChild(ruleContainer);

        this.createConditionsSection();
    };

    this.renderView();

    container.classList.add('autoql-vanilla-data-alert-modal-step');
    return container;
}
