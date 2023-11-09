import './Checkbox.scss';

export function Checkbox(
    parent,
    { checked = false, disabled = false, onChange = () => {}, label = '', clickable = true },
) {
    this.setChecked = (checked) => {
        this.checkbox.checked = checked;
    };

    this.setDisabled = (disabled) => {
        this.checkbox.disabled = disabled;
    };

    const checkboxContainer = document.createElement('label');
    const checkbox = document.createElement('input');
    const checkmark = document.createElement('span');
    const checkboxLabelText = document.createElement('span');

    checkbox.setAttribute('type', 'checkbox');
    checkbox.classList.add('autoql-vanilla-checkbox-input');
    checkmark.classList.add('autoql-vanilla-checkbox-checkmark');
    checkboxLabelText.classList.add('autoql-vanilla-checkbox-label');
    checkboxContainer.classList.add('autoql-vanilla-checkbox__container');

    if (!clickable) {
        checkboxContainer.classList.add('autoql-vanilla-checkbox-unclickable');
    }

    checkbox.checked = checked;
    checkbox.disabled = disabled;
    checkbox.addEventListener('change', (e) => onChange(e));

    checkboxLabelText.innerHTML = label;

    this.container = checkboxContainer;
    this.checkbox = checkbox;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);
    checkboxContainer.appendChild(checkboxLabelText);

    if (parent) {
        parent.appendChild(checkboxContainer);
    }

    return this;
}
