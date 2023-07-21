import {
    mergeBboxes,
    aggregateData,
    getThemeValue,
    sortDataByDate,
    getNumberColumnIndices,
    getStringColumnIndices,
    DOUBLE_AXIS_CHART_TYPES,
    getColorScales,
    usePivotDataForChart,
} from 'autoql-fe-utils';

import { uuidv4 } from '../Utils';
import { select } from 'd3-selection';
import { BarChartNew } from './ChataBarChartNew';
import { ChartLoader } from '../Charts/ChartLoader';
import { refreshTooltips } from '../Tooltips';

const getRenderedChartDimensions = (chartComponent) => {
    const axes = chartComponent?.axesWrapper;

    if (!axes) {
        console.warn('Unable to get chart dimensions - couldnt find axes element');
        return {};
    }

    try {
        const leftAxisBBox = axes.select('.autoql-vanilla-axis-left')?.node()?.getBoundingClientRect();
        const topAxisBBox = axes.select('.autoql-vanilla-axis-top')?.node()?.getBoundingClientRect();
        const bottomAxisBBox = axes.select('.autoql-vanilla-axis-bottom')?.node()?.getBoundingClientRect();
        const rightAxisBBox = axes.select('.autoql-vanilla-axis-right')?.node()?.getBoundingClientRect();
        // const clippedLegendBBox = axes.select('.autoql-vanilla-chart-legend')?.node()?.getBoundingClientRect(); // TODO

        const axesBBox = mergeBboxes([
            leftAxisBBox,
            bottomAxisBBox,
            rightAxisBBox,
            topAxisBBox,
            //  clippedLegendBBox
        ]);

        const axesWidth = axesBBox?.width ?? 0;
        const axesHeight = axesBBox?.height ?? 0;
        const axesX = axesBBox?.x ?? 0;
        const axesY = axesBBox?.y ?? 0;

        return {
            chartHeight: axesHeight,
            chartWidth: axesWidth,
            chartX: axesX,
            chartY: axesY,
        };
    } catch (error) {
        console.error(error);
        return {};
    }
};

const getInnerDimensions = (chartComponent, containerHeight, containerWidth) => {
    const { chartWidth, chartHeight } = getRenderedChartDimensions(chartComponent);
    if (!chartWidth || !chartHeight) {
        return {};
    }

    const CHART_PADDING = 0;

    const xScale = chartComponent?.xScale;
    const yScale = chartComponent?.yScale;

    let innerWidth = containerWidth - 2 * CHART_PADDING;
    if (xScale && chartWidth) {
        const rangeInPx = xScale.range()[1] - xScale.range()[0];
        const totalHorizontalMargins = chartWidth - rangeInPx;
        innerWidth = containerWidth - totalHorizontalMargins - 2 * CHART_PADDING;
    }

    let innerHeight = containerHeight - 2 * CHART_PADDING;
    if (yScale && chartHeight) {
        const rangeInPx = yScale.range()[0] - yScale.range()[1];
        const totalVerticalMargins = chartHeight - rangeInPx;
        innerHeight = containerHeight - totalVerticalMargins - 2 * CHART_PADDING;
    }

    if (innerWidth < 1) {
        innerWidth = 1;
    }

    if (innerHeight < 1) {
        innerHeight = 1;
    }

    return { innerWidth, innerHeight };
};

const getDeltas = (chartComponent) => {
    const CHART_PADDING = 0; // TODO remove or move
    const axesBBox = chartComponent?.axesWrapper?.node()?.getBBox();

    // Get distance in px to shift to the right
    const axesBBoxX = Math.ceil(axesBBox?.x ?? 0);
    const deltaX = -1 * axesBBoxX + CHART_PADDING;

    // Get distance in px to shift down
    const axesBBoxY = Math.ceil(axesBBox?.y ?? 0);
    const deltaY = -1 * axesBBoxY + CHART_PADDING;

    return { deltaX, deltaY };
};

