import './ConditionList.css'
import { FilterLockingLine } from '../FilterLockingLine'

export function ConditionList(){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')
    var conditionLines = []
    emptyConditionListContainer.innerHTML = `
        <p><i>No Filters are locked yet</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)

    container.hideConditionEmptyMessage = () => {
        emptyConditionListContainer.style.display = 'none'
    }

    container.addLine = (data) => {
        if(conditionLines.length === 0){
            container.hideConditionEmptyMessage()
        }
        var line = new FilterLockingLine(data)
        container.appendChild(line)
        conditionLines.push(line)
    }

    return container
}
