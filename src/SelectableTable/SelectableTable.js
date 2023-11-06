import { ColumnTypes, formatElement, getDataFormatting } from 'autoql-fe-utils';
import { uuidv4 } from '../Utils';

import './SelectableTable.scss';

export default function SelectableTable({
    options = {},
    selectedColumns = [],
    disabledColumns = [],
    queryResponse = null,
    onColumnSelection = () => {},
    radio = false,
    showEndOfPreviewMessage = true,
}) {
    this.ID = uuidv4();

    let selected = selectedColumns;

    const rows = queryResponse?.rows;
    const columns = queryResponse?.columns;
    const config = getDataFormatting(options.dataFormatting);

    this.addClassToColumn = (columnIndex, state) => {
        const header = this.getColumnHeaderFromIndex(columnIndex);
        const cells = this.getCellsFromColumnIndex(columnIndex);

        header?.classList.add(`autoql-vanilla-selectable-table-${state}`);

        cells?.forEach((cell) => {
            cell.classList.add(`autoql-vanilla-selectable-table-${state}`);
        });
    };

    this.removeClassFromColumn = (columnIndex, state) => {
        const header = this.getColumnHeaderFromIndex(columnIndex);
        const cells = this.getCellsFromColumnIndex(columnIndex);

        header?.classList.remove(`autoql-vanilla-selectable-table-${state}`);

        cells?.forEach((cell) => {
            cell.classList.remove(`autoql-vanilla-selectable-table-${state}`);
        });
    };

    this.getCellsFromColumnIndex = (index) =>
        this.selectableTable?.querySelectorAll(`.autoql-vanilla-selectable-table-cell-${index}`);

    this.getColumnHeaderFromIndex = (index) => this.selectableTable?.querySelector(`#col-header-${index}`);

    this.onColumnHeaderClick = (index) => {
        if (disabledColumns.includes(index)) {
            return;
        }

        if (radio) {
            onColumnSelection?.([index]);
        } else {
            if (selected?.includes(index)) {
                this.removeClassFromColumn(index, 'selected');
                selected = selected.filter((i) => i !== index);
            } else {
                this.addClassToColumn(index, 'selected');
                selected.push(index);
            }

            onColumnSelection?.(selected);
        }
    };

    this.onMouseOverColumn = (e, columnIndex) => {
        // const allColumnHeaders = this.selectableTable?.querySelectorAll('.autoql-vanilla-selectable-table-column');
        // allColumnHeaders?.forEach((header) => {
        //     header.classList.remove('autoql-vanilla-selectable-table-hovered');
        // });
        // const allCells = this.selectableTable?.querySelectorAll('.autoql-vanilla-selectable-table-cell');
        // allCells?.forEach((cell) => {
        //     cell.classList.remove('autoql-vanilla-selectable-table-hovered');
        // });

        columns.forEach((c, i) => this.removeClassFromColumn(i, 'hovered'));

        if (disabledColumns.includes(columnIndex)) {
            return;
        }

        this.addClassToColumn(columnIndex, 'hovered');
    };

    this.formatColumnHeader = (th, column, i) => {
        const colHeader = document.createElement('div');
        colHeader.classList.add('autoql-vanilla-selectable-table-col-header');
        // TODO: Add tippy content
        //     data-tooltip-id={tooltipID}
        //     data-tooltip-content={JSON.stringify(column)}

        const columnTitle = document.createElement('span');
        columnTitle.innerHTML = column?.display_name;
        colHeader.appendChild(columnTitle);
        // TODO: Add checkbox
        //     <Checkbox
        //       disabled={disabledColumns.includes(i)}
        //       checked={selectedColumns?.includes(i)}
        //       onChange={() => this.onColumnHeaderClick(i)}
        //     />

        th.appendChild(colHeader);
    };

    this.formatCell = ({ td, cell, column, config }) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('autoql-vanilla-selectable-table-cell');
        cellElement.style.textAlign = column.type === ColumnTypes.DOLLAR_AMT ? 'right' : 'center';
        cellElement.innerHTML = formatElement({
            element: cell,
            column,
            config,
        });

        td.appendChild(cellElement);
    };

    this.createSelectableTable = () => {
        const selectableTable = document.createElement('div');
        selectableTable.classList.add('autoql-vanilla-selectable-table');

        this.selectableTable = selectableTable;

        const selectableTableWrapper = document.createElement('div');
        selectableTableWrapper.classList.add('autoql-vanilla-selectable-table-wrapper');
        selectableTable.appendChild(selectableTableWrapper);

        // add scrollbars here around "table"

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const tbody = document.createElement('tbody');

        selectableTableWrapper.appendChild(table);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        table.appendChild(tbody);

        columns.forEach((col, i) => {
            const th = document.createElement('th');
            const isDisabled = disabledColumns.includes(i);
            const isSelected = selectedColumns.includes(i);

            th.id = `col-header-${i}`;
            th.classList.add('autoql-vanilla-selectable-table-column');

            if (isSelected) th.classList.add('autoql-vanilla-selectable-table-selected');
            if (isDisabled) th.classList.add('autoql-vanilla-selectable-table-disabled');

            th.addEventListener('mousedown', () => this.onColumnHeaderClick(i));
            th.addEventListener('mouseover', (e) => this.onMouseOverColumn(e, i));

            this.formatColumnHeader(th, col, i);
            headerRow.appendChild(th);
        });

        rows.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.classList.add('autoql-vanilla-selectable-table-row');

            row.forEach((cell, j) => {
                const column = columns[j];
                const td = document.createElement('td');
                const isDisabled = disabledColumns.includes(j);
                const isSelected = selectedColumns.includes(j);

                td.classList.add('autoql-vanilla-selectable-table-cell');
                td.classList.add(`autoql-vanilla-selectable-table-cell-${j}`);

                if (isSelected) td.classList.add('autoql-vanilla-selectable-table-selected');
                if (isDisabled) td.classList.add('autoql-vanilla-selectable-table-disabled');

                td.addEventListener('mousedown', () => this.onColumnHeaderClick(j));
                td.addEventListener('mouseover', (e) => this.onMouseOverColumn(e, j));

                this.formatCell({ td, cell, column, config });
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        if (showEndOfPreviewMessage) {
            const endOfPreviewMessage = document.createElement('div');

            const endOfPreviewTR = document.createElement('tr');
            endOfPreviewTR.classList.add('autoql-vanilla-selectable-table-end-of-preview-message');
            endOfPreviewMessage.appendChild(endOfPreviewTR);

            const endOfPreviewTD = document.createElement('td');
            endOfPreviewTD.classList.add('autoql-vanilla-selectable-table-end-of-preview-sticky-wrapper');
            endOfPreviewTD.setAttribute('colSpan', `${columns.length}`);
            endOfPreviewTD.innerHTML = 'End of Preview';
            endOfPreviewTR.appendChild(endOfPreviewTD);

            tbody.appendChild(endOfPreviewMessage);
        }
    };

    this.createSelectableTable();

    return this.selectableTable;
}
