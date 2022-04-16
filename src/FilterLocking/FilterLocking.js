import './FilterLocking.css'

export function FilterLocking(){
    var view = document.createElement('div')
    view.classList.add('autoql-vanilla-filter-locking-view')
    view.classList.add('autoql-vanilla-popover-container')

    view.isOpen = false

    view.show = () => {
        view.style.visibility = 'visible';
        view.style.opacity = 1;
        view.isOpen = true
    }

    view.hide = () => {
        view.style.visibility = 'hidden';
        view.style.opacity = 0;
        view.isOpen = false
    }
    return view
}
