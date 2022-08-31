import './ConditionList.css'
import { FilterLockingList } from '../FilterLockingList'
import { strings } from '../../../Strings'

export function ConditionList(datamessenger){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')
    var conditionListWrapper = document.createElement('div')
    var conditionList = []
    emptyConditionListContainer.innerHTML = `
        <p><i>${strings.emptyFilterConditionList}</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)
    container.appendChild(conditionListWrapper)

    container.hideConditionEmptyMessage = () => {
        emptyConditionListContainer.style.display = 'none'
    }

    container.addList = (data) => {
        if(conditionList.length === 0){
            container.hideConditionEmptyMessage()
        }
        var list = new FilterLockingList(datamessenger, data)
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
