import './ChataPopover.css'

export function ChataPopover(baseParent){
    var obj = document.createElement('div')
    obj.isOpen = false
    obj.classList.add('autoql-vanilla-popover')

    obj.setPos = () => {
        const parentRect = baseParent.getBoundingClientRect()
        const rect = baseParent.moreOptionsBtn.getBoundingClientRect();
        let left = 0
        let top = 0

        var width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

        if((parentRect.left + obj.offsetWidth) >= width){
            var diff = obj.offsetWidth - baseParent.offsetWidth
            left = (
                parentRect.left + window.scrollX - diff
            ) + 'px'

        }else{
            left = parentRect.left + window.scrollX + 'px'
        }

        top = (rect.top + window.scrollY + 37) + 'px'

        obj.style.top = top
        obj.style.left = left
    }

    obj.show = () => {
        obj.isOpen = true
        document.body.appendChild(obj)
        obj.setPos()
        return obj
    }

    obj.close = () => {
        obj.isOpen = false
        document.body.removeChild(obj)
    }

    return obj
}
