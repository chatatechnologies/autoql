import './ChataSlider.css'

export function ChataSlider(){
    var view = document.createElement('label')
    var input = document.createElement('input')
    var slider = document.createElement('span')

    input.setAttribute('type', 'checkbox')

    view.classList.add('autoql-vanilla-switch')
    slider.classList.add('autoql-vanilla-slider')
    slider.classList.add('autoql-vanilla-round')

    view.appendChild(input)
    view.appendChild(slider)

    view.setOnChange = (fn) => {
        input.onchange = fn
    }

    view.isChecked = () => {
        return input.checked
    }

    view.setChecked = (val) => {
        input.checked = val
    }

    return view
}
