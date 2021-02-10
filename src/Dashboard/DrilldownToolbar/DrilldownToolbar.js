import './DrilldownToolbar.css'
import {
    CHART_ICON,
    HIDE_DRILLDOWN,
    EXPAND_DRILLDOWN
} from '../../Svg'
import {
    htmlToElement
} from '../../Utils'

export function DrilldownToolbar(parent){
    var container = document.createElement('div')
    container.classList.add('drilldown-hide-chart-btn')
    var button = document.createElement('autoql-vanilla-chata-btn')
    button.classList.add('default')
    container.appendChild(button)

    button.appendChild(htmlToElement(CHART_ICON))
    button.appendChild(htmlToElement(HIDE_DRILLDOWN))

    parent.appendChild(container)

    return container
}
