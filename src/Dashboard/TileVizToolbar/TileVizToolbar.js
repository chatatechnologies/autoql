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
import './TileVizToolbar.css'

export function TileVizToolbar(json, view, tile){
    var displayTypes = getSupportedDisplayTypes(json)
    var { dashboard } = tile
    var ignoreDisplayType = view.internalDisplayType
    var dummyArray = []
    dummyArray.forEach.call(view.querySelectorAll(
        '.autoql-vanilla-viz-toolbar'
    ),
    function(e, index){
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
