import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';
import { CARET_DOWN_ICON } from '../../Svg';
import { createIcon, uuidv4 } from '../../Utils';

import './Select.scss';

export function Select({
    options,
    disabled = false,
    fullWidth = false,
    label,
    outlined = true,
    size = 'large',
    initialValue,
    placeholder = 'Select an item',
    showArrow = true,
    position = 'bottom',
    align = 'start',
    popoverClassName,
    onChange = () => {},
}) {
    this.ID = uuidv4();

    this.showPopover = () => {
        this.popover.show();
        this.scrollToValue(this.selectedValue);
    };

    this.scrollToValue = (value) => {
        const index = options?.findIndex((option) => value == option.value);
        const element = document.querySelector(`#select-option-${this.ID}-${index}`);
        if (element) {
            element.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center',
            });
        }
    };

    this.createSelect = () => {
        this.select = document.createElement('div');
        this.select.classList.add('autoql-vanilla-select-and-label');

        this.selectedValue = initialValue;

        if (fullWidth) {
            this.select.classList.add('autoql-vanilla-select-full-width');
        }

        if (disabled) {
            this.select.setAttribute('disabled', true);
        }

        if (label) {
            const inputLabel = document.createElement('div');
            inputLabel.classList.add('autoql-vanilla-input-label');
            this.select.appendChild(inputLabel);
        }

        const selectElement = document.createElement('div');
        this.select.appendChild(selectElement);
        selectElement.classList.add('autoql-vanilla-select');

        if (outlined) {
            selectElement.classList.add('outlined');
        }

        if (size === 'small') {
            selectElement.classList.add('autoql-vanilla-select-small');
        } else {
            selectElement.classList.add('autoql-vanilla-select-large');
        }

        const selectText = document.createElement('span');
        selectElement.appendChild(selectText);
        selectText.classList.add('autoql-vanilla-select-text');

        const selectTextContent = document.createElement('span');
        this.selectTextContent = selectTextContent;
        selectText.appendChild(selectTextContent);

        this.select.setValue = (value) => {
            const selectedValue = value ?? this.selectedValue;
            const selectedOption = options.find((option) => option.value == selectedValue);

            if (!selectedOption) {
                return
            }
            
            this.selectedValue = selectedOption.value;

            if (selectedOption?.label || selectedOption?.value) {
                selectTextContent.classList.add('autoql-vanilla-menu-item-value-title');
                selectTextContent.innerHTML = `${selectedOption.label ?? selectedOption.value}`;
            } else {
                selectTextContent.classList.add('autoql-vanilla-select-text-placeholder');
                selectTextContent.innerHTML = placeholder;
            }

            onChange(selectedOption);
        };

        this.select.setValue();

        if (showArrow) {
            const selectArrow = document.createElement('div');
            selectArrow.classList.add('autoql-vanilla-select-arrow');

            const selectArrowIcon = createIcon(CARET_DOWN_ICON);
            selectArrow.appendChild(selectArrowIcon);

            selectElement.appendChild(selectArrow);
        }

        selectElement.addEventListener('click', (e) => {
            if (this.popover) {
                this.popover = undefined;
            } else {
                this.popover = new PopoverChartSelector(e, position, align, 0);
                this.popover.classList.add('autoql-vanilla-select-popover')
                if (popoverClassName) this.popover.classList.add(popoverClassName);

                const selectorContent = this.createPopoverContent();

                this.popover.appendContent(selectorContent);

                this.showPopover();
            }
        });
    };

    this.createPopoverContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
        selectorContent.classList.add('autoql-vanilla-axis-selector-content');

        options?.forEach((option, i) => {
            const li = document.createElement('li');

            li.classList.add('autoql-vanilla-select-list-item');
            li.id = `select-option-${this.ID}-${i}`;

            if (option.value == this.selectedValue) {
                li.classList.add('active');
            }

            li.onclick = (e) => {
                e.stopPropagation();
                this.select.setValue(option.value)
                this.popover?.close();
            };

            const listLabel = option?.listLabel ?? option?.label ?? option?.value;

            if (typeof listLabel === 'object') {
                li.appendChild(listLabel);
            } else {
                li.innerHTML = listLabel;
            }

            selectorContent.appendChild(li);
        });

        selectorContainer.appendChild(selectorContent);
        return selectorContainer;
    };

    this.createSelect();
    this.createPopoverContent();

    return this.select;
}
