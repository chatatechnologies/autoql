import { FilterLockingInput } from './Components/FilterLockingInput'
import { INFO_ICON, CLOSE_ICON } from '../Svg'
import './FilterLocking.css'


export function FilterLocking(){
    var view = document.createElement('div')
    var header = document.createElement('div')
    var titleContainer = document.createElement('div')
    var title = document.createElement('h3')
    var infoIcon = document.createElement('span')
    var closeButton = document.createElement('span')
    var input = new FilterLockingInput()
    view.classList.add('autoql-vanilla-filter-locking-view')
    view.classList.add('autoql-vanilla-popover-container')
    header.classList.add('autoql-vanilla-condition-lock-header')
    titleContainer.classList.add('autoql-vanilla-filter-locking-title-container')
    title.classList.add('autoql-vanilla-filter-locking-title')
    closeButton.classList.add('autoql-vanilla-close-filter-locking')
    // infoIcon.classList.add('autoql-vanilla-chata-icon')

    title.textContent = 'Filter Locking'
    infoIcon.innerHTML = INFO_ICON
    closeButton.innerHTML = CLOSE_ICON

    title.appendChild(infoIcon)
    titleContainer.appendChild(title)
    titleContainer.appendChild(closeButton)
    header.appendChild(titleContainer)
    header.appendChild(input)

    view.appendChild(header)

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
    return view
}
