import { fetchDataPreview } from 'autoql-fe-utils';
import SelectableTable from '../../../SelectableTable/SelectableTable';

import './DataPreview.scss';

export function DataPreview({ icon, title, subject, widgetOptions }) {
    let obj = this;

    const container = document.createElement('div');
    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-data-preview-section');

    obj.container = container;

    const { domain, apiKey, token } = widgetOptions.authentication;

    const dataPreviewContainer = document.createElement('div');
    dataPreviewContainer.classList.add('autoql-vanilla-data-explorer-data-preview');
    container.appendChild(dataPreviewContainer);

    obj.getPreview = async () => {
        // card.showLoading();
        const response = await fetchDataPreview({
            subject: subject.context,
            numRows: 5,
            source: 'data_explorer.data_preview',
            domain,
            apiKey,
            token,
        });
        obj.displayResponse(response);
    };

    obj.displayResponse = (r) => {
        // card.clearView();
        const { data } = r.data;
        const table = new SelectableTable({ queryResponse: data });
        dataPreviewContainer.appendChild(table);
    };

    obj.getPreview();

    return obj;
}
