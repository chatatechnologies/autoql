import { getBandScale, getLinearScales, getColumnRectObj, invertArray, scaleZero } from 'autoql-fe-utils';
import { Axes } from './Axes';
import { stack } from 'd3-shape';

export function StackedColumnChartNew(container, params = {}) {
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
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndices, numberColumnIndex } = columnIndexConfig;
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

    this.xScale = getBandScale({
        ...scaleParams,
        axis: 'x',
        columnIndex: stringColumnIndex,
    });

    this.yScale = getLinearScales({
        ...scaleParams,
        axis: 'y',
        isScaled,
        columnIndices1: visibleSeries,
        colorScales,
        stacked: true,
    }).scale;

    var xCol = columns[stringColumnIndex];
    var yCol = columns[numberColumnIndex];

    this.createBars = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create bars - there are no visible series');
            return;
        }

        if (this.bars) this.bars.remove();

        var barWidth = this.xScale.tickSize / visibleSeries.length;

        var self = this;

        var barData = function (d, index) {
            var seriesObj = {};
            var visibleIndex = 0;

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getColumnRectObj({
                        ...columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        dataFormatting,
                        colIndex,
                        visibleIndex,
                        barWidth,
                        index,
                        i,
                        d,
                    });

                    visibleIndex += 1;

                    seriesObj[colIndex] = rectData;
                }
            });

            return seriesObj;
        };

        const stackGen = stack()
            .keys(visibleSeries)
            .value((d, key) => d[key].value);

        const dataForStack = data.map(barData);
        const stackedSeries = stackGen(dataForStack);

        this.bars = container
            .append('g')
            .selectAll('.autoql-vanilla-bar-chart-series-container')
            .data(stackedSeries)
            .enter()
            .append('g')
            .attr('fill', (d) => this.yScale.colorScale(d.key))
            .selectAll('rect')
            .data((d) => d)
            .enter()
            .append('rect')
            .attr('class', 'autoql-vanilla-chart-bar')
            .attr('x', (d, i) => this.xScale(data[i][stringColumnIndex]))
            .attr('y', (d) => this.yScale(d[1]))
            .attr('width', this.xScale.tickSize)
            .attr('height', (d) => this.yScale(d[0]) - (this.yScale(d[1])))
            // .attr('data-tippy-chart', true)
            // .attr('data-tippy-content', (d, key) => d.data?.[key]?.tooltip)
            // .on('click', function (e, d) {
            //     console.log(d);
            // }); // TODO
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
