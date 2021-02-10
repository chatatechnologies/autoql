import './DrilldownToolbar.css'
import {
    CHART_ICON,
    HIDE_DRILLDOWN,
    EXPAND_DRILLDOWN
} from '../../Svg'
import {
    htmlToElement
} from '../../Utils'

export function DrilldownToolbar(){
    var container = document.createElement('div')
    container.classList.add('autoql-vanilla-drilldown-hide-chart-btn')
    container.classList.add('bottom')
    var button = document.createElement('button')
    button.classList.add('autoql-vanilla-chata-btn')
    button.classList.add('default')
    button.classList.add('large')
    container.appendChild(button)

    button.appendChild(htmlToElement(CHART_ICON))
    button.appendChild(htmlToElement(HIDE_DRILLDOWN))

    return container
}
