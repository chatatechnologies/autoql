import './TileView.css'
import {
    TABLE_ICON,
    COLUMN_CHART_ICON,
    BAR_CHART_ICON,
    PIE_CHART_ICON,
    LINE_CHART_ICON,
    PIVOT_ICON,
    HEATMAP_ICON,
    BUBBLE_CHART_ICON,
    STACKED_COLUMN_CHART_ICON,
    STACKED_BAR_CHART_ICON,
    STACKED_AREA_CHART_ICON
} from '../Svg'
import { ChataUtils } from '../ChataUtils'
import {
    apiCall
} from '../Api'
import {
    uuidv4,
    getSupportedDisplayTypes,
    createTableContainer,
    formatData
} from '../Utils'
import { ChataTable, ChataPivotTable } from '../ChataTable'
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
} from '../Charts'

export function TileView(tile, isSecond=false){
    var view = document.createElement('div')
    const {
        dashboard
    } = tile
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
        var loading = view.showLoading()
        var data = await view.executeQuery()
        view.removeChild(loading)
        ChataUtils.responses[UUID] = data.data
        view.displayData()
    }

    view.executeQuery = async () => {
        var val = tile.inputQuery.value
        return apiCall(
            val, tile.dashboard.options, 'dashboards.user'
        )
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
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createBarChart(
                    chartWrapper, json, dashboard.options,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'column':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createColumnChart(
                    chartWrapper, json, dashboard.options,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'line':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createLineChart(
                    chartWrapper, json, dashboard.options,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'heatmap':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);

                createHeatmap(
                    chartWrapper,
                    json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'bubble':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createBubbleChart(
                    chartWrapper, json, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_bar':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createStackedBarChart(
                    chartWrapper, json,
                    dashboard.options, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_column':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createStackedColumnChart(
                    chartWrapper, json,
                    dashboard.options, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_line':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createAreaChart(
                    chartWrapper, json,
                    dashboard.options, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
            break;
            case 'pie':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createPieChart(chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
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
        var displayTypes = getSupportedDisplayTypes(json)

        var ignoreDisplayType = view.internalDisplayType
        var dummyArray = []
        dummyArray.forEach.call(view.querySelectorAll(
            '.autoql-vanilla-tile-toolbar'
        ),
        function(e, index){
            e.parentNode.removeChild(e)
        })

        if(displayTypes.length > 1){
            var vizToolbar = document.createElement('div')
            vizToolbar.classList.add('autoql-vanilla-tile-toolbar')
            for (var i = 0; i < displayTypes.length; i++) {
                if(displayTypes[i] == ignoreDisplayType)continue
                var button = document.createElement('button')
                button.classList.add('autoql-vanilla-chata-toolbar-btn')
                button.setAttribute('data-displaytype', displayTypes[i])
                if(displayTypes[i] == 'table'){
                    button.innerHTML = TABLE_ICON
                    button.setAttribute('data-tippy-content', 'Table')
                }
                if(displayTypes[i] == 'column'){
                    button.innerHTML = COLUMN_CHART_ICON
                    button.setAttribute('data-tippy-content', 'Column Chart')
                }
                if(displayTypes[i] == 'bar'){
                    button.innerHTML = BAR_CHART_ICON
                    button.setAttribute('data-tippy-content', 'Bar Chart')
                }
                if(displayTypes[i] == 'pie'){
                    button.innerHTML = PIE_CHART_ICON
                    button.setAttribute('data-tippy-content', 'Pie Chart')
                }
                if(displayTypes[i] == 'line'){
                    button.innerHTML = LINE_CHART_ICON
                    button.setAttribute('data-tippy-content', 'Line Chart')
                }
                if(displayTypes[i] == 'pivot_table'){
                    button.innerHTML = PIVOT_ICON
                    button.setAttribute('data-tippy-content', 'Pivot Table')
                }
                if(displayTypes[i] == 'heatmap'){
                    button.innerHTML = HEATMAP_ICON
                    button.setAttribute('data-tippy-content', 'Heatmap')
                }
                if(displayTypes[i] == 'bubble'){
                    button.innerHTML = BUBBLE_CHART_ICON
                    button.setAttribute('data-tippy-content', 'Bubble Chart')
                }
                if(displayTypes[i] == 'stacked_column'){
                    button.innerHTML = STACKED_COLUMN_CHART_ICON
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Column Chart'
                    )
                }
                if(displayTypes[i] == 'stacked_bar'){
                    button.innerHTML = STACKED_BAR_CHART_ICON
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Area Chart'
                    )
                }
                if(displayTypes[i] == 'stacked_line'){
                    button.innerHTML = STACKED_AREA_CHART_ICON
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Bar Chart'
                    )
                }
                if(button.innerHTML != ''){
                    vizToolbar.appendChild(button)
                    button.onclick = function(event){
                        view.internalDisplayType = this.dataset.displaytype
                        view.displayData()
                    }
                }
            }
            view.appendChild(vizToolbar)
        }
    }



    view.classList.add('autoql-vanilla-tile-view')

    return view
}
