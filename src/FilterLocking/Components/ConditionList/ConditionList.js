import './ConditionList.css'
import { FilterLockingList } from '../FilterLockingList'

export function ConditionList(datamessenger,filterLocking){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')
    var conditionListWrapper = document.createElement('div')
    var conditionList = []
    emptyConditionListContainer.innerHTML = `
        <p class="autoql-vanilla-filter-locking-empty-condition"><i class='autoql-vanilla-filter-locking-empty-condition'>No Filters are locked yet</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)
    container.appendChild(conditionListWrapper)

    container.hideConditionEmptyMessage = () => {
        emptyConditionListContainer.style.display = 'none'
    }

    container.showConditionEmptyMessage = () => {
        emptyConditionListContainer.style.display = 'block'
    }

    container.addList = (data) => {
        if(conditionList.length === 0){
            container.hideConditionEmptyMessage()
        }
        var list = new FilterLockingList(datamessenger, container, data,filterLocking)
        conditionListWrapper.appendChild(list)
        conditionList.push(list)
    }

    container.clearList = () => {
        conditionListWrapper.innerHTML = ''
        FilterLockingList.index = 0
        conditionList = []
    }

    container.getData = () => {
        return conditionList.map(list => Array.from(list.getLines())).flat()
    }

    return container
}
