import '../../css/PopoverChartSelector.css'

export function PopoverChartSelector(_position, showOnBaseline=false) {
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');
    popover.position = _position
    popover.setPosition = () => {
        let { position } = popover
        popover.style.opacity = 1;
        popover.style.left = position.left + 'px'
        var margin = 0
        var pageYOffset  = window.scrollY

        if(showOnBaseline){
            popover.style.top = (
                (position.top + pageYOffset)
                - popover.clientHeight) + 'px';
            popover.isOpen = true
            return popover
        }

        if(
            (position.top + popover.offsetHeight)
            > window.screen.height
        ){
            popover.style.top = (
                (position.top + pageYOffset)
                - popover.clientHeight + margin) + 'px';
        }else{
            popover.style.top = (position.top + pageYOffset - 120) + 'px';
        }
    }

    popover.show = () => {
        popover.style.visibility = 'visible';
        popover.setPosition()
        popover.isOpen = true;
        return popover;
    }

    popover.close = () => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
        document.body.removeChild(popover);
    }

    popover.appendContent = (elem) => {
        popover.appendChild(elem);
    }

    document.body.appendChild(popover);

    return popover;
}
