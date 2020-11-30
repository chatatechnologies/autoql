import './ChataPopover.css'

export function ChataPopover(baseParent){
    var obj = document.createElement('div')
    obj.classList.add('autoql-vanilla-popover')

    obj.setPos = () => {
        const parentRect = baseParent.getBoundingClientRect()
        const rect = baseParent.moreOptionsBtn.getBoundingClientRect();
        let left = 0
        let top = 0

        var width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

        console.log(obj.offsetWidth);
        console.log(parentRect.left + obj.offsetWidth);
        console.log(width);
        if((parentRect.left + obj.offsetWidth) >= width){
            console.log('ENTRO AQUI');
            var diff = obj.offsetWidth - parentRect.offsetWidth
            obj.style.left = (
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
        document.body.appendChild(obj)
        obj.setPos()
        return obj
    }

    return obj
}
