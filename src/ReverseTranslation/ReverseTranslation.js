import './ReverseTranslation.css'
import { INFO_ICON } from '../Svg'

export function ReverseTranslation(interpretation){
    console.log(interpretation);
    console.log();

    const reverseTranslation = interpretation.replace(/(["'])(?:(?=(\\?))\2.)*?\1/gi, (output) => {
        const text = output.replace(/'/g, '')
        console.log(text);
        return `<a class="autoql-vanilla-condition-link">${text}</a>`
    })
    var container = document.createElement('div')
    var label = document.createElement('strong')
    var textContainer = document.createElement('span')
    var iconContainer = document.createElement('span')

    label.textContent = 'Interpreted as: '
    textContainer.innerHTML = reverseTranslation
    iconContainer.innerHTML = INFO_ICON

    container.classList.add('autoql-vanilla-reverse-translation-container')
    iconContainer.classList.add('autoql-vanilla-reverse-translation-icon')

    container.appendChild(iconContainer)
    container.appendChild(label)
    container.appendChild(textContainer)

    return container
}
