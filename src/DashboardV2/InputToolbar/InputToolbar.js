import {
    INPUT_BUBBLES,
    LEFT_ARROW
} from '../../Svg'
import './InputToolbar.css'


export function InputToolbar(view){
    var toolbar = document.createElement('div')
    toolbar.classList.add('autoql-vanilla-tile-toolbar')
    toolbar.classList.add('autoql-vanilla-input-toolbar')

    var button = document.createElement('button')
    button.classList.add('autoql-vanilla-chata-toolbar-btn')
    button.classList.add('autoql-vanilla-input-toolbar-btn')

    var bubblesIcon = document.createElement('span')
    bubblesIcon.classList.add('autoql-vanilla-chata-icon')
    bubblesIcon.classList.add('autoql-vanilla-chata-toolbar-icon')
    bubblesIcon.innerHTML = INPUT_BUBBLES

    var arrowIcon = document.createElement('span')
    arrowIcon.classList.add('autoql-vanilla-chata-icon')
    arrowIcon.classList.add('autoql-vanilla-input-toolbar-arrow')
    arrowIcon.innerHTML = LEFT_ARROW

    button.appendChild(bubblesIcon)
    button.appendChild(arrowIcon)

    var input = document.createElement('input')
    input.classList.add('autoql-vanilla-dashboard-tile-input')
    input.classList.add('query')
    input.classList.add('second')
    input.setAttribute('placeholder', 'Query')

    button.onclick = (evt) => {
        if(input.classList.contains('open')){
            input.classList.remove('open')
            input.style.width = 0
        }else{
            input.classList.add('open')
            input.style.width = (view.offsetWidth - 67) + 'px'
        }
    }

    toolbar.appendChild(button)
    toolbar.appendChild(input)

    toolbar.input = input

    return toolbar
}
