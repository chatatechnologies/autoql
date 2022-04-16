import './FilterLocking.css'
import { INFO_ICON } from '../Svg'
export function FilterLocking(){
    var view = document.createElement('div')
    var header = document.createElement('div')
    var titleContainer = document.createElement('div')
    var title = document.createElement('h3')
    var infoIcon = document.createElement('span')

    view.classList.add('autoql-vanilla-filter-locking-view')
    view.classList.add('autoql-vanilla-popover-container')
    header.classList.add('autoql-vanilla-condition-lock-header')
    titleContainer.classList.add('autoql-vanilla-filter-locking-title-container')
    title.classList.add('autoql-vanilla-filter-locking-title')
    // infoIcon.classList.add('autoql-vanilla-chata-icon')

    title.textContent = 'Filter Locking'
    infoIcon.innerHTML = INFO_ICON

    title.appendChild(infoIcon)
    titleContainer.appendChild(title)
    header.appendChild(titleContainer)

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
    return view
}
