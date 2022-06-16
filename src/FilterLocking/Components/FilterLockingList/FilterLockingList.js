import './FilterLockingList.css'
import { ButtonContainer } from '../ButtonContainer'
import { FilterLockingLine } from '../FilterLockingLine'
import { INFO_ICON } from '../../../Svg'

export function FilterLockingList(data){
    const category = data[0]
    const lines = data[1]
    console.log(data);
    // app_id: 1500
    // customer_id: "accounting-demo"
    // filter_type: "include"
    // id: 10298
    // key: "ITEM_0_NAME_VALUE_LABEL"
    // lock_flag: null
    // model_id: 10010
    // project_id: 159
    // show_message: "Item Name"
    // user_id: "vidhya@chata.ai"
    // user_type: "user"
    // value: "Seals"
    var view = document.createElement('div')
    var titleContainer = document.createElement('div')
    var titleWrapper = document.createElement('div')
    var title = document.createElement('h4')
    var categoryContainer = document.createElement('span')
    var btnContainer = new ButtonContainer()
    var toggleColumn = document.createElement('div')
    var toggleColumnContent = document.createElement('h4')
    var infoIcon = document.createElement('div')

    categoryContainer.textContent = category
    toggleColumnContent.textContent = 'Persist'
    infoIcon.innerHTML = INFO_ICON

    categoryContainer.classList.add('autoql-vanilla-filter-lock-category-title')
    titleContainer.classList.add('autoql-vanilla-filter-list-title')
    toggleColumnContent.classList.add('autoql-vaniall-persist-toggle-column')
    toggleColumnContent.appendChild(infoIcon)
    toggleColumn.appendChild(toggleColumnContent)

    title.appendChild(categoryContainer)
    title.appendChild(btnContainer)

    titleWrapper.appendChild(title)
    titleContainer.appendChild(titleWrapper)
    titleContainer.appendChild(toggleColumn)
    view.appendChild(titleContainer)

    view.refreshLines = (lines) => {
        lines.map(condition => {
            console.log(condition);
            view.appendChild(new FilterLockingLine(condition))
        })
    }

    view.refreshLines(lines)
    return view
}
