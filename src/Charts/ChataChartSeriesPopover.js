import { PopoverChartSelector } from './PopoverChartSelector';
import { getNumberColumnsByType } from './ChataChartHelpers';
import { htmlToElement, formatColumnName, cloneObject, createIcon } from '../Utils';
import { strings } from '../Strings';
import { TICK } from '../Svg';
import { Select } from '../ChataComponents/Select';
import { AGG_TYPE_ICONS } from '../Svg';
import { AGG_TYPES, AggTypes, getAggConfig, isColumnStringType } from 'autoql-fe-utils';

export function ChataChartSeriesPopover(evt, placement, align, cols, scale, padding, columnIndexConfig) {
    const activeSeries = scale?.fields;

    const columns = cols.filter((col) => !columnIndexConfig || columnIndexConfig?.stringColumnIndex !== col.index);

    var obj = this;
    var seriesIndexes = [];
    var aggConfig = getAggConfig(cols) ?? {};

    activeSeries.map((col) => {
        seriesIndexes.push(col.index);
    });
    var content = document.createElement('div');
    var popover = new PopoverChartSelector(evt, placement, align, padding);
    var series = getNumberColumnsByType(columns); // {}
    const applyButton = htmlToElement(`
        <button
            class="autoql-vanilla-chata-btn autoql-vanilla-primary"
            style="padding: 5px 16px; margin: 2px 5px; width: calc(100% - 10px);">
                ${strings.apply}
        </button>
    `);
    var selectAllCheckBox = (type) => {
        var inputs = content.querySelectorAll(`[data-col-type="${type}"]`);
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].disabled) {
                inputs[i].checked = true;
            }
        }
    };
    var deselectAllCheckBox = (type) => {
        var inputs = content.querySelectorAll(`[data-col-type="${type}"]`);
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].disabled) {
                inputs[i].checked = false;
            }
        }
    };
    // TODO(Alex) - react widgets don't have below feature, but still keep it for future.
    //
    // var deselectCheckBox = () => {
    //     const type = obj.groupType;
    //     var inputs = content.querySelectorAll(`[data-col-type="${type}"]`);

    //     for (var i = 0; i < inputs.length; i++) {
    //         inputs[i].checked = false;
    //     }
    // };

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
        const options = Object.values(AGG_TYPES)
            .filter((agg) => {
                if (isColumnStringType(column)) {
                    return agg === AggTypes.COUNT || agg === AggTypes.COUNT_DISTINCT;
                }

                return true;
            })
            .map((agg) => {
                const listLabel = document.createElement('span');

                let icon = agg.symbol;
                if (agg.icon) {
                    if (AGG_TYPE_ICONS[agg.icon]) {
                        icon = createIcon(AGG_TYPE_ICONS[agg.icon]);
                    }
                }

                let listLabelSymbol = document.createElement('span');
                listLabelSymbol.classList.add('agg-select-list-symbol');

                if (agg.type == AggTypes.SUM) {
                    console.log('appending SUM icon to list label...', icon);
                }

                if (typeof icon == 'object') {
                    listLabelSymbol.innerHTML = '';
                    listLabelSymbol.appendChild(icon);
                } else {
                    listLabelSymbol.innerHTML = icon;
                }

                const listLabelText = document.createElement('span');
                listLabelText.innerHTML = agg.displayName;

                listLabel.appendChild(listLabelSymbol);
                listLabel.appendChild(listLabelText);

                return {
                    value: agg.type,
                    label: icon,
                    listLabel,
                    tooltip: agg.tooltip,
                };
            });

        const selector = new Select({
            options,
            initialValue: column?.aggType,
            showArrow: false,
            size: 'small',
            onChange: (option) => {
                if (column?.name) {
                    aggConfig[column.name] = option.value;
                }
            },
        });

        return selector;
    };

    var createCheckbox = ({ column = '', type = '', header = '' }, checked = false, disabled = false) => {
        let colName;

        if (column !== '') {
            colName = column.display_name || column.name;
        }

        if (header !== '') {
            colName = header;
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
        if (colName) {
            checkboxInput.setAttribute('data-col-name', colName);
        }
        checkboxInput.setAttribute('data-col-index', column.index);
        if (column) {
            checkboxInput.setAttribute('data-col-type', column.type);
        }
        if (type !== '') {
            checkboxInput.setAttribute('data-is-col-header', true);
            checkboxInput.setAttribute('data-col-type', type);
        }

        checkboxInput.col = column;

        tick.style.top = '3px';
        tick.style.left = '23px';
        checkboxInput.style.marginTop = '4.5px';
        if (header !== '') {
            tick.style.top = '14px';
            checkboxInput.style.marginTop = '14px';
            checkboxInput.classList.add('autoql-vanilla-m-checkbox__input-header');
        }
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
            var isColHeader = evt.target.dataset.isColHeader;
            if (isColHeader) {
                var isColHeaderChecked = evt.target.checked;
                if (isColHeaderChecked) {
                    selectAllCheckBox(type);
                } else {
                    deselectAllCheckBox(type);
                }
            } else {
                var inputs = content.querySelectorAll(`[data-col-type="${type}"]`);
                var columnHeaderInput = Array.from(inputs).filter((input) =>
                    input.hasAttribute('data-is-col-header'),
                )[0];
                var columnInputs = Array.from(inputs).filter((input) => !input.hasAttribute('data-is-col-header'));
                var unCheckedColumnInputs = columnInputs.filter((input) => !input.checked);
                var unCheckedColumnInputsCount = unCheckedColumnInputs.length;
                var disabledColumnInputs = Array.from(inputs).filter((input) => input.disabled);
                var disabledColumnInputsCount = disabledColumnInputs.length;
                if (unCheckedColumnInputsCount !== 0) {
                    columnHeaderInput.checked = false;
                } else {
                    columnHeaderInput.checked = true;
                }
                if (disabledColumnInputsCount === unCheckedColumnInputsCount) {
                    columnHeaderInput.checked = true;
                }
            }
            if (type !== obj.groupType) {
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

    obj.createContent = () => {
        var wrapper = document.createElement('div');
        var buttonWrapper = document.createElement('div');

        buttonWrapper.classList.add('autoql-vanilla-button-wrapper-selector');
        for (var [key] of Object.entries(series)) {
            var checkboxInputs = [];
            var selectableList = document.createElement('div');
            selectableList.classList.add('autoql-vanilla-chata-selectable-list');
            var columnsOfType = series[key];

            columnsOfType.forEach((column) => {
                var listItem = document.createElement('div');
                listItem.classList.add('autoql-vanilla-chata-list-item');

                var colName = document.createElement('div');

                const isChecked = seriesIndexes.includes(column.index);
                const isDisabled = !!scale?.secondScale?.fields?.find((col) => col.index === column.index);

                if (isChecked && !obj.groupType) {
                    obj.groupType = column.type;
                }

                if (isDisabled) {
                    listItem.classList.add('autoql-vanilla-chata-list-item-disabled');
                }

                var checkbox = createCheckbox({ column }, isChecked, isDisabled);
                checkboxInputs.push(checkbox.querySelector('input'));

                var n = column.display_name || column.name;
                colName.innerHTML = formatColumnName(n);

                const nameAndSelectContainer = document.createElement('div');
                nameAndSelectContainer.classList.add('autoql-vanilla-chata-col-selector-name');

                if (column.aggType) {
                    const selector = createAggSelector(column);
                    nameAndSelectContainer.appendChild(selector);
                }

                nameAndSelectContainer.appendChild(colName);

                listItem.appendChild(nameAndSelectContainer);
                listItem.appendChild(checkbox);
                selectableList.appendChild(listItem);
            });

            var areAllColumnsChecked = checkboxInputs.every((input) => {
                return !!input.getAttribute('disabled') || !!input.getAttribute('checked');
            });
            var header = document.createElement('div');
            var headerCheckbox = createCheckbox({ type: series[key][0]?.type, header: key }, areAllColumnsChecked);
            var headerWrapper = document.createElement('div');
            headerWrapper.classList.add('autoql-vanilla-chata-series-popover-header-wrapper');
            header.classList.add('number-selector-header');
            header.innerHTML = key;
            headerWrapper.appendChild(header);
            headerWrapper.appendChild(headerCheckbox);
            content.appendChild(headerWrapper);
            content.appendChild(selectableList);
        }

        applyButton.onclick = (evt) => {
            var inputs = content.querySelectorAll(
                '.autoql-vanilla-m-checkbox__input:not(.autoql-vanilla-m-checkbox__input-header)',
            );
            var activeSeries = [];

            for (var i = 0; i < inputs.length; i++) {
                const checkboxColumn = inputs[i]?.col;
                if (checkboxColumn && inputs[i]?.checked) {
                    activeSeries.push(checkboxColumn.index);
                }
            }

            const newColumns = cols.map((col) => {
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
