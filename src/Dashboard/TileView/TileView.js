import { ChataUtils } from '../../ChataUtils';
import { apiCall, apiCallGet, apiCallPut } from '../../Api';
import { ChataTable, ChataPivotTable } from '../../ChataTable';
import { ChataPopover } from '../../ChataComponents';
import { ErrorMessage } from '../../ErrorMessage';
import { DrilldownModal } from '../DrilldownModal';
import { DrilldownView } from '../DrilldownView';
import { select } from 'd3-selection';
import { refreshTooltips } from '../../Tooltips';
import { createSuggestionArray, createSafetynetContent } from '../../Safetynet';
import { TileVizToolbar } from '../TileVizToolbar';
import { ActionToolbar } from '../ActionToolbar';
import { InputToolbar } from '../InputToolbar';
import { strings } from '../../Strings';
import { ChataChart } from '../../Charts';
import {
    CHART_TYPES,
    DEFAULT_DATA_PAGE_SIZE,
    constructFilter,
    getAuthentication,
    getAutoQLConfig,
    getCombinedFilters,
    getFilterDrilldown,
    isColumnDateType,
    isDataLimited,
    runDrilldown,
    runQuery,
    getSupportedDisplayTypes,
} from 'autoql-fe-utils';
import {
    uuidv4,
    createTableContainer,
    formatData,
    closeAllToolbars,
    cloneObject,
    getSafetynetValues,
    getSafetynetUserSelection,
    getRecommendationPath,
    htmlToElement,
    getGroupables,
    showBadge,
} from '../../Utils';

import './TileView.scss';

