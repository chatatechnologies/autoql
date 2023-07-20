import { getBandScale, getLinearScales, getBarRectObj } from 'autoql-fe-utils';
import { Axes } from './Axes';
import { tooltipCharts } from '../Tooltips';

export function BarChartNew(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        outerHeight,
        outerWidth,
        deltaX,
        deltaY,
        firstDraw,
        visibleSeries,
        colorScale,
        options = {},
        isScaled,
        toggleChartScale,
        enableAxisDropdown,
        stringIndexConfig = {},
        numberIndexConfig = {},
    } = params;
    const { stringColumnIndices, stringColumnIndex } = stringIndexConfig;
    const { numberColumnIndices, numberColumnIndex } = numberIndexConfig;
    const { dataFormatting } = options;
    // TODO: var visibleSeries = numberColumnIndices.filter(index => !columns[index].isSeriesHidden)

    const scaleParams = {
        data,
        columns,
        height,
        width,
        dataFormatting,
        stringColumnIndices,
        enableAxisDropdown,
        changeColumnIndices: () => {}, // TODO
        changeNumberColumnIndices: () => {},
        changeStringColumnIndex: () => {}, // TODO
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
        columnIndices1: numberColumnIndices,
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
        var xScale = this.xScale;
        var yScale = this.yScale;

        var barData = function (d, index) {
            var seriesForRow = [];
            var visibleIndex = 0;

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getBarRectObj({
                        ...stringIndexConfig,
                        ...numberIndexConfig,
                        columns,
                        xScale,
                        yScale,
                        colorScale,
                        activeKey: undefined, // TODO
                        legendColumn: undefined, // TODO
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

            console.log('this is the series data for the bars:', {seriesForRow})

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
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('height', (d) => d.height)
            .attr('width', (d) => d.width)
            .style('fill', (d) => d.style?.fill)
            .style('fill-opacity', (d) => d.style?.fillOpacity)
            .on('click', function (d) {
                console.log('ON CLICK', d.onClickData);
            }); // TODO
            // .attr('data-tippy-content', (d) => d.tooltip)
    };

    this.axesWrapper = container.append('g').attr('class', 'autoql-vanilla-axes-chart');

    new Axes(this.axesWrapper, {
        xScale: this.xScale,
        yScale: this.yScale,
        xCol,
        yCol,
        deltaX,
        deltaY,
        height,
        width,
        outerHeight,
        outerWidth,
        toggleChartScale, // TODO
        options,
        firstDraw,
    });

    if (firstDraw) {
        // Do not render bars on first draw
    } else {
        this.createBars();
    }

    return this;
}
