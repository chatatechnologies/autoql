import {
    exportCSV,
    isTableType,
    isChartType,
    formatElement,
    getAutoQLConfig,
    getDataFormatting,
    getAuthentication,
    areAllColumnsHidden,
    getDefaultDisplayType,
    transformQueryResponse,
    getSupportedDisplayTypes,
    GENERAL_QUERY_ERROR,
} from 'autoql-fe-utils';

import { select } from 'd3-selection';

import { uuidv4, checkAndApplyTheme, createIcon } from '../Utils';
import { AntdMessage } from '../Antd';
import { strings } from '../Strings';
import { ChataUtils } from '../ChataUtils';
import { ChataChart } from '../Charts';
import { SEARCH_ICON, WARNING_TRIANGLE } from '../Svg';
import { ChataTable, ChataPivotTable } from '../ChataTable';
import { QueryValidationMessage } from '../QueryValidationMessage';

import './QueryOutput.scss';
import { ErrorMessage } from '../ErrorMessage';

const isQueryResponseTransformed = (response) => {
    return response?.isDrilldown !== undefined;
};

export function QueryOutput(selector, options = {}) {
    try {
        checkAndApplyTheme();

        var responseRenderer = document.createElement('div');

        const PARENT = select(selector).node();
        if (PARENT) {
            PARENT.innerHTML = '';
        }

        const ALLOW_NUMERIC_STRING_COLUMNS = true;
        const uuid = uuidv4();
        responseRenderer.uuid = uuid;

        if (!PARENT) {
            return;
        }

        PARENT.appendChild(responseRenderer);

        responseRenderer.options = {
            supportsSuggestions: true,
            onSuggestionClick: function () {},
            onQueryValidationSubmit: undefined,
            onDataClick: () => {},
            tableBorderColor: undefined,
            tableHoverColor: undefined,
            displayType: undefined,
            renderTooltips: true,
            useInfiniteScroll: true,
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
                        try {
                            const transformedResponse = transformQueryResponse({ data: value }).data;
                            responseRenderer.options[key] = transformedResponse;
                        } catch (error) {
                            console.error(error);
                        }
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

        const responseRendererID = uuidv4();
        responseRenderer.setAttribute('data-componentid', responseRendererID);

        if (responseRenderer.options.height > 0) {
            responseRenderer.style.height = `${responseRenderer.options.height}px`;
        } else {
            responseRenderer.style.height = '400px';
        }

        if (responseRenderer.options.maxHeight > 0) {
            responseRenderer.style.maxHeight = `${responseRenderer.options.maxHeight}px`;
        } else {
            responseRenderer.style.maxHeight = '500px';
        }

        responseRenderer.setObjectProp = (key, _obj) => {
            for (var [keyValue, value] of Object.entries(_obj)) {
                responseRenderer.options[key][keyValue] = value;
            }
        };

        responseRenderer.dispatchResizeEvent = () => {
            window.dispatchEvent(new CustomEvent(`chata-resize-${uuid}`, {}));
        };

        responseRenderer.setOption = (option, value) => {
            switch (option) {
                case 'dataFormatting':
                    responseRenderer.setObjectProp('dataFormatting', value);
                    break;
                case 'queryResponse':
                    responseRenderer.options[option] = value;
                    try {
                        if (!isQueryResponseTransformed(value)) {
                            const transformedResponse = transformQueryResponse({ data: value }).data;
                            responseRenderer.options[key] = transformedResponse;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                    break;
                default:
                    responseRenderer.options[option] = value;
            }

            responseRenderer.refreshView();
        };

        responseRenderer.clearMetadata = () => {
            responseRenderer.metadata = null;
        };

        responseRenderer.onChartClick = (data = {}, jsonResponse) => {
            const drilldownData = {
                ...data,
                queryID: responseRenderer.options.queryResponse?.data?.query_id,
                jsonResponse,
            };

            responseRenderer.options?.onDataClick?.(drilldownData);
        };

        responseRenderer.onCellClick = async (data) => {
            const drilldownData = {
                ...data,
                queryID: responseRenderer.options.queryResponse?.data?.query_id,
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

        responseRenderer.getQuery = () => {
            return responseRenderer.options?.queryResponse?.data?.text;
        };

        responseRenderer.exportToPNG = () => {
            ChataUtils.exportPNGHandler(responseRendererID);
        };

        responseRenderer.copyTableToClipboard = () => {
            responseRenderer?.table?.copyToClipboard('active', true);
            new AntdMessage(strings.copyTextToClipboard, 3000);
        };

        responseRenderer.downloadCSV = async (showSuccessMessage) => {
            try {
                const response = await exportCSV({
                    ...getAuthentication(options.authentication),
                    queryId: responseRenderer.options.queryResponse?.data?.query_id,
                    csvProgressCallback: (progress) => {},
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'export.csv');
                document.body.appendChild(link);
                link.click();

                const exportLimit = parseInt(response?.headers?.export_limit);
                const limitReached = response?.headers?.limit_reached?.toLowerCase() == 'true' ? true : false;

                if (showSuccessMessage) {
                    if (limitReached) {
                        new AntdMessage(
                            `${strings.downloadedCSVWarning} ${exportLimit}
                            MB. ${strings.partialCSVDataWarning}`,
                            3000,
                        );
                    } else {
                        new AntdMessage(strings.downloadedCSVSuccessully, 3000);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        responseRenderer.reportProblem = () => {
            ChataUtils.openModalReport(uuid, responseRenderer.options);
        };

        responseRenderer.toggleTableFiltering = () => {
            if (responseRenderer?.table) {
                responseRenderer?.table.toggleFilters();
            }
        };

        responseRenderer.renderTable = (jsonResponse, displayType = 'table') => {
            const tableContainer = document.createElement('div');

            tableContainer.classList.add('autoql-vanilla-chata-table-container');
            if (tableContainer.classList.contains('autoql-vanilla-chata-chart-container')) {
                tableContainer.classList.remove('autoql-vanilla-chata-chart-container');
            }

            const scrollbox = document.createElement('div');
            scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');

            const tableWrapper = document.createElement('div');
            tableWrapper.setAttribute('data-componentid', uuid);
            tableWrapper.classList.add('autoql-vanilla-chata-table');

            tableContainer.appendChild(tableWrapper);
            scrollbox.appendChild(tableContainer);

            responseRenderer.appendChild(scrollbox);

            // var visibleRowCount = initialRows;
            var useInfiniteScroll = responseRenderer.options.useInfiniteScroll;

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

                        // table.element?.onNewPage?.({ chartsVisibleCount: visibleRowCount });
                    },
                    options?.onDataLoaded,
                );
            } else if (displayType === 'pivot_table') {
                var table = new ChataPivotTable(uuid, responseRenderer.options, (data) =>
                    responseRenderer.onCellClick(data),
                );
            }

            responseRenderer.table = table;
        };

        responseRenderer.renderChart = (jsonResponse, displayType) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.classList.add('autoql-vanilla-chart-wrapper-queryoutput');
            responseRenderer.chartWrapper = chartWrapper;
            responseRenderer.appendChild(chartWrapper);

            const chart = new ChataChart(chartWrapper, {
                uuid,
                type: displayType,
                queryJson: jsonResponse,
                options: responseRenderer.options,
                onChartClick: (data) => responseRenderer.onChartClick(data, jsonResponse),
            });
            responseRenderer.chart = chart;
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

        responseRenderer.renderFeedbackMessage = () => {
            responseRenderer.innerHTML = strings.feedback;
        };

        responseRenderer.renderSuggestionResponse = (jsonResponse) => {
            const suggestions = jsonResponse?.data?.items;

            if (!suggestions) {
                return;
            }

            const suggestionsContainer = document.createElement('div');
            const suggestionMessage = document.createElement('p');
            suggestionMessage.innerHTML = strings.suggestionResponse;

            suggestionsContainer.appendChild(suggestionMessage);
            responseRenderer.appendChild(suggestionsContainer);

            suggestions.forEach((suggestion, i) => {
                const suggestionContainer = document.createElement('div');
                const suggestionButton = document.createElement('button');

                suggestionButton.classList.add('autoql-vanilla-chata-suggestion-btn');
                suggestionButton.textContent = suggestion;
                suggestionContainer.appendChild(suggestionButton);
                suggestionButton.onclick = async (e) => {
                    responseRenderer.options?.onSuggestionClick?.(suggestion);

                    if (suggestion === 'None of these') {
                        responseRenderer.renderFeedbackMessage();
                    }
                };

                suggestionsContainer.appendChild(suggestionContainer);
            });
        };

        responseRenderer.renderValidationResponse = (jsonResponse) => {
            const validationMessage = new QueryValidationMessage({
                response: { data: jsonResponse },
                submitText: 'Run Query',
                submitIcon: SEARCH_ICON,
                onSubmit: ({ query, userSelection }) => {
                    try {
                        responseRenderer.options?.onQueryValidationSubmit?.({ query, userSelection });
                    } catch (error) {
                        console.error(error);
                    }
                },
            });

            responseRenderer.appendChild(validationMessage);
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
                responseText.innerHTML = `<span><strong>${jsonResponse.data?.columns?.[0]?.display_name}:</strong> ${dataValue}</span>`;
            } else {
                responseText.innerHTML = `<span>${dataValue}</span>`;
            }

            clickableResponse.appendChild(responseText);
            responseWrapper.appendChild(clickableResponse);
            responseContainer.appendChild(responseWrapper);
            responseRenderer.appendChild(responseContainer);
        };

        responseRenderer.renderErrorResponse = (json) => {
            const errorResponseContainer = document.createElement('div');
            const errorMessage = new ErrorMessage(json?.message ?? GENERAL_QUERY_ERROR, responseRenderer.reportProblem);

            errorResponseContainer.appendChild(errorMessage);

            if (json?.reference_id) {
                const referenceID = document.createElement('div');
                referenceID.innerHTML = `Error ID: ${json.reference_id}`;
                errorResponseContainer.appendChild(document.createElement('br'));
                errorResponseContainer.appendChild(referenceID);
            }

            responseRenderer.appendChild(errorResponseContainer);
        };

        responseRenderer.refreshView = () => {
            if (!responseRenderer) {
                return;
            }

            var jsonResponse = responseRenderer.options.queryResponse;
            if (!jsonResponse) return;

            responseRenderer.innerHTML = '';
            responseRenderer.clearMetadata();

            ChataUtils.responses[uuid] = jsonResponse;

            const isSuggestionList = !!jsonResponse?.data?.items;
            if (isSuggestionList) {
                return responseRenderer.renderSuggestionResponse(jsonResponse);
            }

            const isValidationResponse = !!jsonResponse?.data?.replacements;
            if (isValidationResponse) {
                return responseRenderer.renderValidationResponse(jsonResponse);
            }

            const isError = !jsonResponse?.data?.rows;
            if (isError) {
                return responseRenderer.renderErrorResponse(jsonResponse);
            }

            const displayType = responseRenderer.getDisplayType();
            responseRenderer.displayType = displayType;

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
            responseRenderer.refreshView();
        } catch (error) {
            console.error(error);
        }

        return responseRenderer;
    } catch (error) {
        console.error(error);
    }
}
