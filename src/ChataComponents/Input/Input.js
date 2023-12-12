import { CALENDAR, CARET_DOWN_ICON } from '../../Svg';
import { createIcon } from '../../Utils';
import { DateRangePicker } from '../DateRangePicker/DateRangePicker';
import dayjs from '../../Utils/dayjsPlugins';

import './Input.scss';

export function Input(options) {
    if (!options) {
        console.warn('No options provided to Input component. Unable to render');
        return;
    }

    const {
        icon,
        type = 'text',
        step = '1',
        size = 'large',
        label = '',
        fullWidth = false,
        selectOptions,
        area,
        onFocus = () => {},
        onBlur = () => {},
        onChange = () => {},
        onKeyDown = () => {},
        min,
        max,
        value,
        datePicker = false,
        onDateRangeChange = () => {},
        initialDateRange,
        validDateRange,
        datePickerType,
    } = options;

    this.focused = false;
    const hasSelect = selectOptions?.length;

    this.onDateRangeChange = (selection) => {
        if (!selection || !this.input) {
            return;
        }

        const { startDate, endDate } = selection;

        if (!startDate && !endDate) {
            return;
        }

        let inputText = '';
        let start = startDate;
        let end = endDate;
        if (startDate && !endDate) {
            end = start;
        } else if (!startDate && endDate) {
            start = end;
        }

        const formattedStart = dayjs(start).format('ll');
        const formattedEnd = dayjs(end).format('ll');

        if (formattedStart === formattedEnd) {
            inputText = `on ${formattedStart}`;
        } else {
            inputText = `between ${formattedStart} and ${formattedEnd}`;
        }

        this.input.value = inputText;
        onDateRangeChange(selection, inputText);

        this.datePickerPopover?.close();
        this.simulateOnChange();
        this.onBlur();
    };

    this.createDatePickerPopover = (e) => {
        const datePickerPopover = new DateRangePicker(e, {
            title: null,
            validRange: validDateRange,
            type: datePickerType,
            onSelectionApplied: (selection) => this.onDateRangeChange(selection),
        });

        this.datePickerPopover = datePickerPopover;

        return datePickerPopover;
    };

    this.onFocus = () => {
        this.focused = true;
        onFocus?.();
    };

    this.onBlur = (e) => {
        if (datePicker && this.datePickerPopover?.isOpen()) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
        }

        this.focused = false;

        onBlur?.();
    };

    this.simulateOnChange = () => {
        this.input?.dispatchEvent(new Event('input', { bubbles: true }));
    };

    this.incrementNumber = () => {
        this.input?.stepUp();
        this.simulateOnChange();
    };

    this.decrementNumber = () => {
        this.input?.stepDown();
        this.simulateOnChange();
    };

    const inputAndLabelContainer = document.createElement('div');
    inputAndLabelContainer.classList.add('autoql-vanilla-input-and-label-container');
    if (fullWidth) inputAndLabelContainer.classList.add('autoql-vanilla-input-full-width');

    inputAndLabelContainer.setValue = (value) => {
        if (this.input) {
            this.input.value = value;
        }
    };

    if (label) {
        const inputLabel = document.createElement('div');
        inputLabel.innerHTML = label;
        inputAndLabelContainer.appendChild(inputLabel);
    }

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('autoql-vanilla-input-container');
    if (size === 'small') inputContainer.classList.add('autoql-vanilla-input-small');
    else inputContainer.classList.add('autoql-vanilla-input-large');
    if (this.focused) inputContainer.classList.add('focus');
    if (hasSelect) inputContainer.classList.add('with-select');
    if (type === 'number') inputContainer.classList.add('autoql-vanilla-input-number');
    inputAndLabelContainer.appendChild(inputContainer);

    if (area) {
        const input = document.createElement('textarea');
        input.classList.add('autoql-vanilla-input');
        input.classList.add('area');
        inputContainer.appendChild(input);

        this.input = input;
    } else {
        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('autoql-vanilla-input-and-icon');

        if (datePicker) {
            inputWrapper.classList.add('with-date-picker');

            const calenderBtn = document.createElement('div');
            calenderBtn.classList.add('autoql-vanilla-inline-input-date-picker-btn');
            calenderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.createDatePickerPopover(e);
            });
            calenderBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });

            const calendarIcon = createIcon(CALENDAR);
            calendarIcon.classList.add('autoql-vanilla-inline-input-date-picker-btn-icon');

            calenderBtn.appendChild(calendarIcon);
            inputWrapper.appendChild(calenderBtn);
        }

        const input = document.createElement('input');
        input.classList.add('autoql-vanilla-input');
        input.value = value;

        input.addEventListener('focus', this.onFocus);
        input.addEventListener('blur', this.onBlur);
        input.addEventListener('input', onChange);
        input.addEventListener('keydown', onKeyDown);

        if (min !== undefined) input.setAttribute('min', min);
        if (max !== undefined) input.setAttribute('max', max);
        if (type) input.setAttribute('type', type);
        if (label) input.setAttribute('label', label);
        if (icon) input.classList.add('with-icon');
        if (hasSelect) input.classList.add('with-select');
        if (step) input.setAttribute('step', step);

        inputWrapper.appendChild(input);
        inputContainer.appendChild(inputWrapper);

        if (icon) {
            const iconElement = createIcon(icon);
            if (iconElement) {
                iconElement.classList.add('autoql-vanilla-input-icon');
                if (this.focused) iconElement.classList.add('focus');
                inputWrapper.appendChild(iconElement);
            }
        }

        this.input = input;
    }

    if (type === 'number') {
        const spinWheelContainer = document.createElement('div');
        spinWheelContainer.classList.add('autoql-vanilla-input-number-spin-button-container');

        const incrementBtn = document.createElement('button');
        incrementBtn.classList.add('autoql-vanilla-input-number-spin-button');
        incrementBtn.onclick = this.incrementNumber;
        spinWheelContainer.appendChild(incrementBtn);
        const incrementIcon = createIcon(CARET_DOWN_ICON);
        incrementIcon.style.transform = 'rotate(180deg)';
        incrementBtn.appendChild(incrementIcon);

        const decrementBtn = document.createElement('button');
        decrementBtn.classList.add('autoql-vanilla-input-number-spin-button');
        decrementBtn.onclick = this.decrementNumber;
        spinWheelContainer.appendChild(decrementBtn);
        const decrementIcon = createIcon(CARET_DOWN_ICON);
        decrementBtn.appendChild(decrementIcon);

        inputContainer.appendChild(spinWheelContainer);
    }

    inputAndLabelContainer.input = this.input;

    return inputAndLabelContainer;
}