export function TileView(tile, isSecond = false) {
    var view = document.createElement('div');
    var responseWrapper = document.createElement('div');
    responseWrapper.classList.add('autoql-vanilla-tile-response-wrapper');
    view.appendChild(responseWrapper);
    const { dashboard } = tile;
    view.isSecond = isSecond;
    view.isSafetynet = false;
    view.isSuggestions = false;
    view.isExecuted = false;

    if (isSecond) {
        view.internalDisplayType = tile.options.secondDisplayType || tile.options.displayType;
        var query = tile.options.secondQuery || tile.inputQuery.value || '';
        var inputToolbar = new InputToolbar(view, query);
        view.appendChild(inputToolbar);
        view.inputToolbar = inputToolbar;
    } else {
        view.internalDisplayType = tile.options.displayType;
    }

    const UUID = uuidv4();
    const { notExecutedText } = tile.dashboard.options;

    const placeHolderText = `
    <div class="autoql-vanilla-dashboard-tile-placeholder-text">
        <em>${notExecutedText}</em>
    </div>`;

    const editPlaceHolderText = `
    <div class="autoql-vanilla-dashboard-tile-placeholder-text">
        <em>
            ${strings.initTileMessage}
        </em>
        <span class="autoql-vanilla-chata-icon play-icon">
            <svg stroke="currentColor" fill="currentColor"
            stroke-width="0" viewBox="0 0 24 24"
            height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2
                12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
                18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
                </path>
            </svg>
        </span>
    </div>
    `;
    view.filterMetadata = [];

    responseWrapper.innerHTML = placeHolderText;

    view.reportProblemHandler = (evt, idRequest, reportProblem, toolbar) => {
        closeAllToolbars();
        var popover = new ChataPopover(toolbar, toolbar.reportProblemButton);
        popover.appendChild(reportProblem);
        popover.show();
    };

    view.makeMoreOptions = () => {};

    view.moreOptionsHandler = (evt, idRequest, moreOptions, toolbar) => {
        closeAllToolbars();
        var popover = new ChataPopover(toolbar, toolbar.moreOptionsBtn);
        var opts = ChataUtils.makeMoreOptionsMenu(idRequest, popover, moreOptions, {
            caller: dashboard,
            query: view.getQuery(),
        });
        popover.appendChild(opts);
        popover.show();
    };

    view.openColumnEditorHandler = (evt, id, options, badge) => {
        ChataUtils.showColumnEditor(id, options, () => {
            var json = ChataUtils.responses[id];
            if (showBadge(json)) {
                badge.style.visibility = 'visible';
            } else {
                badge.style.visibility = 'hidden';
            }
        });
    };

    view.onCellClick = (data, json) => {
        var tableView = new DrilldownView({
            tile,
            displayType: 'table',
            isStatic: false,
            drilldownFn: view.getDrilldownFn(data, json),
        });

        const title = view.getQuery();

        view.displayDrilldownModal(title, [tableView]);
    };

    view.show = () => {
        view.style.display = 'flex';
    };

    view.hide = () => {
        view.style.display = 'none';
    };

    view.showLoading = () => {
        responseWrapper.innerHTML = '';

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-tile-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        responseWrapper.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    };

    view.getQuery = () => {
        let query = '';
        if (view.isSecond) {
            query = view.inputToolbar.input.value;
        } else {
            query = tile.inputQuery.value;
        }

        return query;
    };

    view.setQuery = (val) => {
        if (view.isSecond) {
            view.inputToolbar.input.value = val;
        } else {
            tile.inputQuery.value = val;
        }
    };

    view.showSuggestionButtons = (response) => {
        var items = response.data.items;
        var relatedJson = ChataUtils.responses[UUID];
        relatedJson.suggestions = response;
        var queryId = relatedJson['data']['query_id'];
        var suggestionsContainer = document.createElement('div');
        var div = document.createElement('div');
        const { domain, apiKey } = dashboard.options.authentication;
        const url = `${domain}/autoql/api/v1/query/${queryId}/suggestions?key=${apiKey}`;
        div.innerHTML = `
            <div class="autoql-vanilla-suggestion-message">
                ${relatedJson.message}
            </div>
        `;

        suggestionsContainer.appendChild(div);
        var buttonContainer = document.createElement('div');
        buttonContainer.classList.add('autoql-vanilla-suggestions-container');
        for (var i = 0; i < items.length; i++) {
            var button = document.createElement('button');
            button.classList.add('autoql-vanilla-chata-suggestion-btn');
            button.textContent = items[i];
            button.onclick = (evt) => {
                var body = {
                    suggestion: evt.target.textContent,
                };
                if (evt.target.textContent === strings.noneOfThese) {
                    view.isSuggestions = false;
                    responseWrapper.innerHTML = strings.feedback;
                } else {
                    view.setQuery(evt.target.textContent);
                    view.run();
                }

                apiCallPut(url, body, dashboard.options);
            };
            buttonContainer.appendChild(button);
        }
        suggestionsContainer.appendChild(buttonContainer);
        responseWrapper.appendChild(suggestionsContainer);
    };

    view.getSuggestions = () => {
        var jsonResponse = ChataUtils.responses[UUID];
        let query = view.getQuery();

        const path =
            getRecommendationPath(dashboard.options, encodeURIComponent(query)) +
            '&query_id=' +
            jsonResponse['data']['query_id'];
        return apiCallGet(path, dashboard.options);
    };

    view.displaySuggestions = async () => {
        view.isSuggestions = true;
        view.clearAutoResizeEvents();
        var response = await view.getSuggestions();
        responseWrapper.innerHTML = '';
        view.showSuggestionButtons(response.data);
    };

    view.removeVizToolbar = () => {
        var dummyArray = [];
        dummyArray.forEach.call(view.querySelectorAll('.autoql-vanilla-viz-toolbar'), function (e) {
            e.parentNode.removeChild(e);
        });
    };

    view.reset = () => {
        var oldJson = cloneObject(ChataUtils.responses[UUID]);
        ChataUtils.responses[UUID] = undefined;
        view.isExecuted = false;

        if (dashboard.options.isEditing) {
            responseWrapper.innerHTML = editPlaceHolderText;
        } else {
            responseWrapper.innerHTML = placeHolderText;
        }

        view.removeVizToolbar();

        return oldJson;
    };

    view.setJSON = (newJson) => {
        ChataUtils.responses[UUID] = cloneObject(newJson);
    };

    view.startEditing = () => {
        if (!view.isExecuted) {
            responseWrapper.innerHTML = editPlaceHolderText;
        }
    };

    view.stopEditing = () => {
        if (!view.isExecuted) {
            responseWrapper.innerHTML = placeHolderText;
        }
    };

    view.clearFilterMetadata = () => {
        responseWrapper.filterMetadata = [];
    };

    view.setDefaultFilters = (table) => {
        const { filterMetadata } = responseWrapper;

        if (!filterMetadata) return;

        table.toggleFilters();
        for (var i = 0; i < filterMetadata.length; i++) {
            var filter = filterMetadata[i];
            table.setHeaderFilterValue(filter.field, filter.value);
        }
        table.toggleFilters();
    };

    view.checkAutoChartAggregations = (json) => {
        var groupables = getGroupables(json);
        const { autoChartAggregations } = dashboard.options;

        if (groupables.length === 1 && autoChartAggregations) {
            view.internalDisplayType = 'column';
        }

        if (groupables.length === 2 && autoChartAggregations) {
            view.internalDisplayType = 'stacked_column';
        }
    };

    view.getQueryFn = (response) => {
        let newResponse;

        return async ({ formattedTableParams: undefined, ...args }) => {
            // todo - formattedTablParams
            try {
                const queryRequestData = response?.data?.data?.fe_req;
                const allFilters = getCombinedFilters(undefined, response, undefined);

                const queryParams = {
                    ...getAuthentication(dashboard.options.authentication),
                    ...getAutoQLConfig(dashboard.options.autoQLConfig),
                    source: 'dashboard.user',
                    scope: dashboard.options.scope,
                    debug: queryRequestData?.translation === 'include',
                    filters: queryRequestData?.session_filter_locks,
                    pageSize: queryRequestData?.page_size,
                    groupBys: queryRequestData?.columns,
                    orders: formattedTableParams?.sorters,
                    tableFilters: allFilters,
                };

                let newResponse = await runQuery({
                    ...queryParams,
                    query: queryRequestData?.text,
                    debug: queryRequestData?.translation === 'include',
                    userSelection: queryRequestData?.disambiguation,
                    ...args,
                });

                if (newResponse?.data) {
                    newResponse.data.originalQueryID = response.data.data.query_id;
                    newResponse.data.queryFn = view.getQueryFn(response);
                }
            } catch (error) {
                console.error(error);
                newResponse = error;
            }

            return newResponse;
        };
    };

    view.run = async () => {
        const query = view.getQuery();

        view.isSuggestions = false;
        view.isSafetynet = false;

        if (query) {
            view.clearMetadata();
            view.clearFilterMetadata();
            var loading = view.showLoading();

            let response;
            try {
                response = await runQuery({
                    ...getAuthentication(dashboard.options.authentication),
                    ...getAutoQLConfig(dashboard.options.autoQLConfig),
                    query,
                    source: 'dashboards.user',
                });
                if (response?.data) {
                    response.data.queryFn = view.getQueryFn(response);
                }
            } catch (error) {
                response = error;
            }

            const json = response?.data;

            ChataUtils.responses[UUID] = json;

            if (!response?.data || response.status != 200) {
                responseWrapper.appendChild(view.getMessageError());
            }

            if (json?.data?.replacements?.length) {
                json.status = response.status;
                view.displaySafetynet();
            } else if (json?.data?.items?.length) {
                json.status = response.status;
                if (response.data.reference_id === '1.1.430' || response.data.reference_id === '1.1.431') {
                    view.displaySuggestions();
                } else {
                    if (!view.isExecuted) {
                        view.checkAutoChartAggregations(json);
                    }
                    view.displayData();
                }
            } else {
                view.displayData();
            }
            view.isExecuted = true;
        } else {
            view.isExecuted = false;
            responseWrapper.innerHTML = `
                <div class="autoql-vanilla-dashboard-tile-placeholder-text">
                    <em>${strings.noQuerySupplied}</em>
                </div>
            `;
        }
    };

    view.runSafetynet = async () => {
        view.isSafetynet = false;
        var selection = getSafetynetUserSelection(view);
        var text = getSafetynetValues(view).join(' ');
        view.showLoading();
        var response = await apiCall(text, tile.dashboard.options, 'dashboards.validation', selection);
        ChataUtils.responses[UUID] = response.data;
        if (response.status === 200) {
            view.displayData();
        } else {
            view.displaySuggestions();
        }
    };

    view.onChangeSafetynet = () => {
        var value = getSafetynetValues(view).join(' ');
        view.setQuery(value);
    };

    view.displaySafetynet = () => {
        view.isSafetynet = true;
        view.clearAutoResizeEvents();
        view.removeVizToolbar();
        var json = ChataUtils.responses[UUID];
        var suggestionArray = createSuggestionArray(cloneObject(json));
        var safetynet = createSafetynetContent(suggestionArray, view.runSafetynet, view.onChangeSafetynet);
        responseWrapper.innerHTML = '';
        responseWrapper.appendChild(safetynet);
    };

    view.executeValidate = async () => {
        const { apiKey, domain } = dashboard.options.authentication;
        let val = view.getQuery();
        const URL_SAFETYNET = `${domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(val)}&key=${apiKey}`;

        return apiCallGet(URL_SAFETYNET, dashboard.options);
    };

    view.executeQuery = async () => {
        let val = view.getQuery();
        return apiCall(val, tile.dashboard.options, 'dashboards.user');
    };

    view.clearMetadata = () => {
        responseWrapper.metadata = null;
    };

    view.copyFilterMetadata = () => {
        responseWrapper.filterMetadata = responseWrapper.tabulator.getHeaderFilters();
    };

    view.copyMetadataToDrilldown = (drilldownView) => {
        drilldownView.metadata = responseWrapper.metadata;
        drilldownView.metadata3D = responseWrapper.metadata3D;
    };

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, UUID]);
            };
        }
    };

    view.displayDrilldownModal = (title, views = []) => {
        var drilldownModal = new DrilldownModal(title, views);
        drilldownModal.show();
        setTimeout(function () {
            refreshTooltips();
        }, 100);
    };

    view.selectChartElement = (component, target) => {
        var selected = component.querySelector('.active');
        if (selected) selected.classList.remove('active');
        target.classList.add('active');
    };

    view.processDrilldown = async ({
        json,
        groupBys,
        supportedByAPI,
        row,
        stringColumnIndex,
        queryID,
        source,
        column,
        filter,
    }) => {
        if (!json?.data?.data) {
            return;
        }

        if (getAutoQLConfig(dashboard.options.autoQLConfig)?.enableDrilldowns) {
            try {
                // This will be a new query so we want to reset the page size back to default
                const pageSize = dashboard.options.pageSize ?? DEFAULT_DATA_PAGE_SIZE;

                if (supportedByAPI) {
                    return runDrilldown({
                        ...getAuthentication(dashboard.options.authentication),
                        ...getAutoQLConfig(dashboard.options.autoQLConfig),
                        queryID,
                        source,
                        groupBys,
                    });
                } else if ((!isNaN(stringColumnIndex) && !!row?.length) || filter) {
                    if (!isDataLimited(json) && !isColumnDateType(column) && !filter) {
                        // --------- 1. Use mock filter drilldown from client side --------
                        const mockData = getFilterDrilldown({ stringColumnIndex, row, json });
                        return new Promise((resolve, reject) => {
                            return setTimeout(() => {
                                return resolve(mockData);
                            }, 1500);
                        });
                    } else {
                        // --------- 2. Use subquery for filter drilldown --------
                        const clickedFilter =
                            filter ??
                            constructFilter({
                                column: json.data.data.columns[stringColumnIndex],
                                value: row[stringColumnIndex],
                            });

                        const allFilters = getCombinedFilters(clickedFilter, json, undefined); // TODO: add table params

                        let response;
                        try {
                            response = await json.data?.queryFn?.({ tableFilters: allFilters, pageSize });
                        } catch (error) {
                            console.error(error);
                            return;
                        }

                        return response;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        return;
    };

    view.getDrilldownFn = (data, json) => {
        const queryID = json?.data?.query_id;

        return (newData) => {
            const drilldownData = newData ?? data ?? {};

            return view.processDrilldown({
                ...drilldownData,
                queryID,
                source: json?.data?.fe_req?.source,
                json: { data: json },
            });
        };
    };

    view.chartElementClick = (data, idRequest) => {
        const enableDrilldowns = getAutoQLConfig(dashboard.options.autoQLConfig).enableDrilldowns;
        if (!enableDrilldowns) return;

        const json = cloneObject(ChataUtils.responses[idRequest]);

        view.activeKey = data.activeKey;

        var tableView = new DrilldownView({
            tile,
            displayType: 'table',
            isStatic: false,
            drilldownFn: view.getDrilldownFn(data, json),
        });

        var chartView = new DrilldownView({
            tile,
            displayType: view.internalDisplayType,
            activeKey: view.activeKey,
            onClick: (data) => tableView.executeDrilldown(data),
            json,
        });

        const title = view.getQuery();

        view.drilldownModal = view.displayDrilldownModal(title, [chartView, tableView]);

        view.copyMetadataToDrilldown(chartView);

        // Wait for modal animation to complete
        setTimeout(() => {
            chartView.displayData(json);
        }, 500);
    };

    view.displaySingleValueDrillDown = (json) => {
        const data = { groupBys: [], supportedByAPI: true };

        var tableView = new DrilldownView({
            tile,
            displayType: 'table',
            isStatic: false,
            drilldownFn: view.getDrilldownFn(data, json),
        });

        const title = view.getQuery();

        view.displayDrilldownModal(title, [tableView]);
    };

    view.getMessageError = () => {
        var json = ChataUtils.responses[UUID];
        const { message, reference_id } = json;
        var messageContainer = document.createElement('div');
        messageContainer.classList.add('autoql-vanilla-query-output-error-message');

        var error = new ErrorMessage(message, () => {
            ChataUtils.openModalReport(UUID, dashboard.options, null, null);
        });

        messageContainer.appendChild(error);
        if (json.status !== 200) {
            messageContainer.appendChild(htmlToElement('<br/>'));
            messageContainer.appendChild(htmlToElement(`<div>${strings.errorID}: ${reference_id}</div>`));
        }

        return messageContainer;
    };

    view.clearAutoResizeEvents = () => {
        select(window).on('chata-resize.' + UUID, null);
    };

    view.displayData = () => {
        var json = ChataUtils.responses[UUID];

        if (json === undefined) return;

        view.clearAutoResizeEvents();

        if (!json['data'].rows || json['data'].rows.length == 0) {
            responseWrapper.innerHTML = '';
            responseWrapper.appendChild(view.getMessageError());
            view.createVizToolbar();
            return;
        }

        var container = responseWrapper;
        var displayType = view.internalDisplayType;
        var supportedDisplayTypes = getSupportedDisplayTypes({ response: { data: json } });
        if (!supportedDisplayTypes.includes(displayType)) {
            view.internalDisplayType = 'table';
            displayType = 'table';
        }
        if (responseWrapper.tabulator) {
            view.copyFilterMetadata();
        }
        var chartWrapper;
        var chartWrapper2;

        responseWrapper.innerHTML = '';

        if (displayType === 'table') {
            if (json['data']['columns'].length == 1) {
                var data = formatData(json['data']['rows'][0][0], json['data']['columns'][0], dashboard.options);
                var singleValue = htmlToElement(`
                    <div>
                        <a class="autoql-vanilla-single-value-response">
                            ${data}
                        <a/>
                    </div>
                `);
                container.appendChild(singleValue);
                singleValue.onclick = () => {
                    view.displaySingleValueDrillDown(json);
                };
            } else {
                var div = createTableContainer();
                div.setAttribute('data-componentid', UUID);
                container.appendChild(div);
                container.classList.add('autoql-vanilla-chata-table-container');
                var scrollbox = document.createElement('div');
                scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
                scrollbox.classList.add('no-full-width');
                scrollbox.appendChild(div);
                container.appendChild(scrollbox);
                var table = new ChataTable(UUID, dashboard.options, (data) => view.onCellClick(data, json));

                div.tabulator = table;
                responseWrapper.tabulator = table;
                table.parentContainer = view;
                view.setDefaultFilters(table);
            }
        } else if (displayType === 'pivot_table') {
            var tableContainer = createTableContainer();
            tableContainer.setAttribute('data-componentid', UUID);
            container.appendChild(tableContainer);
            container.classList.add('autoql-vanilla-chata-table-container');
            var _scrollbox = document.createElement('div');
            _scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
            _scrollbox.classList.add('no-full-width');
            _scrollbox.appendChild(tableContainer);
            container.appendChild(_scrollbox);
            var _table = new ChataPivotTable(UUID, dashboard.options, (data) => view.onCellClick(data, json));
            tableContainer.tabulator = _table;
        } else if (CHART_TYPES.includes(displayType)) {
            chartWrapper = document.createElement('div');
            chartWrapper.setAttribute('data-componentid', UUID);
            chartWrapper.classList.add('autoql-vanilla-tile-chart-container-data-componentid-holder');
            chartWrapper2 = document.createElement('div');
            chartWrapper2.classList.add('autoql-vanilla-tile-chart-container');
            chartWrapper2.appendChild(chartWrapper);
            container.appendChild(chartWrapper2);
            new ChataChart(chartWrapper, {
                type: displayType,
                options: dashboard.options,
                queryJson: json,
                onChartClick: (data) => view.chartElementClick(data, UUID),
            });

            // view.registerDrilldownChartEvent(chartWrapper)
        } else {
            container.innerHTML = "Oops! We didn't understand that query.";
        }

        view.createVizToolbar();
        refreshTooltips();
    };

    view.createVizToolbar = () => {
        var json = ChataUtils.responses[UUID];
        new TileVizToolbar(json, view, tile);

        var actionToolbar = new ActionToolbar(UUID, view, tile);
        if (!view.isSecond) actionToolbar.classList.add('first');
        view.appendChild(actionToolbar);
    };

    view.classList.add('autoql-vanilla-tile-view');

    return view;
}
