import './ChataSlider.css'

export function ChataSlider(){
    //     <label class="switch">
    //   <input type="checkbox" checked>
    //   <span class="slider round"></span>
    // </label>
    var view = document.createElement('label')
    var input = document.createElement('input')
    var slider = document.createElement('span')

    input.setAttribute('type', 'checkbox')

    view.classList.add('autoql-vanilla-switch')
    slider.classList.add('autoql-vanilla-slider')
    slider.classList.add('autoql-vanilla-round')

    view.appendChild(input)
    view.appendChild(slider)

    return view
}
