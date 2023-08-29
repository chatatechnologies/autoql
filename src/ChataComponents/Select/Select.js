import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';

import './Select.scss';

export function Select({
    options,
    disabled = false,
    fullWidth,
    label,
    outlined = true,
    size = 'large',
    initialValue,
    placeholder = 'Select an item',
    showArrow = true,
    onChange = () => {},
}) {
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
        const selectedOption = options.find((option) => option.value === this.selectedValue);
        if (selectedOption?.label || selectedOption?.value) {
            selectTextContent.classList.add('autoql-vanilla-menu-item-value-title');
            selectTextContent.innerHTML = selectedOption.label ?? selectedOption.value;
        } else {
            selectTextContent.classList.add('react-autoql-select-text-placeholder');
            selectTextContent.innerHTML = placeholder;
        }

        if (showArrow) {
            const selectArrow = document.createElement('div');
            selectArrow.classList.add('autoql-vanilla-select-arrow');
            selectElement.appendChild(selectArrow);
        }

        selectElement.addEventListener('click', (e) => {
            if (this.popover) {
                this.popover = undefined;
            } else {
                this.popover = new PopoverChartSelector(e, 'bottom', 'start', 0, 'autoql-vanilla-select-popover');

                const selectorContent = this.createPopoverContent();

                this.popover.appendContent(selectorContent);

                this.popover?.show();
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

            if (option.value === this.selectedValue) {
                li.classList.add('active');
            }

            li.onclick = (e) => {
                e.stopPropagation();
                this.selectedValue = options.value;
                this.selectTextContent.innerHTML = option.label ?? option.value;
                onChange(option);
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
