import {
    uuidv4,
    createTableContainer
} from '../../Utils'
import {
    getGroupableFields
} from '../../Charts/ChataChartHelpers'
import {
    ChataTable,
    ChataPivotTable
} from '../../ChataTable'
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
import './DrilldownView.css'

export function DrilldownView(
    jsonResponse, tile, displayType, isStatic=true, drilldownMetadata={}
){
    var view = document.createElement('div')
    if(isStatic){
        view.classList.add('autoql-vanilla-dashboard-drilldown-original')
    }else{
        view.classList.add('autoql-vanilla-dashboard-drilldown-table')
    }
    const {
        dashboard
    } = tile
    const UUID = uuidv4()
    view.onRowClick = () => {

    }

    view.onCellClick = () => {

    }

    view.registerDrilldownChartEvent = () => {

    }

    view.executeDrilldown = (params) => {
        const {
            json,
            indexData,
            options
        } = params
        var loading = view.showLoadingDots()
        const URL = `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`
        let data
        var queryId = json['data']['query_id']
        var params = {}
        var groupables = getGroupableFields(json)
        for (var i = 0; i < groupables.length; i++) {
            var index = groupables[i].indexCol
            var value = json['data']['rows'][parseInt(indexData)][index]
            var colData = json['data']['columns'][index]['name']
            params[colData] = value.toString()
        }

        var cols = []
        for(var [key, value] of Object.entries(params)){
            cols.push({
                name: key,
                value: value
            })
        }
        data = {
            debug: options.autoQLConfig.debug,
            columns: cols
        }

        console.log(data);

    }

    view.showLoadingDots = () => {
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

    view.displayData = () => {
        var container = view
        view.innerHTML = ''

        switch (displayType) {
            case 'table':
                var div = createTableContainer()
                div.setAttribute('data-componentid', UUID)
                container.appendChild(div)
                var scrollbox = document.createElement('div')
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                )
                scrollbox.classList.add('no-full-width')
                scrollbox.appendChild(div)
                container.appendChild(scrollbox)
                var table = new ChataTable(
                    UUID, dashboard.options, view.onRowClick
                )
                div.tabulator = table
                table.parentContainer = view
                break
            case 'bar':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createBarChart(
                    chartWrapper, jsonResponse, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'column':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createColumnChart(
                    chartWrapper, jsonResponse, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'line':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createLineChart(
                    chartWrapper, jsonResponse, dashboard.options,
                    view.registerDrilldownChartEvent, false, 'data-tilechart',
                    true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
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
                    jsonResponse,
                    dashboard.options, false,
                    'data-tilechart', true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'bubble':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createBubbleChart(
                    chartWrapper, jsonResponse, dashboard.options,
                    false, 'data-tilechart',
                    true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'stacked_bar':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedBarChart(
                    chartWrapper, jsonResponse,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'stacked_column':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createStackedColumnChart(
                    chartWrapper, jsonResponse,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'stacked_line':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createAreaChart(
                    chartWrapper, jsonResponse,
                    dashboard.options, view.registerDrilldownChartEvent, false,
                    'data-tilechart', true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
            break
            case 'pie':
                var chartWrapper = document.createElement('div')
                var chartWrapper2 = document.createElement('div')
                chartWrapper2.classList.add(
                    'autoql-vanilla-tile-chart-container'
                )
                chartWrapper2.appendChild(chartWrapper)
                container.appendChild(chartWrapper2)
                createPieChart(chartWrapper, jsonResponse,
                    dashboard.options, false,
                    'data-tilechart', true
                )
                // view.registerDrilldownChartEvent(chartWrapper)
                break
            case 'pivot_table':
                var div = createTableContainer()
                div.setAttribute('data-componentid', UUID)
                container.appendChild(div)
                var scrollbox = document.createElement('div')
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                )
                scrollbox.classList.add('no-full-width')
                scrollbox.appendChild(div)
                container.appendChild(scrollbox)
                var table = new ChataPivotTable(
                    UUID, dashboard.options, view.onCellClick
                )
                div.tabulator = table
                break
        }
    }

    if(!isStatic)view.executeDrilldown(drilldownMetadata)

    return view
}
