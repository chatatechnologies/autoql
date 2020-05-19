function PopoverChartSelector(position) {
    var obj = this;
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');
    obj.popover = popover;

    obj.show = () => {
        popover.style.visibility = 'visible';
        popover.style.left = position.left
        popover.style.top = position.top
        popover.style.opacity = 1;
        return obj;
    }

    obj.close = () => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
        document.body.removeChild(popover);
    }

    obj.appendContent = (elem) => {
        popover.appendChild(elem);
    }

    document.body.appendChild(popover);

    return obj;
}

function ChataChartListPopover(position, indexes, onClick){
    var obj = this;
    var popover = new PopoverChartSelector(position);
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
        console.log(colObj);
        var name = colObj.col['display_name']  || colObj.col['name'];
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

    popover.setSelectedItem = (index) => {
        elements.map(elem => elem.classList.remove('active'));
        elements[parseInt(index)].classList.add('active');
    }

    obj.createContent();
    popover.show();

    return popover;
}
