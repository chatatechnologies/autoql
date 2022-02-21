import './ReverseTranslation.css'

export function ReverseTranslation(interpretation){
    console.log(interpretation);
    var container = document.createElement('div')
    var label = document.createElement('strong')
    var textContainer = document.createElement('span')
    label.textContent = 'Interpreted as: '
    textContainer.textContent = interpretation

    container.classList.add('autoql-vanilla-reverse-translation-container')
    container.appendChild(label)
    container.appendChild(textContainer)

    return container
}
