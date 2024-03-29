import {
    formatChartLabel,
    getBinData,
    getBinLinearScale,
    getDefaultBucketConfig,
    getHistogramColumnObj,
    getHistogramScale,
    onlyUnique,
} from 'autoql-fe-utils';
import { Axes } from './Axes';
import { select } from 'd3-selection';
import { Slider } from '../ChataComponents/Slider/Slider';
import { cloneObject } from '../Utils';

export function Histogram(container, params = {}, chartHeaderElement) {
    const DEFAULT_SLIDER_HEIGHT = 37;

    const {
        data,
        columns,
        height,
        width,
        deltaX,
        outerWidth,
        firstDraw,
        options = {},
        chartColors,
        enableAxisDropdown,
        changeNumberColumnIndices,
        columnIndexConfig = {},
        aggregated,
        activeKey,
        bucketConfig,
        onChartClick,
        onBucketSizeChange = () => {},
        redraw = () => {},
    } = params;

    const { stringColumnIndices, stringColumnIndex, numberColumnIndex } = columnIndexConfig;

    const { dataFormatting } = options;

    this.bucketSize = bucketConfig?.bucketSize;
    this.bucketConfig = bucketConfig ?? getDefaultBucketConfig(data, bucketConfig?.bucketSize);

    this.getScaleParams = () => {
        return {
            data,
            columns,
            width,
            height,
            chartColors,
            dataFormatting,
            stringColumnIndex,
            stringColumnIndices,
            enableAxisDropdown,
            changeNumberColumnIndices,
            aggregated,
        };
    };

    this.setHistogramData = () => {
        const uniqueNumberValues = data.map((d) => d[numberColumnIndex]).filter(onlyUnique).length;
        if (uniqueNumberValues < this.bucketConfig.maxBucketSize) {
            this.bucketConfig.maxNumBuckets = uniqueNumberValues;
        }

        const scaleParams = this.getScaleParams();

        const { buckets, bins } = getBinData({
            bucketConfig: this.bucketConfig,
            newBucketSize: this.bucketConfig.bucketSize,
            data,
            numberColumnIndex,
        });

        this.buckets = buckets;
        this.bins = bins;

        this.xScale = getBinLinearScale({
            ...scaleParams,
            columnIndex: numberColumnIndex,
            axis: 'x',
            buckets: this.buckets,
            bins: this.bins,
        });

        this.yScale = getHistogramScale({
            ...scaleParams,
            columnIndex: numberColumnIndex,
            axis: 'y',
            buckets: this.buckets,
        });
    };

    this.onBucketSizeChange = (bucketSize) => {
        if (bucketSize !== this.bucketConfig.bucketSize) {
            this.bucketConfig.bucketSize = bucketSize;
            onBucketSizeChange(this.bucketConfig);
            redraw();
        }
    };

    this.formatSliderLabel = (value) => {
        const sigDigits =
            this.bucketConfig.bucketStepSize < 1
                ? this.bucketConfig.bucketStepSize.toString().split('.')[1].length
                : undefined;
        return formatChartLabel({
            d: value,
            column: columns[numberColumnIndex],
            dataFormatting,
            scale: this.xScale,
            sigDigits,
        })?.fullWidthLabel;
    };

    this.createHistogramSlider = () => {
        if (!chartHeaderElement) {
            return;
        }

        const existingSlider = chartHeaderElement.querySelector('.autoql-vanilla-histogram-slider');

        if (existingSlider) {
            return;
            existingSlider.parentElement.removeChild(existingSlider);
        }

        const min = this.bucketConfig.minBucketSize;
        const max = this.bucketConfig.maxBucketSize;

        const histogramSlider = new Slider({
            initialValue: this.bucketConfig.bucketSize,
            min,
            max,
            step: this.bucketConfig.bucketStepSize,
            minLabel: this.formatSliderLabel(min),
            maxLabel: this.formatSliderLabel(max),
            onChange: this.onBucketSizeChange,
            valueFormatter: this.formatSliderLabel,
            label: 'Interval size',
            showInput: true,
            marks: true,
        });

        let paddingLeft = deltaX - 10;
        if (paddingLeft < 0 || outerWidth < 300) {
            paddingLeft = 25;
        }

        histogramSlider.classList.add('autoql-vanilla-histogram-slider');

        chartHeaderElement.style.paddingLeft = paddingLeft;
        chartHeaderElement.appendChild(histogramSlider);
    };

    this.createHistogramColumns = () => {
        if (!numberColumnIndex) {
            console.warn('Unable to create bars - there is no number column');
            return;
        }

        var self = this;

        var barData = this.buckets.map((d, index) => {
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

    this.createHistogram = () => {
        this.setHistogramData();
        this.createHistogramSlider();

        if (!firstDraw) {
            this.createHistogramColumns();
        }

        this.axesElement?.destroy?.();
        this.axesElement = new Axes(this.axesWrapper, {
            ...params,
            xScale: this.xScale,
            yScale: this.yScale,
        });
    };

    this.destroy = () => {
        clearTimeout(this.debounceTimer);
        clearTimeout(this.throttleTimer);
        this.axesWrapper?.remove();
    };

    this.axesWrapper = container.append('g').attr('class', 'autoql-vanilla-axes-chart');

    this.createHistogram();

    return this;
}
