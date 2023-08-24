import {
    getBinData,
    getBinLinearScale,
    getDefaultBucketConfig,
    getHistogramColumnObj,
    getHistogramScale,
    onlyUnique,
} from 'autoql-fe-utils';
import { Axes } from './Axes';
import { select } from 'd3-selection';

export function Histogram(container, params = {}) {
    const {
        data,
        columns,
        height,
        width,
        firstDraw,
        options = {},
        chartColors,
        enableAxisDropdown,
        changeNumberColumnIndices,
        columnIndexConfig = {},
        aggregated,
        activeKey,
        initialBucketSize,
        onChartClick,
        onBucketSizeChange = () => {},
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndex, numberColumnIndices } = columnIndexConfig;

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

    this.bucketSize = initialBucketSize;
    this.bucketConfig = getDefaultBucketConfig(data, initialBucketSize);

    const uniqueNumberValues = data.map((d) => d[numberColumnIndex]).filter(onlyUnique).length;
    if (uniqueNumberValues < this.bucketConfig.maxBucketSize) {
        this.bucketConfig.maxNumBuckets = uniqueNumberValues;
    }

    const { buckets, bins } = getBinData({
        bucketConfig: this.bucketConfig,
        newBucketSize: this.bucketSize,
        data,
        numberColumnIndex,
    });

    this.buckets = buckets;
    this.bins = bins;

    this.xScale = getBinLinearScale({
        ...scaleParams,
        columnIndex: numberColumnIndex,
        axis: 'x',
        buckets,
        bins,
    });

    this.yScale = getHistogramScale({
        ...scaleParams,
        columnIndex: numberColumnIndex,
        axis: 'y',
        buckets,
    });

    this.createHistogramColumns = () => {
        if (!numberColumnIndex) {
            console.warn('Unable to create bars - there is no number column');
            return;
        }

        var self = this;

        var barData = buckets.map((d, index) => {
            return getHistogramColumnObj({
                xScale: self.xScale,
                yScale: self.yScale,
                activeKey,
                index,
                d,
            });
        });

        this.bars = container
            .append('g')
            .selectAll('.autoql-vanilla-bar-chart-series-container')
            .data(barData)
            .enter()
            .append('rect')
            .attr('class', 'autoql-vanilla-chart-bar')
            .attr('x', (d) => d?.x)
            .attr('y', (d) => d?.y)
            .attr('height', (d) => d?.height)
            .attr('width', (d) => d?.width)
            .style('stroke-width', 0)
            .style('fill', chartColors[0])
            .style('fill-opacity', (d) => (d?.drilldownData?.activeKey === activeKey ? 0.7 : d?.style?.fillOpacity))
            .attr('data-tippy-chart', true)
            .attr('data-tippy-content', (d) => d?.tooltip)
            .on('click', function (e, d) {
                onChartClick(d.drilldownData);

                container.selectAll('.autoql-vanilla-chart-bar').style('fill-opacity', d?.style?.fillOpacity);
                select(this).style('fill-opacity', 0.7);
            });
    };

    if (!firstDraw) {
        this.createHistogramColumns();
    }

    this.axesWrapper = container.append('g').attr('class', 'autoql-vanilla-axes-chart');

    new Axes(this.axesWrapper, {
        ...params,
        xScale: this.xScale,
        yScale: this.yScale,
    });

    return this;
}
