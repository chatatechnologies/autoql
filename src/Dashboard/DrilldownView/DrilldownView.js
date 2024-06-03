import { uuidv4, createTableContainer, getNumberOfGroupables } from '../../Utils';
import { ChataUtils } from '../../ChataUtils';
import { ChataTable, ChataPivotTable } from '../../ChataTable';
import { ErrorMessage } from '../../ErrorMessage';
import { DrilldownToolbar } from '../DrilldownToolbar';
import { CHART_TYPES } from 'autoql-fe-utils';
import { ChataChart } from '../../Charts';
import { QueryOutput } from '../../QueryOutput/QueryOutput';

import './DrilldownView.scss';

export function DrilldownView({
    tile,
    json,
    displayType,
    isStatic = true,
    drilldownFn,
    activeKey,
    options = {},
    onClick = () => {},
}) {
    var view = document.createElement('div');
    var wrapperView = document.createElement('div');
    wrapperView.classList.add('autoql-vanilla-drilldown-wrapper-view');
    view.appendChild(wrapperView);
    view.wrapper = wrapperView;

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

    view.executeDrilldown = async (data = {}) => {
        if (!drilldownFn) {
            ChataUtils.responses[UUID] = json;
            view.displayData(json);

            return;
        }

        var loading = view.showLoadingDots();

        var response;

        try {
            response = await drilldownFn?.(data);
        } catch (error) {
            console.error(error);
        }

        loading?.parentElement?.removeChild(loading);

        ChataUtils.responses[UUID] = response?.data;

        if (response?.data?.data?.rows?.length > 0) {
            view.displayData(response.data);
        } else {
            var error = new ErrorMessage(response?.data?.message, () => {
                ChataUtils.openModalReport(UUID, dashboard.options, null, null);
            });
            if (error) view.wrapper.appendChild(error);
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
        // console.log('TODO: make new "hide chart" button');
        // if (isStatic) {
        //     var drilldownButton = new DrilldownToolbar(view);
        //     view.appendChild(drilldownButton);
        // }
    };

    view.displayData = (json) => {
        var container = view.wrapper;
        view.wrapper.innerHTML = '';
        // let chartWrapper;
        // let chartWrapper2;

        // if (!json) {
        //     view.showLoadingDots();
        //     return;
        // }

        view.dataResponseContent = new QueryOutput(container, {
            ...options,
            displayType,
            queryResponse: json,
            onDataClick: onClick,
        });

        view.displayToolbar();

        return;
        // if (displayType === 'table') {
        //     var tableContainer = createTableContainer();
        //     tableContainer.setAttribute('data-componentid', UUID);
        //     container.appendChild(tableContainer);
        //     container.classList.add('autoql-vanilla-chata-table-container');
        //     var scrollbox = document.createElement('div');
        //     scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        //     scrollbox.classList.add('no-full-width');
        //     scrollbox.appendChild(tableContainer);
        //     container.appendChild(scrollbox);
        //     var table = new ChataTable(UUID, dashboard.options, view.onRowClick);
        //     tableContainer.tabulator = table;
        //     table.parentContainer = view;
        // } else if (displayType === 'pivot_table') {
        //     var div = createTableContainer();
        //     div.setAttribute('data-componentid', UUID);
        //     container.appendChild(div);
        //     container.classList.add('autoql-vanilla-chata-table-container');
        //     var _scrollbox = document.createElement('div');
        //     _scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        //     _scrollbox.classList.add('no-full-width');
        //     _scrollbox.appendChild(div);
        //     container.appendChild(scrollbox);
        //     var _table = new ChataPivotTable(UUID, dashboard.options, view.onCellClick);

        //     div.tabulator = _table;
        // } else if (CHART_TYPES.includes(displayType)) {
        //     chartWrapper = document.createElement('div');
        //     chartWrapper.classList.add('autoql-vanilla-tile-chart-container-data-componentid-holder');
        //     chartWrapper2 = document.createElement('div');
        //     chartWrapper2.classList.add('autoql-vanilla-tile-chart-container');
        //     chartWrapper2.appendChild(chartWrapper);
        //     container.appendChild(chartWrapper2);
        //     chartWrapper.activeKey = activeKey;

        //     new ChataChart(chartWrapper, {
        //         type: displayType,
        //         options: dashboard.options,
        //         queryJson: json,
        //         onChartClick: onClick,
        //     });
        // }

        // view.displayToolbar();
    };

    if (!isStatic) {
        view.executeDrilldown();
    }

    return view;
}
