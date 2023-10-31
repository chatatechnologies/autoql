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

    console.log({ queryResponse });

    const rows = queryResponse?.rows;
    const columns = queryResponse?.columns;
    const config = getDataFormatting(options.dataFormatting);


//   onColumnHeaderClick = (index) => {
//     if (this.props.disabledColumns.includes(index)) {
//       return
//     }

//     if (this.props.radio) {
//       this.props.onColumnSelection?.([index])
//     } else {
//       let selectedColumns = _cloneDeep(this.props.selectedColumns)

//       if (selectedColumns?.includes(index)) {
//         selectedColumns = selectedColumns.filter((i) => i !== index)
//       } else {
//         selectedColumns.push(index)
//       }

//       this.props.onColumnSelection?.(selectedColumns)
//     }
//   }

//   this.onMouseOverColumn = (e, columnIndex) => {
//     // Must use vanilla styling to achieve hover styles for a whole column
//     const allColumnHeaders = this.tableRef?.querySelectorAll('.selectable-table-column')
//     allColumnHeaders?.forEach((header) => {
//       header.classList.remove('react-autoql-selectable-table-hovered')
//     })

//     const allCells = this.tableRef?.querySelectorAll('.selectable-table-cell')
//     allCells?.forEach((cell) => {
//       cell.classList.remove('react-autoql-selectable-table-hovered')
//     })

//     if (this.props.disabledColumns.includes(columnIndex)) {
//       return
//     }

//     const columnHeader = this.tableRef?.querySelector(`#col-header-${columnIndex}`)
//     columnHeader?.classList.add('react-autoql-selectable-table-hovered')

//     const cells = this.tableRef?.querySelectorAll(`.cell-${columnIndex}`)
//     cells?.forEach((cell) => cell.classList.add('react-autoql-selectable-table-hovered'))
//   }


    this.formatColumnHeader = (th, column, i) => {
        const colHeader = document.createElement('div');
        colHeader.classList.add('autoql-vanilla-selectable-table-col-header');
        // TODO: Add tippy content
        //     data-tooltip-id={this.props.tooltipID}
        //     data-tooltip-content={JSON.stringify(column)}

        const columnTitle = document.createElement('span');
        columnTitle.innerHTML = column?.display_name;
        colHeader.appendChild(columnTitle);

        // TODO: Add checkbox
        //     <Checkbox
        //       disabled={this.props.disabledColumns.includes(i)}
        //       checked={this.props.selectedColumns?.includes(i)}
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

            th.classList.add('autoql-vanilla-selectable-table-column');
            if (isSelected) th.classList.add('autoql-vanilla-selectable-table-column-selected');
            if (isDisabled) th.classList.add('autoql-vanilla-selectable-table-column-disabled');

            th.addEventListener('mousedown', () => {
                // this.onColumnHeaderClick(i)
            });

            th.addEventListener('mouseover', (e) => {
                // this.onMouseOverColumn(e, i)
            });

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
                if (isSelected) td.classList.add('autoql-vanilla-selectable-table-cell-selected');
                if (isDisabled) td.classList.add('autoql-vanilla-selectable-table-cell-disabled');

                td.addEventListener('mousedown', () => {
                    // this.onColumnHeaderClick(j)
                });

                td.addEventListener('mouseover', (e) => {
                    // this.onMouseOverColumn(e, j)
                });

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
