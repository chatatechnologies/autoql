import './FilterLockingInput.css'

export function FilterLockingInput(){
    var view = document.createElement('div')
    var input = document.createElement('input')

    input.classList.add('autoql-vanilla-condition-locking-input')
    input.setAttribute('placeholder', 'Search & select a filter')

    view.appendChild(input)

    return view
}
