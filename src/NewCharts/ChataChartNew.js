import {
    aggregateData,
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
    getAggConfig,
    formatQueryColumns,
    CHARTS_WITHOUT_AGGREGATED_DATA,
    DisplayTypes,
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
import { Scatterplot } from './ChataScatterplot';
import { Histogram } from './ChataHistogram';

import '../Charts/ChataChart.scss';

export function ChataChartNew(component, { type = 'bar', queryJson, options = {}, onChartClick = () => {} } = {}) {
    if (!component || !queryJson) {
        console.warn('Unable to create chart - one of the following parameters were not supplied:', {
            component: !!component,
            queryJson: !!queryJson,
        });
        return;
    }

    const CHART_ID = uuidv4();
    const CHART_SVG_CLASS = 'autoql-vanilla-chart-svg';
    const CHART_CONTAINER_CLASS = 'autoql-vanilla-chart-content-container';
    const FONT_SIZE = 12;

    const origRows = queryJson?.data?.rows;
    const dataFormatting = getDataFormatting(options.dataFormatting);

    var columns = formatQueryColumns({
        columns: queryJson?.data?.columns,
        aggConfig: component.aggConfig,
        queryResponse: { data: queryJson },
        dataFormatting,
    });

    if (!origRows?.length || !columns?.length) {
        return null;
    }

    this.isColumnIndexConfigValid = () => {
        return isColumnIndexConfigValid({
            columnIndexConfig: component.columnIndexConfig,
            response: { data: queryJson },
            columns,
            displayType: type,
        });
    };

    this.getColumnIndexConfig = (currentConfig) => {
        return getColumnIndexConfig({
            response: { data: queryJson },
            columns,
            currentTableConfig: currentConfig,
            allowNumericalOrdinalAxis: true,
        });
    };


    this.getColorScales = () => getColorScales({ ...this.columnIndexConfig, data: this.data, type, CSS_PREFIX });

    this.setColumns = (newColumns) => {
        columns = newColumns;
    };

    this.getData = (rows) => {
        const rowData = rows ?? origRows ?? [];

        if (!rowData?.length || !columns?.length) {
            return;
        }

        if (isDataAggregated) {
            const sortedRows = sortDataByDate(rowData, columns, 'asc');

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
                    tableConfig: this.columnIndexConfig,
                    dataFormatting,
                });

                let pivotColumnIndexConfig = {
                    stringColumnIndex,
                    legendColumnIndex,
                };

                // TODO: do we need these for anything? Drilldowns specifically
                this.pivotRowHeaders = pivotRowHeaders;
                this.pivotColumnHeaders = pivotColumnHeaders;

                this.columnIndexConfig = getPivotColumnIndexConfig({
                    pivotTableColumns,
                    columnIndexConfig: pivotColumnIndexConfig,
                    isFirstGeneration: !!this.chartComponent,
                    response: queryJson,
                });

                this.setColumns(pivotTableColumns);

                return pivotTableData;
            } catch (error) {
                console.error(error);
            }
        } else if (!CHARTS_WITHOUT_AGGREGATED_DATA.includes(type) && numberIndices.length) {
            let maxElements;
            if (type === DisplayTypes.PIE) {
                maxElements = 10
            }

            return aggregateData({
                data: rowData,
                columns,
                numberIndices,
                dataFormatting,
                columnIndexConfig: this.columnIndexConfig,
                maxElements
            });
        }

        return rowData;
    };

    this.updateColumns = (newColumns) => {
        columns = newColumns;
        this.drawChart();
    };

    this.changeNumberColumnIndexConfig = (indices, indices2, newColumns) => {
        const newConfig = cloneObject(this.columnIndexConfig);

        if (indices) {
            newConfig.numberColumnIndices = indices;
            newConfig.numberColumnIndex = indices[0];
        }

        if (indices2) {
            newConfig.numberColumnIndices2 = indices2;
            newConfig.numberColumnIndex2 = indices2[0];
        }

        if (!this.isColumnIndexConfigValid(newConfig)) {
            console.warn('Column index config selected was not valid:', newConfig);
            return;
        }

        this.columnIndexConfig = newConfig;
        component.columnIndexConfig = newConfig;

        if (newColumns) {
            columns = newColumns;
            component.aggConfig = getAggConfig(columns);
        }

        if (type === DisplayTypes.PIE) {
            this.legendLabels = undefined
        }

        this.data = this.getData();

        this.drawChart();
    };

    this.changeStringColumnIndices = (index) => {
        if (this.columnIndexConfig.legendColumnIndex === index) {
            this.columnIndexConfig.legendColumnIndex = undefined;
        }

        if (typeof index === 'number') {
            this.columnIndexConfig.stringColumnIndex = index;
        } else if (Array.isArray(index) && index?.length) {
            const indices = index;
            this.columnIndexConfig.stringColumnIndex = indices[0];
        }

        if (type === DisplayTypes.PIE) {
            this.legendLabels = undefined
        }

        component.columnIndexConfig = this.columnIndexConfig

        this.data = this.getData();

        this.drawChart();
    };

    this.toggleChartScale = () => {
        component.isChartScaled = !component.isChartScaled;
        this.drawChart();
    };

    this.areLabelsRotated = (component, axis) => {
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
        if (type === DisplayTypes.PIE) {
            const labels = this.legendLabels?.labels;
            if (labels?.[label?.dataIndex]) {
                labels[label.dataIndex].hidden = !labels[label.dataIndex].hidden;
                this.drawChart();
            }
        } else {
            const newColumns = cloneObject(columns);
            newColumns[label.column.index].isSeriesHidden = !label.column.isSeriesHidden;
            this.updateColumns(newColumns);
        }
    };

    const getLegendLabelsForChart = () => {
        if (type === DisplayTypes.PIE && this.legendLabels) {
            return this.legendLabels
        }

        const labels =
            getLegendLabels({
                isDataAggregated,
                columns,
                colorScales: this.getColorScales(),
                columnIndexConfig: this.columnIndexConfig,
                dataFormatting,
                data: this.data,
                type,
            }) ?? [];
        
            this.legendLabels = labels

        return labels;
    };

    this.getLegendObject = () => {
        const location = getLegendLocation(this.columnIndexConfig.numberColumnIndices, type, options.legendLocation);
        const labels = getLegendLabelsForChart();
        const hasSecondAxis = DOUBLE_AXIS_CHART_TYPES.includes(type);
        const title = getLegendTitleFromColumns({
            columnIndices: this.columnIndexConfig.numberColumnIndices,
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
                zIndex: 99999999,
            });
        }
    };

    this.isColumnIndexConfigValid = (newConfig) => {
        if (!this.columnIndexConfig) {
            return false
        }

        return isColumnIndexConfigValid({
            columnIndexConfig: newConfig ?? this.columnIndexConfig,
            response: { data: queryJson },
            columns,
            displayType: type,
        });
    };

    this.setLabelRotationValues = (chartContentWrapper) => {
        this.prevBottomLabelsRotated = this.bottomLabelsRotated;
        this.prevTopLabelsRotated = this.topLabelsRotated;

        const bottomLabelsRotated = this.areLabelsRotated(chartContentWrapper, 'bottom');
        const topLabelsRotated = this.areLabelsRotated(chartContentWrapper, 'top');

        this.bottomLabelsRotated = bottomLabelsRotated;
        this.topLabelsRotated = topLabelsRotated;

        return { bottomLabelsRotated, topLabelsRotated };
    };

    this.didLabelsRotateOnSecondDraw = () => {
        let labelsRotatedOnSecondDraw = false;

        labelsRotatedOnSecondDraw =
            this.drawCount === 2 &&
            ((this.bottomLabelsRotated && !this.prevBottomLabelsRotated) ||
                (this.topLabelsRotated && !this.prevTopLabelsRotated));

        return labelsRotatedOnSecondDraw;
    };

    this.drawChart = (firstDraw = true) => {
        if (this.drawCount > 10) {
            console.warn('recursive drawChart was called over 10 times. Something is wrong.');
            return;
        }

        if (!this.isColumnIndexConfigValid()) {
            console.warn(
                'Current column config is not valid for new axis selection. Resetting config to default in order to draw the chart.',
            );
            this.columnIndexConfig = this.getColumnIndexConfig(this.columnIndexConfig);
        }

        const hasDrawnOnce = !!this.chartComponent;

        try {
            this.outerHeight = this.svgWrapper?.node()?.clientHeight ?? component.clientHeight;
            this.outerWidth = this.svgWrapper?.node()?.clientWidth ?? component.clientWidth;

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

            this.svgWrapper?.remove();
            this.svgWrapper = this.chartWrapper.append('div').attr('class', 'autoql-vanilla-chart-svg-wrapper');

            this.svg = this.svgWrapper
                .append('svg')
                .attr('id', CHART_ID)
                .attr('class', CHART_SVG_CLASS)
                .attr('width', this.outerWidth)
                .attr('height', this.outerHeight)
                .style('font-size', FONT_SIZE)
                .style('font-family', 'var(--autoql-vanilla-font-family)')
                .style('color', 'var(--autoql-vanilla-text-color-primary)')
                .style('stroke', 'var(--autoql-vanilla-text-color-primary)')
                .style('background', 'var(--autoql-vanilla-background-color-secondary)');

            var chartContentWrapper = this.svg
                .append('g')
                .attr('class', CHART_CONTAINER_CLASS)
                .attr('transform', `translate(${this.deltaX}, ${this.deltaY})`)
                .style('opacity', 0);

            const chartColors = getChartColorVars(CSS_PREFIX) ?? {};

            const aggregated = !CHARTS_WITHOUT_AGGREGATED_DATA.includes(type);
            const legend = this.getLegendObject()
            const colorScales = this.getColorScales()

            const params = {
                data: this.data,
                json: queryJson,
                columns,
                options,
                height: this.innerHeight ?? this.outerHeight,
                width: this.innerWidth ?? this.outerWidth,
                columnIndexConfig: this.columnIndexConfig,
                aggConfig,
                aggregated,
                visibleSeries: this.columnIndexConfig.numberColumnIndices.filter(
                    (index) => !columns?.[index]?.isSeriesHidden,
                ),
                visibleSeries2: this.columnIndexConfig.numberColumnIndices2?.filter(
                    (index) => !columns?.[index]?.isSeriesHidden,
                ),
                outerHeight: this.outerHeight,
                outerWidth: this.outerWidth,
                deltaX: this.deltaX,
                deltaY: this.deltaY,
                legendColumn: queryJson?.data?.columns[this.columnIndexConfig?.legendColumnIndex],
                firstDraw,
                hasRowSelector,
                isScaled: component.isChartScaled,
                colorScales,
                legend,
                enableAxisDropdown: options.enableDynamicCharting && !isDataAggregated,
                tippyInstance: this.tippyInstance,
                activeKey: component.activeKey,
                topLabelsRotated: this.topLabelsRotated,
                bottomLabelsRotated: this.bottomLabelsRotated,
                toggleChartScale: this.toggleChartScale,
                changeNumberColumnIndices: this.changeNumberColumnIndexConfig,
                changeStringColumnIndices: this.changeStringColumnIndices,
                onDataFetching: this.onDataFetching,
                onNewData: this.onNewData,
                onDataFetchError: this.onDataFetchError,
                redraw: this.drawChart,
                onChartClick,
                ...chartColors,
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
                case 'column_line':
                    this.chartComponent = new ColumnChartNew(chartContentWrapper, { ...params, columnLineCombo: true });
                    break;
                case 'scatterplot':
                    this.chartComponent = new Scatterplot(chartContentWrapper, params);
                    break;
                case 'histogram':
                    this.chartComponent = new Histogram(
                        chartContentWrapper,
                        {
                            ...params,
                            bucketConfig: component.bucketConfig,
                            onBucketSizeChange: (bucketConfig) => (component.bucketConfig = bucketConfig),
                        },
                        this.chartHeaderElement?.node(),
                    );
                    break;
                default:
                    return null; // 'Unknown Display Type'
            }

            // This is used for a safety fallback in case of infinite recursion
            this.drawCount += 1;

            if (CHARTS_WITHOUT_AXES.includes(type)) {
                // Do not redraw
            } else {
                try {
                    this.setLabelRotationValues(chartContentWrapper);
                } catch (error) {
                    console.error(error);
                }

                if (firstDraw) {
                    this.drawChart(false);
                } else if (this.didLabelsRotateOnSecondDraw()) {
                    // Labels rotated after seconds draw - redraw one last time
                    this.drawChart(false);
                }
            }
        } catch (error) {
            console.error(error);
        }

        chartContentWrapper.style('opacity', 1);

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

    const columnIndexConfigExists = !!component.columnIndexConfig;

    if (!columnIndexConfigExists || (columnIndexConfigExists && !this.isColumnIndexConfigValid())) {
        component.columnIndexConfig = this.getColumnIndexConfig();
    }

    if (!component.aggConfig) {
        component.aggConfig = getAggConfig(columns);
    }

    if (component.isChartScaled == undefined) {
        component.isChartScaled = DEFAULT_CHART_CONFIG.isScaled;
    }

    var metadataElement = component.parentElement.parentElement;

    // TODO: update send in index config directly instead of using the metadata component
    if (!metadataElement.metadata) {
        const columnIndexConfig = this.getColumnIndexConfig()
        metadataElement.metadata = {
            groupBy: {
                index: columnIndexConfig.stringColumnIndex,
                currentLi: 0,
            },
            series: indices1,
            columnIndexConfig,
            tippyInstance: tippy('[data-tippy-chart]', {
                theme: 'chata-theme',
                delay: [0],
                allowHTML: true,
                dynamicTitle: true,
                maxWidth: 300,
                zIndex: 99999999,
            }),
        };
    }

    this.columnIndexConfig = metadataElement.metadata.columnIndexConfig ?? this.getColumnIndexConfig();
    
    var aggConfig = component.aggConfig;

    const indices1 = this.columnIndexConfig.numberColumnIndices ?? [];
    const indices2 = DOUBLE_AXIS_CHART_TYPES.includes(type) ? this.columnIndexConfig.numberColumnIndices2 ?? [] : [];
    const numberIndices = [...indices1, ...indices2];
    const isDataAggregated = usePivotDataForChart({ data: queryJson });
    const hasRowSelector = options.pageSize < queryJson?.data?.count_rows;


    this.data = this.getData();

    // Default starting size and position
    this.deltaX = 0;
    this.deltaY = 0;
    this.innerHeight = Math.round(component.parentElement.clientHeight / 2);
    this.innerWidth = Math.round(component.parentElement.clientWidth / 2);
    this.drawCount = 0;

    // ----------- TODO move this outside of this component ----------------------
    select(component).select('*')?.remove();
    component.innerHTML = '';

    if (component.headerElement) {
        component.parentElement.parentElement.removeChild(component.headerElement);
        component.headerElement = null;
    }
    component.parentElement.classList.remove('chata-table-container');
    component.parentElement.classList.add('autoql-vanilla-chata-chart-container');
    component.parentElement.parentElement.classList.add('chata-hidden-scrollbox');
    // ----------------------------------------------------------------------------

    this.chartWrapper = select(component).append('div').attr('class', 'autoql-vanilla-chart-wrapper');

    this.chartLoader = new ChartLoader(this.chartWrapper.node());

    this.chartHeaderElement = this.chartWrapper.append('div').attr('class', 'autoql-vanilla-chart-header');

    this.drawChart();

    select(window).on('chata-resize.' + component.dataset.componentid, this.drawChart);

    return this.svg?.node();
}
