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
    sortDataByDate,
    generatePivotTableData,
    getPivotColumnIndexConfig,
} from 'autoql-fe-utils';

import { uuidv4, cloneObject } from '../Utils';
import { select } from 'd3-selection';
import { BarChartNew } from './ChataBarChartNew';
import { ChartLoader } from '../Charts/ChartLoader';
import { CSS_PREFIX } from '../Constants';
import { ColumnChartNew } from './ChataColumnChartNew';
import { LineChartNew } from './ChataLineChartNew';
import { refreshTooltips } from '../Tooltips';
import tippy from 'tippy.js';
import { getDeltas, getInnerDimensions } from './helpers';
import { StackedColumnChartNew } from './ChataStackedColumnChartNew';

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

    var columnIndexConfig =
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
        var data = newRows;

        if (isDataAggregated) {
            const sortedRows =  sortDataByDate(newRows, columns, 'asc');
            try {
                const {
                    legendColumnIndex,
                    pivotColumnHeaders,
                    pivotRowHeaders,
                    pivotTableColumns,
                    pivotTableData,
                    stringColumnIndex,
                } = generatePivotTableData({
                    isFirstGeneration: !!this.chartComponent,
                    rows: sortedRows,
                    columns,
                    tableConfig: columnIndexConfig,
                    dataFormatting: options.dataFormatting,
                });

                let pivotColumnIndexConfig = {
                    stringColumnIndex,
                    legendColumnIndex,
                };

                // TODO: do we need these for anything? Drilldowns specifically
                this.pivotRowHeaders = pivotRowHeaders;
                this.pivotColumnHeaders = pivotColumnHeaders;

                columnIndexConfig = getPivotColumnIndexConfig({
                    pivotTableColumns,
                    columnIndexConfig: pivotColumnIndexConfig,
                    isFirstGeneration: !!this.chartComponent,
                    response: queryJson,
                });

                data = pivotTableData;
                columns = pivotTableColumns;
            } catch (error) {
                console.error(error);
            }
        } else if (numberIndices.length) {
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
        const newColumns = cloneObject(columns);
        newColumns[label.column.index].isSeriesHidden = !label.column.isSeriesHidden;
        this.updateColumns(newColumns);
    };

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

    const refreshChartTooltips = () => {
        this.tippyInstance?.destroy?.();

        this.tippyInstance = tippy('[data-tippy-chart]', {
            theme: 'chata-theme',
            delay: [0],
            allowHTML: true,
            dynamicTitle: true,
            maxWidth: 300,
            inertia: true,
        });
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
                visibleSeries: columnIndexConfig.numberColumnIndices.filter((index) => !columns[index].isSeriesHidden),
                outerHeight: this.outerHeight,
                outerWidth: this.outerWidth,
                deltaX: this.deltaX,
                deltaY: this.deltaY,
                legendColumn: columns[columnIndexConfig?.legendColumnIndex],
                firstDraw,
                hasRowSelector,
                isScaled,
                colorScales: this.colorScales,
                legend: getLegendObject(),
                enableAxisDropdown: options.enableDynamicCharting && !isDataAggregated,
                tippyInstance: this.tippyInstance,
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
                    this.chartComponent = new LineChartNew(chartContentWrapper, params);
                    break;
                case 'pie':
                    return null;
                case 'bubble':
                    return null;
                case 'heatmap':
                    return null;
                case 'stacked_column':
                    this.chartComponent = new StackedColumnChartNew(chartContentWrapper, params);
                    break;
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

        resetChartRedrawParams();
        refreshChartTooltips();
        refreshTooltips();

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
