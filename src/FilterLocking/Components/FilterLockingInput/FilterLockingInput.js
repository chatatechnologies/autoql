import './FilterLockingInput.scss'
import { animateInputText } from 'autoql-fe-utils';
import {
    apiCallGet,
    apiCallPut
} from '../../../Api'
import { AntdMessage } from '../../../Antd'
import { IFON_ICON_BLUE } from '../../../Svg'
import { strings } from '../../../Strings'

export function FilterLockingInput(datamessenger, filterLocking){
    var view = document.createElement('div')
    var inputContainer = document.createElement('div')
    var input = document.createElement('input')
    var autocompleteContainer = document.createElement('div')
    var autoCompleteList = document.createElement('ul')

    view.classList.add('autoql-vanilla-chata-bar-container')
    view.classList.add('autoql-vanilla-chat-drawer-chat-bar')
    view.classList.add('autoql-vanilla-autosuggest-top')

    inputContainer.classList.add('autoql-vanilla-text-bar')
    inputContainer.classList.add('autoql-vanilla-filter-locking-input-container')
    input.classList.add('autoql-vanilla-condition-locking-input')
    input.setAttribute('placeholder', strings.filterLockingInputPlaceholder)
    view.input = input
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

            content.onclick = async () => {
                view.close()
                view.clear()
                var response = await view.onSuggestionClick(match)
                if(response){
                    filterLocking.refreshConditions(response.data)
                }
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

    view.onSuggestionClick = async (data) => {
        const {
            authentication
        } = datamessenger.options

        const body = {
            columns: [
                {
                    filter_type: 'include',
                    key: data.canonical,
                    show_message: data.show_message,
                    value: data.keyword
                }
            ]
        }

        if(filterLocking.existsFilter(data)){
            new AntdMessage(strings.filterLockingAddFilterWarning, 3000, {
                parent: filterLocking,
                icon: IFON_ICON_BLUE
            })
            return Promise.resolve(0)
        }else{
            const url = `${authentication.domain}/autoql/api/v1/query/filter-locking?key=${authentication.apiKey}`
            const response = await apiCallPut(url, body, datamessenger.options)

            return response.data.data
        }

    }

    view.close = () => {
        autoCompleteList.innerHTML = ''
        autoCompleteList.style.display = 'none'
    }

    view.clear = () => {
        input.value = ''
    }

    view.animateInputWithText = (text) => {
        animateInputText({
            text,
            inputRef: input,
            totalAnimationTime: 500,
            callback: () => {
                view.autoCompleteCall(text);
            },
        });
    };

    input.onkeyup = (evt) => {
        autoCompleteList.style.display = 'none'
        if(evt.target.value){
            view.autoCompleteCall(evt.target.value)
        }
    }

    return view
}
