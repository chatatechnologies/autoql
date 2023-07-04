import { FilterLockingInput } from './Components/FilterLockingInput'
import { ConditionList } from './Components/ConditionList'
import { INFO_ICON, CLOSE_ICON } from '../Svg'
import { strings } from '../Strings'
import { apiCallGet } from '../Api'
import { refreshTooltips } from '../Tooltips'
import './FilterLocking.css'

export function FilterLocking(datamessenger){
    var view = document.createElement('div')
    var header = document.createElement('div')
    var footer = document.createElement('div')
    var titleContainer = document.createElement('div')
    var title = document.createElement('h3')
    var infoIcon = document.createElement('span')
    var closeButton = document.createElement('span')
    var continueButton = document.createElement('button')
    var input = new FilterLockingInput(datamessenger, view)
    var conditionList = new ConditionList(datamessenger)
    view.classList.add('autoql-vanilla-filter-locking-view')
    view.classList.add('autoql-vanilla-popover-container')
    header.classList.add('autoql-vanilla-condition-lock-header')
    titleContainer.classList.add('autoql-vanilla-filter-locking-title-container')
    title.classList.add('autoql-vanilla-filter-locking-title')
    closeButton.classList.add('autoql-vanilla-close-filter-locking')
    footer.classList.add('autoql-vanilla-condition-lock-menu-footer')
    continueButton.classList.add('autoql-vanilla-chata-btn')
    continueButton.classList.add('default')
    continueButton.classList.add('large')
    // infoIcon.classList.add('autoql-vanilla-chata-icon')

    title.textContent = strings.filterLocking
    infoIcon.innerHTML = INFO_ICON
    closeButton.innerHTML = CLOSE_ICON
    continueButton.textContent = strings.continue

    infoIcon.setAttribute(
        'data-tippy-content',
        strings.filterLockingTooltip
    )

    title.appendChild(infoIcon)
    titleContainer.appendChild(title)
    titleContainer.appendChild(closeButton)
    header.appendChild(titleContainer)
    header.appendChild(input)

    view.appendChild(header)
    view.appendChild(conditionList)
    view.appendChild(footer)

    view.isOpen = false

    view.appendList = (data) => {
        conditionList.addList(data)
    }

    view.refreshConditions = (data) => {
        var groups = {}
        conditionList.clearList()
        data.map(condition => {
            if(groups[condition.show_message] === undefined){
                groups[condition.show_message] = [condition]
            }else{
                groups[condition.show_message].push(condition)
            }
        })
        for (let group of Object.entries(groups)) {
            view.appendList(group)
        }
        refreshTooltips()
    }

    view.show = () => {
        view.style.visibility = 'visible';
        view.style.opacity = 1;
        view.isOpen = true
    }

    view.existsFilter = (filter) => {
        const data = conditionList.getData()
        const finded = data.find((line) => {
            const lineData = line.getData()
            return lineData.key === filter.canonical
            && lineData.value === filter.keyword
        })

        return finded
    }

    view.hide = () => {
        view.style.visibility = 'hidden';
        view.style.opacity = 0;
        view.isOpen = false
    }

    view.getConditions = async () => {
        const {
            authentication
        } = datamessenger.options
        const url = `${authentication.domain}/autoql/api/v1/query/filter-locking?key=${authentication.apiKey}`
        const response = await apiCallGet(url, datamessenger.options)
        return response.data.data
    }

    view.loadConditions = async () => {
        const { data } = await view.getConditions()
        view.refreshConditions(data)
    }

    closeButton.onclick = () => {
        view.hide()
    }

    continueButton.onclick = () => {
        view.hide()
    }

    return view
}
