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
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndices, numberColumnIndex } =
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

        var lineData = function (colIndex, i) {
            const vertices = [];
            const color = self.yScale?.colorScale?.(colIndex);

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
                        d,
                    });

                    vertices.push(vertexData);
                }
            });

            const pathD = createSVGPath(
                vertices.map((circle) => [circle.cx, circle.cy]),
                PATH_SMOOTHING,
            );

            const path = {
                key: `line-${getKey(0, i)}`,
                pathD,
                stroke: color,
            };

            return [
                {
                    path,
                    vertices,
                },
            ];
        };

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
            .style('fill', 'none')
            .style('stroke-width', 2);

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
