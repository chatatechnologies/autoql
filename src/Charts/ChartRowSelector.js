import { DEFAULT_DATA_PAGE_SIZE, MAX_DATA_PAGE_SIZE, getRowNumberListForPopover, getThemeValue } from 'autoql-fe-utils';
import { PopoverChartSelector } from './PopoverChartSelector';
import { closeAllChartPopovers } from '../Utils';
import { strings } from '../Strings';
import { DATA_LIMIT_WARNING } from '../Svg';
import { CSS_PREFIX } from '../Constants';

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
        var initialPageSize = options?.pageSize ?? DEFAULT_DATA_PAGE_SIZE;
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
            var popover = new PopoverChartSelector(e, 'top', 'middle');
            var selectorContainer = document.createElement('div');
            var selectorContent = document.createElement('ul');

            selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
            selectorContent.classList.add('autoql-vanilla-axis-selector-content');

            if (pageSizeList.length) {
                pageSizeList.forEach((pageSize, i) => {           
                    var li = document.createElement('li');

                    li.setAttribute('data-popover-page-size', pageSize);
                    li.onclick = (evt) => onPageSizeClick(evt, popover);
    
                    li.classList.add('autoql-vanilla-string-select-list-item');
                    if (pageSize === currentPageSize) {
                        li.classList.add('active');
                    }

                    let rowCountSuffix = ''

                    if (i === pageSizeList.length - 1) {
                        if (pageSize >= MAX_DATA_PAGE_SIZE) {
                          rowCountSuffix = ' (Maximum)'
                        } else {
                          rowCountSuffix = ' (All)'
                        }
                    }

                    li.innerHTML = `${pageSize}${rowCountSuffix}`;

                    selectorContent.appendChild(li);
                }); 
            }

            selectorContainer.appendChild(selectorContent);
            popover.appendContent(selectorContainer);

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
            .attr('text-anchor', 'start')
            .style('stroke-width', 0)
            .style('font-size', 'inherit')
            .style('font-family', 'inherit')

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
                    .style('color', getThemeValue('warning-color', CSS_PREFIX))
                    .attr('data-tippy-content', strings.maxDataWarningTooltip);
            } else if (currentPageSize < totalRows) {
                warningIcon
                    .style('color', getThemeValue('info-color', CSS_PREFIX))
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
            .style('opacity', 0) // use CSS to change the opacity to 1 so it doesnt show in the PNG export
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
