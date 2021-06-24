import {
    INFO_ICON
} from '../../Svg'
import { $dom } from '../../Dom'


export function InfoIcon(tooltip){
    var icon = $dom('span', {
        classes: ['autoql-vanilla-chata-icon-info']
    })
    icon.innerHTML = INFO_ICON
    icon.setAttribute('data-tippy-content', tooltip)
    return icon
}
