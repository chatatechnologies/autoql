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
        const {
            matches
        } = response

        if(matches.length === 0){
            view.close()
            return
        }

        autoCompleteList.style.display = 'block'
        autoCompleteList.innerHTML = ''

        matches.sort((match) => match.keyword).map((match) => {
            let li = document.createElement('li')
            let content = document.createElement('div')
            let keyContent = document.createElement('div')
            let messageContent = document.createElement('div')

            li.classList.add('autoql-vanilla-filter-suggestion')
            content.classList.add('autoql-vanilla-suggestion-content')
            keyContent.textContent = match.keyword
            messageContent.textContent = match.show_message
            content.appendChild(keyContent)
            content.appendChild(messageContent)
            li.appendChild(content)
            autoCompleteList.appendChild(li)

            content.onclick = () => {
                console.log(match);
                view.close()
            }
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
    view.close = () => {
        autoCompleteList.innerHTML = ''
        autoCompleteList.style.display = 'none'
    }

    input.onkeyup = (evt) => {
        autoCompleteList.style.display = 'none'
        if(evt.target.value){
            view.autoCompleteCall(evt.target.value)
        }
    }


    return view
}
