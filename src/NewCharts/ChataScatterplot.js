import {
    getLinearScale,
    getMinAndMaxValues,
    getPointObj,
} from 'autoql-fe-utils';
import { Axes } from './Axes';

export function Scatterplot(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        firstDraw,
        options = {},
        legendColumn,
        chartColors,
        activeKey,
        enableAxisDropdown,
        changeNumberColumnIndices,
        columnIndexConfig = {},
        aggregated,
    } = params;

    const {
        stringColumnIndices,
        stringColumnIndex,
        numberColumnIndex,
        numberColumnIndices,
        numberColumnIndex2,
        numberColumnIndices2,
    } = columnIndexConfig;
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
        aggregated,
    };

    var isXScaled = true;
    var isYScaled = true;

    const xMinMax = getMinAndMaxValues(data, numberColumnIndices, isXScaled);
    const xMaxValue = xMinMax.maxValue;
    const xMinValue = xMinMax.minValue;

    this.xScale = getLinearScale({
        ...scaleParams,
        minValue: xMinValue,
        maxValue: xMaxValue,
        axis: 'x',
        isScaled: isXScaled,
        columnIndex: numberColumnIndex,
        changeColumnIndices: (indices, newColumns) => changeNumberColumnIndices(indices, undefined, newColumns),
        allowMultipleSeries: false,
    });

    const yMinMax = getMinAndMaxValues(data, numberColumnIndices2, isYScaled);
    const yMaxValue = yMinMax.maxValue;
    const yMinValue = yMinMax.minValue;

    this.yScale = getLinearScale({
        ...scaleParams,
        minValue: yMinValue,
        maxValue: yMaxValue,
        axis: 'y',
        isScaled: isYScaled,
        columnIndex: numberColumnIndex2,
        changeColumnIndices: (indices, newColumns) => changeNumberColumnIndices(undefined, indices, newColumns),
        allowMultipleSeries: false,
    });

    this.xScale.secondScale = this.yScale;
    this.yScale.secondScale = this.xScale;

    var xCol = columns[numberColumnIndex];
    var yCol = columns[numberColumnIndex2];

    this.createPoints = () => {
        if (!numberColumnIndex || !numberColumnIndex2) {
            console.warn('Unable to create points - there are not enough number columns');
            return;
        }

        if (this.points) this.points.remove();

        var pointData = data.map((d, index) => {
            return getPointObj({
                columnIndexConfig,
                columns,
                xScale: this.xScale,
                yScale: this.yScale,
                activeKey,
                dataFormatting,
                index,
                legendColumn,
                chartColors,
                d,
            });
        });

        this.points = container
            .append('g')
            .selectAll('.autoql-vanilla-bar-chart-series-container')
            .data(pointData)
            .enter()
            .append('circle')
            .attr('class', 'autoql-vanilla-chart-point')
            .attr('cx', (d) => d?.cx)
            .attr('cy', (d) => d?.cy)
            .attr('r', (d) => d?.r)
            .style('stroke-width', 10)
            .style('stroke', 'transparent')
            .style('fill-opacity', 0.7)
            .style('fill', (d) => d?.style?.fill)
            .attr('data-tippy-chart', true)
            .attr('data-tippy-content', (d) => d?.tooltip);
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
        this.createPoints();
    }

    return this;
}
