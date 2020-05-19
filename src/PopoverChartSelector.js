function PopoverChartSelector(position, indexes) {
    var obj = this;
    var popover = document.createElement('div');
    popover.classList.add('autoql-vanilla-popover-selector');

    obj.show = () => {
        popover.style.visibility = 'visible';
    }

    obj.hide = () => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
    }

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
            selectorContent.appendChild(obj.createListItem(indexes[i]));
        }
        // selectorContent.innerHTML = `
        //     <li class="autoql-vanilla-string-select-list-item active">Customer Number</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Customer</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Description</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Number</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Code</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Type</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Date Created</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Resource Number</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Resource Name</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Last Name</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Description</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Date</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Type</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Status</li>
        //     <li class="autoql-vanilla-string-select-list-item ">External Control Number 1</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Actual Start</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket Start Time</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Actual End</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Ticket End Time</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Customer Start Date</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Customer End Date</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job Start Time</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job End Time</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job Scheduled Start Date</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job Scheduled End Date</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job Type</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job phase</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Reference Number 1</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Reference Number 2</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Area</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Job Status</li>
        //     <li class="autoql-vanilla-string-select-list-item ">Current Routing Point</li>
        // `;
        selectorContainer.appendChild(selectorContent);
        popover.appendChild(selectorContainer);
    }

    obj.createListItem = (index) => {
        var name = index.col['display_name']  || index.col['name'];
        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-string-select-list-item');
        li.innerHTML = formatColumnName(name);
        return li;
    }

    popover.style.left = position.left
    popover.style.top = position.top
    popover.style.opacity = 1;
    obj.createContent();
    document.body.appendChild(popover);

    return obj;
}
