import { FilterLockingInput } from './Components/FilterLockingInput'
import { ConditionList } from './Components/ConditionList'
import { INFO_ICON, CLOSE_ICON } from '../Svg'
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
    var input = new FilterLockingInput(datamessenger)
    var conditionList = new ConditionList()
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

    title.textContent = 'Filter Locking'
    infoIcon.innerHTML = INFO_ICON
    closeButton.innerHTML = CLOSE_ICON
    continueButton.textContent = 'Continue'

    title.appendChild(infoIcon)
    titleContainer.appendChild(title)
    titleContainer.appendChild(closeButton)
    header.appendChild(titleContainer)
    header.appendChild(input)
    footer.appendChild(continueButton)

    view.appendChild(header)
    view.appendChild(conditionList)
    view.appendChild(footer)

    view.isOpen = false

    view.show = () => {
        view.style.visibility = 'visible';
        view.style.opacity = 1;
        view.isOpen = true
    }

    view.hide = () => {
        view.style.visibility = 'hidden';
        view.style.opacity = 0;
        view.isOpen = false
    }

    closeButton.onclick = () => {
        view.hide()
    }

    continueButton.onclick = () => {
        view.hide()
    }

    return view
}
