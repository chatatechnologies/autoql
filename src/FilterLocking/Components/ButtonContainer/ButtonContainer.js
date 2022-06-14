import './ButtonContainer.css'

export function ButtonContainer(){
    var view = document.createElement('div')
    var buttonInclude = document.createElement('div')
    var buttonExclude = document.createElement('div')
    var textInclude = document.createElement('div')
    var textExclude = document.createElement('div')

    textInclude.textContent = 'INCLUDE'
    textExclude.textContent = 'EXCLUDE'

    view.classList.add('autoql-vanilla-radio-btn-container')
    buttonInclude.classList.add('autoql-vanilla-radio-btn')
    buttonExclude.classList.add('active')
    buttonExclude.classList.add('autoql-vanilla-radio-btn')
    buttonInclude.appendChild(textInclude)
    buttonExclude.appendChild(textExclude)

    view.appendChild(buttonInclude)
    view.appendChild(buttonExclude)

    buttonInclude.onclick = () => {
        buttonInclude.classList.add('active')
        buttonExclude.classList.remove('active')
    }

    buttonExclude.onclick = () => {
        buttonExclude.classList.add('active')
        buttonInclude.classList.remove('active')
    }

    return view
}
