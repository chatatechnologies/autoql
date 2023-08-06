import './AppearanceView.scss';
import { NOTEBOOK } from '../../../../Svg';
import { createIcon } from '../../../../Utils';

export function AppearanceView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const composeMessageSection = document.createElement('div');
  const formSection = document.createElement('div');
  
  const createInputContainer = ({ inputType, placeholder, icon, label }) => {
    const container = document.createElement('div');
    const inputLabel = document.createElement('div');
    const inputContainer = document.createElement('div');
    const inputWrapper = document.createElement('div');
    const input = document.createElement(inputType);
    inputLabel.textContent = label;
    inputWrapper.appendChild(input);

    inputContainer.appendChild(inputWrapper);
    if(icon) {
      inputWrapper.appendChild(icon);
      input.classList.add('autoql-vanilla-with-icon');
    }

    container.appendChild(inputLabel);
    container.appendChild(inputContainer);

    container.classList.add('autoql-vanilla-input-and-label-container');
    inputLabel.classList.add('autoql-vanilla-input-label');
    inputContainer.classList.add('autoql-vanilla-input-container');
    inputWrapper.classList.add('autoql-vanilla-input-and-icon');
    input.classList.add('autoql-vanilla-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', placeholder);

    return container;
  }

  title.textContent = 'Appearance';

  const titleSection = createInputContainer({
    inputType: 'input',
    placeholder: 'eg. "Budget alert!"',
    icon: createIcon(NOTEBOOK),
    label: 'Title'
  });

  const messageSection = createInputContainer({
    inputType: 'textarea',
    placeholder: 'eg. "You have spent 80% of your budget for the month."',
    label: 'Message (optional)',
  });
  messageSection.classList.add('autoql-vanilla-notification-message-input');

  title.classList.add('autoql-vanilla-data-alert-setting-section-title');
  wrapper.classList.add('autoql-vanilla-data-alerts-container');
  container.classList.add('autoql-vanilla-data-alert-setting-section');
  composeMessageSection.classList.add('autoql-vanilla-compose-message-section');
  formSection.classList.add('autoql-vanilla-form-section');

  formSection.appendChild(titleSection);
  formSection.appendChild(messageSection);
  composeMessageSection.appendChild(formSection);
  wrapper.appendChild(composeMessageSection);
  container.appendChild(title);
  container.appendChild(wrapper);
  return container;
}