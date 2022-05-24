import './ConditionList.css'

export function ConditionList(){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')

    emptyConditionListContainer.innerHTML = `
        <p><i>No Filters are locked yet</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)

    return container
}
