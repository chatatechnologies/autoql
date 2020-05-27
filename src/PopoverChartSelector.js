function PopoverChartSelector(position) {
    var obj = this;
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');
    obj.popover = popover;

    obj.show = () => {
        popover.style.visibility = 'visible';
        popover.style.opacity = 1;
        popover.style.left = position.left + 'px'
        if((position.top + popover.clientHeight + 100) > window.screen.height){
            popover.style.top = (position.top - 300) + 'px';
        }else{
            popover.style.top = position.top + 'px';
        }
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


function ChataChartSeriesPopover(position, cols, activeSeries, onClick){
    var obj = this;
    var indexList = getIndexesByType(cols);
    var seriesIndexes = [];
    activeSeries.map((col) => {
        seriesIndexes.push(col.index);
    })
    var content = document.createElement('div');
    var popover = new PopoverChartSelector(position);
    var series = {};
    const applyButton = htmlToElement(`
        <button
            class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 2px 5px; width: calc(100% - 10px);">
                Apply
        </button>
    `);

    var deselectCheckBox = () => {
        const type = obj.groupType;
        var inputs = content.querySelectorAll(
            `[data-col-type="${type}"]`
        );

        for (var i = 0; i < inputs.length; i++) {
            inputs[i].removeAttribute('checked')
        }
    }

    var enableApplyButton = (evt) => {
        const count = selectedCount();
        if(count == 0){
            applyButton.setAttribute('disabled', 'true');
            applyButton.classList.add('disabled');
        }else{
            applyButton.removeAttribute('disabled');
            applyButton.classList.remove('disabled');
        }
    }

    var selectedCount = () => {
        var inputs = content.querySelectorAll(
            '[data-col-type]:checked'
        );
        return inputs.length;
    }

    content.classList.add('autoql-vanilla-axis-selector-container');

    var createCheckbox = (column, checked=false) => {
        var colObj = column.col;
        var colName = colObj.display_name || colObj.name;
        var tick = htmlToElement(`
            <div class="autoql-vanilla-chata-checkbox-tick">
            <span class="chata-icon">${TICK}</span>
            </div>
        `);
        var checkboxContainer = document.createElement('div');
        var checkboxWrapper = document.createElement('div');
        var checkboxInput = document.createElement('input');
        checkboxInput.setAttribute('type', 'checkbox');

        checkboxInput.classList.add('autoql-vanilla-m-checkbox__input');
        if(name){
            checkboxInput.setAttribute('data-col-name', colName);
        }
        checkboxInput.setAttribute('data-col-index', column.index);
        checkboxInput.setAttribute('data-col-type', colObj.type);
        checkboxInput.col = column;
        tick.style.top = '3px';
        tick.style.left = '23px';
        checkboxInput.style.marginTop = '4.5px';
        checkboxInput.style.marginLeft = '20px';

        checkboxContainer.style.width = '38px';
        checkboxContainer.style.height = '18px';
        checkboxWrapper.style.width = '38px';
        checkboxWrapper.style.height = '18px';
        checkboxWrapper.style.position = 'relative';

        if(checked){
            checkboxInput.setAttribute('checked', 'true');
        }

        checkboxInput.onchange = (evt) => {
            var type = evt.target.dataset.colType;
            if(type !== obj.groupType){
                deselectCheckBox();
                obj.groupType = type;
            }
            enableApplyButton();
        }

        checkboxWrapper.appendChild(checkboxInput);
        checkboxWrapper.appendChild(tick);

        checkboxContainer.appendChild(checkboxWrapper);
        checkboxContainer.input = checkboxInput;
        return checkboxContainer;
    }

    if(indexList['DOLLAR_AMT']){
        series['Currency'] = [...indexList['DOLLAR_AMT']]
    }

    if(indexList['QUANTITY']){
        series['Quantity'] = [...indexList['QUANTITY']]
    }

    obj.createContent = () => {
        var wrapper = document.createElement('div');
        var buttonWrapper = document.createElement('div');

        buttonWrapper.style.backgroundColor = 'rgb(255, 255, 255)';
        buttonWrapper.style.padding = '5px';

        for(var [key, value] of Object.entries(series)){
            var header = document.createElement('div');
            var selectableList = document.createElement('div');
            selectableList.classList.add(
                'autoql-vanilla-chata-selectable-list'
            );
            var cols = series[key];
            header.classList.add('number-selector-header');
            header.innerHTML = key;
            content.appendChild(header);

            for (var i = 0; i < cols.length; i++) {
                var listItem = document.createElement('div');
                var colName = document.createElement('div');
                var colIndex = cols[i].index;
                var isChecked = seriesIndexes.includes(colIndex);
                if(isChecked && !obj.groupType){
                    console.log(cols[i].col.type);
                    obj.groupType = cols[i].col.type;
                }
                var checkbox = createCheckbox(cols[i], isChecked);
                var n = cols[i].col.display_name ||
                cols[i].col.name;
                colName.innerHTML = formatColumnName(n);
                listItem.classList.add('autoql-vanilla-chata-list-item');
                listItem.appendChild(colName);
                listItem.appendChild(checkbox);
                selectableList.appendChild(listItem);
            }
            content.appendChild(selectableList);
        }

        applyButton.onclick = (evt) => {
            var inputs = content.querySelectorAll(
                '.autoql-vanilla-m-checkbox__input'
            );
            var activeSeries = []
            for (var i = 0; i < inputs.length; i++) {
                if(inputs[i].checked){
                    activeSeries.push(inputs[i].col);
                }
            }

            onClick(evt, popover, activeSeries);
        }

        buttonWrapper.appendChild(applyButton);
        wrapper.appendChild(content);
        wrapper.appendChild(buttonWrapper);
        popover.appendContent(wrapper);
    }
    obj.createContent();
    popover.show();
    return popover;
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

    popover.setSelectedItem = (index) => {
        elements.map(elem => elem.classList.remove('active'));
        elements[parseInt(index)].classList.add('active');
    }

    obj.createContent();
    popover.show();

    return popover;
}
