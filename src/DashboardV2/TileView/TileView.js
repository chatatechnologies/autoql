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
    getSafetynetUserSelection,
    getSupportedDisplayTypes,
    getRecommendationPath,
    apiCallPut,
    htmlToElement
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
import { select } from 'd3-selection';
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
    view.isSafetynet = false
    view.isSuggestions = false

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
            let title = view.getQuery()

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

    view.getQuery = () => {
        let query = ''
        if(view.isSecond){
            query = view.inputToolbar.input.value
        }else{
            query = tile.inputQuery.value
        }

        return query
    }

    view.setQuery = (val) => {
        if(view.isSecond){
            view.inputToolbar.input.value = val
        }else{
            tile.inputQuery.value = val
        }
    }

    view.showSuggestionButtons = (response) => {
        var items = response.data.items
        var relatedJson = ChataUtils.responses[UUID]
        relatedJson.suggestions = response
        var queryId = relatedJson['data']['query_id'];
        var suggestionsContainer = document.createElement('div')
        var div = document.createElement('div')
        const {
            domain,
            apiKey
        } = dashboard.options.authentication
        const url = `${domain}/autoql/api/v1/query/${queryId}/suggestions?key=${apiKey}`
        div.innerHTML = `
        I want to make sure I understood your query. Did you mean:
        `

        suggestionsContainer.appendChild(div)

        for (var i = 0; i < items.length; i++) {
            var button = document.createElement('button')
            button.classList.add('autoql-vanilla-chata-suggestion-btn');
            button.textContent = items[i]
            button.onclick = (evt) => {
                var body = {
                    suggestion: evt.target.textContent
                };
                let loading = null;
                if(evt.target.textContent === 'None of these'){
                    view.isSuggestions = false
                    responseWrapper.innerHTML = 'Thank you for your feedback'
                }else{
                    view.setQuery(evt.target.textContent)
                    view.run()
                }

                var response = apiCallPut(url, body, dashboard.options)
            }
            suggestionsContainer.appendChild(button)
        }

        responseWrapper.appendChild(suggestionsContainer)
    }

    view.getSuggestions = () => {
        var jsonResponse = ChataUtils.responses[UUID]
        let query = view.getQuery()

        const path = getRecommendationPath(
            dashboard.options,
            query.split(' ').join(',')
        ) + '&query_id=' + jsonResponse['data']['query_id'];
        return apiCallGet(path, dashboard.options)
    }

    view.displaySuggestions = async () => {
        view.isSuggestions = true
        view.clearAutoResizeEvents()
        var response = await view.getSuggestions()
        responseWrapper.innerHTML = ''
        view.showSuggestionButtons(response.data)
    }

    view.run = async () => {
        let query = view.getQuery()
        view.isSuggestions = false
        view.isSafetynet = false
        console.log(view.metadata);
        if(query){
            view.clearMetadata()
            var loading = view.showLoading()
            var validate = await view.executeValidate()
            if(validate.data.data.replacements.length){
                var json = validate.data
                json.status = validate.status
                ChataUtils.responses[UUID] = json
                view.displaySafetynet()
            }else{
                var data = await view.executeQuery()
                var json = data.data
                json.status = data.status
                ChataUtils.responses[UUID] = json
                if(
                    data.data.reference_id === '1.1.430' ||
                    data.data.reference_id === '1.1.431'
                ){
                    view.displaySuggestions()
                }else{
                    responseWrapper.removeChild(loading)
                    view.displayData()
                }
            }

        }else{
            responseWrapper.innerHTML = placeHolderText
        }
    }

    view.runSafetynet = async () => {
        view.isSafetynet = false
        var selection = getSafetynetUserSelection(view)
        var text = getSafetynetValues(view).join(' ')
        var loading = view.showLoading()
        var response = await apiCall(
            text, tile.dashboard.options,
            'dashboards.validation', selection
        )
        ChataUtils.responses[UUID] = response.data
        if(response.status === 200){
            view.displayData()
        }else{
            view.displaySuggestions()
        }
    }

    view.onChangeSafetynet = (suggestionList, selectedOption) => {
        var value = getSafetynetValues(view).join(' ')
        view.setQuery(value)
    }

    view.displaySafetynet = () => {
        view.isSafetynet = true
        view.clearAutoResizeEvents()
        var json = ChataUtils.responses[UUID]
        var suggestionArray = createSuggestionArray(cloneObject(json))
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
        let val = view.getQuery()
        const URL_SAFETYNET = `${domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            val
        )}&key=${apiKey}`

        return apiCallGet(URL_SAFETYNET, dashboard.options)
    }

    view.executeQuery = async () => {
        let val = view.getQuery()
        return apiCall(
            val, tile.dashboard.options, 'dashboards.user'
        )
    }

    view.clearMetadata = () => {
        responseWrapper.metadata = null;
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
        }else{
            view.sendDrilldownClientSideChart(
                json, indexValue, colValue, dashboard.options
            )
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
        let title = view.getQuery()


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

    view.filterData = (json, indexValue, filterBy) => {
        var newJson = cloneObject(json);
        var newData = [];
        var oldData = newJson['data']['rows'];

        for (var i = 0; i < oldData.length; i++) {
            if(oldData[i][indexValue] === filterBy)newData.push(oldData[i]);
        }
        newJson.data.rows = newData;


        return newJson
    }

    view.sendDrilldownClientSideChart = (
        json, indexValue, filterBy, options
    ) => {
        if(!options.autoQLConfig.enableDrilldowns)return
        let title = view.getQuery()
        var newJson = view.filterData(json, indexValue, filterBy)

        var tableView = new DrilldownView(
            tile,
            'table',
            () => {},
            false,
            {
                json: newJson,
            }
        )

        const onClickDrilldownView = (evt, idRequest) => {
            var indexData = evt.target.dataset.tilechart
            var curJson = view.filterData(json, indexValue, filterBy)
            console.log(curJson);
            tableView.executeDrilldownClientSide({
                json: newJson,
            })
        }

        var chartView = new DrilldownView(
            tile, view.internalDisplayType, onClickDrilldownView
        )

        view.displayDrilldownModal(title, [chartView, tableView])
        chartView.displayData(json)
    }

    view.displaySingleValueDrillDown = () => {
        var json = ChataUtils.responses[UUID]

        let title = view.getQuery()

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

    view.getMessageError = () => {
        var json = ChataUtils.responses[UUID]
        const {
            message,
            reference_id
        } = json
        return htmlToElement(`
            <div class="autoql-vanilla-query-output-error-message">
                <div>
                    <span>
                    ${message}
                    </span>
                </div>
                <br>
                <div>Error ID: ${reference_id}</div>
            </div>
        `)
    }

    view.clearAutoResizeEvents = () => {
        select(window).on('chata-resize.'+UUID, null);
    }

    view.displayData = () => {
        var json = ChataUtils.responses[UUID]
        // const suggestionErrorCodes = [
        //     '1.1.431',
        //     '1.1.430'
        // ]
        if(json === undefined)return

        // if(
        //     json.status !== 200
        //     && !suggestionErrorCodes.includes(json.reference_id)
        // ){
        //     responseWrapper.innerHTML = ''
        //     responseWrapper.appendChild(view.getMessageError())
        //     return
        // }
        //
        // if(view.isSafetynet){
        //     view.displaySafetynet()
        //     return
        // }
        //
        // if(view.isSuggestions){
        //     responseWrapper.innerHTML = ''
        //     view.showSuggestionButtons(json.suggestions)
        //     return
        // }

        var container = responseWrapper
        var displayType = view.internalDisplayType
        var supportedDisplayTypes = getSupportedDisplayTypes(json)
        if(!supportedDisplayTypes.includes(displayType)){
            view.internalDisplayType = 'table'
            displayType = 'table'
        }
        var toolbarType = ''
        responseWrapper.innerHTML = ''
        view.clearAutoResizeEvents()

        switch (displayType) {
            case 'table':
                if(json['data']['columns'].length == 1){
                    var data = formatData(
                        json['data']['rows'][0][0],
                        json['data']['columns'][0],
                        dashboard.options
                    );
                    var singleValue = htmlToElement(`
                        <div>
                            <a class="autoql-vanilla-single-value-response">
                                ${data}
                            <a/>
                        </div>
                    `)
                    container.appendChild(singleValue)
                    singleValue.onclick = () => {
                        view.displaySingleValueDrillDown()
                    }
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
                chartWrapper.setAttribute('data-componentid', UUID)
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
