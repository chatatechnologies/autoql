import './ReverseTranslation.css'
import { INFO_ICON } from '../Svg'

export function ReverseTranslation(interpretation){
    console.log(interpretation);
    var container = document.createElement('div')
    var label = document.createElement('strong')
    var textContainer = document.createElement('span')
    var iconContainer = document.createElement('span')

    label.textContent = 'Interpreted as: '
    textContainer.textContent = interpretation
    iconContainer.innerHTML = INFO_ICON

    container.classList.add('autoql-vanilla-reverse-translation-container')
    iconContainer.classList.add('autoql-vanilla-reverse-translation-icon')

    container.appendChild(iconContainer)
    container.appendChild(label)
    container.appendChild(textContainer)

    return container
}
