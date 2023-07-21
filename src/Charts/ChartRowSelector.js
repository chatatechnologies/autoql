import { MAX_DATA_PAGE_SIZE, getRowNumberListForPopover } from 'autoql-fe-utils';
import { PopoverChartSelector } from './PopoverChartSelector';
import { closeAllChartPopovers } from '../Utils';
import { strings } from '../Strings';
import { DATA_LIMIT_WARNING } from '../Svg';

export function ChartRowSelector(
    svg,
    json,
    onDataFetching = () => {},
    onNewData = () => {},
    onDataFetchError = () => {},
    options,
) {
    try {
        var currentPageSize = json.data.row_limit;
        var initialPageSize = options?.pageSize ?? currentPageSize;
        var totalRows = json.data.count_rows;

        const pageSizeList = getRowNumberListForPopover(initialPageSize, totalRows);

        const onPageSizeClick = async (evt, popover) => {
            var clickedPageSize = parseInt(evt.target.dataset.popoverPageSize);

            popover.close();

            onDataFetching();
            try {
                const response = await json.queryFn({ pageSize: clickedPageSize });
                const newJson = response?.data;
                if (newJson) {
                    newJson.queryFn = json.queryFn;
                    newJson.originalPageSize = json.originalPageSize ?? json.data.row_limit;
                }

                onNewData(response?.data);
            } catch (error) {
                onDataFetchError(error);
            }
        };

        function RowSelectorPopover(e) {
            var obj = this;
            var elements = [];

            obj.createContent = () => {
                var selectorContainer = document.createElement('div');
                var selectorContent = document.createElement('ul');

                selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
                selectorContent.classList.add('autoql-vanilla-axis-selector-content');

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
                li.onclick = (evt) => {
                    onPageSizeClick(evt, popover);
                };

                if (pageSize === currentPageSize) {
                    li.classList.add('active');
                }

                elements.push(li);
                return li;
            };

            var popover = new PopoverChartSelector(e, 'top', 'middle');

            obj.createContent(currentPageSize);

            popover.show();
            return popover;
        }

        const onSelectorClick = (evt) => {
            closeAllChartPopovers();
            new RowSelectorPopover(evt);
        };

        // Element that is returned
        var rowSelectorD3Container = svg.append('g').attr('class', 'autoql-vanilla-chart-row-selector');

        // Group to apply center transform to
        var rowSelectorD3 = rowSelectorD3Container.append('g');

        var textContainer = rowSelectorD3
            .append('text')
            .attr('dominant-baseline', 'text-before-edge')
            .attr('text-anchor', 'start');

        // Text before selector
        textContainer.append('tspan').text(`${strings.visualizingText} `);

        // Selector text
        var numberSelector = textContainer
            .append('tspan')
            .attr('class', 'autoql-vanilla-chart-row-selector')
            .style('text-decoration', 'underline')
            .text(currentPageSize);

        // Text after selector
        textContainer.append('tspan').text(` / ${totalRows} ${strings.rowsText}`);

        // Warning icon if necessary
        if (totalRows > MAX_DATA_PAGE_SIZE || currentPageSize < totalRows) {
            const textContainerBBox = textContainer.node().getBBox();
            const textContainerTop = textContainerBBox?.y ?? 0;
            const textContainerX = textContainerBBox?.x ?? 0;
            const textContainerWidth = textContainerBBox?.width ?? 0;
            const textContainerRightX = textContainerX + textContainerWidth;
            const warningIconLeftPadding = 5;

            var warningIcon = rowSelectorD3
                .append('g')
                .style('font-size', '16px')
                .attr(
                    'transform',
                    `translate(${textContainerRightX + warningIconLeftPadding}, ${textContainerTop - 1})`,
                )
                .html(DATA_LIMIT_WARNING);

            if (totalRows > MAX_DATA_PAGE_SIZE) {
                warningIcon
                    .style('color', 'var(--autoql-vanilla-warning-color)')
                    .attr('data-tippy-content', strings.maxDataWarningTooltip);
            } else if (currentPageSize < totalRows) {
                warningIcon
                    .style('color', 'var(--autoql-vanilla-info-color)')
                    .attr('data-tippy-content', strings.dataSubsetWarningTooltip);
            }
        }

        const numberSelectorBBox = numberSelector.node().getBBox();

        // Hover box for selector
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

        // Finally, anchor the whole element vertically and horizontally
        const rowSelectorBBox = rowSelectorD3.node().getBBox() ?? {};
        const rowSelectorWidth = rowSelectorBBox.width ?? 0;
        const rowSelectorY = rowSelectorBBox.y ?? 0;

        rowSelectorD3.attr('transform', `translate(${-rowSelectorWidth / 2}, ${-rowSelectorY / 2})`);

        return rowSelectorD3Container;
    } catch (error) {
        console.error(error);
        return;
    }
}
