import {
    isTableType,
    isChartType,
    formatElement,
    getAutoQLConfig,
    getDataFormatting,
    areAllColumnsHidden,
    getDefaultDisplayType,
    transformQueryResponse,
    getSupportedDisplayTypes,
} from 'autoql-fe-utils';

import { uuidv4, checkAndApplyTheme, createIcon } from '../Utils';

import { strings } from '../Strings';
import { WARNING_TRIANGLE } from '../Svg';
import { ChataUtils } from '../ChataUtils';
import { ChataChartNew } from '../NewCharts';
import { ChataTable, ChataPivotTable } from '../ChataTable';

import './QueryOutput.scss';

const isQueryResponseTransformed = (response) => {
    return response?.isDrilldown !== undefined;
};

export function QueryOutput(selector, options = {}) {
    try {
        checkAndApplyTheme();

        const PARENT = document.querySelector(selector);
        PARENT.innerHTML = '';

        const ALLOW_NUMERIC_STRING_COLUMNS = true;
        const uuid = uuidv4();

        var responseRenderer = document.createElement('div');

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
            enableDynamicCharting: true,
            queryResponse: null,
            autoChartAggregations: true,
        };

        for (var [key, value] of Object.entries(options)) {
            responseRenderer.options[key] = value;

            if (key === 'queryResponse') {
                try {
                    if (!isQueryResponseTransformed(value)) {
                        const transformedResponse = transformQueryResponse({ data: value }).data;
                        responseRenderer.options[key] = transformedResponse;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }

        if (responseRenderer.options.queryResponse) {
            responseRenderer.options.pageSize = options.queryResponse?.data?.fe_req?.page_size;
        }

        responseRenderer.classList.add('autoql-vanilla-chata-response-content-container');
        responseRenderer.classList.add('autoql-vanilla-renderer-container');
        responseRenderer.setAttribute('data-componentid', uuidv4());

        responseRenderer.setObjectProp = (key, _obj) => {
            for (var [keyValue, value] of Object.entries(_obj)) {
                responseRenderer.options[key][keyValue] = value;
            }
        };

        responseRenderer.dispatchResizeEvent = () => {
            window.dispatchEvent(new CustomEvent('chata-resize', {}));
        };

        window.addEventListener('resize', responseRenderer.dispatchResizeEvent);

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

        responseRenderer.onChartClick = (data, jsonResponse) => {
            const drilldownData = {
                ...data,
                queryID: jsonResponse?.data?.query_id,
                jsonResponse,
            };

            responseRenderer.options?.onDataClick?.(drilldownData);
        };

        responseRenderer.onCellClick = async (data) => {
            const json = ChataUtils.responses[uuid];

            const drilldownData = {
                ...data,
                queryID: json?.data?.query_id,
            };

            responseRenderer.options?.onDataClick?.(drilldownData);
        };

        responseRenderer.renderAllColumnsHiddenMessage = () => {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('autoql-vanilla-no-columns-error-message');

            try {
                const messageIcon = createIcon(WARNING_TRIANGLE);
                messageIcon.classList.add('autoql-vanilla-warning-icon');

                const message = document.createElement('span');
                message.innerHTML = strings.allColsHidden;

                messageWrapper.appendChild(messageIcon);
                messageWrapper.appendChild(message);
            } catch (error) {
                console.error(error);
            }

            responseRenderer.appendChild(messageWrapper);
        };

        responseRenderer.renderTable = (jsonResponse, displayType = 'table') => {
            var totalRows = jsonResponse.data.count_rows;
            var initialRows = jsonResponse.data.rows.length;

            const tableContainer = document.createElement('div');
            tableContainer.classList.add('autoql-vanilla-chata-table-container');
            if (tableContainer.classList.contains('autoql-vanilla-chata-chart-container')) {
                tableContainer.classList.remove('autoql-vanilla-chata-chart-container');
            }

            const tableRowCount = document.createElement('div');
            tableRowCount.classList.add('autoql-vanilla-chata-table-row-count');
            tableRowCount.textContent = `${strings.scrolledText} ${initialRows} / ${totalRows} ${strings.rowsText}`;

            const scrollbox = document.createElement('div');
            scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');

            const tableWrapper = document.createElement('div');
            tableWrapper.setAttribute('data-componentid', uuid);
            tableWrapper.classList.add('autoql-vanilla-chata-table');

            tableContainer.appendChild(tableWrapper);
            scrollbox.appendChild(tableContainer);

            if (displayType === 'table') {
                tableContainer.appendChild(tableRowCount);
            }

            responseRenderer.appendChild(scrollbox);

            var visibleRowCount = initialRows;
            var useInfiniteScroll = true;
            var tableParams = responseRenderer.tableParams ?? {
                queryJson: jsonResponse,
                sort: undefined,
                filter: undefined,
            };

            if (displayType === 'table') {
                var table = new ChataTable(
                    uuid,
                    responseRenderer.options,
                    (data) => responseRenderer.onCellClick(data),
                    useInfiniteScroll,
                    tableParams,
                    (response, params) => {
                        if (response?.data) {
                            ChataUtils.responses[uuid] = response.data;
                        }

                        if (params) {
                            responseRenderer.tableParams = {
                                ...tableParams,
                                ...params,
                            };
                        }

                        table.element.onNewPage({ chartsVisibleCount: visibleRowCount });
                    },
                );
            } else if (displayType === 'pivot_table') {
                var table = new ChataPivotTable(uuid, responseRenderer.options, (data) =>
                    responseRenderer.onCellClick(data),
                );
            }

            select(window).on('chata-resize.' + uuid, null);
        };

        responseRenderer.renderChart = (jsonResponse, displayType) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.classList.add('autoql-vanilla-chart-wrapper-queryoutput');
            responseRenderer.chartWrapper = chartWrapper;
            responseRenderer.appendChild(chartWrapper);

            new ChataChartNew(chartWrapper, {
                type: displayType,
                queryJson: jsonResponse,
                options: responseRenderer.options,
                onChartClick: (data) => responseRenderer.onChartClick(data, jsonResponse),
            });
        };

        responseRenderer.getDisplayType = () => {
            const jsonResponse = responseRenderer.options.queryResponse;

            const supportedDisplayTypes = getSupportedDisplayTypes({
                response: { data: jsonResponse },
                allowNumericStringColumns: ALLOW_NUMERIC_STRING_COLUMNS,
            });

            let displayType = responseRenderer.options.displayType;

            if (!supportedDisplayTypes.includes(displayType)) {
                const defaultDisplayType = getDefaultDisplayType({ data: jsonResponse });
                console.warn(
                    `Display type provided is invalid: ${displayType}. Using default display type ${defaultDisplayType} instead`,
                );

                displayType = defaultDisplayType;
            }

            return displayType;
        };

        responseRenderer.renderSingleValueResponse = async (jsonResponse) => {
            const responseContainer = document.createElement('div');
            responseContainer.classList.add('autoql-vanilla-single-value-response-flex-container');

            const responseWrapper = document.createElement('div');
            responseWrapper.classList.add('autoql-vanilla-single-value-response-container');

            const clickableResponse = document.createElement('a');
            clickableResponse.classList.add('autoql-vanilla-single-value-response');

            if (getAutoQLConfig(responseRenderer.options?.autoQLConfig).enableDrilldowns) {
                clickableResponse.classList.add('with-drilldown');
                clickableResponse.addEventListener('click', () => {
                    responseRenderer.options?.onDataClick?.({
                        groupBys: [],
                        queryID: jsonResponse.data.query_id,
                        supportedByAPI: true,
                    });
                });
            }

            const dataValue = formatElement({
                element: jsonResponse.data.rows[0]?.[0] ?? 0,
                column: jsonResponse.data.columns?.[0],
                config: getDataFormatting(responseRenderer.options?.dataFormatting),
            });

            const responseText = document.createElement('span');
            if (responseRenderer.options?.showSingleValueResponseTitle) {
                responseText.innerHTML = `<span><strong>${responseRenderer.data?.columns?.[0]?.display_name}:</strong> ${dataValue}</span>`;
            } else {
                responseText.innerHTML = `<span>${dataValue}</span>`;
            }

            clickableResponse.appendChild(responseText);
            responseWrapper.appendChild(clickableResponse);
            responseContainer.appendChild(responseWrapper);
            responseRenderer.appendChild(responseContainer);
        };

        responseRenderer.refreshView = () => {
            var jsonResponse = responseRenderer.options.queryResponse;
            if (!jsonResponse) return;

            responseRenderer.innerHTML = '';
            responseRenderer.clearMetadata();

            ChataUtils.responses[uuid] = jsonResponse;

            const displayType = responseRenderer.getDisplayType();

            if (displayType === 'single-value') {
                responseRenderer.renderSingleValueResponse(jsonResponse);
            } else if (areAllColumnsHidden(jsonResponse?.data?.columns)) {
                responseRenderer.renderAllColumnsHiddenMessage();
            } else if (isTableType(displayType)) {
                responseRenderer.renderTable(jsonResponse, displayType);
            } else if (isChartType(displayType)) {
                responseRenderer.renderChart(jsonResponse, displayType);
            } else {
                responseRenderer.innerHTML = `
                    <div>
                        Error: There was no data supplied for this table
                    </div>
                `;
            }

            responseRenderer.dispatchResizeEvent();
        };

        try {
            PARENT.appendChild(responseRenderer);
            responseRenderer.refreshView();
        } catch (error) {
            console.error(error);
        }

        return responseRenderer;
    } catch (error) {
        console.error(error);
    }
}
