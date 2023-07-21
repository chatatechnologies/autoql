import { ButtonContainer } from '../ButtonContainer'
import { FilterLockingLine } from '../FilterLockingLine'
import {
    apiCallPut
} from '../../../Api'
import { INFO_ICON } from '../../../Svg'
import { strings } from '../../../Strings'

import './FilterLockingList.scss'

export function FilterLockingList(datamessenger, conditionList,  data,filterLocking){
    const category = data[0]
    const lines = data[1]
    var view = document.createElement('div')
    var titleContainer = document.createElement('div')
    var titleWrapper = document.createElement('div')
    titleWrapper.classList.add('autoql-vanilla-filter-list-title-section')
    var title = document.createElement('h4')
    var categoryContainer = document.createElement('span')
    var btnContainer = new ButtonContainer(lines)

    categoryContainer.textContent = category

    categoryContainer.classList.add('autoql-vanilla-filter-lock-category-title')
    titleContainer.classList.add('autoql-vanilla-filter-list-title')

    title.appendChild(categoryContainer)


    titleWrapper.appendChild(title)
    titleWrapper.appendChild(btnContainer)
    titleContainer.appendChild(titleWrapper)
    if(FilterLockingList.index === 0){
        var toggleColumn = document.createElement('div')
        toggleColumn.classList.add('autoql-vanilla-filter-list-title-section')
        var toggleColumnContent = document.createElement('h4')
        var infoIcon = document.createElement('div')
        infoIcon.classList.add('autoql-vanilla-filter-list-title-section-icon')
        infoIcon.innerHTML = INFO_ICON
        infoIcon.setAttribute(
            'data-tippy-content',
            strings.filterLockingListTooltip,
        )
        toggleColumnContent.textContent = strings.persist
        toggleColumnContent.classList.add('autoql-vaniall-persist-toggle-column')
        toggleColumnContent.appendChild(infoIcon)
        toggleColumn.appendChild(toggleColumnContent)
        titleContainer.appendChild(toggleColumn)
    }
    view.appendChild(titleContainer)

    view.refreshLines = (lines) => {
        lines.map(condition => {
            view.appendChild(new FilterLockingLine(datamessenger, conditionList, condition,filterLocking))
        })
    }

    view.getLines = () => {
        const lines = view.getElementsByClassName('autoql-vanilla-filter-locking-line')
        return lines
    }

    const onButtonGroupClick = async (action) => {
		filterLocking.showSavingIndicator()
		setTimeout(()=>{
			filterLocking.hideSavingIndicator()
		}, 1500);
        const {
            authentication
        } = datamessenger.options
        const url = `${authentication.domain}/autoql/api/v1/query/filter-locking?key=${authentication.apiKey}`

        const lines = view.getLines()
        var cols = []
        for (var line of lines) {
            if(action === 'exclude'){
                line.exclude()
            }else{
                line.include()
            }
            cols.push({
                ...line.getData()
            })
        }

        await apiCallPut(url, {
            columns: cols
        }, datamessenger.options)

    }

    btnContainer.setExcludeClick(() => {
        onButtonGroupClick('exclude')
    })

    btnContainer.setIncludeClick(() => {
        onButtonGroupClick('include')
    })

    view.refreshLines(lines)
    FilterLockingList.index++
    return view
}

FilterLockingList.index = 0
