import './AppearanceView.scss';
import { NOTEBOOK } from '../../../../Svg';
import { createIcon } from '../../../../Utils';

export function AppearanceView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const composeMessageSection = document.createElement('div');
  const formSection = document.createElement('div');
  
  const createInputLabel = ({ label }) => {
    const container = document.createElement('div');
    const inputLabel = document.createElement('div');
    inputLabel.textContent = label;
    container.appendChild(inputLabel);
    container.classList.add('autoql-vanilla-input-and-label-container');
    inputLabel.classList.add('autoql-vanilla-input-label');
    
    return container;
  }
  
  const createInputContainer = ({ inputType, placeholder, icon, label }) => {
    const container = createInputLabel({ label });
    const inputContainer = document.createElement('div');
    const inputWrapper = document.createElement('div');
    const input = document.createElement(inputType);
    inputWrapper.appendChild(input);
    
    inputContainer.appendChild(inputWrapper);
    if(icon) {
      inputWrapper.appendChild(icon);
      input.classList.add('autoql-vanilla-with-icon');
    }
    
    container.appendChild(inputContainer);
    
    inputContainer.classList.add('autoql-vanilla-input-container');
    inputWrapper.classList.add('autoql-vanilla-input-and-icon');
    input.classList.add('autoql-vanilla-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', placeholder);
    
    return container;
  }
  
  const createPreview = ({ label }) => {
    const inputlabelContainer = createInputLabel({ label });
    const previewSection = document.createElement('div');
    const dataAlertPreview = document.createElement('div');
    
    previewSection.classList.add('autoql-vanilla-preview-section');
    dataAlertPreview.classList.add('autoql-vanilla-data-alert-preview');
    previewSection.appendChild(inputlabelContainer);
    previewSection.appendChild(dataAlertPreview);
    
    return previewSection;
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

  const previewSection = createPreview({
    label: 'Preview',
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
  composeMessageSection.appendChild(previewSection);
  wrapper.appendChild(composeMessageSection);
  container.appendChild(title);
  container.appendChild(wrapper);
  return container;
}