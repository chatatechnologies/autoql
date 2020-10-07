import {
    htmlToElement,
    uuidv4
} from '../Utils'
import './ChataRadio.css'

export function ChataRadio(options, onChange){
    var wrapper = document.createElement('div')
    wrapper.classList.add('chata-radio-btn-container')
    var uuid = uuidv4()

    for (var i = 0; i < options.length; i++) {
        var opt = options[i]
        var p = document.createElement('p')
        var input = document.createElement('input')
        var label = document.createElement('label')
        input.setAttribute('type', 'radio')
        input.setAttribute('name', `chata-radio-${uuid}`)
        input.setAttribute('id', `chata-radio-${uuid}-${i}`)
        label.setAttribute('for', `chata-radio-${uuid}-${i}`)

        if(opt.checked)input.setAttribute('checked', 'true')
        label.innerHTML = opt.label
        input.setAttribute('value', opt.value)

        input.onchange = (evt) => {
            wrapper.selectedValue = evt.target.value
            console.log(wrapper.selectedValue);
            onChange(evt)
        }

        p.appendChild(input)
        p.appendChild(label)
        wrapper.appendChild(p)
    }

    return wrapper
}
