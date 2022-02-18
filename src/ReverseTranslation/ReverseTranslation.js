import './ReverseTranslation.css'

export function ReverseTranslation(interpretation){
    var container = document.createElement('div')
    var label = document.createElement('strong')
    label.textContent = 'Interpreted as: '

    container.classList.add('autoql-vanilla-reverse-translation-container')
    container.appendChild(label)

    return container
}
