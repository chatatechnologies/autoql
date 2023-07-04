import {
    uuidv4,
    createTableContainer,
    getNumberOfGroupables
} from '../../Utils'
import { apiCallPost } from '../../Api'
import {
    getGroupableFields
} from '../../Charts/ChataChartHelpers'
import {
    ChataUtils
} from '../../ChataUtils'
import {
    ChataTable,
    ChataPivotTable
} from '../../ChataTable'
import { ErrorMessage } from '../../ErrorMessage'
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
    DrilldownToolbar
} from '../DrilldownToolbar'
import './DrilldownView.css'

export function DrilldownView(
    tile, displayType,onClick=()=>{}, isStatic=true, drilldownMetadata={}
){
    var view = document.createElement('div')
    var wrapperView = document.createElement('div')
    wrapperView.classList.add('autoql-vanilla-drilldown-wrapper-view')
    view.appendChild(wrapperView)
    view.wrapper = wrapperView
    view.onClick = onClick
    if(isStatic){
        view.classList.add('autoql-vanilla-dashboard-drilldown-original')
    }else{
        view.classList.add('autoql-vanilla-dashboard-drilldown-table')
    }
    const {
        dashboard
    } = tile
    const UUID = uuidv4()
    view.isVisible = true

    view.onRowClick = () => {

    }

    view.onCellClick = () => {

    }

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector)
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, UUID, view])
            }
        }
    }

    view.setSelectedElement = (index) => {
        var elem = view.querySelector(`[data-tilechart="${index}"]`)
        elem.classList.add('active')
    }

    view.registerDrilldownChartEvent = (component) => {
        view.componentClickHandler(
            view.onClick, component, '[data-tilechart]'
        )
    }

    view.executeDrilldownClientSide = (params) => {
        const {
            json
        } = params

        view.showLoadingDots()

        setTimeout(() => {
            ChataUtils.responses[UUID] = json
            view.displayData(json)
        }, 400)
    }

    view.executeDrilldown = async (args) => {
        const {
            json,
            indexData,
            options
        } = args

        var loading = view.showLoadingDots()
        let data
        var queryId = json['data']['query_id']
        var params = {}
        const URL = `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`
        var groupables = getGroupableFields(json)
        for (var i = 0; i < groupables.length; i++) {
            var index = groupables[i].indexCol
            var value = json['data']['rows'][parseInt(indexData)][index]
            var colData = json['data']['columns'][index]['name']
            params[colData] = value.toString()
        }

        var cols = []
        for(let [key, value] of Object.entries(params)){
            cols.push({
                name: key,
                value: value
            })
        }
        data = {
            debug: options.autoQLConfig.debug,
            columns: cols
        }

        var response = await apiCallPost(URL, data, options);
        ChataUtils.responses[UUID] = response.data
        view.wrapper.removeChild(loading)

        if(response.data.data.rows.length > 0){
            view.displayData(response.data)
        }else{
            var error = new ErrorMessage(response.data.message, () => {
                ChataUtils.openModalReport(
                    UUID, dashboard.options, null, null
                )
            })
            view.wrapper.appendChild(error)
        }
    }

    view.showLoadingDots = () => {
        wrapperView.innerHTML = ''

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
        view.wrapper.appendChild(responseLoadingContainer)
        return responseLoadingContainer
    }

    view.getGutter = () => {
        var gutter = view.parentElement.querySelector('.gutter')
        return gutter
    }

    view.hide = () => {
        view.isVisible = false
        view.wrapper.style.display = 'none'
        view.classList.add('no-height')
        let gutter = view.getGutter()
        gutter.style.display = 'none'
    }

    view.show = () => {
        view.isVisible = true
        view.wrapper.style.display = 'block'
        view.classList.remove('no-height')
        let gutter = view.getGutter()
        gutter.style.display = 'block'
    }

    view.displayToolbar = () => {
        if(isStatic){
            var drilldownButton = new DrilldownToolbar(view)
            view.appendChild(drilldownButton)
        }
    }

    view.displayData = (json) => {
        var container = view.wrapper
        view.wrapper.innerHTML = ''
        let chartWrapper
        let chartWrapper2

        switch (displayType) {
            case 'table':
                var tableContainer = createTableContainer()
                tableContainer.setAttribute('data-componentid', UUID)
                container.appendChild(tableContainer)
                var scrollbox = document.createElement('div')
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                )
                scrollbox.classList.add('no-full-width')
                scrollbox.appendChild(tableContainer)
                container.appendChild(scrollbox)
                var table = new ChataTable(
                    UUID, dashboard.options, view.onRowClick
                )
                tableContainer.tabulator = table
                table.parentContainer = view
                break
            case 'bar':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createBarChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'column':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createColumnChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'line':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createLineChart(
                    chartWrapper, json, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'heatmap':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
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
                break
            case 'bubble':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
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
                break
            case 'stacked_bar':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedBarChart(
                    chartWrapper, json,
                    dashboard.options,
                    view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'stacked_column':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedColumnChart(
                    chartWrapper, json,
                    dashboard.options,
                    view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'stacked_line':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createAreaChart(
                    chartWrapper, json,
                    dashboard.options,
                    view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
            break
            case 'pie':
                chartWrapper = document.createElement('div')
                chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createPieChart(chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                )
                view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'pivot_table':
                var div = createTableContainer()
                div.setAttribute('data-componentid', UUID)
                container.appendChild(div)
                var _scrollbox = document.createElement('div')
                _scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                )
                _scrollbox.classList.add('no-full-width')
                _scrollbox.appendChild(div)
                container.appendChild(scrollbox)
                var _table = new ChataPivotTable(
                    UUID, dashboard.options, view.onCellClick
                )
                div.tabulator = _table
                break
        }
        view.displayToolbar()
    }

    if(!isStatic){
        var {
            json
        } = drilldownMetadata
        var colCount = json['data']['columns'].length
        var groupableCount = getNumberOfGroupables(json['data']['columns'])
        if(groupableCount == 1 || groupableCount == 2 || colCount == 1){
            view.executeDrilldown(drilldownMetadata)
        }else{
            view.executeDrilldownClientSide(drilldownMetadata)
        }
    }

    return view
}
