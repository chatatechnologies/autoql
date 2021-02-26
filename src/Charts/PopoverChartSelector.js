import '../../css/PopoverChartSelector.css'

export function PopoverChartSelector(position, showOnBaseline=true) {
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');

    popover.show = () => {
        popover.style.visibility = 'visible';
        popover.style.opacity = 1;
        popover.style.left = position.left + 'px'
        var margin = showOnBaseline ? 0 : 60
        var pageYOffset  = window.scrollY

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
