import { DataExplorerTypes, getAuthentication, runQueryValidation } from 'autoql-fe-utils';

import { strings } from '../Strings';
import { createIcon } from '../Utils';
import { refreshTooltips } from '../Tooltips';
import { DataPreview } from './Components/DataPreview';
import { SampleQueries } from './Components/SampleQueries';
import { TopicList } from './Components/TopicList/TopicList';
import { SubjectName } from './Components/SubjectName/SubjectName';
import { DataExplorerInput } from './Components/DataExplorerInput';
import { QueryValidationMessage } from '../QueryValidationMessage';
import { DATA_EXPLORER_SEARCH_ICON, CHATA_BUBBLES_ICON, ABACUS_ICON, TABLE_ICON, SEARCH_ICON } from '../Svg';

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
        onSubmit: (subject, skipQueryValidation) => obj.createDataExplorerContent(subject, skipQueryValidation),
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
                onColumnSelection: (columns) => obj.onColumnFilter(columns),
                onDataPreview: (response) => obj.onDataPreview(response),
            });

            obj.dataPreviewComponent = previewSection;

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
                onSubjectClick: (subject) => obj.onSubjectFilter(subject),
                onColumnSelection: (columns) => obj.onColumnFilter(columns),
                onDataPreview: (response) => obj.onDataPreview(response),
            });

            obj.topicList = topicListSection;

            contentWrapper.appendChild(topicListSection.container);
        }
    };

    obj.clearSampleQueriesSection = () => {
        obj.sampleQueriesSection?.container?.remove?.();
    };

    obj.createValidationMessage = (response) => {
        const validationMessage = new QueryValidationMessage({
            response,
            submitText: 'Search',
            submitIcon: SEARCH_ICON,
            onSubmit: ({ query, userSelection }) => {
                textBarComponent.input.value = query;
                textBarComponent.onSearch(
                    { type: DataExplorerTypes.TEXT_TYPE, displayName: query, userSelection },
                    true,
                );
            },
        });

        contentWrapper.appendChild(validationMessage);
    };

    obj.validateSearchTerm = async (text) => {
        try {
            const response = await runQueryValidation({
                ...getAuthentication(widget.options.authentication),
                text,
            });

            if (response?.data?.data?.replacements?.length) {
                return response;
            }
        } catch (error) {}
        return;
    };

    obj.createSampleQueriesSection = async (skipQueryValidation) => {
        obj.clearSampleQueriesSection();

        const subject = obj.selectedSubject;

        const context = subject?.type === DataExplorerTypes.VL_TYPE ? this.selectedSubject?.context : subject?.context;

        let searchText = '';

        if (subject?.type === DataExplorerTypes.TEXT_TYPE) {
            searchText = subject?.displayName;

            if (!skipQueryValidation) {
                const validationResponse = await obj.validateSearchTerm(searchText);
                if (validationResponse) {
                    obj.createValidationMessage(validationResponse);
                    return;
                }
            }
        }

        const sampleQueriesSection = new SampleQueries({
            widget,
            searchText,
            context,
            subject,
            selectedColumns: obj.selectedColumns,
            dataPreview: obj.dataPreview,
            onColumnClick: (option, index) => {
                obj.dataPreviewComponent?.table?.onColumnHeaderClick?.(index);
            },
            onColumnSelection: (columns) => {
                obj.onColumnFilter(columns);
                obj.dataPreviewComponent?.table?.clearSelections?.();
            },
        });

        obj.sampleQueriesSection = sampleQueriesSection;

        contentWrapper.appendChild(sampleQueriesSection.container);
    };

    obj.onSubjectFilter = (subject) => {
        obj.selectedSubject = subject;
        obj.createSampleQueriesSection();
    };

    obj.onColumnFilter = (columns) => {
        obj.selectedColumns = columns;
        obj.sampleQueriesSection?.updateSampleQueries?.({ selectedColumns: obj.selectedColumns });
    };

    obj.onDataPreview = (dataPreview) => {
        obj.dataPreview = dataPreview;
        obj.sampleQueriesSection?.setDataPreview?.(dataPreview);
    };

    obj.createDataExplorerContent = async (subject, skipQueryValidation) => {
        obj.selectedSubject = subject;
        obj.dataPreview = undefined;
        obj.selectedColumns = undefined;

        contentWrapper.innerHTML = '';

        obj.createTitle();
        obj.createDataPreviewSection();
        obj.createTopicsListSection();
        obj.createSampleQueriesSection(skipQueryValidation);
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
