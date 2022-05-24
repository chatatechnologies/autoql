import moment from 'moment'
import { strings } from '../Strings'
import { INFO_ICON } from '../Svg'
import './ReverseTranslation.css'

export function ReverseTranslation(interpretation){
    const reverseTranslation = interpretation.replace(/(["'])(?:(?=(\\?))\2.)*?\1/gi, (output) => {
        const text = output.replace(/'/g, '')
        return `<a class="autoql-vanilla-condition-link">${text}</a>`
    })
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/gi, (output) => {
        return moment
        .utc(output)
        .format('ll')
        .toString()
    })
    var container = document.createElement('div')
    var label = document.createElement('strong')
    var textContainer = document.createElement('span')
    var iconContainer = document.createElement('span')

    label.textContent = strings.reverseTranslationLabel
    textContainer.innerHTML = reverseTranslation
    iconContainer.innerHTML = INFO_ICON

    container.classList.add('autoql-vanilla-reverse-translation-container')
    iconContainer.classList.add('autoql-vanilla-reverse-translation-icon')

    container.appendChild(iconContainer)
    container.appendChild(label)
    container.appendChild(textContainer)

    return container
}
