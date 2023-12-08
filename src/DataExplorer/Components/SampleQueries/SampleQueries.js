import {
    fetchDataExplorerSampleQueries,
    SampleQueryReplacementTypes,
    getTitleCase,
    getQueryRequestParams,
} from 'autoql-fe-utils';

import { strings } from '../../../Strings';
import { createIcon } from '../../../Utils';
import { SampleQuery } from './SampleQuery';
import { QUERY_SEND_BTN } from '../../../Svg';
import { SubjectName } from '../SubjectName/SubjectName';
import { MultiSelect } from '../../../ChataComponents/MultiSelect';
import { VLAutocompleteInputPopover } from '../../../VLAutocomplete/VLAutocompletePopover';

import './SampleQueries.scss';

export function SampleQueries({
    widget,
    subject,
    context,
    searchText,
    dataPreview,
    selectedColumns = [],
    onColumnClick = () => {},
    onColumnSelection = () => {},
}) {
    let obj = this;

    const container = document.createElement('div');
    const suggestionList = document.createElement('div');
    const list = document.createElement('div');

    obj.container = container;
    obj.dataPreview = dataPreview;
    obj.selectedColumns = selectedColumns;

    const showLoading = () => {
        list.innerHTML = '';

        if (!obj.placeholderContainer) {
            const placeholderHeight = '25px';

            const placeholderContainer = document.createElement('div');
            placeholderContainer.classList.add('autoql-vanilla-data-explorer-section-placeholder-loading-container');

            ['60%', '80%', '40%', '50%'].forEach((percentWidth) => {
                const placeholderRow = document.createElement('div');
                const placeholderLoader = document.createElement('div');
                placeholderRow.classList.add('autoql-vanilla-data-explorer-section-placeholder-loading-item');
                placeholderLoader.classList.add('autoql-vanilla-placeholder-loader');
                placeholderLoader.style.height = placeholderHeight;
                placeholderLoader.style.width = percentWidth;

                placeholderRow.appendChild(placeholderLoader);
                placeholderContainer.appendChild(placeholderRow);
            });

            obj.placeholderContainer = placeholderContainer;

            obj.suggestionList.appendChild(placeholderContainer);
        } else {
            obj.placeholderContainer.style.display = 'block';
        }
    };

    const clearLoading = () => {
        if (obj.placeholderContainer) {
            obj.placeholderContainer.style.display = 'none';
        }
    };

    const getColumns = () => {
        let columns;
        if (subject?.valueLabel?.column_name) {
            columns = {
                [subject.valueLabel.column_name]: {
                    value: subject.valueLabel.keyword,
                },
            };
        }

        if (obj.selectedColumns?.length) {
            obj.selectedColumns?.forEach((columnIndex) => {
                if (!columns) {
                    columns = {};
                }

                const column = obj.dataPreview?.data?.data?.columns[columnIndex];
                if (column?.name && !columns[column.name]) {
                    columns[column.name] = { value: '' };
                }
            });
        }

        return columns;
    };

    const createErrorMessage = (error) => {
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.classList.add('data-explorer-section-error-container');

        const messageText = document.createElement('p');
        messageText.innerHTML = error?.message || strings.sampleQueriesGeneralError;
        errorMessageContainer.appendChild(messageText);

        if (error?.reference_id) {
            const messageErrorID = document.createElement('p');
            messageErrorID.innerHTML = `${strings.errorID}: ${error.reference_id}`;
            errorMessageContainer.appendChild(messageErrorID);
        }

        list.appendChild(errorMessageContainer);
    };

    obj.setDataPreview = (dataPreviewData) => {
        obj.dataPreview = dataPreviewData;
        obj.createFieldSelectorSection();
    };

    obj.updateSampleQueries = ({ dataPreview: dataPreviewData, selectedColumns }) => {
        if (dataPreviewData) {
            obj.dataPreview = dataPreviewData;
        }

        if (selectedColumns) {
            obj.selectedColumns = selectedColumns;
        }

        obj.getSampleQueries();
    };

    obj.createFieldSelectorSection = () => {
        try {
            obj.fieldSelectorSection?.remove();

            const dataPreviewColumns = obj.dataPreview?.data?.data?.columns;

            if (!dataPreviewColumns?.length) {
                return;
            }

            const fieldSelectorSection = document.createElement('div');
            const fieldSelectorWrapper = document.createElement('span');

            fieldSelectorSection.classList.add('autoql-vanilla-data-explorer-sample-queries-header-actions');
            fieldSelectorWrapper.classList.add('autoql-vanilla-data-preview-selected-columns-selector');

            let fieldsDropdownTitle = 'Select fields of interest';
            if (subject) {
                fieldsDropdownTitle = document.createElement('span');
                const fieldsDropdownTitleText = document.createElement('span');
                fieldsDropdownTitleText.innerHTML = 'Select fields from ';
                const subjectName = new SubjectName({ subject });

                fieldsDropdownTitle.appendChild(fieldsDropdownTitleText);
                fieldsDropdownTitle.appendChild(subjectName);
            }

            const options = dataPreviewColumns.map((col) => {
                return {
                    value: col.name,
                    label: col.display_name,
                };
            });

            const selected =
                obj.selectedColumns?.map((index) => {
                    return dataPreviewColumns[index]?.name;
                }) ?? [];

            const fieldSelector = new MultiSelect({
                options,
                title: 'FIELDS',
                size: 'small',
                align: 'start',
                selected,
                listTitle: fieldsDropdownTitle,
                onItemClick: (option, index) => {
                    onColumnClick(option, index);
                },
                onChange: (selectedColumnNames) => {
                    const selectedColumnIndexes = selectedColumnNames.map((name) =>
                        dataPreviewColumns.findIndex((col) => name === col.name),
                    );
                    // onColumnSelection(selectedColumnIndexes);
                    obj.selectedColumns = selectedColumnIndexes;
                },
            });

            obj.fieldSelectorSection = fieldSelectorSection;
            obj.fieldSelector = fieldSelector;

            fieldSelectorWrapper.appendChild(fieldSelector);

            const clearFiltersBtn = document.createElement('span');
            clearFiltersBtn.classList.add('autoql-vanilla-data-preview-selected-columns-clear-btn');
            clearFiltersBtn.innerHTML = 'CLEAR';
            clearFiltersBtn.addEventListener('click', () => {
                onColumnSelection([]);
            });

            if (!obj.selectedColumns?.length) {
                clearFiltersBtn.classList.add('autoql-vanilla-data-preview-selected-columns-clear-btn-hidden');
            }

            fieldSelectorSection.appendChild(fieldSelectorWrapper);
            fieldSelectorSection.appendChild(clearFiltersBtn);

            this.sampleQueriesHeader.appendChild(fieldSelectorSection);
        } catch (error) {
            console.error(error);
        }
    };

    obj.getSampleQueries = async () => {
        try {
            showLoading();
            obj.createFieldSelectorSection();

            const columns = getColumns();
            const sampleQueries = await fetchDataExplorerSampleQueries({
                ...(widget?.options?.authentication ?? {}),
                text: searchText,
                context,
                columns,
            });

            clearLoading();

            const items = sampleQueries?.data?.data?.suggestions;

            if (!items?.length) {
                const emptyListMessage = document.createElement('div');
                emptyListMessage.classList.add('autoql-vanilla-related-queries-empty-list-message');
                const emptyListText = strings.sampleQueriesNotFound;
                emptyListMessage.appendChild(document.createTextNode(emptyListText));
                list.appendChild(emptyListMessage);
            } else {
                items.forEach((suggestion) => {
                    const item = new SampleQuery({
                        suggestion,
                        options: widget.options,
                        context,
                        onSubmit: (queryParams) => {
                            const queryText = queryParams?.query ?? suggestion.queryText;

                            widget.setActiveTab(widget.tabChataUtils);
                            widget.tabsAnimation('flex', 'block');
                            widget.dataExplorer.hide();
                            widget.notificationsAnimation('none');
                            widget.keyboardAnimation(queryText);
                            widget.options.landingPage = 'data-messenger';
                        },
                    });

                    list.appendChild(item);
                });
            }
        } catch (error) {
            console.error(error);
            clearLoading();
            createErrorMessage(error);
        }
    };

    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-query-suggestions-section');
    list.classList.add('autoql-vanilla-query-suggestion-list');
    suggestionList.classList.add('autoql-vanilla-data-explorer-query-suggestion-list');
    suggestionList.appendChild(list);
    obj.suggestionList = suggestionList;

    // Create Header
    const sampleQueriesHeader = document.createElement('div');
    sampleQueriesHeader.classList.add('autoql-vanilla-data-explorer-title-text');
    const sampleQueriesHeaderText = document.createElement('span');
    sampleQueriesHeaderText.classList.add('autoql-vanilla-data-explorer-title-text-sample-queries');
    sampleQueriesHeaderText.innerHTML = strings.sampleQueries;
    sampleQueriesHeader.appendChild(sampleQueriesHeaderText);

    this.sampleQueriesHeader = sampleQueriesHeader;

    container.appendChild(sampleQueriesHeader);
    container.appendChild(suggestionList);

    obj.getSampleQueries();

    return obj;
}
