import {
    INPUT_BUBBLES,
    LEFT_ARROW
} from '../../Svg'
import './InputToolbar.css'


export function InputToolbar(){
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

    toolbar.appendChild(button)


    return toolbar
}
