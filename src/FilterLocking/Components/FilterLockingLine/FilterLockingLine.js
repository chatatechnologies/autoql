import { CLEAR_ALL } from '../../../Svg'

export function FilterLockingLine(conditionData){
    const {
        value
    } = conditionData
    var view = document.createElement('div')
    var label = document.createElement('div')
    var settings = document.createElement('div')
    var removeButton = document.createElement('span')

    view.classList.add('autoql-vanilla-filter-locking-line')
    label.classList.add('autoql-vanilla-condition-table-list-item')
    settings.classList.add('autoql-vanilla-condition-table-settings')

    label.textContent = value
    removeButton.innerHTML = removeButton

    view.appendChild(label)
    view.appendChild(settings)

    return view
}
