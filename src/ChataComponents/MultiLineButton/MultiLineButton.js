import { createIcon, uuidv4 } from '../../Utils';

import './MultiLineButton.scss';

export function MultiLineButton({
    title = '',
    subtitle = '',
    active = false,
    disabled = false,
    fullWidth = false,
    icon = undefined,
    onClick = () => {},
}) {
    const obj = this;

    obj.ID = uuidv4();
    obj.isDisabled = disabled;
    obj.isActive = active;

    obj.multiLineButton = document.createElement('button');
    obj.multiLineButton.classList.add('autoql-vanilla-multiline-btn');

    obj.multiLineButton.setActive = (isActive) => {
        obj.isActive = isActive;

        if (isActive) {
            obj.multiLineButton.classList.add('autoql-vanilla-multiline-btn-active');
        } else {
            obj.multiLineButton.classList.remove('autoql-vanilla-multiline-btn-active');
        }
    };

    obj.multiLineButton.setDisabled = (isDisabled) => {
        obj.isDisabled = isDisabled;

        if (isDisabled) {
            obj.multiLineButton.classList.add('autoql-vanilla-multiline-btn-disabled');
        } else {
            obj.multiLineButton.classList.remove('autoql-vanilla-multiline-btn-disabled');
        }
    };

    obj.createRadioButton = () => {
        const radioButtonContainer = document.createElement('div');
        radioButtonContainer.classList.add('autoql-vanilla-multiline-radio-btn-container');

        const radioButton = document.createElement('div');
        radioButton.classList.add('autoql-vanilla-multiline-radio-btn');

        radioButtonContainer.appendChild(radioButton);

        return radioButtonContainer;
    };

    obj.createTitle = () => {
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('autoql-vanilla-multiline-btn-title');

        if (icon) {
            const iconElement = createIcon(icon);
            iconElement.classList.add('autoql-vanilla-icon');

            if (iconElement) {
                titleContainer.appendChild(iconElement);
            }
        }

        const titleText = document.createElement('span');
        titleText.innerHTML = title;

        titleContainer.appendChild(titleText);

        return titleContainer;
    };

    obj.createSubtitle = () => {
        const subtitleContainer = document.createElement('div');
        subtitleContainer.classList.add('autoql-vanilla-multiline-btn-subtitle');
        subtitleContainer.innerHTML = subtitle;
        return subtitleContainer;
    };

    obj.createButton = () => {
        if (obj.isDisabled) {
            obj.multiLineButton.classList.add('autoql-vanilla-multiline-btn-disabled');
        }

        if (obj.isActive) {
            obj.multiLineButton.classList.add('autoql-vanilla-multiline-btn-active');
        }

        obj.multiLineButton.addEventListener('click', onClick);

        const radioButton = obj.createRadioButton();
        obj.multiLineButton.appendChild(radioButton);

        const buttonContentContainer = document.createElement('div');

        const titleElement = obj.createTitle();
        buttonContentContainer.appendChild(titleElement);

        if (subtitle) {
            const subtitleElement = obj.createSubtitle();
            buttonContentContainer.appendChild(subtitleElement);
        }

        obj.multiLineButton.appendChild(buttonContentContainer);
    };

    obj.createButton();

    return obj.multiLineButton;
}
