import { createIcon } from '../../../Utils';
import { CHATA_BUBBLES_ICON } from '../../../Svg';
import { fetchDataExplorerSuggestions } from 'autoql-fe-utils';

import './RelatedQueries.scss';

export function RelatedQueries({ widget, subject = {}, plainText }) {
    // if (!subject || this.validating) {
    //   return null
    // }

    // const context = subject?.type === DataExplorerTypes.VL_TYPE
    //     ? this.selectedTopic?.context
    //     : subject?.context

    // let searchText = ''
    // if (subject?.type === DataExplorerTypes.TEXT_TYPE) {
    //   searchText = subject?.displayName
    // }

    // let columns
    // if (subject?.valueLabel?.column_name) {
    //   columns = {
    //     [subject.valueLabel.column_name]: {
    //       value: subject.valueLabel.keyword,
    //     },
    //   }
    // }

    // if (this.selectedColumns?.length) {
    //   this.selectedColumns?.forEach((columnIndex) => {
    //     if (!columns) {
    //       columns = {}
    //     }

    //     const column = obj.dataPreview?.response?.data?.data?.columns[columnIndex]
    //     if (!columns[column.name]) {
    //       columns[column.name] = { value: '' }
    //     }
    //   })
    // }

    this.currentPage = 1;
    const container = document.createElement('div');
    const suggestionList = document.createElement('div');
    const list = document.createElement('div');

    let pageNumber = 1;
    const getRelatedQueries = async ({ pageNumber }) => {
        const relatedQueries = await fetchDataExplorerSuggestions({
            context: subject.context,
            text: plainText,
            skipQueryValidation: true,
            pageSize: 25,
            domain,
            apiKey,
            token,
            pageNumber,
            // TODO: implement safetynet for plain text input
            // skipQueryValidation: pageNumber > 1,
            // selectedVL: undefined,
            // userVLSelection: undefined,
        });
        const { items } = relatedQueries?.data?.data;

        if (!items?.length) {
            const emptyListMessage = document.createElement('div');
            emptyListMessage.classList.add('autoql-vanilla-related-queries-empty-list-message');
            const emptyListText =
                "Sorry, I couldn't find any queries matching your input. Try entering a different topic or keyword instead.";
            emptyListMessage.appendChild(document.createTextNode(emptyListText));
            list.appendChild(emptyListMessage);
        } else {
            items.forEach((suggestion) => {
                const item = document.createElement('div');
                const icon = createIcon(CHATA_BUBBLES_ICON);
                const text = document.createElement('div');
                item.classList.add('autoql-vanilla-query-tip-item');
                item.classList.add('autoql-vanilla-animated-item');
                text.classList.add('autoql-vanilla-query-suggestion-text');

                item.onclick = () => {
                    widget.setActiveTab(widget.tabChataUtils);
                    widget.tabsAnimation('flex', 'block');
                    widget.dataExplorer.hide();
                    widget.notificationsAnimation('none');
                    widget.keyboardAnimation(suggestion);
                    widget.options.landingPage = 'data-messenger';
                };
                text.appendChild(icon);
                text.appendChild(document.createTextNode(suggestion));
                item.appendChild(text);
                list.appendChild(item);
            });
        }
    };

    const { domain, apiKey, token } = widget.options.authentication;

    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-query-suggestions-section');
    list.classList.add('autoql-vanilla-query-suggestion-list');
    suggestionList.classList.add('autoql-vanilla-data-explorer-query-suggestion-list');
    suggestionList.appendChild(list);
    container.appendChild(suggestionList);

    getRelatedQueries(pageNumber);

    return container;
}
