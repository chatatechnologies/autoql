import {
    aggregateData,
    getThemeValue,
    DOUBLE_AXIS_CHART_TYPES,
    getColorScales,
    usePivotDataForChart,
    DEFAULT_CHART_CONFIG,
    getDataFormatting,
    getColumnIndexConfig,
    isColumnIndexConfigValid,
    getLegendLocation,
    getLegendLabels,
    getLegendTitleFromColumns,
    mergeBoundingClientRects,
} from 'autoql-fe-utils';

import { uuidv4, cloneObject } from '../Utils';
import { select } from 'd3-selection';
import { BarChartNew } from './ChataBarChartNew';
import { ChartLoader } from '../Charts/ChartLoader';
import { refreshChartTooltips, refreshTooltips } from '../Tooltips';
import { CSS_PREFIX } from '../Constants';
import { ColumnChartNew } from './ChataColumnChartNew';

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
        const clippedLegendBBox = axes.select('.autoql-vanilla-chart-legend-clipping-container')?.node()?.getBoundingClientRect();

        const axesBBox = mergeBoundingClientRects([leftAxisBBox, bottomAxisBBox, rightAxisBBox, topAxisBBox, clippedLegendBBox]);

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
    { type = 'bar', queryJson, options, onUpdate = () => {}, chartConfig = {} } = {},
) {
    if (!component || !queryJson) {
        console.warn('Unable to create chart - one of the following parameters were not supplied:', {
            component: !!component,
            queryJson: !!queryJson,
        });
        return;
    }

    const chartID = uuidv4();

    var origRows = queryJson?.data?.rows;
    var columns = queryJson?.data?.columns;

    if (!origRows?.length || !columns?.length) {
        return null;
    }

    const CHART_SVG_CLASS = 'autoql-vanilla-chart-new';
    const CHART_CONTAINER_CLASS = 'autoql-vanilla-chart-content-container';
    const FONT_SIZE = 12;

    const columnIndexConfig =
        chartConfig?.columnIndexConfig ?? getColumnIndexConfig({ response: { data: queryJson }, columns });
    const indices1 = columnIndexConfig.numberColumnIndices ?? [];
    const indices2 = DOUBLE_AXIS_CHART_TYPES.includes(type) ? columnIndexConfig.numberColumnIndices2 ?? [] : [];
    const numberIndices = [...indices1, ...indices2];
    const isDataAggregated = usePivotDataForChart({ data: queryJson });
    const hasRowSelector = options.pageSize < queryJson?.data?.count_rows;

    const { isScaled } = {
        ...DEFAULT_CHART_CONFIG,
        ...chartConfig,
    };

    var metadataElement = component.parentElement.parentElement;
    // TODO: update send in index config directly instead of using the metadata component
    if (!metadataElement.metadata) {
        // var dateCol = getFirstDateCol(cols)
        // let i = dateCol !== -1 ? dateCol : yIndexes[0]?.index
        metadataElement.metadata = {
            groupBy: {
                index: columnIndexConfig.stringColumnIndex,
                currentLi: 0,
            },
            series: indices1,
            columnIndexConfig,
        };
    }

    this.getData = (rows) => {
        let newRows = rows ?? origRows;

        // TODO: console.log('set pivot table data as chart data for double groupbys')
        // OR: use legend column to find unique values and get bar height from that.
        // we might not need to use the pivot table data for charts
        // if (isDataAggregated) {
        //     return sortDataByDate(newRows, columns, 'asc');
        // }

        var data = newRows;
        if (numberIndices.length) {
            data = aggregateData({
                data: newRows,
                aggColIndex: columnIndexConfig.stringColumnIndex,
                columns: columns,
                numberIndices,
                dataFormatting: getDataFormatting(options.dataFormatting),
            });
        }

        return data;
    };

    this.updateColumns = (newColumns) => {
        // formatQueryColumns({columns})
        columns = newColumns;
        this.drawChart();
    };

    this.changeNumberColumnIndexConfig = (indices, indices2, newColumns) => {
        if (indices) {
            columnIndexConfig.numberColumnIndices = indices;
            columnIndexConfig.numberColumnIndex = indices[0];
        }

        if (indices2) {
            columnIndexConfig.numberColumnIndices2 = indices2;
            columnIndexConfig.numberColumnIndex2 = indices2[0];
        }

        if (newColumns) {
            this.updateColumns(newColumns);
        }

        this.drawChart();
    };

    this.changeStringColumnIndices = (index) => {
        if (columnIndexConfig.legendColumnIndex === index) {
            // console.log('do we need to use legend column index?')
            columnIndexConfig.legendColumnIndex = undefined;
        }

        if (typeof index === 'number') {
            columnIndexConfig.stringColumnIndex = index;
        } else if (Array.isArray(index) && index?.length) {
            const indices = index;
            columnIndexConfig.stringColumnIndex = indices[0];
        }

        this.drawChart();
    };

    this.data = this.getData();

    // Default starting size and position
    this.deltaX = 100;
    this.deltaY = 0;
    this.innerHeight = component.parentElement.clientHeight - 100;
    this.innerWidth = component.parentElement.clientWidth - 100;
    this.drawCount = 0;
    this.isScaled = false;

    this.toggleChartScale = () => {
        this.isScaled = !this.isScaled;
        this.drawChart();
    };

    const areLabelsRotated = (component, axis) => {
        return !!component?.select(`.autoql-vanilla-axis-${axis}.autoql-vanilla-axis-labels-rotated`)?.node?.();
    };

    const resetChartRedrawParams = () => {
        this.prevBottomLabelsRotated = undefined;
        this.prevTopLabelsRotated = undefined;
        this.bottomLabelsRotated = undefined;
        this.topLabelsRotated = undefined;
        this.drawCount = 0;
    };

    const onLegendClick = (label) => {
        const newColumns = cloneObject(columns)
        newColumns[label.column.index].isSeriesHidden = !label.column.isSeriesHidden
        this.updateColumns(newColumns)
    }

    const getLegendObject = () => {
        const location = getLegendLocation(columnIndexConfig.numberColumnIndices, type, options.legendLocation);
        const labels =
            getLegendLabels({
                isDataAggregated,
                columns,
                colorScales: this.colorScales,
                columnIndexConfig,
            }) ?? {};

        const hasSecondAxis = DOUBLE_AXIS_CHART_TYPES.includes(type);
        const title = getLegendTitleFromColumns({
            columnIndices: columnIndexConfig.numberColumnIndices,
            isDataAggregated,
            columns,
            hasSecondAxis,
        });

        return {
            ...labels,
            title,
            location,
            onLegendClick,
            orientation: location === 'bottom' ? 'horizontal' : 'vertical',
        };
    };

    this.isColumnIndexConfigValid = () => {
        return isColumnIndexConfigValid({
            columnIndexConfig,
            response: { data: queryJson },
            columns,
            displayType: type,
        });
    };

    this.drawChart = (firstDraw = true, redrawParams = {}) => {
        if (this.drawCount > 10) {
            console.warn('recursive drawChart was called over 10 times. Something is wrong.');
            return;
        }

        if (!this.isColumnIndexConfigValid()) {
            console.warn('Current column config is not valid for new axis selection. Resetting column config now...');
            // columnIndexConfig = getColumnIndexConfig({ response: { data: queryJson }, columns });
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
                .attr('width', this.outerWidth)
                .attr('height', this.outerHeight)
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

            this.colorScales = getColorScales({ ...columnIndexConfig });

            const params = {
                data: this.data,
                json: queryJson,
                columns,
                options,
                height: this.innerHeight ?? this.outerHeight,
                width: this.innerWidth ?? this.outerWidth,
                columnIndexConfig,
                visibleSeries: columnIndexConfig.numberColumnIndices.filter(index => !columns[index].isSeriesHidden),
                outerHeight: this.outerHeight,
                outerWidth: this.outerWidth,
                deltaX: this.deltaX,
                deltaY: this.deltaY,
                firstDraw,
                hasRowSelector,
                isScaled,
                colorScales: this.colorScales,
                legend: getLegendObject(),
                enableAxisDropdown: options.enableDynamicCharting && !isDataAggregated,
                toggleChartScale: this.toggleChartScale,
                changeNumberColumnIndices: this.changeNumberColumnIndexConfig,
                changeStringColumnIndices: this.changeStringColumnIndices,
                onDataFetching: this.onDataFetching,
                onNewData: this.onNewData,
                onDataFetchError: this.onDataFetchError,
                redraw: this.drawChart,
                ...redrawParams,
            };

            switch (type) {
                case 'column':
                    this.chartComponent = new ColumnChartNew(chartContentWrapper, params);
                    break;
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

            // This is used for a safety fallback in case of infinite recursion
            this.drawCount += 1;

            this.prevBottomLabelsRotated = this.bottomLabelsRotated;
            this.prevTopLabelsRotated = this.topLabelsRotated;
            this.bottomLabelsRotated = areLabelsRotated(chartContentWrapper, 'bottom');
            this.topLabelsRotated = areLabelsRotated(chartContentWrapper, 'top');

            const labelsRotatedOnSecondDraw =
                this.drawCount === 2 &&
                ((this.bottomLabelsRotated && !this.prevBottomLabelsRotated) ||
                    (this.topLabelsRotated && !this.prevTopLabelsRotated));

            if (firstDraw) {
                return this.drawChart(false);
            } else if (labelsRotatedOnSecondDraw) {
                this.drawChart(false, {
                    bottomLabelsRotated: this.bottomLabelsRotated,
                    topLabelsRotated: this.topLabelsRotated,
                });
            }
        } catch (error) {
            console.error(error);
        }

        chartContentWrapper.style('visibility', 'visible');

        refreshTooltips();
        refreshChartTooltips();
        resetChartRedrawParams();

        onUpdate(component);

        return;
    };

    this.onDataFetching = () => this.chartLoader?.setChartLoading(true);

    this.onNewData = (newJson) => {
        if (newJson?.data?.rows) {
            queryJson.data.rows = newJson.data.rows;
            queryJson.data.row_limit = newJson.data.row_limit;
            this.data = this.getData(newJson.data.rows);

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

    return this.svg?.node();
}
