import './ChataPopover.css'

export function ChataPopover(baseParent, button){
    var obj = document.createElement('div')
    obj.isOpen = false
    obj.classList.add('autoql-vanilla-popover')

    obj.setPos = () => {
        const parentRect = baseParent.getBoundingClientRect()
        const rect = button.getBoundingClientRect();
        let left = 0
        let top = 0
        var bottomOffset = 0

        var width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth

        var height = window.screen.height
        var pageYOffset = window.pageYOffset

        if((parentRect.left + obj.offsetWidth) >= width){
            var diff = obj.offsetWidth - baseParent.offsetWidth
            left = (
                parentRect.left + window.scrollX - diff
            ) + 'px'

        }else{
            left = parentRect.left + window.scrollX + 'px'
        }

        if((parentRect.top + obj.offsetHeight + pageYOffset) >= height){
            bottomOffset = obj.offsetHeight + 44
        }

        top = ((rect.top + window.scrollY + 37) - bottomOffset) + 'px'

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
