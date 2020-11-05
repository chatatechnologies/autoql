import './TileView.css'
import { ChataUtils } from '../../ChataUtils'
import {
    uuidv4,
    createTableContainer,
    formatData,
    apiCall,
    closeAllToolbars,
    allColsHidden
} from '../../Utils'
import { ChataTable, ChataPivotTable } from '../../ChataTable'
import {
    createAreaChart,
    createBarChart,
    createBubbleChart,
    createColumnChart,
    createHeatmap,
    createLineChart,
    createPieChart,
    createStackedBarChart,
    createStackedColumnChart
} from '../../Charts'
import {
    TileVizToolbar
} from '../TileVizToolbar'
import {
    ActionToolbar
} from '../ActionToolbar'

export function TileView(tile, isSecond=false){
    var view = document.createElement('div')
    const {
        dashboard
    } = tile
    view.isSecond = isSecond
    if(isSecond){
        view.internalDisplayType = tile.options.secondDisplayType ||
        tile.options.displayType
    }else{
        view.internalDisplayType = tile.options.displayType
    }

    const UUID = uuidv4()
    const {
        notExecutedText
    } = tile.dashboard.options

    const placeHolderText = `
    <div class="autoql-vanilla-dashboard-tile-placeholder-text">
        <em>${notExecutedText}</em>
    </div>`

    view.innerHTML = placeHolderText

    view.reportProblemHandler = (evt, idRequest, reportProblem, toolbar) => {
        reportProblem.classList.toggle('show');
        reportProblem.classList.add('up-chart');
        toolbar.classList.toggle('show');
    }

    view.moreOptionsHandler = (evt, idRequest, moreOptions, toolbar) => {
        let popoverClass;
        var json = ChataUtils.responses[idRequest];
        if(['table', 'pivot_table'].includes(view.internalDisplayType)){
            var isAllHidden = allColsHidden(json);
            if(isAllHidden){
                popoverClass = 'up-table-single';
                moreOptions.classList.remove('up-table');
            }else{
                popoverClass = 'up-table';
                moreOptions.classList.remove('up-table-single');
            }
        }else if(json.data.columns.length === 1){
            popoverClass = 'up-table-single';
        }else{
            popoverClass = 'up-chart';
        }
        closeAllToolbars();
        moreOptions.classList.toggle('show');
        moreOptions.classList.add(popoverClass);
        toolbar.classList.toggle('show');
    }

    view.openColumnEditorHandler = (evt, id, options) => {
        ChataUtils.showColumnEditor(id, options);
    }

    view.onRowClick = (e, row, json) => {

    }

    view.onCellClick = (e ,cell, json) => {

    }

    view.show = () => {
        view.style.display = 'flex'
    }

    view.hide = () => {
        view.style.display = 'none'
    }

    view.showLoading = () => {
        view.innerHTML = ''

        var responseLoadingContainer = document.createElement('div')
        var responseLoading = document.createElement('div')

        responseLoadingContainer.classList.add(
            'autoql-vanilla-tile-response-loading-container'
        )
        responseLoading.classList.add('response-loading')
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'))
        }

        responseLoadingContainer.appendChild(responseLoading)
        view.appendChild(responseLoadingContainer)
        return responseLoadingContainer
    }

    view.run = async () => {
        if(tile.inputQuery.value){
            view.clearMetadata()
            var loading = view.showLoading()
            var data = await view.executeQuery()
            view.removeChild(loading)
            ChataUtils.responses[UUID] = data.data
            view.displayData()
        }else{
            view.innerHTML = placeHolderText
        }
    }

    view.executeQuery = async () => {
        var val = tile.inputQuery.value
        return apiCall(
            val, tile.dashboard.options, 'dashboards.user'
        )
    }

    view.clearMetadata = () => {
        view.metadata = null;
    }

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, UUID])
            }
        }
    }

    view.registerDrilldownChartEvent = (component) => {
        view.componentClickHandler(
            view.chartElementClick, component, '[data-tilechart]'
        )
    }

    view.chartElementClick = (evt, idRequest) => {
        console.log(idRequest);
    }

    view.displayData = () => {
        var json = ChataUtils.responses[UUID]
        console.log(typeof json);
        if(json === undefined)return
        var container = view
        var displayType = view.internalDisplayType
        var toolbarType = ''
        view.innerHTML = ''

        switch (displayType) {
            case 'safetynet':
                var responseContentContainer = obj.getSafetynetBody(
                    json
                );
                view.appendChild(
                    responseContentContainer
                );
                updateSelectWidth(responseContentContainer);
            break;
            case 'table':
                if(json['data']['columns'].length == 1){
                    var data = formatData(
                        json['data']['rows'][0][0],
                        json['data']['columns'][0],
                        dashboard.options
                    );
                    container.innerHTML =
                    `<div>
                        <a class="autoql-vanilla-single-value-response">
                            ${data}
                        <a/>
                    </div>`;
                }else{
                    var div = createTableContainer();
                    div.setAttribute('data-componentid', UUID)
                    container.appendChild(div);
                    var scrollbox = document.createElement('div');
                    scrollbox.classList.add(
                        'autoql-vanilla-chata-table-scrollbox'
                    );
                    scrollbox.classList.add('no-full-width');
                    scrollbox.appendChild(div);
                    container.appendChild(scrollbox);
                    var table = new ChataTable(
                        UUID, dashboard.options, view.onRowClick
                    )
                    div.tabulator = table;
                    table.parentContainer = view;
                }
                break;
            case 'bar':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createBarChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'column':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createColumnChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'line':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createLineChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'heatmap':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)

                createHeatmap(
                    chartWrapper,
                    json,
                    dashboard.options, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'bubble':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createBubbleChart(
                    chartWrapper, json, dashboard.options,
                    false, 'data-tilechart',
                    true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'stacked_bar':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedBarChart(
                    chartWrapper, json,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'stacked_column':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedColumnChart(
                    chartWrapper, json,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'stacked_line':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createAreaChart(
                    chartWrapper, json,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
            break;
            case 'pie':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createPieChart(chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                view.registerDrilldownChartEvent(chartWrapper)
                toolbarType = 'chart-view';
                break;
            case 'pivot_table':
                var div = createTableContainer();
                div.setAttribute('data-componentid', UUID)
                container.appendChild(div);
                var scrollbox = document.createElement('div');
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                );
                scrollbox.classList.add('no-full-width');
                scrollbox.appendChild(div);
                container.appendChild(scrollbox);
                var table = new ChataPivotTable(
                    UUID, dashboard.options, view.onCellClick
                )
                div.tabulator = table;
                break;
            // case 'suggestion':
            //     var responseContentContainer = document.createElement('div');
            //     responseContentContainer.classList.add(
            //         'autoql-vanilla-chata-response-content-container'
            //     );
            //     responseContentContainer.classList.add(
            //         'autoql-vanilla-chata-response-content-center'
            //     );
            //     var val = ''
            //     if(obj.isSecond){
            //         val = obj.internalQuery;
            //     }else{
            //         val = chataDashboardItem.inputQuery.value;
            //     }
            //     responseContentContainer.innerHTML = `
            //         <div>I'm not sure what you mean by
            //             <strong>"${val}"</strong>. Did you mean:
            //         </div>`;
            //     container.appendChild(responseContentContainer);
            //     var rows = json['data']['items'];
            //     ChataUtils.createSuggestions(
            //         responseContentContainer,
            //         rows,
            //         'autoql-vanilla-chata-suggestion-btn-renderer'
            //     );
            //     break;
            default:
            container.innerHTML = "Oops! We didn't understand that query.";
        }
        view.createVizToolbar()
    }

    view.createVizToolbar = () => {
        var json = ChataUtils.responses[UUID]
        new TileVizToolbar(json, view, tile)

        var actionToolbar = new ActionToolbar(UUID, view, tile)
        if(!view.isSecond)actionToolbar.classList.add('first')
        view.appendChild(actionToolbar)
    }



    view.classList.add('autoql-vanilla-tile-view')

    return view
}
