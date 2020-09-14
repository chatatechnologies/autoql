import '../../css/PopoverChartSelector.css'

export function PopoverChartSelector(position) {
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');

    popover.show = () => {
        popover.style.visibility = 'visible';
        popover.style.opacity = 1;
        popover.style.left = position.left + 'px'
        if((position.top + popover.clientHeight + 185) > window.screen.height){
            popover.style.top = ((position.top + window.pageYOffset) - popover.clientHeight + 100) + 'px';
        }else{
            popover.style.top = (position.top + window.pageYOffset) + 'px';
        }
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
