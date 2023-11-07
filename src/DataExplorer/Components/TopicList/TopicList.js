import { fetchSubjectListV2 } from 'autoql-fe-utils';

import { createIcon } from '../../../Utils';
import { CARET_LEFT_ICON } from '../../../Svg';
import { DataPreview } from '../DataPreview';
import { strings } from '../../../Strings';

import './TopicList.scss';

export function TopicList({
    options,
    subjects,
    subject,
    valueLabel,
    onSubjectClick = () => {},
    onColumnSelection = () => {},
    onDataPreview = () => {},
}) {
    let obj = this;

    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-topic-dropdown-section');

    const showLoading = () => {
        container.innerHTML = '';
    };

    const clearLoading = () => {
        if (obj.loader) {
            obj.loader.style.display = 'none';
        }
    };

    const createErrorMessage = (error) => {
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.classList.add('data-explorer-section-error-container');

        const messageText = document.createElement('p');
        messageText.innerHTML = error?.message || strings.topicsGeneralError;
        errorMessageContainer.appendChild(messageText);

        if (error?.reference_id) {
            const messageErrorID = document.createElement('p');
            messageErrorID.innerHTML = `${strings.errorID}: ${error.reference_id}`;
            errorMessageContainer.appendChild(messageErrorID);
        }

        container.appendChild(errorMessageContainer);
    };

    obj.onSubjectClick = (clickedSubject) => {
        onSubjectClick(clickedSubject);

        const dataPreviewSection = document.createElement('div');
        dataPreviewSection.classList.add('autoql-vanilla-topic-cascader-data-preview');

        if (obj.dataPreviewSection) {
            container.removeChild(obj.dataPreviewSection);
        }

        const title = document.createElement('div');
        title.classList.add('autoql-vanilla-topics-list-title');
        title.addEventListener('click', () => {
            dataPreviewSection.parentElement.removeChild(dataPreviewSection);
            obj.topicList.classList.add('autoql-vanilla-data-explorer-query-topic-list-visible');
            obj.topicList.classList.remove('autoql-vanilla-data-explorer-query-topic-list-hidden');
            onSubjectClick();
        });

        const titleText = document.createElement('span');
        titleText.classList.add('autoql-vanilla-topics-list-title-text');
        titleText.innerHTML = clickedSubject.displayName;

        const backArrow = createIcon(CARET_LEFT_ICON);
        backArrow.classList.add('autoql-vanilla-topic-list-back-arrow');

        title.appendChild(backArrow);
        title.appendChild(titleText);

        const dataPreview = new DataPreview({
            subject: clickedSubject,
            widgetOptions: options,
            showLabel: false,
            onColumnSelection,
        });

        onDataPreview(dataPreview);

        dataPreviewSection.appendChild(title);
        dataPreviewSection.appendChild(dataPreview.container);

        obj.topicList.classList.remove('autoql-vanilla-data-explorer-query-topic-list-visible');
        obj.topicList.classList.add('autoql-vanilla-data-explorer-query-topic-list-hidden');

        obj.listCascader.appendChild(dataPreviewSection);
    };

    const createTopicsList = (topics) => {
        container.innerHTML = '';

        const listCascader = document.createElement('div');
        listCascader.classList.add('autoql-vanilla-query-topic-list');

        obj.listCascader = listCascader;

        const subjectList = [];

        topics.forEach((topic) => {
            const foundSubject = subjects?.find((subj) => subj.context === topic.subject);
            if (foundSubject) {
                subjectList.push(foundSubject);
            }
        });

        if (subjectList?.length) {
            const listLabel = document.createElement('div');
            listLabel.classList.add('autoql-vanilla-input-label');
            listLabel.innerHTML = `${strings.topicSelectionLabel} <em>"${subject?.displayName}"</em>:`;

            const topicList = document.createElement('div');
            topicList.classList.add('autoql-vanilla-data-explorer-query-topic-list');
            topicList.classList.add('autoql-vanilla-data-explorer-query-topic-list-visible');

            obj.topicList = topicList;

            subjectList.forEach((subject) => {
                const subjectItem = document.createElement('div');
                const subjectItemText = document.createElement('span');
                const subjectItemArrow = createIcon(CARET_LEFT_ICON);

                subjectItem.classList.add('autoql-vanilla-data-explorer-topic-list-item');
                subjectItemText.classList.add('autoql-vanilla-data-explorer-topic-list-item-text');
                subjectItemArrow.classList.add('autoql-vanilla-cascader-option-arrow');
                subjectItemText.innerHTML = subject.displayName;

                subjectItem.addEventListener('click', () => obj.onSubjectClick(subject));

                subjectItem.appendChild(subjectItemText);
                subjectItem.appendChild(subjectItemArrow);
                topicList.appendChild(subjectItem);
            });

            listCascader.appendChild(topicList);

            container.appendChild(listLabel);
            container.appendChild(listCascader);
        }
    };

    const getTopics = async () => {
        showLoading();

        try {
            const topics = await fetchSubjectListV2({
                ...(options.authentication ?? {}),
                valueLabel,
            });

            clearLoading();

            if (!topics?.length) {
                createErrorMessage();
            } else {
                createTopicsList(topics);
            }
        } catch (error) {
            console.error(error);
            clearLoading();
            createErrorMessage(error);
        }
    };

    getTopics();

    obj.container = container;

    return obj;
}
