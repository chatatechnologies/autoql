import { Card } from '../Card';
import { fetchDataPreview } from 'autoql-fe-utils';
import { DataPreviewTable } from '../DataPreviewTable';

import './DataPreview.scss';

export function DataPreview({ icon, title, subject, widgetOptions }) {
    console.log({ subjectForDP: subject });
    let obj = this;
    const container = document.createElement('div');
    const card = new Card({ icon, title, maxHeight: 155 });
    const { domain, apiKey, token } = widgetOptions.authentication;

    container.classList.add('autoql-vanilla-data-explorer-section');
    container.classList.add('autoql-vanilla-data-preview-section');

    container.appendChild(card);

    obj.container = container;

    obj.getPreview = async () => {
        card.showLoading();
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
        card.clearView();
        const { data } = r.data;
        const table = new DataPreviewTable({ previewResponse: data });
        card.setContent(table);
    };

    obj.getPreview();

    return obj;
}
