import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';
import { Checkbox } from '../../Checkbox';
import { CARET_DOWN_ICON } from '../../Svg';
import { createIcon, uuidv4 } from '../../Utils';

import './MultiSelect.scss';

export function MultiSelect({
    options = [],
    selected = [],
    disabled = false,
    fullWidth = false,
    width,
    label,
    showBadge = true,
    outlined = true,
    size = 'large',
    placeholder = 'Select an item',
    showArrow = true,
    position = 'bottom',
    align = 'start',
    title = '',
    listTitle = '',
    popoverClassName,
    onChange = () => {},
    onItemClick = () => {},
}) {
    const obj = this;

    obj.ID = uuidv4();
    obj.selected = selected;

    obj.showPopover = () => {
        obj.popover.show();
    };

    obj.scrollToValue = (value) => {
        const index = options?.findIndex((option) => value == option.value);
        const element = document.querySelector(`#select-option-${obj.ID}-${index}`);
        if (element) {
            element.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center',
            });
        }
    };

    obj.createSelect = () => {
        obj.select = document.createElement('div');
        obj.select.classList.add('autoql-vanilla-select-and-label');

        if (fullWidth) {
            obj.select.classList.add('autoql-vanilla-select-full-width');
        }

        if (disabled) {
            obj.select.setAttribute('disabled', true);
        }

        if (label) {
            const inputLabel = document.createElement('div');
            inputLabel.classList.add('autoql-vanilla-input-label');
            obj.select.appendChild(inputLabel);
        }

        const selectElement = document.createElement('div');
        selectElement.classList.add('autoql-vanilla-select');
        selectElement.classList.add('autoql-vanilla-multi-select');

        if (outlined) {
            selectElement.classList.add('outlined');
        }

        if (size === 'small') {
            selectElement.classList.add('autoql-vanilla-select-small');
        } else {
            selectElement.classList.add('autoql-vanilla-select-large');
        }

        const selectText = document.createElement('span');
        const selectTextContent = document.createElement('span');
        selectText.classList.add('autoql-vanilla-multi-select-text');
        selectTextContent.innerHTML = title ?? placeholder;
        obj.selectTextContent = selectTextContent;

        selectText.appendChild(selectTextContent);
        selectElement.appendChild(selectText);

        obj.select.setSelectedValues = (option, li, checkbox) => {
            if (!option) {
                return;
            }

            if (obj.selected?.includes(option.value)) {
                checkbox?.setChecked?.(false);
                li.classList.remove('autoql-vanilla-multi-select-selected');
                obj.selected = obj.selected.filter((value) => value !== option.value);
            } else {
                checkbox?.setChecked?.(true);
                li.classList.add('autoql-vanilla-multi-select-selected');
                obj.selected = [...obj.selected, option.value];
            }

            onChange(obj.selected);
        };

        obj.select.setSelectedValues();

        if (showBadge && obj.selected?.length) {
            const badge = document.createElement('div');
            badge.classList.add('autoql-vanilla-multi-select-badge');
            badge.innerHTML = `${obj.selected.length}`;

            selectElement.appendChild(badge);
        }

        if (showArrow) {
            const selectArrow = document.createElement('div');
            const selectArrowIcon = createIcon(CARET_DOWN_ICON);
            selectArrow.classList.add('autoql-vanilla-select-arrow');

            selectArrow.appendChild(selectArrowIcon);
            selectElement.appendChild(selectArrow);
        }

        selectElement.addEventListener('click', (e) => {
            if (obj.popover) {
                obj.popover = undefined;
            } else {
                obj.popover = new PopoverChartSelector(e, position, align, 0);
                obj.popover.classList.add('autoql-vanilla-select-popover');
                if (popoverClassName) obj.popover.classList.add(popoverClassName);

                const selectorContent = obj.createPopoverContent();

                obj.popover.appendContent(selectorContent);

                obj.showPopover();
            }
        });

        obj.select.appendChild(selectElement);
    };

    obj.createPopoverContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
        selectorContainer.classList.add('autoql-vanilla-select-popup-container');
        selectorContent.classList.add('autoql-vanilla-axis-selector-content');

        if (width) {
            selectorContainer.style.width = width;
        }

        if (listTitle) {
            const listTitleDiv = document.createElement('div');
            listTitleDiv.classList.add('autoql-vanilla-multi-select-list-title');

            if (typeof listTitle === 'object') {
                listTitleDiv.appendChild(listTitle);
            } else {
                listTitleDiv.innerHTML = listTitle;
            }

            selectorContent.appendChild(listTitleDiv);
        }

        options?.forEach((option, i) => {
            const itemWrapper = document.createElement('li');
            itemWrapper.id = `select-option-${obj.ID}-${i}`;
            itemWrapper.classList.add('autoql-vanilla-multi-select-item-wrapper');

            const isSelected = obj.selected.includes(option.value);
            if (isSelected) {
                itemWrapper.classList.add('autoql-vanilla-multi-select-selected');
            }

            const itemCheckboxComponent = new Checkbox(itemWrapper, { checked: isSelected, clickable: false });
            itemCheckboxComponent.checkbox.classList.add('autoql-vanilla-multi-select-item-checkbox');

            const itemText = document.createElement('div');
            itemText.classList.add('autoql-vanilla-multi-select-menu-item');

            const listLabel = option?.listLabel ?? option?.label ?? option?.value;
            if (typeof listLabel === 'object') {
                itemText.appendChild(listLabel);
            } else {
                itemText.innerHTML = listLabel;
            }

            itemWrapper.onclick = (e) => {
                e.stopPropagation();
                obj.select.setSelectedValues(option, itemWrapper, itemCheckboxComponent);
                onItemClick(option, i);
            };

            itemWrapper.appendChild(itemText);
            selectorContent.appendChild(itemWrapper);
        });

        selectorContainer.appendChild(selectorContent);
        return selectorContainer;
    };

    obj.createSelect();
    obj.createPopoverContent();

    return obj.select;
}
