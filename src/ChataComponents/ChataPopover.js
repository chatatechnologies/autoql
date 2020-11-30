import './ChataPopover.css'

export function ChataPopover(baseParent){
    var obj = document.createElement('div')
    obj.classList.add('autoql-vanilla-popover')

    obj.setPos = () => {
        const rect = baseParent.getBoundingClientRect();
        obj.style.left = rect.left + window.scrollX + 'px'
        obj.style.top = rect.top + window.scrollY + 'px'
    }

    obj.show = () => {
        obj.setPos()
        document.body.appendChild(obj)
        return obj
    }

    return obj
}
