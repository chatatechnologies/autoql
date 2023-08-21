import { getBandScale, getLinearScales, getColumnRectObj } from 'autoql-fe-utils';
import { select } from 'd3-selection';
import { Axes } from './Axes';

export function ColumnChartNew(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        firstDraw,
        visibleSeries,
        colorScales,
        options = {},
        isScaled,
        onChartClick,
        legendColumn,
        enableAxisDropdown,
        changeNumberColumnIndices,
        changeStringColumnIndices,
        columnIndexConfig = {},
        activeKey,
        stacked,
        aggregated
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndices, numberColumnIndex } = columnIndexConfig;
    const { dataFormatting } = options;

    const scaleParams = {
        data,
        columns,
        height,
        width,
        dataFormatting,
        stringColumnIndex,
        stringColumnIndices,
        enableAxisDropdown,
        changeNumberColumnIndices,
        changeStringColumnIndices,
        aggregated
    };

    this.xScale = getBandScale({
        ...scaleParams,
        axis: 'x',
    });

    this.yScale = getLinearScales({
        ...scaleParams,
        axis: 'y',
        isScaled,
        columnIndices1: visibleSeries,
        colorScales,
        stacked,
    }).scale;

    var xCol = columns[stringColumnIndex];
    var yCol = columns[numberColumnIndex];

    this.createBars = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create bars - there are no visible series');
            return;
        }

        if (this.bars) this.bars.remove();

        let barWidth = this.xScale.tickSize;
        if (!stacked) {
            barWidth = barWidth / visibleSeries.length;
        }

        var self = this;

        var barData = function (d, index) {
            var seriesForRow = [];
            var visibleIndex = 0;
            let prevY;
            let prevHeight;

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getColumnRectObj({
                        columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey,
                        dataFormatting,
                        colIndex,
                        visibleIndex,
                        legendColumn,
                        barWidth,
                        index,
                        stacked,
                        prevY,
                        prevHeight,
                        i,
                        d,
                    });

                    visibleIndex += 1;

                    if (rectData && stacked) {
                        prevY = rectData?.y;
                        prevHeight = rectData?.height;
                    }

                    seriesForRow.push(rectData);
                }
            });

            return seriesForRow;
        };

        this.bars = container
            .append('g')
            .selectAll('.autoql-vanilla-bar-chart-series-container')
            .data(data)
            .enter()
            .selectAll('rect')
            .data(barData)
            .enter()
            .append('rect')
            .attr('class', 'autoql-vanilla-chart-bar')
            .attr('x', (d) => d?.x)
            .attr('y', (d) => d?.y)
            .attr('height', (d) => d?.height)
            .attr('width', (d) => d?.width)
            .style('stroke-width', 0)
            .style('fill', (d) => d?.style?.fill)
            .style('fill-opacity', (d) => d?.drilldownData?.activeKey === activeKey ? 0.7 : d?.style?.fillOpacity)
            .attr('data-tippy-chart', true)
            .attr('data-tippy-content', (d) => d?.tooltip)
            .on('click', function (e, d) {
                onChartClick(d.drilldownData);
                
                container.selectAll('.autoql-vanilla-chart-bar').style('fill-opacity', d?.style?.fillOpacity);
                select(this).style('fill-opacity', 0.7);
            });
    };

    this.axesWrapper = container.append('g').attr('class', 'autoql-vanilla-axes-chart');

    new Axes(this.axesWrapper, {
        ...params,
        xScale: this.xScale,
        yScale: this.yScale,
        xCol,
        yCol,
    });

    if (!firstDraw) {
        this.createBars();
    }

    return this;
}
