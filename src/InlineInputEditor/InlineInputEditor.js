import { Input } from '../ChataComponents/Input/Input';

import './InlineInputEditor.scss';

export function InlineInputEditor({
    options,
    type,
    column,
    initialValue,
    onChange = () => {},
    datePicker = false,
    onDateRangeChange = () => {},
    initialDateRange,
}) {
    const obj = this;

    obj.selectedVL = initialValue;

    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('autoql-vanilla-inline-number-editor-wrapper');

    const inputBtn = document.createElement('div');
    inputBtn.classList.add('autoql-vanilla-inline-number-input-editor-btn');
    inputBtn.innerHTML = initialValue;
    inputBtn.onclick = () => toggleInput(true);

    const setInputWidth = () => {
        if (obj.inputElement) {
            const input = obj.inputElement;

            let tempElement = document.createElement('span');
            tempElement.innerHTML = input.value;
            tempElement.style = window.getComputedStyle(input);
            tempElement.style.visibility = 'none';
            tempElement.style.position = 'absolute';
            tempElement.style.whiteSpace = 'pre';

            input.parentElement?.appendChild(tempElement);
            const width = window.getComputedStyle(tempElement)?.getPropertyValue('width');
            input.parentElement?.removeChild(tempElement);
            tempElement = undefined;

            const paddingLeft = window.getComputedStyle(input)?.getPropertyValue('padding-left') || '0px';
            const paddingRight = window.getComputedStyle(input)?.getPropertyValue('padding-right') || '0px';
            const borderWidth = '2px';

            const widthCSS = `calc(${width} + ${paddingLeft} + ${paddingRight} + ${borderWidth})`;

            obj.inputElement.style.width = widthCSS;
        }
    };

    const toggleInput = (isInput) => {
        inputWrapper.innerHTML = '';

        const prevIsInput = obj.isInput;

        if (isInput && !prevIsInput) {
            inputWrapper.style.visibility = 'hidden';

            inputWrapper.appendChild(input);

            setInputWidth();

            inputWrapper.style.visibility = 'visible';

            obj.inputElement.focus();
            obj.inputElement.select();
        } else if (!isInput && prevIsInput) {
            const inputValue = obj.inputElement?.value;
            inputBtn.innerHTML = inputValue;
            onChange(inputValue);

            inputWrapper.appendChild(inputBtn);
        }

        obj.isInput = isInput;
    };

    const input = new Input({
        type: type === 'number' ? type : 'text',
        value: initialValue,
        onBlur: () => toggleInput(false),
        onChange: (e) => {
            setInputWidth();
        },
        onDateRangeChange: (selection, inputValue) => {
            inputBtn.innerHTML = inputValue;
            setInputWidth();
        },
        onKeyDown: (e) => {
            if (e.key === 'Enter') {
                obj.inputElement?.blur();
            }
        },
        datePicker,
    });

    obj.input = input;
    obj.inputElement = input.input;

    inputWrapper.appendChild(inputBtn);

    return inputWrapper;
}
