import './ButtonContainer.css'
import { strings } from '../../../Strings'

export function ButtonContainer(lines){
    var view = document.createElement('div')
    var buttonInclude = document.createElement('div')
    var buttonExclude = document.createElement('div')
    var textInclude = document.createElement('div')
    var textExclude = document.createElement('div')
    view.onIncludeClick = () => {}
    view.onExcludeClick = () => {}
    const filterType = lines[0].filter_type
    textInclude.textContent = strings.include
    textExclude.textContent =  strings.exclude

    view.classList.add('autoql-vanilla-radio-btn-container')
    buttonInclude.classList.add('autoql-vanilla-radio-btn')
    buttonExclude.classList.add('autoql-vanilla-radio-btn')
    buttonInclude.appendChild(textInclude)
    buttonExclude.appendChild(textExclude)

    view.appendChild(buttonInclude)
    view.appendChild(buttonExclude)

    buttonInclude.onclick = () => {
        buttonInclude.classList.add('active')
        buttonExclude.classList.remove('active')
        view.onIncludeClick()
    }

    buttonExclude.onclick = () => {
        buttonExclude.classList.add('active')
        buttonInclude.classList.remove('active')
        view.onExcludeClick()
    }

    view.setExcludeClick = (fn) => {
        view.onExcludeClick = fn
    }

    view.setIncludeClick = (fn) => {
        view.onIncludeClick = fn
    }
    if(filterType === 'include'){
        buttonInclude.classList.add('active')
    }else{
        buttonExclude.classList.add('active')
    }

    return view
}
