import { getBandScale, getBubbleObj, getRadiusScale } from 'autoql-fe-utils';
import { Axes } from './Axes';

export function BubbleChartNew(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        firstDraw,
        visibleSeries,
        options = {},
        legendColumn,
        onChartClick,
        chartColors,
        enableAxisDropdown,
        changeNumberColumnIndices,
        changeStringColumnIndices,
        columnIndexConfig = {},
        legend,
        aggregated
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndices } = columnIndexConfig;
    const { dataFormatting } = options;

    const scaleParams = {
        data,
        columns,
        height,
        width,
        chartColors,
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
        innerPadding: 0.01,
        outerPadding: 0,
    });

    this.yScale = getBandScale({
        ...scaleParams,
        column: legendColumn,
        domain: legend?.labels?.map((d) => d.label),
        axis: 'y',
        innerPadding: 0.01,
        outerPadding: 0,
    });

    var xCol = columns[stringColumnIndex];
    var yCol = legendColumn;

    this.createSquares = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create bars - there are no visible series');
            return;
        }

        if (this.squares) this.squares.remove();

        var self = this;

        var barData = function (d, index) {
            var seriesForRow = [];

            numberColumnIndices.forEach((colIndex, i) => {
                if (visibleSeries.includes(colIndex)) {
                    const rectData = getBubbleObj({
                        columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        dataFormatting,
                        colIndex,
                        index,
                        radiusScale: getRadiusScale(data, visibleSeries, self.xScale, self.yScale),
                        legendLabels: legend.labels,
                        legendColumn,
                        chartColors,
                        i,
                        d,
                    });

                    seriesForRow.push(rectData);
                }
            });

            return seriesForRow;
        };

        this.squares = container
            .append('g')
            .selectAll('.autoql-vanilla-bar-chart-series-container')
            .data(data)
            .enter()
            .selectAll('circle')
            .data(barData)
            .enter()
            .append('circle')
            .attr('class', 'autoql-vanilla-chart-bar')
            .attr('cx', (d) => d?.cx)
            .attr('cy', (d) => d?.cy)
            .attr('r', (d) => d?.r)
            .style('stroke-width', 10)
            .style('stroke', 'transparent')
            .style('fill-opacity', 0.7)
            .style('fill', (d) => d?.style?.fill)
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
        this.createSquares();
    }

    return this;
}
