import { getBandScale, getHeatmapRectObj, getOpacityScale } from 'autoql-fe-utils';
import { Axes } from './Axes';

export function HeatmapNew(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        firstDraw,
        visibleSeries,
        options = {},
        legendColumn,
        chartColors,
        onChartClick,
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
        legendColumn,
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
                    const rectData = getHeatmapRectObj({
                        columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        dataFormatting,
                        colIndex,
                        index,
                        opacityScale: getOpacityScale(data, visibleSeries),
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
    });

    if (!firstDraw) {
        this.createSquares();
    }

    return this;
}
