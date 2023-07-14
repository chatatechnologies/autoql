import { getRowNumberListForPopover } from 'autoql-fe-utils';
import { PopoverChartSelector } from './PopoverChartSelector';
import { closeAllChartPopovers } from '../Utils';
import { strings } from '../Strings';

export function ChartRowSelector(
    svg,
    json,
    onDataFetching = () => {},
    onNewData = () => {},
    onDataFetchError = () => {},
    metadataComponent,
    position,
) {
    var currentPageSize = json.data.row_limit;
    var initialPageSize = json.originalPageSize ?? currentPageSize;
    var totalRows = json.data.count_rows;

    if (!metadataComponent.metadata?.pageSize) {
        const pageSize = {
            size: json.originalPageSize ?? json.data.row_limit,
            currentLi: 0,
        };

        if (!metadataComponent.metadata) {
            metadataComponent.metadata = { pageSize };
        } else {
            metadataComponent.metadata.pageSize = pageSize;
        }
    }

    const onPageSizeClick = async (evt, popover) => {
        var currentLi = evt.target.dataset.popoverPosition;
        metadataComponent.metadata.pageSize.currentLi = currentLi;

        popover.close();

        onDataFetching();
        try {
            const response = await json.queryFn({ pageSize: Number(evt.target.dataset.popoverPageSize) });
            const newJson = response?.data;
            if (newJson) {
                newJson.queryFn = json.queryFn;
                newJson.originalPageSize = json.originalPageSize ?? json.data.row_limit;
            }

            onNewData(response?.data);
        } catch (error) {
            onDataFetchError(error);
        }
    }

    function RowSelectorPopover (e) {
        var obj = this;
        var elements = [];
    
        obj.createContent = () => {
            var selectorContainer = document.createElement('div');
            var selectorContent = document.createElement('ul');
    
            selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
            selectorContent.classList.add('autoql-vanilla-axis-selector-content');
    
            const pageSizeList = getRowNumberListForPopover(initialPageSize, totalRows);
    
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
                onPageSizeClick(evt, popover);
            };
    
            elements.push(li);
            return li;
        };

        var popover = new PopoverChartSelector(e, 'top', 'middle');

        obj.createContent(currentPageSize);

        popover.setSelectedItem = (index) => {
            elements.map((elem) => elem.classList.remove('active'));
            elements[parseInt(index)].classList.add('active');
        };
    
        popover.show();
        return popover;
    }

    const onSelectorClick = (evt) => {
        closeAllChartPopovers();
        const selectedItem = metadataComponent.metadata.pageSize.currentLi;
        var popoverSelector = new RowSelectorPopover(evt);
        popoverSelector.setSelectedItem(selectedItem);
    };

    // container
    var rowSelectorD3 = svg
        .append('g')
        .attr('class', 'autoql-vanilla-chart-row-selector')
        .attr('transform', `translate(${position.x}, ${position.y})`);

    // text wrapper
    var textContainer = rowSelectorD3
        .append('text')
        .attr('class', 'autoql-vanilla-chart-row-selector-text-container')
        .attr('text-anchor', 'middle')

    // text before selector
    textContainer
        .append('tspan')
        .attr('class', 'autoql-vanilla-chart-row-selector-text')
        .text(`${strings.visualizingText} `);

    // selector inner text
    var numberSelector = textContainer
        .append('tspan')
        .attr('class', 'autoql-vanilla-chart-row-selector')
        .style('text-decoration', 'underline')
        .text(currentPageSize);

    // text after selector
    textContainer
        .append('tspan')
        .attr('class', 'autoql-vanilla-chart-row-selector-text')
        .text(` / ${totalRows} ${strings.rowsText}`);

    const numberSelectorBBox = numberSelector.node().getBBox()

    // hover box for selector
    rowSelectorD3
        .append('rect')
        .attr('class', 'autoql-vanilla-chart-row-selector-box')
        .attr('height', numberSelectorBBox.height + 6)
        .attr('width', numberSelectorBBox.width + 6)
        .attr('x', numberSelectorBBox.x - 3)
        .attr('y', numberSelectorBBox.y - 3)
        .attr('rx', 4)
        .on('mouseup', function (evt) {
            onSelectorClick(evt);
        });

    return rowSelectorD3.node();
}
