import './FilterLockingInput.css'

export function FilterLockingInput(){
    var view = document.createElement('div')
    var inputContainer = document.createElement('div')
    var input = document.createElement('input')
    var autocompleteContainer = document.createElement('div')
    var autoCompleteList = document.createElement('ul')

    view.classList.add('autoql-vanilla-chata-bar-container')
    view.classList.add('autoql-vanilla-chat-drawer-chat-bar')
    view.classList.add('autoql-vanilla-autosuggest-top')

    inputContainer.classList.add('autoql-vanilla-text-bar')
    input.classList.add('autoql-vanilla-condition-locking-input')
    input.setAttribute('placeholder', 'Search & select a filter')
    autocompleteContainer.classList.add('autoql-vanilla-auto-complete-suggestions')
    autoCompleteList.classList.add('autoql-vanilla-auto-complete-filter-locking')

    autocompleteContainer.appendChild(autoCompleteList)
    inputContainer.appendChild(input)
    view.appendChild(autocompleteContainer)
    view.appendChild(inputContainer)


    view.createSuggestions = (suggestions) => {
        autoCompleteList.style.display = 'block'
        autoCompleteList.innerHTML = ''
        suggestions.map((s) => {
            let li = document.createElement('li')
            li.classList.add('suggestion')
            li.textContent = s
            autoCompleteList.appendChild(li)
        })
    }

    view.createSuggestions(['test1', 'test2', 'test4'])

    return view
}
