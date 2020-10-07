import {
    htmlToElement,
    uuidv4
} from '../Utils'
import './ChataRadio.css'

export function ChataRadio(options){
    var wrapper = document.createElement('div')
    wrapper.classList.add('chata-radio-btn-container')

    for (var i = 0; i < options.length; i++) {
        var opt = options[i]
        var p = document.createElement('p')
        var input = document.createElement('input')
        var label = document.createElement('label')
        input.setAttribute('type', 'radio')

        if(opt.checked)input.setAttribute('checked', 'true')
        label.innerHTML = opt.label
        input.setAttribute('value', opt.value)

        p.appendChild(input)
        p.appendChild(label)
        wrapper.appendChild(p)
    }

    return wrapper
}
