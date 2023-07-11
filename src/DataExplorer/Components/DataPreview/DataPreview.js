import { Card } from "../Card";
import './DataPreview.scss';
import { fetchDataPreview } from 'autoql-fe-utils'; 
import { ChataTable } from "../../../ChataTable";
import { uuidv4 } from "../../../Utils";
import { ChataUtils } from "../../../ChataUtils";
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
    const idRequest = uuidv4();
    const tableContainer = document.createElement('div');
    const table = document.createElement('div');

    table.setAttribute('data-componentid', idRequest);
    tableContainer.classList.add('autoql-vanilla-chata-table-container');
    table.classList.add('autoql-vanilla-chata-table');
    tableContainer.appendChild(table);
    card.setContent(tableContainer)
    ChataUtils.responses[idRequest] = r.data;
    new ChataTable(idRequest, widgetOptions, () => {});
  }

  obj.getPreview();

  return obj;
}