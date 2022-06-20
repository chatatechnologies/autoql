import './ButtonContainer.css'

export function ButtonContainer(lines){
    var view = document.createElement('div')
    var buttonInclude = document.createElement('div')
    var buttonExclude = document.createElement('div')
    var textInclude = document.createElement('div')
    var textExclude = document.createElement('div')
    const filterType = lines[0].filter_type
    textInclude.textContent = 'INCLUDE'
    textExclude.textContent = 'EXCLUDE'

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
    }

    buttonExclude.onclick = () => {
        buttonExclude.classList.add('active')
        buttonInclude.classList.remove('active')
    }

    if(filterType === 'include'){
        buttonInclude.classList.add('active')
    }else{
        buttonExclude.classList.add('active')
    }

    return view
}
