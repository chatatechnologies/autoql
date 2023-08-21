import {
    getBandScale,
    getLinearScales,
    getThemeValue,
    getLineVertexObj,
    createSVGPath,
    PATH_SMOOTHING,
    getKey,
} from 'autoql-fe-utils';
import { Axes } from './Axes';
import { select } from 'd3-selection';
import { CSS_PREFIX } from '../Constants';

export const createLines = (container, params) => {
    const { data, width, visibleSeries, onChartClick, activeKey, stacked, options, xScale, yScale, legend } = params;
    const { dataFormatting } = options;

    if (!visibleSeries?.length) {
        console.warn('Unable to create lines - there are no visible series');
        return;
    }

    const backgroundColor = getThemeValue('background-color-secondary', CSS_PREFIX);
    const largeDataset = width / data?.length < 10;

    let minValue = params.yScale.domain()[0];
    if (minValue < 0) {
        minValue = 0;
    }

    let prevVertices = [];
    let cumulativeValues = [];

    var lineData = function (colIndex, i) {
        if (i === 0) {
            prevVertices = [];
            cumulativeValues = [];

            xScale.domain().forEach((xLabel) => {
                cumulativeValues.push(minValue);
                prevVertices.push([xScale(xLabel), yScale(minValue)]);
            });
        }

        const vertices = [];
        const color = yScale?.colorScale?.(colIndex);
        const currentValues = [];

        data.forEach((d, index) => {
            if (visibleSeries.includes(colIndex)) {
                const vertexData = getLineVertexObj({
                    ...params,
                    d,
                    index,
                    color,
                    colIndex,
                    backgroundColor,
                    dataFormatting,
                    prevVertices,
                    cumulativeValues,
                });

                if (stacked && vertexData) {
                    currentValues[index] = vertexData.value;
                }

                vertices.push(vertexData);
            }
        });

        if (stacked && currentValues) {
            cumulativeValues = currentValues;
        }

        const currentVertices = vertices.map((circle) => [circle.cx, circle.cy]);

        let pathD = createSVGPath(currentVertices, PATH_SMOOTHING);
        if (prevVertices && stacked) {
            // Create closed loop by
            // 1. Combining vertices with the previous vertices reversed
            // 2. Adding a copy of the last point without smoothing to start the loop
            // 3. Adding a copy of the first point without smoothing at the end to close the loop
            const prevVerticesReversed = [...prevVertices].reverse();
            const prevPathDSliced = createSVGPath([...prevVerticesReversed], PATH_SMOOTHING).replace('M', 'L');
            const firstPoint = `L ${currentVertices[0].join(',')}`;
            const lastPoint = `L ${currentVertices.slice(-1).pop().join(',')}`;

            pathD = `${pathD} ${lastPoint} ${prevPathDSliced} ${firstPoint}`;
        }

        prevVertices = currentVertices;
        const path = {
            key: `line-${getKey(0, i)}`,
            pathD,
            stroke: color,
            fill: stacked ? color : 'transparent',
            tooltip: `
                <div>
                <strong>Field</strong>: ${legend.labels[i].label}
                </div>
            `
        };

        return [{ path, vertices }];
    };

    // Reverse the final values so the strokes on the bottom are drawn on top
    const cumulativeData = visibleSeries.map(lineData);
    const reversedCumulativeData = [...cumulativeData].reverse();

    const seriesContainerClass = 'autoql-vanilla-line-chart-series-container';
    const vertexClass = 'autoql-vanilla-inner-vertex';
    const hoverVertexClass = 'autoql-vanilla-hover-vertex';
    const pathClass = 'autoql-vanilla-chart-line';

    var seriesContainers = container
        .append('g')
        .attr('class', 'autoql-vanilla-line-chart-element-container')
        .selectAll(`g.${seriesContainerClass}`)
        .data(reversedCumulativeData)
        .enter()
        .append('g')
        .attr('class', seriesContainerClass)
        .selectAll(`path.${pathClass}`)
        .data((d) => d)
        .enter();

    // Paths
    const paths = seriesContainers
        .append('path')
        .attr('class', pathClass)
        .attr('d', (d) => d.path.pathD)
        .style('stroke', (d) => d.path.stroke)
        .style('fill', (d) => d.path.fill)
        .style('fill-opacity', 0.7)
        .style('stroke-width', 2);

    if (stacked) {
        paths.attr('data-tippy-chart', true).attr('data-tippy-content', (d) => d.path.tooltip);
    }

    if (!stacked) {
        // Circles
        seriesContainers
            .append('g')
            .attr('class', 'autoql-vanilla-line-chart-vertices')
            .selectAll(`circle.${vertexClass}`)
            .data((d) => d.vertices)
            .enter()
            .append('circle')
            .attr('class', vertexClass)
            .attr('cx', (d) => d.cx)
            .attr('cy', (d) => d.cy)
            .attr('r', 2.5)
            .style('pointer-events', 'none')
            .style('stroke', (d) => d.style.color)
            .style('stroke-width', 4)
            .style('paint-order', 'stroke')
            .style('opacity', largeDataset ? 0 : 1)
            .style('color', (d) => d.style.color)
            .style('fill', (d) => (d.drilldownData.activeKey === activeKey ? d.style.color : d.style.fill));

        // Hover Circles
        seriesContainers
            .append('g')
            .attr('class', 'autoql-vanilla-line-chart-hover-vertices')
            .selectAll(`circle.${hoverVertexClass}`)
            .data((d) => d.vertices)
            .enter()
            .append('circle')
            .attr('class', hoverVertexClass)
            .attr('cx', (d) => d.cx)
            .attr('cy', (d) => d.cy)
            .attr('r', 2.5)
            .attr('data-tippy-chart', true)
            .attr('data-tippy-content', (d) => d.tooltip)
            .style('stroke', 'transparent')
            .style('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('click', function (e, d) {
                onChartClick(d.drilldownData);

                container.selectAll(`circle.${vertexClass}`).style('fill', d?.style?.fill);
                select(this).style('fill', d?.style?.color);
            });
    }
};

export function LineChartNew(container, params = {}) {
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
        stacked,
        aggregated,
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndex } = columnIndexConfig;
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
        aggregated,
    };

    this.xScale = getBandScale({
        ...scaleParams,
        axis: 'x',
        innerPadding: stacked ? 1 : undefined,
        outerPadding: stacked ? 0 : 0.05,
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

    const self = this;

    this.axesWrapper = container.append('g').attr('class', 'autoql-vanilla-axes-chart');

    new Axes(this.axesWrapper, {
        ...params,
        xScale: this.xScale,
        yScale: this.yScale,
        xCol,
        yCol,
        legendShape: 'line',
    });

    if (!firstDraw) {
        createLines(container, { ...params, xScale: this.xScale, yScale: this.yScale });
    }

    return this;
}
