import { Card } from "../Card";
import './DataPreview.scss';
import { fetchDataPreview } from 'autoql-fe-utils';
import { DataPreviewTable } from "../DataPreviewTable";

export function DataPreview({ icon, title, subject, widgetOptions }) {
  let obj = this;
  const container = document.createElement('div');
  const card = new Card({ icon, title });
  const {
    domain,
    apiKey,
    token,
  } = widgetOptions.authentication;

  container.classList.add('autoql-vanilla-data-explorer-section');
  container.classList.add('autoql-vanilla-data-preview-section');

  container.appendChild(card);

  obj.container = container;

  obj.getPreview = async() => {
    card.showLoading();
    const response = await fetchDataPreview({
      subject: subject.name,
      numRows: 5,
      source: 'data_explorer.data_preview',
      domain,
      apiKey,
      token,
    });
    obj.displayResponse(response);
  }

  obj.displayResponse = (r) => {
    card.clearView();
    const { data } = r.data

    new DataPreviewTable({ previewResponse: data });
  }

  obj.getPreview();

  return obj;
}