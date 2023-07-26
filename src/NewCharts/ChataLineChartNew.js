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
import { CSS_PREFIX } from '../Constants';

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

    this.xScale = getBandScale({
        ...scaleParams,
        axis: 'x',
        innerPadding: stacked ? 1 : undefined,
        outerPadding: stacked ? 0 : undefined,
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

    this.createLines = () => {
        if (!visibleSeries?.length) {
            console.warn('Unable to create lines - there are no visible series');
            return;
        }

        const backgroundColor = getThemeValue('background-color-secondary', CSS_PREFIX);
        const largeDataset = width / data?.length < 10;

        var self = this;

        if (this.lines) this.lines.remove();

        const smoothing = PATH_SMOOTHING; // stacked ? 0 : PATH_SMOOTHING

        let minValue = this.yScale.domain()[0];
        if (minValue < 0) {
            minValue = 0;
        }

        let prevVertices = [];
        let cumulativeValues = [];
        var lineData = function (colIndex, i) {
            if (i === 0) {
                prevVertices = [];
                cumulativeValues = [];
        
                self.xScale.domain().forEach((xLabel) => {
                    cumulativeValues.push(minValue);
                    prevVertices.push([self.xScale(xLabel), self.yScale(minValue)]);
                });
            }

            const vertices = [];
            const color = self.yScale?.colorScale?.(colIndex);
            const currentValues = [];

            data.forEach((d, index) => {
                if (visibleSeries.includes(colIndex)) {
                    const vertexData = getLineVertexObj({
                        ...columnIndexConfig,
                        columns,
                        xScale: self.xScale,
                        yScale: self.yScale,
                        activeKey: undefined, // TODO
                        dataFormatting,
                        colIndex,
                        backgroundColor,
                        color,
                        index,
                        stacked,
                        prevVertices,
                        cumulativeValues,
                        d,
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

            let pathD;

            if (prevVertices && stacked) {
                const prevVerticesReversed = [...prevVertices].reverse();

                // Create closed loop by combining vertices then adding a copy of the first point at the end
                pathD = createSVGPath([...currentVertices, ...prevVerticesReversed, currentVertices[0]], smoothing);

                console.log('merged paths:', {
                    pathD,
                });

                prevVertices = currentVertices;
            } else {
                pathD = createSVGPath(currentVertices, smoothing);
            }

            const path = {
                key: `line-${getKey(0, i)}`,
                pathD,
                stroke: color,
                fill: stacked ? color : 'transparent',
            };

            return [
                {
                    path,
                    vertices,
                },
            ];
        };

        // ---temp
        // Reverse the final values so the strokes on the bottom are drawn on top
        const cumulativeData = visibleSeries.map(lineData);
        const reversedCumulativeData = [...cumulativeData].reverse();
        console.log({ cumulativeData, reversedCumulativeData });
        //

        const seriesContainerClass = 'autoql-vanilla-line-chart-series-container';
        const vertexClass = 'autoql-vanilla-inner-vertex';
        const hoverVertexClass = 'autoql-vanilla-hover-vertex';
        const pathClass = 'autoql-vanilla-chart-line';

        var seriesContainers = container
            .append('g')
            .attr('class', 'autoql-vanilla-line-chart-element-container')
            .selectAll(`g.${seriesContainerClass}`)
            .data(numberColumnIndices)
            .enter()
            .append('g')
            .attr('class', seriesContainerClass)
            .selectAll(`path.${pathClass}`)
            .data(lineData)
            .enter();

        // Paths
        seriesContainers
            .append('path')
            .attr('class', pathClass)
            .attr('d', (d) => d.path.pathD)
            .style('stroke', (d) => d.path.stroke)
            .style('fill', (d) => d.path.fill)
            .style('fill-opacity', 0.7)
            .style('stroke-width', 2);

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
                .style('fill', (d) => d.style.fill);

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
                .style('cursor', 'pointer');
        }
    };

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
        this.createLines();
    }

    return this;
}
