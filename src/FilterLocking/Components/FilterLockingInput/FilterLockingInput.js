import './FilterLockingInput.css'
import {
    apiCallGet
} from '../../../Utils'

export function FilterLockingInput(datamessenger){
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

    view.autoCompleteTimer = undefined

    view.createSuggestions = (response) => {
        autoCompleteList.style.display = 'block'
        autoCompleteList.innerHTML = ''
        const {
            matches
        } = response
        matches.sort((match) => match.keyword).map((match) => {
            let li = document.createElement('li')
            li.classList.add('suggestion')
            li.textContent = match.keyword
            autoCompleteList.appendChild(li)
        })
    }

    view.autoCompleteCall = async (search) => {
        const {
            authentication
        } = datamessenger.options
        const s = encodeURIComponent(search)
        const url = `${authentication.domain}/autoql/api/v1/query/vlautocomplete?text=${s}&key=${authentication.apiKey}`
        const response = await apiCallGet(url, datamessenger.options)
        view.createSuggestions(response.data.data)
    }

    input.onkeyup = (evt) => {
        autoCompleteList.style.display = 'none'
        if(evt.target.value){
            view.autoCompleteCall(evt.target.value)
        }
    }


    return view
}
