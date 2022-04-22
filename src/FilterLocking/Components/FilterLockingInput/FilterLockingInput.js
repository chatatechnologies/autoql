export function FilterLockingInput(){
    var view = document.createElement('div')
    var input = document.createElement('input')

    view.classList.add('autoql-vanilla-text-bar')

    view.appendChild(input)

    return view
}
