import { PopoverChartSelector } from './PopoverChartSelector';
import { getIndexesByType } from './ChataChartHelpers';
import { htmlToElement, formatColumnName, cloneObject } from '../Utils';
import { strings } from '../Strings';
import { TICK } from '../Svg';
import { Select } from '../ChataComponents/Select';
import { AGG_TYPES, getAggConfig } from 'autoql-fe-utils';

export function ChataChartSeriesPopover(evt, placement, align, cols, scale, padding) {
    const activeSeries = scale?.fields;

    var obj = this;
    var indexList = getIndexesByType(cols);
    var seriesIndexes = [];
    var aggConfig = getAggConfig(cols) ?? {};
    const allColumns = cloneObject(cols);
    activeSeries.map((col) => {
        seriesIndexes.push(col.index);
    });
    var content = document.createElement('div');
    var popover = new PopoverChartSelector(evt, placement, align, padding);
    var series = {};
    const applyButton = htmlToElement(`
        <button
            class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 2px 5px; width: calc(100% - 10px);">
                ${strings.apply}
        </button>
    `);

    var deselectCheckBox = () => {
        const type = obj.groupType;
        var inputs = content.querySelectorAll(`[data-col-type="${type}"]`);

        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = false;
        }
    };

    var enableApplyButton = () => {
        const count = selectedCount();
        if (count == 0) {
            applyButton.setAttribute('disabled', 'true');
            applyButton.classList.add('disabled');
        } else {
            applyButton.removeAttribute('disabled');
            applyButton.classList.remove('disabled');
        }
    };

    var selectedCount = () => {
        var inputs = content.querySelectorAll('[data-col-type]:checked');
        return inputs.length;
    };

    content.classList.add('autoql-vanilla-axis-selector-container');

    var createAggSelector = (column) => {
        const options = Object.values(AGG_TYPES).map((agg) => {
            const listLabel = document.createElement('span');

            const listLabelSymbol = document.createElement('span');
            listLabelSymbol.classList.add('agg-select-list-symbol');
            listLabelSymbol.innerHTML = agg.symbol;

            const listLabelText = document.createElement('span');
            listLabelText.innerHTML = agg.displayName;

            listLabel.appendChild(listLabelSymbol);
            listLabel.appendChild(listLabelText);

            return {
                value: agg.type,
                label: agg.symbol,
                listLabel,
                tooltip: agg.tooltip,
            };
        });

        const selector = new Select({
            options,
            initialValue: column?.col?.aggType,
            showArrow: false,
            size: 'small',
            onChange: (option) => {
                if (column?.col) {
                    aggConfig[column?.col?.name] = option.value;
                }
            },
        });

        return selector;
    };

    var createCheckbox = ({ column = '', columnInfo = '',header = '' }, checked = false, disabled = false) => {
        let colObj = {}
        let colName = ''
        
		if(column !== ''){
			colObj = column.col;
			colName = colObj.display_name || colObj.name;
		}
		
		if(header !== ''){
			colName = header
		}
        var tick = htmlToElement(`
            <div class="autoql-vanilla-chata-checkbox-tick">
                <span class="chata-icon">${TICK}</span>
            </div>
        `);
        var checkboxContainer = document.createElement('div');
        var checkboxWrapper = document.createElement('div');
        var checkboxInput = document.createElement('input');
        checkboxInput.setAttribute('type', 'checkbox');

        checkboxInput.classList.add('autoql-vanilla-m-checkbox__input');
        checkboxInput.classList.add('chata-chart-selector-checkbox');
        if (name) {
            checkboxInput.setAttribute('data-col-name', colName);
        }
        checkboxInput.setAttribute('data-col-index', column.index);
        checkboxInput.setAttribute('data-col-type', colObj.type);
        checkboxInput.col = column;
        tick.style.top = '3px';
        tick.style.left = '23px';
        checkboxInput.style.marginTop = '4.5px';
        checkboxInput.style.marginLeft = '20px';

        checkboxContainer.style.width = '38px';
        checkboxContainer.style.height = '18px';
        checkboxWrapper.style.width = '38px';
        checkboxWrapper.style.height = '18px';
        checkboxWrapper.style.position = 'relative';

        if (checked) {
            checkboxInput.setAttribute('checked', 'true');
        }

        if (disabled) {
            checkboxInput.setAttribute('disabled', 'true');
        }

        checkboxInput.onchange = (evt) => {
            var type = evt.target.dataset.colType;
            if (type !== obj.groupType) {
                deselectCheckBox();
                obj.groupType = type;
            }
            enableApplyButton();
        };

        checkboxWrapper.appendChild(checkboxInput);
        checkboxWrapper.appendChild(tick);

        checkboxContainer.appendChild(checkboxWrapper);
        checkboxContainer.input = checkboxInput;
        return checkboxContainer;
    };

    if (indexList['DOLLAR_AMT']) {
        series['Currency'] = [...indexList['DOLLAR_AMT']];
    }

    if (indexList['QUANTITY']) {
        series['Quantity'] = [...indexList['QUANTITY']];
    }

    if (indexList['PERCENT']) {
        series['Percent'] = [...indexList['PERCENT']];
    }

    obj.createContent = () => {
        var wrapper = document.createElement('div');
        var buttonWrapper = document.createElement('div');

        buttonWrapper.classList.add('autoql-vanilla-button-wrapper-selector');
        for (var [key] of Object.entries(series)) {
            var header = document.createElement('div');
            var selectableList = document.createElement('div');
            selectableList.classList.add('autoql-vanilla-chata-selectable-list');
            var cols = series[key];
            header.classList.add('number-selector-header');
            header.innerHTML = key;
            content.appendChild(header);

            for (var i = 0; i < cols.length; i++) {
                var listItem = document.createElement('div');
                listItem.classList.add('autoql-vanilla-chata-list-item');

                var colName = document.createElement('div');
                var colIndex = cols[i].index;
                var isChecked = seriesIndexes.includes(colIndex);
                if (isChecked && !obj.groupType) {
                    obj.groupType = cols[i].col.type;
                }

                var isDisabled = !!scale?.secondScale?.fields?.find((col) => col.index === colIndex);
                if (isDisabled) {
                    listItem.classList.add('autoql-vanilla-chata-list-item-disabled');
                }

                var checkbox = createCheckbox({column:cols[i]}, isChecked, isDisabled);
                
                var n = cols[i].col.display_name || cols[i].col.name;
                colName.innerHTML = formatColumnName(n);

                const nameAndSelectContainer = document.createElement('div');
                nameAndSelectContainer.classList.add('autoql-vanilla-chata-col-selector-name');

                if (cols[i]?.col?.aggType) {
                    const selector = createAggSelector(cols[i]);
                    nameAndSelectContainer.appendChild(selector);
                }

                nameAndSelectContainer.appendChild(colName);

                listItem.appendChild(nameAndSelectContainer);
                listItem.appendChild(checkbox);
                selectableList.appendChild(listItem);
            }
            content.appendChild(selectableList);
        }

        applyButton.onclick = (evt) => {
            var inputs = content.querySelectorAll('.autoql-vanilla-m-checkbox__input');
            var activeSeries = [];
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].checked) {
                    activeSeries.push(inputs[i].col.index);
                }
            }

            const newColumns = allColumns.map((col) => {
                const aggType = aggConfig[col?.name];
                if (aggType && col) {
                    col.aggType = aggType;
                }

                return col;
            });

            scale?.changeColumnIndices?.(activeSeries, newColumns);

            popover.close();
        };

        buttonWrapper.appendChild(applyButton);
        wrapper.appendChild(content);
        wrapper.appendChild(buttonWrapper);
        popover.appendContent(wrapper);
    };
    obj.createContent();
    popover.show();
    return popover;
}