export function ChataChartNew(
    component,
    type = 'bar',
    origJson,
    options,
    onUpdate = () => {},
    valueClass = 'data-chartindex',
    renderTooltips = true,
) {
    var origRows = origJson?.data?.rows;
    var columns = origJson?.data?.columns;
    var drawCount = 1;

    if (!origRows?.length || !columns?.length) {
        return null;
    }

    const CSS_PREFIX = 'autoql-vanilla';
    const CHART_SVG_CLASS = 'autoql-vanilla-chart-new';
    const CHART_CONTAINER_CLASS = 'autoql-vanilla-chart-content-container';
    const FONT_SIZE = 12;

    const { dataFormatting } = options;

    const numberIndexConfig = getNumberColumnIndices(columns) ?? {};
    const stringIndexConfig = getStringColumnIndices(columns) ?? {};

    const indices1 = numberIndexConfig.numberColumnIndices ?? [];
    const indices2 = DOUBLE_AXIS_CHART_TYPES.includes(type) ? numberIndexConfig.numberColumnIndices2 ?? [] : [];
    const numberIndices = [...indices1, ...indices2];
    const isDataAggregated = usePivotDataForChart({ data: origJson });
    const hasRowSelector = options.pageSize < origJson?.data?.count_rows;

    var metadataElement = component.parentElement.parentElement;
    // TODO: update send in index config directly instead of using the metadata component
    if (!metadataElement.metadata) {
        // var dateCol = getFirstDateCol(cols)
        // let i = dateCol !== -1 ? dateCol : yIndexes[0]?.index
        metadataElement.metadata = {
            groupBy: {
                index: stringIndexConfig.stringColumnIndex,
                currentLi: 0,
            },
            series: indices1,
            stringIndexConfig,
            numberIndexConfig,
        };
    }

    const chartID = uuidv4();

    this.getData = (rows) => {
        let newRows = rows ?? origRows

        if (isDataAggregated) {
            return sortDataByDate(newRows, columns, 'asc');
        }

        var data = newRows;
        if (numberIndices.length) {
            data = aggregateData({
                data: newRows,
                aggColIndex: stringIndexConfig.stringColumnIndex,
                columns: columns,
                numberIndices,
                dataFormatting,
            });
        }

        return data;
    };

    this.data = this.getData();

    // this.onLabelRotation = () => {
    //     this.chartComponent = this.drawChart();
    // }

    // Default starting size and position
    this.deltaX = 100;
    this.deltaY = 0;
    this.innerHeight = component.parentElement.clientHeight - 100;
    this.innerWidth = component.parentElement.clientWidth - 100;

    this.isScaled = false;

    this.toggleChartScale = () => {
        this.isScaled = !this.isScaled;
        this.drawChart();
    };

    this.drawChart = (firstDraw = true) => {
        if (drawCount > 50) {
            console.warn('recursive drawChart was called over 50 times. Something is wrong.');
            return;
        }

        const hasDrawnOnce = !!this.chartComponent;

        try {
            this.outerHeight = component.parentElement.clientHeight;
            this.outerWidth = component.parentElement.clientWidth;

            if (hasDrawnOnce) {
                const { innerWidth, innerHeight } = getInnerDimensions(
                    this.chartComponent,
                    this.outerHeight,
                    this.outerWidth,
                );
                this.innerWidth = innerWidth;
                this.innerHeight = innerHeight;

                const { deltaX, deltaY } = getDeltas(this.chartComponent);
                this.deltaX = deltaX;
                this.deltaY = deltaY;
            }

            select(component).selectAll(`.${CHART_SVG_CLASS}`).remove();

            this.svg = select(component)
                .append('svg')
                .attr('id', chartID)
                .attr('class', CHART_SVG_CLASS)
                .attr('width', '100%')
                .attr('height', '100%')
                .style('font-size', FONT_SIZE)
                .style('font-family', getThemeValue('font-family', CSS_PREFIX))
                .style('color', getThemeValue('text-color-primary', CSS_PREFIX))
                .style('stroke', getThemeValue('text-color-primary', CSS_PREFIX))
                .style('background', getThemeValue('background-color-secondary', CSS_PREFIX));

            var chartContentWrapper = this.svg
                .append('g')
                .attr('class', CHART_CONTAINER_CLASS)
                .attr('transform', `translate(${this.deltaX}, ${this.deltaY})`)
                .style('visibility', 'hidden');

            const colorScales = getColorScales({ ...numberIndexConfig });

            const params = {
                data: this.data,
                columns,
                options,
                height: this.innerHeight ?? this.outerHeight,
                width: this.innerWidth ?? this.outerWidth,
                numberIndexConfig,
                stringIndexConfig,
                visibleSeries: numberIndexConfig.numberColumnIndices, // TODO
                outerHeight: this.outerHeight,
                outerWidth: this.outerWidth,
                deltaX: this.deltaX,
                deltaY: this.deltaY,
                firstDraw,
                hasRowSelector,
                isScaled: this.isScaled,
                colorScale: colorScales.colorScale,
                colorScale2: colorScales.colorScale2,
                toggleChartScale: this.toggleChartScale,
                enableAxisDropdown: options.enableDynamicCharting && !isDataAggregated,
                changeNumberColumnIndices: () => {
                    console.log('CHANGE NUMBER COLUMN INDICES... FROM CHATA CHART');
                }, // TODO
                changeStringColumnIndices: () => {
                    console.log('CHANGE STRING COLUMN INDICES... FROM CHATA CHART');
                }, // TODO
                onDataFetching: this.onDataFetching,
                onNewData: this.onNewData,
                onDataFetchError: this.onDataFetchError,
                json: origJson,
                pageSize: undefined, // metadataComponent.metadata?.pageSize, // TODO: do we need this?
                // onLabelRotation: this.onLabelRotation,
            };

            switch (type) {
                case 'column':
                    return null;
                case 'bar':
                    this.chartComponent = new BarChartNew(chartContentWrapper, params);
                    break;
                case 'line':
                    return null;
                case 'pie':
                    return null;
                case 'bubble':
                    return null;
                case 'heatmap':
                    return null;
                case 'stacked_column':
                    return null;
                case 'stacked_bar':
                    return null;
                case 'stacked_line':
                    return null;
                default:
                    return null; // 'Unknown Display Type'
            }

            // This is a safety fallback in case of infinite recursion
            drawCount += 1;
            setTimeout(() => {
                drawCount = 0;
            }, 1000);

            if (firstDraw) {
                return this.drawChart(false);
            }
        } catch (error) {
            console.error(error);
        }

        chartContentWrapper.style('visibility', 'visible');

        onUpdate(component);
        return;
    };

    this.onDataFetching = () => this.chartLoader?.setChartLoading(true);

    this.onNewData = (newJson) => {
        if (newJson?.data?.rows) {
            origJson.data.rows = newJson.data.rows;
            origJson.data.row_limit = newJson.data.row_limit;
            this.data = this.getData(newJson.data.rows)

            this.drawChart();
        }

        this.chartLoader?.setChartLoading(false);
    };

    this.onDataFetchError = (error) => {
        console.error(error);
        this.chartLoader?.setChartLoading(false);
    };

    // ----------- TODO move this outside of this component ----------------------
    component.innerHTML = '';
    if (component.headerElement) {
        component.parentElement.parentElement.removeChild(component.headerElement);
        component.headerElement = null;
    }
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('autoql-vanilla-chata-chart-container');
    component.parentElement.parentElement.classList.add('chata-hidden-scrollbox');
    // ----------------------------------------------------------------------------

    this.chartLoader = new ChartLoader(component);

    this.drawChart();

    select(window).on('chata-resize.' + component.dataset.componentid, this.drawChart);

    refreshTooltips();

    return this.svg?.node();
}
