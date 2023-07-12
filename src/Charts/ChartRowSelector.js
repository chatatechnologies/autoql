import { getRowNumberListForPopover } from 'autoql-fe-utils';
import { PopoverChartSelector } from './PopoverChartSelector';
import { closeAllChartPopovers } from '../Utils';
import { getMetadataElement } from './ChataChartHelpers';

function RowSelectorPopover(position, onClick, json, showOnBaseline = false) {
    var obj = this;
    var elements = [];
    var currentPageSize = json.data.row_limit;
    var totalRows = json.data.count_rows;

    obj.createContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
        selectorContent.classList.add('autoql-vanilla-axis-selector-content');

        const pageSizeList = getRowNumberListForPopover(currentPageSize, totalRows);

        if (pageSizeList.length) {
            pageSizeList.forEach((pageSize, i) => {
                selectorContent.appendChild(obj.createListItem(pageSize, i));
            });
        }

        selectorContainer.appendChild(selectorContent);
        popover.appendContent(selectorContainer);
    };

    obj.createListItem = (pageSize, i) => {
        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-string-select-list-item');
        li.innerHTML = `${pageSize}`;
        li.setAttribute('data-popover-page-size', pageSize);
        li.setAttribute('data-popover-position', i);
        li.onclick = (evt) => {
            onClick(evt, popover);
        };

        elements.push(li);
        return li;
    };

    var popover = new PopoverChartSelector(position, showOnBaseline);
    obj.createContent(currentPageSize);
    if (position.left + popover.clientWidth >= window.innerWidth) {
        position.left = window.innerWidth - popover.clientWidth - 60;
    }
    popover.position = position;
    popover.setSelectedItem = (index) => {
        elements.map((elem) => elem.classList.remove('active'));
        elements[parseInt(index)].classList.add('active');
    };

    popover.show();
    return popover;
}

export function ChartRowSelector(
    svg,
    json,
    onDataFetching = () => {},
    onNewData = () => {},
    onDataFetchError = () => {},
    metadataComponent,
    position,
) {
    if (!metadataComponent.metadata?.pageSize) {
        const pageSize = {
            size: json.data.row_limit,
            currentLi: 0,
        };

        if (!metadataComponent.metadata) {
            metadataComponent.metadata = { pageSize };
        } else {
            metadataComponent.metadata.pageSize = pageSize;
        }
    }

    const onSelectorClick = (evt, showOnBaseline) => {
        closeAllChartPopovers();
        const selectedItem = metadataComponent.metadata.pageSize.currentLi;

        var popoverSelector = new RowSelectorPopover(
            {
                left: evt.clientX,
                top: evt.clientY,
            },
            async (evt, popover) => {
                var currentLi = evt.target.dataset.popoverPosition;
                metadataComponent.metadata.pageSize.currentLi = currentLi;

                popover.close();

                onDataFetching();
                try {
                    const newJson = await json.queryFn({ pageSize: Number(evt.target.dataset.popoverPageSize) });
                    onNewData(newJson);
                } catch (error) {
                    onDataFetchError(error);
                }
            },
            json,
            showOnBaseline,
        );

        popoverSelector.setSelectedItem(selectedItem);
    };

    var rowSelectorD3 = svg
        .append('g')
        .attr('class', 'autoql-vanilla-chart-row-selector')
        .attr('transform', `translate(${position.x}, ${position.y})`)
        .attr('text-anchor', 'middle');

    var textContainer = rowSelectorD3
        .append('text')
        .attr('class', 'autoql-vanilla-chart-row-selector-text-container')
        .on('mouseup', (evt) => {
            onSelectorClick(evt, false);
        });

    textContainer.append('tspan').attr('class', 'autoql-vanilla-chart-row-selector-text').text('TEST TSPAN');

    return rowSelectorD3.node();
}
