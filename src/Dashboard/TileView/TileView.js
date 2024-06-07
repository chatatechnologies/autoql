import {
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
    isChartType,
} from 'autoql-fe-utils';

import { ChataUtils } from '../../ChataUtils';
import { apiCall, apiCallGet, apiCallPut } from '../../Api';
import { ErrorMessage } from '../../ErrorMessage';
import { DrilldownModal } from '../DrilldownModal';
import { DrilldownView } from '../DrilldownView';
import { select } from 'd3-selection';
import { refreshTooltips } from '../../Tooltips';
import { createSuggestionArray, createSafetynetContent } from '../../Safetynet';
import { InputToolbar } from '../InputToolbar';
import { QueryOutput } from '../../QueryOutput/QueryOutput';
import { strings } from '../../Strings';
import { OptionsToolbar } from '../../OptionsToolbar';
import { VizToolbar } from '../../VizToolbar';

import {
    uuidv4,
    cloneObject,
    getSafetynetValues,
    getSafetynetUserSelection,
    getRecommendationPath,
    htmlToElement,
    getGroupables,
    showBadge,
} from '../../Utils';

import './TileView.scss';
import { SPLIT_VIEW, SPLIT_VIEW_ACTIVE } from '../../Svg';

export function TileView(tile, isSecond = false, onSplitBtnClick = () => {}) {
    var view = document.createElement('div');
    var responseWrapper = document.createElement('div');

    responseWrapper.classList.add('autoql-vanilla-tile-response-wrapper');
    responseWrapper.classList.add(`autoql-vanilla-tile-response-wrapper-${isSecond ? 'second' : 'first'}`);

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

    view.openColumnEditorHandler = (evt, id, options, badge) => {
        ChataUtils.showColumnEditor(
            id,
            options,
            () => {
                var json = ChataUtils.responses[id];
                if (showBadge(json)) {
                    badge.style.visibility = 'visible';
                } else {
                    badge.style.visibility = 'hidden';
                }
            },
            view.queryOutput,
        );
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

    // view.clearFilterMetadata = () => {
    //     responseWrapper.filterMetadata = [];
    // };

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

    view.run = async () => {
        const query = view.getQuery();

        view.isSuggestions = false;
        view.isSafetynet = false;

        if (query) {
            // view.clearMetadata();
            // view.clearFilterMetadata();
            view.showLoading();

            let response;
            try {
                response = await runQuery({
                    ...getAuthentication(dashboard.options.authentication),
                    ...getAutoQLConfig(dashboard.options.autoQLConfig),
                    enableQueryValidation: dashboard.options.isEditing,
                    query,
                    source: 'dashboards.user',
                    scope: dashboard.options.scope,
                    pageSize: dashboard.options.pageSize ?? DEFAULT_DATA_PAGE_SIZE,
                });
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

    // view.clearMetadata = () => {
    //     responseWrapper.metadata = null;
    // };

    view.copyFilterMetadata = () => {
        responseWrapper.filterMetadata = responseWrapper.tabulator.getHeaderFilters();
    };

    // view.copyMetadataToDrilldown = (drilldownView) => {
    //     drilldownView.metadata = responseWrapper.metadata;
    //     drilldownView.metadata3D = responseWrapper.metadata3D;
    // };

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
                            response = await json.data?.queryFn?.({
                                ...getAuthentication(dashboard.options.authentication),
                                ...getAutoQLConfig(dashboard.options.autoQLConfig),
                                tableFilters: allFilters,
                                pageSize,
                            });
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

    view.onDrilldownClick = (data) => {
        const enableDrilldowns = getAutoQLConfig(dashboard.options.autoQLConfig).enableDrilldowns;
        if (!enableDrilldowns) return;

        const json = view.queryOutput?.options?.queryResponse;

        view.activeKey = data.activeKey;

        const views = [];

        var drilldownView = new DrilldownView({
            isStatic: false,
            options: dashboard.options,
            tile,
            displayType: 'table',
            drilldownFn: view.getDrilldownFn(data, json),
        });

        views.push(drilldownView);

        var originalView;
        if (isChartType(view.internalDisplayType)) {
            originalView = new DrilldownView({
                options: dashboard.options,
                tile,
                displayType: view.internalDisplayType,
                activeKey: view.activeKey,
                onClick: (drilldownData) => drilldownView.executeDrilldown(drilldownData),
                json,
            });

            views.unshift(originalView);
        }

        const title = view.getQuery();

        view.drilldownModal = view.displayDrilldownModal(title, views, data);

        // Wait for modal animation to complete
        setTimeout(() => {
            originalView?.displayData(json);
            setTimeout(() => {
                drilldownView.displayData();
                drilldownView.executeDrilldown(data);
            }, 100);
        }, 350);
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

    view.redraw = () => {
        view.queryOutput?.dispatchResizeEvent?.();
    };

    view.displayData = () => {
        var json = ChataUtils.responses[UUID];

        if (json === undefined) {
            view.createToolbars();
            return;
        }

        view.clearAutoResizeEvents();

        if (!json['data'].rows || json['data'].rows.length == 0) {
            responseWrapper.innerHTML = '';
            responseWrapper.appendChild(view.getMessageError());
            view.createToolbars();
            return;
        }

        var displayType = view.internalDisplayType;
        var supportedDisplayTypes = getSupportedDisplayTypes({ response: { data: json } });
        if (!supportedDisplayTypes.includes(displayType)) {
            view.internalDisplayType = 'table';
            displayType = 'table';
        }
        if (responseWrapper.tabulator) {
            view.copyFilterMetadata();
        }

        responseWrapper.innerHTML = '';

        const queryOutput = new QueryOutput(responseWrapper, {
            authentication: getAuthentication(dashboard.options.authentication),
            autoQLConfig: getAutoQLConfig(dashboard.options.autoQLConfig),
            queryResponse: json,
            displayType,
            pageSize: 50,
            onDataClick: view.onDrilldownClick,
        });

        view.queryOutput = queryOutput;

        if (queryOutput) {
            responseWrapper.appendChild(queryOutput);
        } else {
            responseWrapper.innerHTML = "Oops! We didn't understand that query.";
        }

        view.createToolbars();
        refreshTooltips();

        return;
    };

    view.createSplitViewBtn = () => {
        var vizToolbarSplit = htmlToElement(`
            <div 
                class="autoql-vanilla-tile-toolbar autoql-vanilla-split-view-btn"
                data-tippy-content="${tile.options.isSplit ? strings.singleView : strings.splitView}">
            </div>
        `);

        var vizToolbarSplitButton = htmlToElement(`
            <button
                class="autoql-vanilla-chata-toolbar-btn"
            </button>
        `);

        var vizToolbarSplitContent = htmlToElement(`
            <span class="autoql-vanilla-chata-icon" style="color: inherit;">
                ${tile.options.isSplit ? SPLIT_VIEW_ACTIVE : SPLIT_VIEW}
            </span>
        `);

        vizToolbarSplit.appendChild(vizToolbarSplitButton);
        vizToolbarSplitButton.appendChild(vizToolbarSplitContent);
        vizToolbarSplit.setAttribute('data-issplit', tile.options.isSplit);
        vizToolbarSplit.onclick = function () {
            try {
                onSplitBtnClick();
            } catch (error) {
                console.error(error);
            }

            const isSplit = this.dataset.isSplit;

            if (isSplit) {
                vizToolbarSplitContent.innerHTML = SPLIT_VIEW;
                this.setAttribute('data-tippy-content', strings.singleView);
            } else {
                vizToolbarSplitContent.innerHTML = SPLIT_VIEW_ACTIVE;
                this.setAttribute('data-tippy-content', strings.splitView);
            }

            this.setAttribute('data-issplit', !isSplit);
            refreshTooltips();
        };

        return vizToolbarSplit;
    };

    view.createToolbars = () => {
        if (view.toolbarContainer) {
            view.toolbarContainer.innerHTML = '';
        }

        const toolbarContainer = document.createElement('div');
        const leftToolbarContainer = document.createElement('div');
        const rightToolbarContainer = document.createElement('div');

        toolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container');
        leftToolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container-left');
        rightToolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container-right');

        var json = ChataUtils.responses[UUID];

        const shouldCreateSplitViewBtn = view.isSecond || (!view.isSecond && !tile.options.isSplit);

        const splitViewBtn = shouldCreateSplitViewBtn ? view.createSplitViewBtn() : null;
        const vizToolbar = new VizToolbar(json, view.queryOutput, tile.dashboard.options);
        const optionsToolbar = new OptionsToolbar(UUID, view.queryOutput, tile.dashboard.options);

        if (view.isSecond) vizToolbar.classList.add('second');
        if (view.isSecond) optionsToolbar.classList.add('second');

        if (splitViewBtn) leftToolbarContainer.appendChild(splitViewBtn);
        if (vizToolbar) leftToolbarContainer.appendChild(vizToolbar);
        if (optionsToolbar) rightToolbarContainer.appendChild(optionsToolbar);

        toolbarContainer.appendChild(leftToolbarContainer);
        toolbarContainer.appendChild(rightToolbarContainer);

        view.toolbarContainer = toolbarContainer;

        view.appendChild(toolbarContainer);
    };

    view.classList.add('autoql-vanilla-tile-view');

    return view;
}
