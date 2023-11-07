import { DataExplorerTypes } from 'autoql-fe-utils';

import { strings } from '../Strings';
import { createIcon } from '../Utils';
import { refreshTooltips } from '../Tooltips';
import { DataPreview } from './Components/DataPreview';
import { SampleQueries } from './Components/SampleQueries';
import { TopicList } from './Components/TopicList/TopicList';
import { SubjectName } from './Components/SubjectName/SubjectName';
import { DataExplorerInput } from './Components/DataExplorerInput';
import { DATA_EXPLORER_SEARCH_ICON, CHATA_BUBBLES_ICON, ABACUS_ICON, TABLE_ICON } from '../Svg';

import './DataExplorer.scss';

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
        onSubmit: (subject) => obj.createDataExplorerContent(subject),
        options: widget.options,
        onClearSearch: () => {
            contentWrapper.innerHTML = '';
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

    title.appendChild(document.createTextNode(strings.welcomeTo));
    title.appendChild(createIcon(DATA_EXPLORER_SEARCH_ICON));
    title.appendChild(document.createTextNode(strings.dataExplorer));
    p.appendChild(document.createTextNode(strings.dataExplorerIntro));

    const texts = [
        { icon: TABLE_ICON, string: strings.dataExplorerMessage1 },
        { icon: ABACUS_ICON, string: strings.dataExplorerMessage2 },
        { icon: CHATA_BUBBLES_ICON, string: strings.dataExplorerMessage3 },
    ];

    texts.map((text) => {
        const icon = createIcon(text.icon);
        const elem = document.createElement('p');

        elem.appendChild(icon);
        elem.appendChild(document.createTextNode(text.string));
        listWrapper.appendChild(elem);
    });

    obj.createTitle = () => {
        const subject = obj.selectedSubject;
        if (subject?.displayName && subject?.type !== DataExplorerTypes.TEXT_TYPE) {
            const subjectName = new SubjectName({ subject });
            subjectName.classList.add('autoql-vanilla-data-explorer-selected-subject-title');

            contentWrapper.appendChild(subjectName);
        }
    };

    obj.createDataPreviewSection = () => {
        const subject = obj.selectedSubject;

        if (subject?.type === DataExplorerTypes.SUBJECT_TYPE) {
            const previewSection = new DataPreview({
                subject,
                widgetOptions: widget.options,
                onColumnSelection: obj.onColumnFilter,
            });

            obj.dataPreview = previewSection;

            contentWrapper.appendChild(previewSection.container);
        }
    };

    obj.createTopicsListSection = () => {
        const subject = obj.selectedSubject;

        if (subject?.type === DataExplorerTypes.VL_TYPE) {
            const topicListSection = new TopicList({
                valueLabel: subject.valueLabel.canonical,
                options: widget.options,
                subjects,
                subject,
                onSubjectClick: obj.onSubjectFilter,
                onColumnSelection: obj.onColumnFilter,
                onDataPreview: (previewSection) => (obj.dataPreview = previewSection),
            });

            obj.topicList = topicListSection;

            contentWrapper.appendChild(topicListSection.container);
        }
    };

    obj.clearSampleQueriesSection = () => {
        obj.sampleQueriesSection?.remove?.();
    };

    obj.createSampleQueriesSection = () => {
        obj.clearSampleQueriesSection();

        const subject = obj.selectedSubject;

        const context = subject?.type === DataExplorerTypes.VL_TYPE ? this.selectedSubject?.context : subject?.context;

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
                if (column?.name && !columns[column.name]) {
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

        obj.sampleQueriesSection = sampleQueriesSection;

        contentWrapper.appendChild(sampleQueriesSection);
    };

    obj.onSubjectFilter = (subject) => {
        obj.selectedSubject = subject;
        obj.createSampleQueriesSection();
    };

    obj.onColumnFilter = (columns) => {
        obj.selectedColumns = columns;
        obj.createSampleQueriesSection();
    };

    obj.createDataExplorerContent = async (subject) => {
        obj.selectedSubject = subject;

        contentWrapper.innerHTML = '';

        obj.createTitle();

        // TODO: console.log('implement safetynet for plain text search')
        // if (subject.type === DataExplorerTypes.TEXT_TYPE) {
        //     await validateSearchTerm(searchTerm)
        // }

        obj.createDataPreviewSection();
        obj.createTopicsListSection();
        obj.createSampleQueriesSection();
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
