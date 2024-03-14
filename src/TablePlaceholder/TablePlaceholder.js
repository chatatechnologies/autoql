import './TablePlaceholder.scss';

const defaultOptions = {
    rows: 3,
    columns: 3,
};

export function TablePlaceholder(
    component,
    { rows = defaultOptions.rows, columns = defaultOptions.columns } = defaultOptions,
) {
    const obj = this;

    const tablePlaceholderLoader = document.createElement('div');
    tablePlaceholderLoader.classList.add('autoql-vanilla-placeholder-table-container');

    obj.clear = () => {
        tablePlaceholderLoader?.parentElement?.removeChild(tablePlaceholderLoader);
    };

    obj.show = () => {
        obj.clear();
        component.appendChild(tablePlaceholderLoader);
    };

    obj.createPlaceholderCell = () => {
        const cell = document.createElement('div');
        cell.classList.add('autoql-vanilla-placeholder-loader');
        return cell;
    };

    obj.createPlaceholderRow = () => {
        const row = document.createElement('div');
        row.classList.add('autoql-vanilla-table-placeholder-row');

        new Array(columns).fill(0).map((c, i) => {
            const cell = obj.createPlaceholderCell(i);
            row.appendChild(cell);
        });

        return row;
    };

    obj.createTablePlaceholderLoader = () => {
        // Create Header
        const header = obj.createPlaceholderRow();
        header.classList.add('autoql-vanilla-table-placeholder-header');
        tablePlaceholderLoader.appendChild(header);

        // Create Rows
        new Array(rows).fill(0).map((r, i) => {
            const row = obj.createPlaceholderRow(i);
            tablePlaceholderLoader.appendChild(row);
        });

        component.appendChild(tablePlaceholderLoader);
    };

    obj.createTablePlaceholderLoader();

    return obj;
}
