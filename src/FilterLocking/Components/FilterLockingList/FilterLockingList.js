import './FilterLockingList.css'
import { ButtonContainer } from '../ButtonContainer'
import { FilterLockingLine } from '../FilterLockingLine'
import { INFO_ICON } from '../../../Svg'

export function FilterLockingList(datamessenger, data){
    const category = data[0]
    const lines = data[1]
    var view = document.createElement('div')
    var titleContainer = document.createElement('div')
    var titleWrapper = document.createElement('div')
    var title = document.createElement('h4')
    var categoryContainer = document.createElement('span')
    var btnContainer = new ButtonContainer(lines)

    categoryContainer.textContent = category

    categoryContainer.classList.add('autoql-vanilla-filter-lock-category-title')
    titleContainer.classList.add('autoql-vanilla-filter-list-title')

    title.appendChild(categoryContainer)
    title.appendChild(btnContainer)

    titleWrapper.appendChild(title)
    titleContainer.appendChild(titleWrapper)
    if(FilterLockingList.index === 0){
        var toggleColumn = document.createElement('div')
        var toggleColumnContent = document.createElement('h4')
        var infoIcon = document.createElement('div')
        infoIcon.innerHTML = INFO_ICON

        toggleColumnContent.textContent = 'Persist'
        toggleColumnContent.classList.add('autoql-vaniall-persist-toggle-column')
        toggleColumnContent.appendChild(infoIcon)
        toggleColumn.appendChild(toggleColumnContent)
        titleContainer.appendChild(toggleColumn)
    }
    view.appendChild(titleContainer)

    view.refreshLines = (lines) => {
        lines.map(condition => {
            console.log(condition);
            view.appendChild(new FilterLockingLine(datamessenger, condition))
        })
    }

    view.refreshLines(lines)
    FilterLockingList.index++
    return view
}

FilterLockingList.index = 0
