import { ColumnTypes, formatElement, getDataFormatting } from 'autoql-fe-utils';
import { Checkbox } from '../Checkbox';

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
    let selected = selectedColumns;

    const rows = queryResponse?.rows;
    const columns = queryResponse?.columns;
    const config = getDataFormatting(options.dataFormatting);

    this.addClassToColumn = (columnIndex, state) => {
        const className = `autoql-vanilla-selectable-table-${state}`;
        const header = this.getColumnHeaderFromIndex(columnIndex);
        const cells = this.getCellsFromColumnIndex(columnIndex);

        if (header) {
            header.classList.add(className);

            if (state === 'selected') {
                const checkbox = header.querySelector('input.autoql-vanilla-checkbox-input');
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        }

        if (cells?.length) {
            cells?.forEach((cell) => cell.classList.add(className));
        }
    };

    this.removeClassFromColumn = (columnIndex, state) => {
        const header = this.getColumnHeaderFromIndex(columnIndex);
        const cells = this.getCellsFromColumnIndex(columnIndex);

        header?.classList.remove(`autoql-vanilla-selectable-table-${state}`);

        if (state === 'selected') {
            const checkbox = header.querySelector('input.autoql-vanilla-checkbox-input');
            if (checkbox) {
                checkbox.checked = false;
            }
        }

        cells?.forEach((cell) => {
            cell.classList.remove(`autoql-vanilla-selectable-table-${state}`);
        });
    };

    this.removeClassFromAllColumns = (state) => {
        columns.forEach((c, i) => this.removeClassFromColumn(i, state));
    };

    this.getCellsFromColumnIndex = (index) =>
        this.selectableTable?.querySelectorAll(`.autoql-vanilla-selectable-table-cell-${index}`);

    this.getColumnHeaderFromIndex = (index) => this.selectableTable?.querySelector(`#col-header-${index}`);

    this.clearSelections = () => {
        selected = [];
        this.removeClassFromAllColumns('selected');
        onColumnSelection?.(selected);
    };

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
        this.removeClassFromAllColumns('hovered');

        if (disabledColumns.includes(columnIndex)) {
            return;
        }

        this.addClassToColumn(columnIndex, 'hovered');
    };

    this.formatColumnHeader = (th, column, i) => {
        const colHeader = document.createElement('div');
        const columnTitle = document.createElement('span');
        const checkboxContainer = document.createElement('div');

        colHeader.classList.add('autoql-vanilla-selectable-table-col-header');
        checkboxContainer.classList.add('autoql-vanilla-checkbox-container');
        // TODO: Add tippy content
        //     data-tooltip-id={tooltipID}
        //     data-tooltip-content={JSON.stringify(column)}

        columnTitle.innerHTML = column?.display_name;

        const checkboxElement = new Checkbox(checkboxContainer, {
            checked: selectedColumns?.includes(i),
            disabled: disabledColumns?.includes(i),
        });

        colHeader.appendChild(columnTitle);
        colHeader.appendChild(checkboxContainer);

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
        selectableTableWrapper.addEventListener('mouseout', () => this.removeClassFromAllColumns('hovered'));
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

    return this;
}
