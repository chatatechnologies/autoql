import './TileView.css'
import { ChataUtils } from '../../ChataUtils'
import {
    uuidv4,
    createTableContainer,
    formatData,
    apiCall,
    apiCallGet,
    closeAllToolbars,
    allColsHidden,
    cloneObject,
    getNumberOfGroupables,
    getSafetynetValues,
    getSafetynetUserSelection
} from '../../Utils'
import {
    getGroupableFields
} from '../../Charts/ChataChartHelpers'
import { ChataTable, ChataPivotTable } from '../../ChataTable'
import {
    DrilldownModal
} from '../DrilldownModal'
import {
    DrilldownView
} from '../DrilldownView'
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
    createSuggestionArray,
    createSafetynetContent,
} from '../../Safetynet'
import {
    TileVizToolbar
} from '../TileVizToolbar'
import {
    ActionToolbar
} from '../ActionToolbar'
import {
    InputToolbar
} from '../InputToolbar'

export function TileView(tile, isSecond=false){
    var view = document.createElement('div')
    var responseWrapper = document.createElement('div')
    responseWrapper.classList.add('autoql-vanilla-tile-response-wrapper')
    view.appendChild(responseWrapper)
    const {
        dashboard
    } = tile
    view.isSecond = isSecond
    if(isSecond){
        view.internalDisplayType = tile.options.secondDisplayType ||
        tile.options.displayType
        var query = tile.options.secondQuery ||
        tile.inputQuery.value || ''
        var inputToolbar = new InputToolbar(view, query)
        view.appendChild(inputToolbar)
        view.inputToolbar = inputToolbar
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

    responseWrapper.innerHTML = placeHolderText

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
        var index = 0;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if(groupableCount > 0){
            for(var[key, value] of Object.entries(row._row.data)){
                json['data']['rows'][0][index++] = value;
            }
            let title =''
            if(view.isSecond){
                title = view.inputToolbar.input.value
            }else{
                title = tile.inputQuery.value
            }

            var tableView = new DrilldownView(
                tile,
                'table',
                () => {},
                false,
                {
                    json: json,
                    indexData: 0,
                    options: dashboard.options
                }
            )
            view.displayDrilldownModal(title, [tableView])
        }
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
        responseWrapper.innerHTML = ''

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
        responseWrapper.appendChild(responseLoadingContainer)
        return responseLoadingContainer
    }

    view.run = async () => {
        let query = ''
        if(view.isSecond){
            query = view.inputToolbar.input.value
        }else{
            query = tile.inputQuery.value
        }
        if(query){
            view.clearMetadata()
            var loading = view.showLoading()
            var validate = await view.executeValidate()
            if(validate.data.data.replacements.length){
                ChataUtils.responses[UUID] = validate.data
                view.displaySafetynet()
            }else{
                var data = await view.executeQuery()
                responseWrapper.removeChild(loading)
                ChataUtils.responses[UUID] = data.data
                view.displayData()
            }

        }else{
            responseWrapper.innerHTML = placeHolderText
        }
    }

    view.runSafetynet = () => {
        var values = getSafetynetUserSelection(view)
        console.log(values);
    }

    view.onChangeSafetynet = (suggestionList, selectedOption) => {
        var value = getSafetynetValues(view).join(' ')
        if(view.isSecond){
            view.inputToolbar.input.value = value
        }else{
            tile.inputQuery.value = value
        }
    }

    view.displaySafetynet = () => {
        var json = ChataUtils.responses[UUID]
        var suggestionArray = createSuggestionArray(json)
        var safetynet = createSafetynetContent(
            suggestionArray, view.runSafetynet, view.onChangeSafetynet
        )
        responseWrapper.innerHTML = ''
        responseWrapper.appendChild(safetynet)
    }

    view.executeValidate = async () => {
        const {
            apiKey,
            domain
        } = dashboard.options.authentication
        let val = ''
        if(view.isSecond){
            val = view.inputToolbar.input.value
        }else{
            val = tile.inputQuery.value
        }
        const URL_SAFETYNET = `${domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            val
        )}&key=${apiKey}`

        return apiCallGet(URL_SAFETYNET, dashboard.options)
    }

    view.executeQuery = async () => {
        let val = ''
        if(view.isSecond){
            val = view.inputToolbar.input.value
        }else{
            val = tile.inputQuery.value
        }
        return apiCall(
            val, tile.dashboard.options, 'dashboards.user'
        )
    }

    view.clearMetadata = () => {
        view.metadata = null;
    }

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector)
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

    view.registerDrilldownStackedChartEvent = (component) => {
        view.componentClickHandler(
            view.stackedChartElementClick, component, '[data-tilechart]'
        )
    }

    view.displayDrilldownModal = (title, views=[]) => {
        var drilldownModal = new DrilldownModal(title, views)
        drilldownModal.show()
    }

    view.chartElementClick = (evt, idRequest) => {
        var json = cloneObject(ChataUtils.responses[idRequest])
        var indexData = evt.target.dataset.tilechart
        var colValue = evt.target.dataset.colvalue1
        var indexValue = evt.target.dataset.filterindex
        var groupableCount = getNumberOfGroupables(json['data']['columns'])
        if(groupableCount == 1 || groupableCount == 2){
            view.sendDrilldownMessageChart(json, indexData, dashboard.options)
        }
    }

    view.stackedChartElementClick = (evt, idRequest) => {
        var json = cloneObject(ChataUtils.responses[idRequest])
        json['data']['rows'][0][0] = evt.target.dataset.unformatvalue1
        json['data']['rows'][0][1] = evt.target.dataset.unformatvalue2
        json['data']['rows'][0][2] = evt.target.dataset.unformatvalue3
        view.sendDrilldownMessageChart(json, 0, dashboard.options)
    }

    view.sendDrilldownMessageChart = async (json, indexData, options) => {
        if(!dashboard.options.autoQLConfig.enableDrilldowns)return
        let title =''
        if(view.isSecond){
            title = view.inputToolbar.input.value
        }else{
            title = tile.inputQuery.value
        }


        var tableView = new DrilldownView(
            tile,
            'table',
            () => {},
            false,
            {
                json: json,
                indexData: indexData,
                options: options
            }
        )

        const onClickDrilldownView = (evt, idRequest) => {
            var indexData = evt.target.dataset.tilechart
            var curJson = json

            if(evt.target.classList.contains('autoql-vanilla-stacked-rect')){
                curJson = cloneObject(curJson)
                curJson['data']['rows'][0][0] =
                evt.target.dataset.unformatvalue1
                curJson['data']['rows'][0][1] =
                evt.target.dataset.unformatvalue2
                curJson['data']['rows'][0][2] =
                evt.target.dataset.unformatvalue3
                indexData = 0
            }

            tableView.executeDrilldown({
                json: curJson,
                indexData: indexData,
                options: options
            })
        }

        var chartView = new DrilldownView(
            tile, view.internalDisplayType, onClickDrilldownView
        )

        view.displayDrilldownModal(title, [chartView, tableView])
        chartView.displayData(json)
    }

    view.sendDrilldownClientSideChart = (
        json, indexValue, filterBy, options) => {

    }


    view.displayData = () => {
        var json = ChataUtils.responses[UUID]
        if(json === undefined)return
        var container = responseWrapper
        var displayType = view.internalDisplayType
        var toolbarType = ''
        responseWrapper.innerHTML = ''

        switch (displayType) {
            case 'safetynet':
                var responseContentContainer = obj.getSafetynetBody(
                    json
                );
                responseWrapper.appendChild(
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
                view.registerDrilldownStackedChartEvent(chartWrapper)
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
                view.registerDrilldownStackedChartEvent(chartWrapper)
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
                view.registerDrilldownStackedChartEvent(chartWrapper)
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
