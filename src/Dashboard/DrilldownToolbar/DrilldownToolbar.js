import './DrilldownToolbar.css'
import {
    CHART_ICON,
    HIDE_DRILLDOWN,
    EXPAND_DRILLDOWN
} from '../../Svg'
import {
    htmlToElement
} from '../../Utils'
import {
    refreshTooltips
} from '../../Tooltips'

export function DrilldownToolbar(view){
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
    button.setAttribute(
        'data-tippy-content', 'Hide Chart'
    )
    button.onclick = () => {
        button.innerHTML = ''
        button.appendChild(htmlToElement(CHART_ICON))
        if(view.isVisible){
            view.hide()
            button.appendChild(htmlToElement(EXPAND_DRILLDOWN))
            button.setAttribute(
                'data-tippy-content', 'Show Chart'
            )
        }else{
            view.show()
            button.appendChild(htmlToElement(HIDE_DRILLDOWN))
            button.setAttribute(
                'data-tippy-content', 'Hide Chart'
            )
        }
        refreshTooltips()
    }

    return container
}
