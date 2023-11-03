import { fetchDataPreview } from 'autoql-fe-utils';
import { TablePlaceholder } from '../../../TablePlaceholder/TablePlaceholder';
import SelectableTable from '../../../SelectableTable/SelectableTable';

import './DataPreview.scss';

export function DataPreview({ subject, widgetOptions }) {
    let obj = this;

    const DATA_PREVIEW_ROWS = 20;

    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-data-preview-section');

    obj.container = container;

    const { domain, apiKey, token } = widgetOptions.authentication;

    const dataPreviewContainer = document.createElement('div');
    dataPreviewContainer.classList.add('autoql-vanilla-data-explorer-data-preview');
    container.appendChild(dataPreviewContainer);

    obj.showLoading = () => {
        dataPreviewContainer.innerHTML = '';

        if (!obj.placeholderContainer) {
            const placeholderContainer = document.createElement('div');
            placeholderContainer.classList.add('autoql-vanilla-data-explorer-section-placeholder');
            placeholderContainer.classList.add('autoql-vanilla-data-explorer-section-placeholder-data-preview');

            obj.placeholderContainer = placeholderContainer;

            new TablePlaceholder(placeholderContainer);

            container.appendChild(placeholderContainer);
        } else {
            obj.placeholderContainer.style.display = 'block';
        }
    };

    obj.clearLoading = () => {
        if (obj.placeholderContainer) {
            obj.placeholderContainer.style.display = 'none';
        }
    };

    obj.createErrorMessage = (error) => {
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.classList.add('autoql-vanilla-data-preview-error-message');

        const messageText = document.createElement('p');
        messageText.innerHTML =
            error?.message ?? 'Oops... Something went wrong and we were unable to fetch your Data Preview.';
        errorMessageContainer.appendChild(messageText);

        if (error?.reference_id) {
            const messageErrorID = document.createElement('p');
            messageErrorID.innerHTML = `Error ID: ${error.reference_id}`;
            errorMessageContainer.appendChild(messageErrorID);
        }

        const tryAgainMessage = document.createElement('p');
        const tryAgainLink = document.createElement('a');
        tryAgainLink.innerHTML = 'Try again';
        tryAgainLink.onclick = () => obj.getPreview();
        tryAgainMessage.appendChild(tryAgainLink);
        errorMessageContainer.appendChild(tryAgainMessage);

        dataPreviewContainer.appendChild(errorMessageContainer);
    };

    obj.getPreview = async () => {
        obj.showLoading();

        try {
            const response = await fetchDataPreview({
                subject: subject.context,
                numRows: DATA_PREVIEW_ROWS,
                source: 'data_explorer.data_preview',
                domain,
                apiKey,
                token,
            });

            obj.response = response;
            obj.displayResponse(response);
        } catch (error) {
            obj.clearLoading();
            obj.createErrorMessage(error);
        }
    };

    obj.displayResponse = (r) => {
        obj.clearLoading();
        const { data } = r.data;
        const table = new SelectableTable({ queryResponse: data });

        const previewTableLabel = document.createElement('div');
        previewTableLabel.classList.add('autoql-vanilla-input-label');
        previewTableLabel.innerHTML = `Select all fields of interest from <em>"${subject?.displayName}"</em>:`;

        dataPreviewContainer.appendChild(previewTableLabel);
        dataPreviewContainer.appendChild(table);
    };

    obj.getPreview();

    return obj;
}
