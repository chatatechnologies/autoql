import {
    getClickedData,
    getNumberOfGroupables,
    getGroupables,
    uuidv4,
    cloneObject,
    getSupportedDisplayTypes,
    createTableContainer,
    formatData,
    mergeOptions,
    checkAndApplyTheme,
} from '../Utils';
import {
    createAreaChart,
    createBarChart,
    createBubbleChart,
    createColumnChart,
    createHeatmap,
    createLineChart,
    createPieChart,
    createStackedBarChart,
    createStackedColumnChart,
} from '../Charts';
import { ChataTable, ChataPivotTable } from '../ChataTable';
import { ChataUtils } from '../ChataUtils';

export function QueryOutput(selector, options = {}) {
    checkAndApplyTheme();

    const PARENT = document.querySelector(selector);
    var responseRenderer = document.createElement('div');
    const uuid = uuidv4();
    responseRenderer.options = {
        supportsSuggestions: true,
        onSuggestionClick: function () {},
        onDataClick: () => {},
        tableBorderColor: undefined,
        tableHoverColor: undefined,
        displayType: undefined,
        renderTooltips: true,
        dataFormatting: {
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 1,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'MMM D, YYYY',
        },
        themeConfig: {
            theme: 'light',
            chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
            accentColor: undefined,
            fontFamily: 'sans-serif',
        },
        enableDynamicCharting: true,
        queryResponse: null,
        autoChartAggregations: true,
    };

    for (var [key, value] of Object.entries(options)) {
        responseRenderer.options[key] = value;
    }
    responseRenderer.classList.add('autoql-vanilla-chata-response-content-container');
    responseRenderer.classList.add('autoql-vanilla-renderer-container');
    responseRenderer.style.setProperty('--chata-drawer-font-family', responseRenderer.options.themeConfig.fontFamily);
    responseRenderer.setAttribute('data-componentid', uuidv4());
    var applyTableStyles = function () {
        var css = '';
        var style = document.createElement('style');
        if (responseRenderer.options.tableBorderColor !== undefined) {
            css += `.renderer-table tr{ border-color: ${responseRenderer.options.tableBorderColor}; }`;
        }
        if (responseRenderer.options.tableHoverColor !== undefined) {
            css += `.renderer-table tr:hover{ background-color: ${responseRenderer.options.tableHoverColor}; }`;
        }
        style.appendChild(document.createTextNode(css));
        document.getElementsByTagName('head')[0].appendChild(style);
    };
    applyTableStyles();

    responseRenderer.setObjectProp = (key, _obj) => {
        for (var [keyValue, value] of Object.entries(_obj)) {
            responseRenderer.options[key][keyValue] = value;
        }
    };

    responseRenderer.setOption = (option, value) => {
        switch (option) {
            case 'dataFormatting':
                responseRenderer.setObjectProp('dataFormatting', value);
                break;
            default:
                responseRenderer.options[option] = value;
        }
    };

    responseRenderer.clearMetadata = () => {
        responseRenderer.metadata = null;
    };

    responseRenderer.refreshView = () => {
        var jsonResponse = responseRenderer.options.queryResponse;
        const { autoChartAggregations } = responseRenderer.options;
        if (!jsonResponse) return;
        var chataBarContainer = responseRenderer.chataBarContainer;
        var groupables = getGroupables(jsonResponse);
        responseRenderer.clearMetadata();
        ChataUtils.responses[uuid] = jsonResponse;
        if (!jsonResponse) return;
        let displayType;
        var sup = getSupportedDisplayTypes(jsonResponse);
        var chartWrapper = document.createElement('div');
        if (sup.includes(responseRenderer.options.displayType)) {
            displayType = responseRenderer.options.displayType;
            if (groupables.length === 1 && autoChartAggregations) {
                displayType = 'column';
            }

            if (groupables.length === 2 && autoChartAggregations) {
                displayType = 'stacked_column';
            }
        } else {
            displayType = 'table';
        }

        switch (displayType) {
            case 'table':
                var div = createTableContainer();
                responseRenderer.appendChild(div);
                var scrollbox = document.createElement('div');
                scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
                scrollbox.appendChild(div);
                responseRenderer.appendChild(scrollbox);
                if (jsonResponse['data']['columns'].length == 1) {
                    var data = formatData(
                        jsonResponse['data'],
                        jsonResponse['data']['columns'][0],
                        responseRenderer.options,
                    );
                    responseRenderer.innerHTML = `<div>${data}</div>`;
                } else {
                    var table = new ChataTable(uuid, opts, chataBarContainer.onRowClick);
                    div.tabulator = table;
                }
                break;
            case 'pivot_table':
                var opts = mergeOptions([chataBarContainer.options, responseRenderer.options]);
                var d = createTableContainer();
                responseRenderer.appendChild(d);
                var s = document.createElement('div');
                s.classList.add('autoql-vanilla-chata-table-scrollbox');
                scrollbox.appendChild(d);
                responseRenderer.appendChild(scrollbox);
                var t = new ChataPivotTable(uuid, opts, chataBarContainer.onCellClick);
                div.tabulator = t;
                break;
            case 'line':
                responseRenderer.appendChild(chartWrapper);
                createLineChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-chartrenderer',
                );
                break;
            case 'bar':
                responseRenderer.appendChild(chartWrapper);
                createBarChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-chartrenderer',
                );
                break;
            case 'column':
                responseRenderer.appendChild(chartWrapper);
                createColumnChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-chartrenderer',
                );
                break;
            case 'heatmap':
                responseRenderer.appendChild(chartWrapper);
                createHeatmap(chartWrapper, jsonResponse, responseRenderer.options, false, 'data-chartrenderer');
                break;
            case 'bubble':
                responseRenderer.appendChild(chartWrapper);
                createBubbleChart(chartWrapper, jsonResponse, responseRenderer.options, false, 'data-chartrenderer');
                break;
            case 'help':
                responseRenderer.innerHTML = ChataUtils.createHelpContent(jsonResponse['data']['rows'][0]);
                break;
            case 'stacked_bar':
                responseRenderer.appendChild(chartWrapper);
                createStackedBarChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-stackedchartindex',
                );
                break;
            case 'stacked_column':
                responseRenderer.appendChild(chartWrapper);
                createStackedColumnChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-stackedchartindex',
                );
                break;
            case 'stacked_line':
                responseRenderer.appendChild(chartWrapper);
                createAreaChart(
                    chartWrapper,
                    jsonResponse,
                    responseRenderer.options,
                    () => {},
                    false,
                    'data-stackedchartindex',
                );
                break;
            case 'pie':
                responseRenderer.appendChild(chartWrapper);
                createPieChart(chartWrapper, jsonResponse, responseRenderer.options, false, 'data-chartrenderer', true);
                break;
            default:
                responseRenderer.innerHTML = `
                    <div>
                        Error: There was no data supplied for this table
                    </div>
                `;
        }
    };

    responseRenderer.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-chartrenderer')) {
            if (responseRenderer.chataBarContainer.options.autoQLConfig.enableDrilldowns) {
                var json = ChataUtils.responses[uuid];
                var queryId = json['data']['query_id'];
                var indexData = e.target.dataset.chartrenderer;
                var colValue = e.target.dataset.colvalue1;
                var indexValue = e.target.dataset.filterindex;
                var clickedData = getClickedData(json, ...json['data']['rows'][indexData]);

                var groupableCount = getNumberOfGroupables(json['data']['columns']);
                if (groupableCount == 1 || groupableCount == 2) {
                    responseRenderer.chataBarContainer.sendDrilldownMessage(json, indexData);
                } else {
                    responseRenderer.chataBarContainer.sendDrilldownClientSide(json, indexValue, colValue);
                }
            }
            responseRenderer.options.onDataClick(clickedData, queryId);
        }

        if (e.target.hasAttribute('data-stackedchartindex')) {
            let json = cloneObject(ChataUtils.responses[uuid]);
            let queryId = json['data']['query_id'];

            var val1 = e.target.dataset.unformatvalue1;
            var val2 = e.target.dataset.unformatvalue2;
            var val3 = e.target.dataset.unformatvalue3;

            let clickedData = getClickedData(json, val1, val2, val3);
            json['data']['rows'][0][0] = val1;
            json['data']['rows'][0][1] = val2;
            json['data']['rows'][0][2] = val3;

            responseRenderer.chataBarContainer.sendDrilldownMessage(json, indexData);
            responseRenderer.options.onDataClick(clickedData, queryId);
        }

        if (e.target.classList.contains('autoql-vanilla-chata-suggestion-btn-renderer')) {
            var parent = e.target.parentElement.parentElement.parentElement;
            parent.chataBarContainer.sendMessageToResponseRenderer(e.target.textContent);
        }
    });

    PARENT.appendChild(responseRenderer);
    responseRenderer.refreshView();

    return responseRenderer;
}
