import { getFormattedTimestamp } from 'autoql-fe-utils';

import { createIcon } from '../../../../../Utils';
import { Input } from '../../../../../ChataComponents/Input';
import { NOTEBOOK, CALENDAR, VERTICAL_DOTS } from '../../../../../Svg';

import './AppearanceStep.scss';

export function AppearanceStep({ onChange = () => {}, dataAlert, showSummaryMessage = true } = {}) {
    const container = document.createElement('div');
    const composeStepMessage = document.createElement('div');
    const wrapper = document.createElement('div');
    const composeMessageSection = document.createElement('div');
    const composeMessageSectionWrapper = document.createElement('span');
    const boldText = document.createElement('strong');
    const formSection = document.createElement('div');

    const defaultTitle = dataAlert?.title ?? '[Title]';

    const createInputLabel = ({ label }) => {
        const container = document.createElement('div');
        const inputLabel = document.createElement('div');
        inputLabel.textContent = label;
        container.appendChild(inputLabel);
        container.classList.add('autoql-vanilla-input-and-label-container');
        inputLabel.classList.add('autoql-vanilla-input-label');

        return container;
    };

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
        item.classList.add('autoql-vanilla-notification-unread');
        header.classList.add('autoql-vanilla-notification-list-item-header');
        displayNameContainer.classList.add('autoql-vanilla-notification-display-name-container');
        displayName.classList.add('autoql-vanilla-notification-display-name');
        description.classList.add('autoql-vanilla-notification-description');
        timestampContainer.classList.add('autoql-vanilla-notification-timestamp-container');
        timestamp.classList.add('autoql-vanilla-notification-timestamp');
        btnContainer.classList.add('autoql-vanilla-notification-options-btn-container');
        verticalDots.classList.add('autoql-vanilla-notification-options-btn');
        strip.classList.add('autoql-vanilla-notification-alert-strip');
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
            if (val) {
                displayName.textContent = val;
            } else {
                displayName.textContent = defaultTitle;
            }
        };

        item.setDescription = (val) => {
            description.textContent = val;
        };

        return item;
    };

    const createPreview = ({ label, defaultMessage }) => {
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
            item.setTitle(val);
        };

        previewSection.setDescription = (val) => {
            item.setDescription(val);
        };

        previewSection.setTitle(defaultTitle);
        previewSection.setDescription(defaultMessage);

        return previewSection;
    };

    const previewSection = createPreview({
        label: 'Preview',
        defaultMessage: dataAlert?.message ?? '',
    });

    const handleTitleChange = (e) => {
        const title = e.target.value;
        previewSection.setTitle(title);
        onChange({ title });
    };

    const handleDescriptionChange = (e) => {
        const message = e.target.value;

        previewSection.setDescription(message);
        onChange({ message });
    };

    const titleSection = new Input({
        placeholder: 'eg. "Budget alert!"',
        icon: NOTEBOOK,
        label: 'Title',
        value: dataAlert?.title ?? '',
        onChange: handleTitleChange,
    });

    const messageSection = new Input({
        area: true,
        placeholder: 'eg. "You have spent 80% of your budget for the month."',
        label: 'Message (optional)',
        value: dataAlert?.message ?? '',
        onChange: handleDescriptionChange,
    });

    composeMessageSectionWrapper.textContent =
        "If the Data Alert conditions are met, you'll receive a notification with this ";
    boldText.textContent = 'title and message:';

    messageSection.classList.add('autoql-vanilla-notification-message-input');
    composeStepMessage.classList.add('autoql-vanilla-compose-message-section-condition-statement');
    wrapper.classList.add('autoql-vanilla-data-alerts-container');
    composeMessageSection.classList.add('autoql-vanilla-compose-message-section');
    formSection.classList.add('autoql-vanilla-form-section');
    composeMessageSectionWrapper.appendChild(boldText);

    if (showSummaryMessage) {
        composeStepMessage.appendChild(composeMessageSectionWrapper);
    }

    formSection.appendChild(titleSection);
    formSection.appendChild(messageSection);
    composeMessageSection.appendChild(formSection);
    composeMessageSection.appendChild(previewSection);
    wrapper.appendChild(composeStepMessage);
    wrapper.appendChild(composeMessageSection);
    container.appendChild(wrapper);

    container.getValues = () => {
        return {
            title: titleSection.input?.value,
            message: messageSection.input?.value,
        };
    };

    container.isValid = () => {
        return titleSection.getValue() !== '';
    };

    container.classList.add('autoql-vanilla-data-alert-setting-section');
    container.classList.add('autoql-vanilla-data-alert-modal-step');

    return container;
}
