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
    getChartColorVars,
    CHARTS_WITHOUT_AXES,
    getNumberColumnIndices,
} from 'autoql-fe-utils';

import { uuidv4, cloneObject } from '../Utils';
import { select } from 'd3-selection';
import { BarChartNew } from './ChataBarChartNew';
import { ChartLoader } from '../Charts/ChartLoader';
import { CSS_PREFIX } from '../Constants';
import { ColumnChartNew } from './ChataColumnChartNew';
import { LineChartNew } from './ChataLineChartNew';
import { refreshTooltips } from '../Tooltips';
import { getDeltas, getInnerDimensions } from './helpers';
import tippy from 'tippy.js';
import { HeatmapNew } from './ChataHeatmap';
import { BubbleChartNew } from './ChataBubbleChart';
import { PieChartNew } from './ChataPieChart';

export function ChataChartNew(
    component,
    { type = 'bar', queryJson, options = {}, onChartClick = () => {}, chartConfig = {} } = {},
) {
    const dataFormatting = getDataFormatting(options.dataFormatting);

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
            activeKey: undefined,
            tippyInstance: tippy('[data-tippy-chart]', {
                theme: 'chata-theme',
                delay: [300],
                allowHTML: true,
                dynamicTitle: true,
                maxWidth: 300,
                inertia: true,
            })
        };
    }

    var colorScales = getColorScales({ ...columnIndexConfig, CSS_PREFIX });

    this.getData = (rows) => {
        let newRows = rows ?? origRows ?? [];
        var data = newRows;

        if (type === 'pie') {
            return [...data].sort((aRow, bRow) => {
                const a = aRow[columnIndexConfig.numberColumnIndex] || 0;
                const b = bRow[columnIndexConfig.numberColumnIndex] || 0;
                return parseFloat(b) - parseFloat(a);
            });
        }

        if (isDataAggregated) {
            const sortedRows = sortDataByDate(newRows, columns, 'asc');
            try {
                // TODO: pass this data in from parent
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
                    dataFormatting,
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
                numberIndices: getNumberColumnIndices(columns).allNumberColumnIndices,
                dataFormatting,
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

        this.data = this.getData();

        this.drawChart();
    };

    this.data = this.getData();

    // Default starting size and position
    this.deltaX = 0;
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
                colorScales,
                columnIndexConfig,
                dataFormatting,
                data: this.data,
                type,
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
        if (metadataElement?.metadata) {
            metadataElement.metadata.tippyInstance?.destroy?.();

            metadataElement.metadata.tippyInstance = tippy('[data-tippy-chart]', {
                theme: 'chata-theme',
                delay: [0],
                allowHTML: true,
                dynamicTitle: true,
                maxWidth: 300,
                inertia: true,
            });
        }
    };

    this.isColumnIndexConfigValid = () => {
        return isColumnIndexConfigValid({
            columnIndexConfig,
            response: { data: queryJson },
            columns,
            displayType: type,
        });
    };

    this.didLabelsRotate = (chartContentWrapper) => {
        let labelsRotatedOnSecondDraw = false;
        if (type !== 'pie') {
            this.prevBottomLabelsRotated = this.bottomLabelsRotated;
            this.prevTopLabelsRotated = this.topLabelsRotated;
            this.bottomLabelsRotated = areLabelsRotated(chartContentWrapper, 'bottom');
            this.topLabelsRotated = areLabelsRotated(chartContentWrapper, 'top');

            labelsRotatedOnSecondDraw =
                this.drawCount === 2 &&
                ((this.bottomLabelsRotated && !this.prevBottomLabelsRotated) ||
                    (this.topLabelsRotated && !this.prevTopLabelsRotated));
        }

        return labelsRotatedOnSecondDraw;
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

            if (hasDrawnOnce && !CHARTS_WITHOUT_AXES.includes(type)) {
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

            colorScales = getColorScales({ ...columnIndexConfig, CSS_PREFIX });

            const chartColors = getChartColorVars(CSS_PREFIX) ?? {};
            
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
                legendColumn: queryJson?.data?.columns[columnIndexConfig?.legendColumnIndex],
                firstDraw,
                hasRowSelector,
                isScaled,
                colorScales,
                legend: getLegendObject(),
                enableAxisDropdown: options.enableDynamicCharting && !isDataAggregated,
                tippyInstance: this.tippyInstance,
                activeKey: metadataElement.metadata.activeKey,
                toggleChartScale: this.toggleChartScale,
                changeNumberColumnIndices: this.changeNumberColumnIndexConfig,
                changeStringColumnIndices: this.changeStringColumnIndices,
                onDataFetching: this.onDataFetching,
                onNewData: this.onNewData,
                onDataFetchError: this.onDataFetchError,
                redraw: this.drawChart,
                onChartClick,
                ...colorScales,
                ...chartColors,
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
                    this.chartComponent = new PieChartNew(chartContentWrapper, params);
                    break;
                case 'bubble':
                    this.chartComponent = new BubbleChartNew(chartContentWrapper, params);
                    break;
                case 'heatmap':
                    this.chartComponent = new HeatmapNew(chartContentWrapper, params);
                    break;
                case 'stacked_column':
                    this.chartComponent = new ColumnChartNew(chartContentWrapper, { ...params, stacked: true });
                    break;
                case 'stacked_bar':
                    this.chartComponent = new BarChartNew(chartContentWrapper, { ...params, stacked: true });
                    break;
                case 'stacked_line':
                    this.chartComponent = new LineChartNew(chartContentWrapper, { ...params, stacked: true });
                    break;
                default:
                    return null; // 'Unknown Display Type'
            }

            // This is used for a safety fallback in case of infinite recursion
            this.drawCount += 1;

            if (firstDraw && !CHARTS_WITHOUT_AXES.includes(type)) {
                return this.drawChart(false);
            } else if (this.didLabelsRotate(chartContentWrapper)) {
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
