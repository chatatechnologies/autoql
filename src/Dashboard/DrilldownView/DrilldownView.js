import { uuidv4, createTableContainer, getNumberOfGroupables } from '../../Utils';
import { ChataUtils } from '../../ChataUtils';
import { ChataTable, ChataPivotTable } from '../../ChataTable';
import { ErrorMessage } from '../../ErrorMessage';
import { DrilldownToolbar } from '../DrilldownToolbar';
import { CHART_TYPES, DEFAULT_DATA_PAGE_SIZE, constructFilter, getAuthentication, getAutoQLConfig, getCombinedFilters, getFilterDrilldown, runDrilldown } from 'autoql-fe-utils';
import { ChataChartNew } from '../../NewCharts';

import './DrilldownView.scss';

export function DrilldownView(
    tile,
    displayType,
    onClick = () => {},
    isStatic = true,
    drilldownMetadata = {},
    drilldownRequestData,
) {
    var view = document.createElement('div');
    var wrapperView = document.createElement('div');
    wrapperView.classList.add('autoql-vanilla-drilldown-wrapper-view');
    view.appendChild(wrapperView);
    view.wrapper = wrapperView;
    view.onClick = onClick;
    if (isStatic) {
        view.classList.add('autoql-vanilla-dashboard-drilldown-original');
    } else {
        view.classList.add('autoql-vanilla-dashboard-drilldown-table');
    }
    const { dashboard } = tile;
    const UUID = uuidv4();
    view.isVisible = true;

    view.onRowClick = () => {};

    view.onCellClick = () => {};

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, UUID, view]);
            };
        }
    };

    view.setSelectedElement = (index) => {
        var elem = view.querySelector(`[data-tilechart="${index}"]`);
        elem.classList.add('active');
    };

    view.registerDrilldownChartEvent = (component) => {
        view.componentClickHandler(view.onClick, component, '[data-tilechart]');
    };

    view.executeDrilldownClientSide = (params) => {
        const { json } = params;

        view.showLoadingDots();

        setTimeout(() => {
            ChataUtils.responses[UUID] = json;
            view.displayData(json);
        }, 400);
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

    view.executeDrilldown = async (args) => {
        var loading = view.showLoadingDots();

        var response = await view.processDrilldown(drilldownRequestData);

        view.wrapper.removeChild(loading);

        if (!response) {
            return;
        }

        ChataUtils.responses[UUID] = response.data;

        if (response.data.data.rows.length > 0) {
            view.displayData(response.data);
        } else {
            var error = new ErrorMessage(response.data.message, () => {
                ChataUtils.openModalReport(UUID, dashboard.options, null, null);
            });
            view.wrapper.appendChild(error);
        }
    };

    view.showLoadingDots = () => {
        wrapperView.innerHTML = '';

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-tile-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        view.wrapper.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    };

    view.getGutter = () => {
        var gutter = view.parentElement.querySelector('.gutter');
        return gutter;
    };

    view.hide = () => {
        view.isVisible = false;
        view.wrapper.style.display = 'none';
        view.classList.add('no-height');
        let gutter = view.getGutter();
        gutter.style.display = 'none';
    };

    view.show = () => {
        view.isVisible = true;
        view.wrapper.style.display = 'block';
        view.classList.remove('no-height');
        let gutter = view.getGutter();
        gutter.style.display = 'block';
    };

    view.displayToolbar = () => {
        if (isStatic) {
            var drilldownButton = new DrilldownToolbar(view);
            view.appendChild(drilldownButton);
        }
    };

    view.displayData = (json) => {
        var container = view.wrapper;
        view.wrapper.innerHTML = '';
        let chartWrapper;
        let chartWrapper2;

        if (displayType === 'table') {
            var tableContainer = createTableContainer();
            tableContainer.setAttribute('data-componentid', UUID);
            container.appendChild(tableContainer);
            container.classList.add('autoql-vanilla-chata-table-container');
            var scrollbox = document.createElement('div');
            scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
            scrollbox.classList.add('no-full-width');
            scrollbox.appendChild(tableContainer);
            container.appendChild(scrollbox);
            var table = new ChataTable(UUID, dashboard.options, view.onRowClick);
            tableContainer.tabulator = table;
            table.parentContainer = view;
        } else if (displayType === 'pivot_table') {
            var div = createTableContainer();
            div.setAttribute('data-componentid', UUID);
            container.appendChild(div);
            container.classList.add('autoql-vanilla-chata-table-container');
            var _scrollbox = document.createElement('div');
            _scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
            _scrollbox.classList.add('no-full-width');
            _scrollbox.appendChild(div);
            container.appendChild(scrollbox);
            var _table = new ChataPivotTable(UUID, dashboard.options, view.onCellClick);
            div.tabulator = _table;
        } else if (CHART_TYPES.includes(displayType)) {
            chartWrapper = document.createElement('div');
            chartWrapper.classList.add('autoql-vanilla-tile-chart-container-data-componentid-holder');
            chartWrapper2 = document.createElement('div');
            chartWrapper2.classList.add('autoql-vanilla-tile-chart-container');
            chartWrapper2.appendChild(chartWrapper);
            container.appendChild(chartWrapper2);

            new ChataChartNew(chartWrapper, {
                type: displayType,
                options: dashboard.options,
                queryJson: json,
                onChartClick: (data) => onClick(data, UUID),
            });
        }

        view.displayToolbar();
    };

    if (!isStatic) {
        var { json } = drilldownMetadata;
        var colCount = json['data']['columns'].length;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if (groupableCount == 1 || groupableCount == 2 || colCount == 1) {
            view.executeDrilldown(drilldownMetadata);
        } else {
            view.executeDrilldownClientSide(drilldownMetadata);
        }
    }

    return view;
}
