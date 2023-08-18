import { closeAllChartPopovers } from '../Utils';
import { ChataChartSeriesPopover } from './ChataChartSeriesPopover';
import { PopoverChartSelector } from './PopoverChartSelector';

export function ChataChartListPopover(e, scale, columns, placement, align) {
    var obj = this;
    var elements = [];

    if (!scale) console.warn('No scale provided to ChataChartListPover');

    if (scale.type === 'LINEAR') {
        return new ChataChartSeriesPopover(e, placement, align, columns, scale)
    }

    obj.createContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
        selectorContent.classList.add('autoql-vanilla-axis-selector-content');

        var fields = scale.allFields ?? indexes;
        const fieldColumns = fields.map((i) => columns[i]);

        fieldColumns?.forEach((column, i) => {
            var listItem = obj.createListItem(column, i);
            selectorContent.appendChild(listItem);
        });

        selectorContainer.appendChild(selectorContent);
        popover.appendContent(selectorContainer);
    };

    obj.onListItemClick = (evt, scale) => {
        var clickedColumnIndex = parseInt(evt.target.dataset.columnIndex);

        if (isNaN(clickedColumnIndex)) {
            console.warn('Unable to change axis - clicked element did not have a column index', evt.target.dataset);
        }

        scale.changeColumnIndices?.([clickedColumnIndex]);
        popover.close();
    };

    obj.createListItem = (column, i) => {
        if (!column) return;

        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-string-select-list-item');
        li.setAttribute('data-column-index', column.index);
        li.onclick = (e) => obj.onListItemClick(e, scale);
        li.innerHTML = column?.display_name;

        elements.push(li);
        return li;
    };

    var popover = new PopoverChartSelector(e, placement, align);
    
    obj.createContent();

    popover.setSelectedItem = (columnIndex) => {
        var element = elements.find((elem) => elem.getAttribute('data-column-index') === columnIndex);
        if (element) {
            elements.map((elem) => elem.classList.remove('active'));
            element.classList.add('active');
        }
    };

    // Set column index as initial selection
    if (scale.columnIndex !== undefined) {
        popover.setSelectedItem(scale.columnIndex);
    }

    popover.show();

    return popover;
}
