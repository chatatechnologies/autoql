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
        toggleChartScale, // TODO
    } = params;

    const { stringColumnIndices, stringColumnIndex, legendColumnIndex, numberColumnIndices, numberColumnIndex } =
        columnIndexConfig;
    const { dataFormatting } = options;

    const scaleParams = {
        data,
        columns,
        height,
        width,
        dataFormatting,
        stringColumnIndices,
        enableAxisDropdown,
        changeNumberColumnIndices,
        changeStringColumnIndices,
    };

    this.yScale = getBandScale({
        ...scaleParams,
        axis: 'y',
        columnIndex: stringColumnIndex,
    });

    this.xScale = getLinearScales({
        ...scaleParams,
        axis: 'x',
        isScaled,
        columnIndices1: visibleSeries,
        colorScales,
    }).scale;

    var xCol = columns[numberColumnIndex];
    var yCol = columns[stringColumnIndex];

    this.createBars = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create bars - there are no visible series');
            return;
        }

        if (this.bars) this.bars.remove();

        var barHeight = this.yScale.tickSize / visibleSeries.length;

        var self = this;

        var barData = function (d, index) {
            var seriesForRow = [];
            var visibleIndex = 0;

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getBarRectObj({
                        ...columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        legendColumn: columns[legendColumnIndex],
                        dataFormatting,
                        colIndex,
                        visibleIndex,
                        barHeight,
                        index,
                        i,
                        d,
                    });

                    visibleIndex += 1;

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
                console.log(d);
            }); // TODO
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
