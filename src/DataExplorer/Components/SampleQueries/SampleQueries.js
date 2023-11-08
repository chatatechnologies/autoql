import { fetchDataExplorerSampleQueries, SampleQueryReplacementTypes, getTitleCase } from 'autoql-fe-utils';

import _cloneDeep from 'lodash.clonedeep';

import { strings } from '../../../Strings';
import { createIcon } from '../../../Utils';
import { QUERY_SEND_BTN } from '../../../Svg';
import { SubjectName } from '../SubjectName/SubjectName';
import { MultiSelect } from '../../../ChataComponents/MultiSelect';

import './SampleQueries.scss';

export function SampleQueries({
    widget,
    subject,
    searchText,
    selectedColumns = [],
    context,
    dataPreview,
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

    const createSampleQuery = (suggestion) => {
        const renderedChunks = document.createElement('div');

        if (suggestion.chunked?.length) {
            suggestion.chunked.forEach((chunk, i) => {
                if (chunk?.value) {
                    let text = chunk.value;
                    if (i === 0 && chunk?.type == SampleQueryReplacementTypes.SAMPLE_QUERY_TEXT_TYPE) {
                        text = getTitleCase(chunk.value);
                    }

                    let chunkContent = text;

                    if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_VL_TYPE) {
                        chunkContent = text;
                        // TODO: console.log('CREATE INLINE AUTOCOMPLETE VL POPOVER')
                        // chunkContent = (
                        //   <VLAutocompleteInputPopover
                        //     authentication={this.props.authentication}
                        //     placeholder='Search values'
                        //     value={this.state.values[chunk.name]?.replacement ?? undefined}
                        //     onChange={(newValue) => this.onValueChange(newValue, chunk.name)}
                        //     tooltipID={this.props.tooltipID}
                        //     context={this.props.context}
                        //     shouldRender={this.props.shouldRender}
                        //   />
                        // )
                    } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_AMOUNT_TYPE) {
                        chunkContent = text;
                        // chunkContent = (
                        //   <InlineInputEditor
                        //     value={chunk.value}
                        //     type='number'
                        //     onChange={(newValue) => this.onAmountChange(newValue, chunk.name)}
                        //     tooltipID={this.props.tooltipID}
                        //   />
                        // )
                    } else if (chunk.type == SampleQueryReplacementTypes.SAMPLE_QUERY_TIME_TYPE) {
                        chunkContent = text;
                        // TODO: console.log('CREATE INLINE INPUT EDITOR')
                        // chunkContent = (
                        //   <InlineInputEditor
                        //     value={chunk.value}
                        //     type='text'
                        //     onChange={(newValue) => this.onAmountChange(newValue, chunk.name)}
                        //     datePicker={true}
                        //     tooltipID={this.props.tooltipID}
                        //   />
                        // )
                    }

                    const chunkElement = document.createElement('div');
                    chunkElement.classList.add('autoql-vanilla-data-explorer-sample-chunk');
                    chunkElement.innerHTML = chunkContent;

                    renderedChunks.appendChild(chunkElement);
                }
            });
        }

        const item = document.createElement('div');
        item.classList.add('autoql-vanilla-data-explorer-sample-query');

        const itemText = document.createElement('div');
        itemText.classList.add('autoql-vanilla-query-suggestion-text');
        itemText.appendChild(renderedChunks);

        const sendButton = document.createElement('div');
        const sendIcon = createIcon(QUERY_SEND_BTN);
        sendButton.appendChild(sendIcon);
        sendButton.classList.add('autoql-vanilla-query-suggestion-send-btn');
        sendButton.setAttribute('data-tippy-content', 'Submit Query');
        sendButton.onclick = () => {
            widget.setActiveTab(widget.tabChataUtils);
            widget.tabsAnimation('flex', 'block');
            widget.dataExplorer.hide();
            widget.notificationsAnimation('none');
            widget.keyboardAnimation(suggestion.queryText);
            widget.options.landingPage = 'data-messenger';
        };

        item.appendChild(itemText);
        item.appendChild(sendButton);

        return item;
    };

    obj.updateSelectedColumns = () => {
        if (obj.fieldSelector) {
            obj.selectedColumns;
        }
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

            const fieldSelector = new MultiSelect({
                title: 'FIELDS',
                size: 'small',
                align: 'start',
                selected: obj.selectedColumns,
                listTitle: fieldsDropdownTitle,
                options: dataPreviewColumns.map((col) => {
                    return {
                        value: col.name,
                        label: col.display_name,
                    };
                }),
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
                    const item = createSampleQuery(suggestion);
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
