import { getBandScale, getLinearScales, getBarRectObj } from 'autoql-fe-utils';
import { Axes } from './Axes';

export function BarChartNew(container, params = {}) {
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
        enableAxisDropdown,
        changeNumberColumnIndices,
        changeStringColumnIndices,
        columnIndexConfig = {},
        onChartClick,
        stacked,
        legendColumn,
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
    };

    this.yScale = getBandScale({
        ...scaleParams,
        axis: 'y',
    });

    this.xScale = getLinearScales({
        ...scaleParams,
        axis: 'x',
        isScaled,
        columnIndices1: visibleSeries,
        colorScales,
        stacked,
    }).scale;

    var xCol = columns[numberColumnIndex];
    var yCol = columns[stringColumnIndex];

    this.createBars = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create bars - there are no visible series');
            return;
        }

        if (this.bars) this.bars.remove();

        let barHeight = this.yScale.tickSize;
        if (!stacked) {
            barHeight = barHeight / visibleSeries.length;
        }

        var self = this;

        var barData = function (d, index) {
            var seriesForRow = [];
            var visibleIndex = 0;
            let prevX;
            let prevWidth;

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getBarRectObj({
                        columnIndexConfig,
                        columns,
                        legendColumn,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        dataFormatting,
                        colIndex,
                        visibleIndex,
                        barHeight,
                        index,
                        stacked,
                        prevX,
                        prevWidth,
                        i,
                        d,
                    });

                    visibleIndex += 1;

                    if (rectData && stacked) {
                        prevX = rectData?.x;
                        prevWidth = rectData?.width;
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
            .style('fill-opacity', (d) => d?.style?.fillOpacity)
            .attr('data-tippy-chart', true)
            .attr('data-tippy-content', (d) => d?.tooltip)
            .on('click', function (e, d) {
                onChartClick(d.drilldownData);
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
