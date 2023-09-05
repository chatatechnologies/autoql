import { CARET_DOWN_ICON } from '../../Svg';
import { createIcon } from '../../Utils';
import './Input.scss';

export function Input(options) {
    if (!options) {
        console.warn('No options provided to Slider component. Unable to render');
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
        min,
        max,
        value,
    } = options;

    this.focused = false;
    const hasSelect = selectOptions?.length;

    this.onFocus = () => {
        this.focused = true;
        onFocus?.();
    };

    this.onBlur = () => {
        this.focused = false;
        onBlur?.();
    };

    this.simulateOnChange = () => {
        this.input?.dispatchEvent(new Event('change', { bubbles: true }));
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

        const input = document.createElement('input');
        input.classList.add('autoql-vanilla-input');
        input.value = value;
        input.onfocus = this.onFocus;
        input.onblur = this.onBlur;
        input.onchange = onChange;
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

    return inputAndLabelContainer;
}
