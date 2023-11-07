import { DataExplorerTypes } from 'autoql-fe-utils';

import { DATA_EXPLORER_SEARCH_ICON, CHATA_BUBBLES_ICON, ABACUS_ICON, TABLE_ICON } from '../Svg';

import { refreshTooltips } from '../Tooltips';
import { createIcon } from '../Utils';
import { DataPreview } from './Components/DataPreview';
import { SampleQueries } from './Components/SampleQueries';
import { SubjectName } from './Components/SubjectName/SubjectName';
import { DataExplorerInput } from './Components/DataExplorerInput';

import './DataExplorer.scss';
import { TopicList } from './Components/TopicList/TopicList';

export function DataExplorer({ subjects, widget }) {
    let obj = this;

    const container = document.createElement('div');
    const introMessage = document.createElement('div');
    const title = document.createElement('h2');
    const instructions = document.createElement('div');
    const p = document.createElement('p');
    const instructionList = document.createElement('div');
    const listWrapper = document.createElement('div');
    const contentWrapper = document.createElement('div');
    const resultContainer = document.createElement('div');

    container.classList.add('autoql-vanilla-data-explorer-content-container');
    resultContainer.classList.add('autoql-vanilla-data-explorer-result-container');
    contentWrapper.classList.add('autoql-vanilla-data-explorer-sections-container');
    resultContainer.appendChild(contentWrapper);

    const textBarComponent = new DataExplorerInput({
        subjects,
        container,
        onSubjectClick: (subject) => obj.onSubjectClick(subject),
        widget,
        onClearSearch: () => {
            contentWrapper.innerHTML = '';

            // var previewSection = document.querySelector(
            //     '.autoql-vanilla-data-explorer-section.autoql-vanilla-data-preview-section',
            // );
            // var sampleQueriesSection = document.querySelector(
            //     '.autoql-vanilla-data-explorer-section.autoql-vanilla-query-suggestions-section',
            // );

            // if (previewSection) {
            //     previewSection.remove();
            // }
            // if (sampleQueriesSection) {
            //     sampleQueriesSection.remove();
            // }
            contentWrapper.appendChild(introMessage);
        },
    });
    const textBar = textBarComponent?.textBar;

    obj.setSubjects = (subjects) => {
        textBarComponent?.setSubjects(subjects);
    };

    refreshTooltips();

    introMessage.classList.add('autoql-vanilla-data-explorer-intro-message');
    instructionList.classList.add('autoql-vanilla-intro-message-list-container');

    title.appendChild(document.createTextNode('Welcome to '));
    title.appendChild(createIcon(DATA_EXPLORER_SEARCH_ICON));
    title.appendChild(document.createTextNode('Data Explorer'));
    p.appendChild(
        document.createTextNode(
            `Explore your data and discover what you can ask AutoQL. Simply enter a term or topic above and:`,
        ),
    );

    const texts = [
        { icon: TABLE_ICON, string: 'Preview available data in a snapshot' },
        { icon: ABACUS_ICON, string: 'Explore data structure and column types' },
        { icon: CHATA_BUBBLES_ICON, string: 'View a variety of query suggestions' },
    ];

    texts.map((text) => {
        const icon = createIcon(text.icon);
        const elem = document.createElement('p');

        elem.appendChild(icon);
        elem.appendChild(document.createTextNode(text.string));
        listWrapper.appendChild(elem);
    });

    obj.createTitle = (subject) => {
        if (subject?.displayName && subject?.type !== DataExplorerTypes.TEXT_TYPE) {
            const subjectName = new SubjectName({ subject });
            subjectName.classList.add('autoql-vanilla-data-explorer-selected-subject-title');

            contentWrapper.appendChild(subjectName);
        }
    };

    obj.createDataPreviewSection = (subject) => {
        if (subject?.type === DataExplorerTypes.SUBJECT_TYPE) {
            const previewSection = new DataPreview({
                subject,
                widgetOptions: widget.options,
            });

            obj.dataPreview = previewSection;

            contentWrapper.appendChild(previewSection.container);
        }
    };

    obj.createTopicsListSection = (subject) => {
        if (subject?.type === DataExplorerTypes.VL_TYPE) {
            const topicListSection = new TopicList({
                valueLabel: subject.valueLabel.canonical,
                options: widget.options,
                subjects,
                subject,
            });

            obj.topicList = topicListSection;

            contentWrapper.appendChild(topicListSection.container);
        }
    };

    obj.createSampleQueriesSection = (subject) => {
        const context = subject?.type === DataExplorerTypes.VL_TYPE ? this.selectedTopic?.context : subject?.context;

        let searchText = '';
        if (subject?.type === DataExplorerTypes.TEXT_TYPE) {
            searchText = subject?.displayName;
        }

        let columns;
        if (subject?.valueLabel?.column_name) {
            columns = {
                [subject.valueLabel.column_name]: {
                    value: subject.valueLabel.keyword,
                },
            };
        }

        if (this.selectedColumns?.length) {
            this.selectedColumns?.forEach((columnIndex) => {
                if (!columns) {
                    columns = {};
                }

                const column = obj.dataPreview?.response?.data?.data?.columns[columnIndex];
                if (!columns[column.name]) {
                    columns[column.name] = { value: '' };
                }
            });
        }

        const sampleQueriesSection = new SampleQueries({
            widget,
            searchText,
            columns,
            context,
        });

        contentWrapper.appendChild(sampleQueriesSection);
    };

    obj.onSubjectClick = (subject) => {
        contentWrapper.innerHTML = '';
        obj.createDataExplorerContent(subject);
    };

    obj.createDataExplorerContent = async (subject) => {
        obj.createTitle(subject);
        obj.createDataPreviewSection(subject);
        obj.createTopicsListSection(subject);
        obj.createSampleQueriesSection(subject);
    };

    instructionList.appendChild(listWrapper);
    instructions.appendChild(p);
    instructions.appendChild(instructionList);
    introMessage.appendChild(title);
    introMessage.appendChild(instructions);
    contentWrapper.appendChild(introMessage);
    container.appendChild(textBar);
    container.appendChild(resultContainer);
    container.style.display = 'none';

    obj.hide = () => {
        container.style.display = 'none';
    };

    obj.show = () => {
        container.style.display = 'block';
    };

    obj.container = container;
}
