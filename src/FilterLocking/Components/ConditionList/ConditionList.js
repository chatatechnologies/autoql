import './ConditionList.css'
import { FilterLockingList } from '../FilterLockingList'

export function ConditionList(){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')
    var conditionList = []
    emptyConditionListContainer.innerHTML = `
        <p><i>No Filters are locked yet</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)

    container.hideConditionEmptyMessage = () => {
        emptyConditionListContainer.style.display = 'none'
    }

    container.addList = (data) => {
        if(conditionList.length === 0){
            container.hideConditionEmptyMessage()
        }
        var list = new FilterLockingList(data)
        container.appendChild(list)
        conditionList.push(list)
    }

    return container
}
