import './AppearanceView.scss';
import { NOTEBOOK, CALENDAR, VERTICAL_DOTS } from '../../../../Svg';
import { createIcon } from '../../../../Utils';
import dayjs from '../../../../Utils/dayjsPlugins';
import { isNumber } from 'autoql-fe-utils';

export function AppearanceView() {
  const container = document.createElement('div');
  const title = document.createElement('div');
  const wrapper = document.createElement('div');
  const composeMessageSection = document.createElement('div');
  const formSection = document.createElement('div');
  
  const getFormattedTimestamp = () => {
    const timestamp = new Date().toISOString();

    let dateDayJS
    if (isNumber(timestamp)) {
      dateDayJS = dayjs.unix(timestamp)
    } else {
      dateDayJS = dayjs(timestamp)
    }

    const time = dateDayJS.format('h:mma')
    const day = dateDayJS.format('MM-DD-YY')

    const today = dayjs().format('MM-DD-YY')
    const yesterday = dayjs().subtract(1, 'd').format('MM-DD-YY')

    if (day === today) {
      return `Today at ${time}`
    } else if (day === yesterday) {
      return `Yesterday at ${time}`
    } else if (dayjs().isSame(dateDayJS, 'year')) {
      return `${dateDayJS.format('MMMM Do')} at ${time}`
    }
    return `${dateDayJS.format('MMMM Do, YYYY')} at ${time}`
  }

  const createInputLabel = ({ label }) => {
    const container = document.createElement('div');
    const inputLabel = document.createElement('div');
    inputLabel.textContent = label;
    container.appendChild(inputLabel);
    container.classList.add('autoql-vanilla-input-and-label-container');
    inputLabel.classList.add('autoql-vanilla-input-label');
    
    return container;
  }
  
  const createInputContainer = ({ inputType, placeholder, icon, label, onChange }) => {
    const container = createInputLabel({ label });
    const inputContainer = document.createElement('div');
    const inputWrapper = document.createElement('div');
    const input = document.createElement(inputType);
    inputWrapper.appendChild(input);
    
    inputContainer.appendChild(inputWrapper);
    if(icon) {
      inputWrapper.appendChild(icon);
      inputWrapper.classList.add('autoql-vanilla-with-icon');
      input.classList.add('autoql-vanilla-with-icon');
    }
    
    container.appendChild(inputContainer);
    
    inputContainer.classList.add('autoql-vanilla-input-container');
    inputWrapper.classList.add('autoql-vanilla-input-and-icon');
    input.classList.add('autoql-vanilla-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', placeholder);
    
    input.onkeyup = ((evt) => {
      let val = evt.target.value;
      if(inputType === 'input' &&  val === '') {
        val = '[Title]';
      }
      onChange(val);
    })

    return container;
  }

  const createPreviewItem = () => {
    const item = document.createElement('div');
    const header = document.createElement('div');
    const displayNameContainer = document.createElement('div');
    const displayName = document.createElement('div');
    const description = document.createElement('div');
    const timestampContainer = document.createElement('div');
    const timestamp = document.createElement('span');

    const btnContainer = document.createElement('div');
    const verticalDots = createIcon(VERTICAL_DOTS);

    const strip = document.createElement('div');

    item.classList.add('autoql-vanilla-notification-list-item');
    header.classList.add('autoql-vanilla-notification-list-item-header');
    displayNameContainer.classList.add('autoql-vanilla-notification-display-name-container');
    displayName.classList.add('autoql-vanilla-notification-display-name');
    description.classList.add('autoql-vanilla-notification-description');
    timestampContainer.classList.add('autoql-vanilla-notification-timestamp-container');
    timestamp.classList.add('autoql-vanilla-notification-timestamp');
    btnContainer.classList.add('autoql-vanilla-notification-options-btn-container')
    verticalDots.classList.add('autoql-vanilla-notification-options-btn');
    strip.classList.add('autoql-vanilla-notification-alert-strip')
    displayName.textContent = 'Test1';
    timestamp.appendChild(createIcon(CALENDAR));
    timestamp.appendChild(document.createTextNode(getFormattedTimestamp()));

    btnContainer.appendChild(verticalDots);
    timestampContainer.appendChild(timestamp);
    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestampContainer);

    header.appendChild(displayNameContainer);
    header.appendChild(btnContainer);
    item.appendChild(header);
    item.appendChild(strip);

    item.setTitle = (val) => {
      displayName.textContent = val;
    }

    item.setDescription = (val) => {
      description.textContent = val;
    }

    return item;
  }
  
  const createPreview = ({ label }) => {
    const inputlabelContainer = createInputLabel({ label });
    const previewSection = document.createElement('div');
    const dataAlertPreview = document.createElement('div');
    const item = createPreviewItem();

    previewSection.classList.add('autoql-vanilla-preview-section');
    dataAlertPreview.classList.add('autoql-vanilla-data-alert-preview');
    dataAlertPreview.appendChild(item);
    previewSection.appendChild(inputlabelContainer);
    previewSection.appendChild(dataAlertPreview);
    
    previewSection.setTitle = (val) => {
      item.setTitle(val)
    }

    previewSection.setDescription = (val) => {
      item.setDescription(val)
    }

    return previewSection;
  }
  
  title.textContent = 'Appearance';

  const previewSection = createPreview({
    label: 'Preview',
  });

  const handleTitleChange = (val) => {
    previewSection.setTitle(val);
  }

  const handleDescriptionChange = (val) => {
    previewSection.setDescription(val);
  }
  
  const titleSection = createInputContainer({
    inputType: 'input',
    placeholder: 'eg. "Budget alert!"',
    icon: createIcon(NOTEBOOK),
    label: 'Title',
    onChange: handleTitleChange,
  });
  
  const messageSection = createInputContainer({
    inputType: 'textarea',
    placeholder: 'eg. "You have spent 80% of your budget for the month."',
    label: 'Message (optional)',
    onChange: handleDescriptionChange,
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