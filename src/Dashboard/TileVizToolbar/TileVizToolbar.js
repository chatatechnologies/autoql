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
} from '../../Svg'
import {
    getSupportedDisplayTypes
} from '../../Utils'
import {
    refreshTooltips
} from '../../Tooltips'
import { strings } from '../../Strings'
import './TileVizToolbar.css'

export function TileVizToolbar(json, view, tile){
    var displayTypes = getSupportedDisplayTypes(json)
    var { dashboard } = tile
    var ignoreDisplayType = view.internalDisplayType
    var dummyArray = []
    dummyArray.forEach.call(view.querySelectorAll(
        '.autoql-vanilla-viz-toolbar'
    ),
    function(e){
        e.parentNode.removeChild(e)
    })

    if(displayTypes.length > 1){
        var vizToolbar = document.createElement('div')

        if(!view.isSecond)vizToolbar.classList.add('first')
        if(!view.isSecond && tile.options.isSplit)vizToolbar.classList.add(
            'is-split'
        )

        vizToolbar.classList.add('autoql-vanilla-tile-toolbar')
        vizToolbar.classList.add('autoql-vanilla-viz-toolbar')
        for (var i = 0; i < displayTypes.length; i++) {
            if(displayTypes[i] == ignoreDisplayType)continue
            var button = document.createElement('button')
            button.classList.add('autoql-vanilla-chata-toolbar-btn')
            button.setAttribute('data-displaytype', displayTypes[i])
            if(displayTypes[i] == 'table'){
                button.innerHTML = TABLE_ICON
                button.setAttribute('data-tippy-content', strings.table)
            }
            if(displayTypes[i] == 'column'){
                button.innerHTML = COLUMN_CHART_ICON
                button.setAttribute('data-tippy-content', strings.columnChart)
            }
            if(displayTypes[i] == 'bar'){
                button.innerHTML = BAR_CHART_ICON
                button.setAttribute('data-tippy-content', strings.barChart)
            }
            if(displayTypes[i] == 'pie'){
                button.innerHTML = PIE_CHART_ICON
                button.setAttribute('data-tippy-content', strings.pieChart)
            }
            if(displayTypes[i] == 'line'){
                button.innerHTML = LINE_CHART_ICON
                button.setAttribute('data-tippy-content', strings.lineChart)
            }
            if(displayTypes[i] == 'pivot_table'){
                button.innerHTML = PIVOT_ICON
                button.setAttribute('data-tippy-content', strings.pivotTable)
            }
            if(displayTypes[i] == 'heatmap'){
                button.innerHTML = HEATMAP_ICON
                button.setAttribute('data-tippy-content', strings.heatmap)
            }
            if(displayTypes[i] == 'bubble'){
                button.innerHTML = BUBBLE_CHART_ICON
                button.setAttribute('data-tippy-content', strings.bubbleChart)
            }
            if(displayTypes[i] == 'stacked_column'){
                button.innerHTML = STACKED_COLUMN_CHART_ICON
                button.setAttribute(
                    'data-tippy-content',
                    strings.stackedColumn
                )
            }
            if(displayTypes[i] == 'stacked_bar'){
                button.innerHTML = STACKED_BAR_CHART_ICON
                button.setAttribute(
                    'data-tippy-content',
                    strings.stackedBar
                )
            }
            if(displayTypes[i] == 'stacked_line'){
                button.innerHTML = STACKED_AREA_CHART_ICON
                button.setAttribute(
                    'data-tippy-content',
                    strings.stackedLine
                )
            }
            if(button.innerHTML != ''){
                vizToolbar.appendChild(button)
                button.onclick = function(){
                    dashboard.setUndoData('display-type-change', () => {
                        var curValue = view.internalDisplayType
                        view.internalDisplayType = ignoreDisplayType
                        view.displayData()
                        return curValue
                    }, view)
                    view.internalDisplayType = this.dataset.displaytype
                    view.displayData()
                }
            }
        }
        view.appendChild(vizToolbar)
        refreshTooltips()
    }
}
