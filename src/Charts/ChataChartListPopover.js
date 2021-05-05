import { PopoverChartSelector } from './PopoverChartSelector'
import { formatColumnName } from '../Utils'

export function ChataChartListPopover(position, indexes, onClick, showOnBaseline=false){
    var obj = this;
    var elements = [];

    obj.createContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add(
            'autoql-vanilla-axis-selector-container'
        )
        selectorContent.classList.add(
            'autoql-vanilla-axis-selector-content'
        )
        for (var i = 0; i < indexes.length; i++) {
            selectorContent.appendChild(obj.createListItem(indexes[i], i));
        }
        selectorContainer.appendChild(selectorContent);
        popover.appendContent(selectorContainer);
    }

    obj.createListItem = (colObj, i) => {
        var name = colObj.col['display_name'] || colObj.col['name'];
        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-string-select-list-item');
        li.innerHTML = formatColumnName(name);
        li.setAttribute('data-popover-index', colObj.index);
        li.setAttribute('data-popover-type', colObj.col.type);
        li.setAttribute('data-popover-position', i);

        li.onclick = (evt) => {
            onClick(evt, popover);
        }
        elements.push(li);
        return li;
    }


    var popover = new PopoverChartSelector(position, showOnBaseline);
    obj.createContent();
    if((position.left + popover.clientWidth) >= window.innerWidth) {
        position.left = window.innerWidth - popover.clientWidth - 30
    }
    popover.position = position
    popover.setSelectedItem = (index) => {
        elements.map(elem => elem.classList.remove('active'));
        elements[parseInt(index)].classList.add('active');
    }
    popover.show();
    return popover;
}
