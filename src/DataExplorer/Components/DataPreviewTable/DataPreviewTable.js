import './DataPreviewTable.scss'
import { formatElement } from 'autoql-fe-utils';

export function DataPreviewTable({ previewResponse }) {
  const container = document.createElement('div');
  const scroll = document.createElement('div');
  const table = document.createElement('table');
  const header = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const body = document.createElement('tbody');
  const { columns, rows } = previewResponse;

  columns.forEach((col) => {
    const th = document.createElement('th');
    const colHeader = document.createElement('div');
    colHeader.classList.add('autoql-vanilla-data-preview-col-header');

    colHeader.textContent = col.display_name
    th.appendChild(colHeader);
    headerRow.appendChild(th);
  })

  rows.forEach((row) => {
    const dataPreviewRow = document.createElement('tr');
    dataPreviewRow.classList.add('autoql-vanilla-data-preview-row');
    row.forEach((value, index) => {
      const td = document.createElement('td');
      const cell = document.createElement('div');
      cell.classList.add('data-preview-cell')

      cell.textContent = formatElement({
        element: value,
        column: columns[index],
      });
      td.appendChild(cell);
      dataPreviewRow.appendChild(td);
    })
    body.appendChild(dataPreviewRow);
  })

  container.classList.add('autoql-vanilla-data-preview');
  scroll.classList.add('autoql-vanilla-data-preview-scroll');

  header.appendChild(headerRow);
  table.appendChild(header);
  table.appendChild(body);
  scroll.appendChild(table);
  container.appendChild(scroll);

  return container;
}