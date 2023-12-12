import { Input } from '../ChataComponents/Input/Input';

import './InlineInputEditor.scss';

export function InlineInputEditor({ options, type, initialValue, onChange = () => {} }) {
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

        if (isInput && !obj.isInput) {
            inputWrapper.style.visibility = 'hidden';

            inputWrapper.appendChild(input);

            setInputWidth();

            inputWrapper.style.visibility = 'visible';

            obj.inputElement.focus();
            obj.inputElement.select();
        } else if (!isInput && obj.isInput) {
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
        onChange: () => setInputWidth(),
        onKeyDown: (e) => {
            if (e.key === 'Enter') {
                obj.inputElement?.blur();
            }
        },
    });

    obj.input = input;
    obj.inputElement = input.input;

    if (type === 'number') {
        input.type = type;
        input.classList.add('autoql-vanilla-input-number');
    } else {
        // Todo: Date type
    }

    inputWrapper.appendChild(inputBtn);

    return inputWrapper;
}
