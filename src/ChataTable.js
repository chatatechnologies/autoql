function createTable(jsonResponse, oldComponent, options, action='replace', uuid, tableClass='autoql-vanilla-table-response', selector='[data-indexrow]'){
    var groupField = getGroupableField(jsonResponse);
    var table = document.createElement('table');
    var header = document.createElement('tr');
    var thArray = [];
    var cols = jsonResponse['data']['columns'];
    table.classList.add(tableClass);
    table.sort = 'asc';
    oldComponent.parentElement.parentElement.classList.remove(
        'chata-hidden-scrollbox'
    );
    if(oldComponent.dataset.componentid){
        table.setAttribute('data-componentid', oldComponent.dataset.componentid);
        if(oldComponent.parentElement.classList.contains('chata-chart-container')){
            oldComponent.parentElement.classList.remove('chata-chart-container');
            oldComponent.parentElement.classList.add('chata-table-container');
        }
    }else{
        table.setAttribute('data-componentid', uuid);
    }
    var dataLines = jsonResponse['data']['rows'];

    for (var i = 0; i < cols.length; i++) {
        var colStr = cols[i]['display_name'] ||
        cols[i]['name'];
        var isVisible = true;
        if('is_visible' in cols[i]){
            isVisible = cols[i]['is_visible']
            || false;
        }
        var colName = formatColumnName(colStr);
        var th = document.createElement('th');
        var arrow = document.createElement('div');
        var col = document.createElement('div');
        col.textContent = colName;
        arrow.classList.add('autoql-vanilla-tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column');
        col.setAttribute('data-type', cols[i]['type']);
        col.setAttribute('data-index', i);

        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('autoql-vanilla-tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        filter.colType = cols[i]['type'];
        filter.onkeyup = function(event){
            console.log('FILTER onkeyup');
            var _table = document.querySelector(
                `[data-componentid='${oldComponent.dataset.componentid}']`
            );
            var rows = applyFilter(
                oldComponent.dataset.componentid
            );
            ChataUtils.refreshTableData(
                _table, cloneObject(rows), options, false
            );
        }
        col.appendChild(divFilter);

        th.appendChild(col);
        th.appendChild(arrow);
        th.onclick = (evt) => {
            ChataUtils.onClickColumn(evt, table, options);
        }
        header.appendChild(th);
        thArray.push(th);
        if(!isVisible){
            th.classList.add('chata-hidden');
        }
        th.addEventListener('contextmenu', function(e){
            e.preventDefault();
            let col;
            if(e.target.tagName == 'DIV'){
                col = e.target;
            }else{
                col = e.target.childNodes[0];
            }
            var popoverElements = document.querySelectorAll(
                '.chata-tiny-popover-container'
            );
            [].forEach.call(popoverElements, function(e, i){
                e.parentNode.removeChild(e);
            })
            var popoverContainer = htmlToElement(`
                <div class="chata-tiny-popover-container">
                </div>
            `);
            var popoverMenu = htmlToElement(`
                <div class="chata-context-menu">
                </div>
            `)
            var popoverList = htmlToElement(`
                <ul class="chata-context-menu-list">
                </ul>
            `);

            var popoverLi = htmlToElement(`
                <li>Hide Column</li>
            `)

            popoverLi.onclick = function(evt){
                document.body.removeChild(popoverContainer);
                console.log(col.dataset.index);
                var parameters = [];
                var jsonCols = jsonResponse['data']['columns'];
                for (var i = 0; i < jsonCols.length; i++) {
                    var visibility = col.dataset.index == i ? false : true;
                    if(col.dataset.index == i){
                        visibility = false;
                        jsonResponse.data.columns[i].is_visible = false;
                    }else{
                        visibility = jsonCols[i].is_visible;
                    }
                    parameters.push({
                        name: jsonCols[i].name,
                        is_visible: visibility
                    })


                }
                ChataUtils.putCall(parameters, function(response){
                    adjustTableWidth(
                        table, thArray, jsonResponse['data']['columns']
                    );
                    hideShowTableCols(table);
                }, options)
            }

            popoverContainer.appendChild(popoverMenu);
            popoverMenu.appendChild(popoverList);
            popoverList.appendChild(popoverLi);

            popoverContainer.style.left = mouseX(e) + 'px';
            popoverContainer.style.top = mouseY(e) + 'px';
            document.body.appendChild(popoverContainer);
        })
    }
    header.classList.add('autoql-vanilla-table-header');
    // table.appendChild(header);
    for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i];
        var tr = document.createElement('tr');
        for (var x = 0; x < data.length; x++) {
            value = formatData(
                data[x], cols[x],
                options
            );
            var isVisible = true;
            if('is_visible' in cols[x]){
                isVisible = cols[x]['is_visible']
                || false;
            }
            var td = document.createElement('td');
            td.textContent = value;
            if(['PERCENT', 'RATIO'].includes(cols[x]['type']) &&
                options.dataFormatting.comparisonDisplay == 'PERCENT'){
                if(parseFloat(value) >= 0){
                    td.classList.add('autoql-vanilla-comparison-value-positive');
                }else{
                    td.classList.add('autoql-vanilla-comparison-value-negative');
                }
            }
            tr.appendChild(td);
            if(!isVisible){
                td.classList.add('chata-hidden');
            }
        }
        if(action == 'replace'){
            tr.setAttribute('data-indexrow', i);
        }else{
            tr.setAttribute('data-indexrowrenderer', i);
        }
        if(typeof groupField !== 'number'){
            tr.setAttribute('data-has-drilldown', true);
        }else{
            tr.setAttribute('data-has-drilldown', false);
        }
        table.appendChild(tr);
    }

    if(action == 'replace'){
        if(oldComponent.headerElement){
            oldComponent.parentElement.parentElement.replaceChild(
                header, oldComponent.headerElement
            );
        }else{
            oldComponent.parentElement.parentElement.insertBefore(
                header, oldComponent.parentElement
            );
        }
        oldComponent.parentElement.replaceChild(table, oldComponent);
    }else{
        oldComponent.appendChild(table);
    }
    let headerWidth = adjustTableWidth(table, thArray, cols, selector);
    table.style.width = headerWidth + 'px';
    header.style.width = headerWidth + 'px';
    table.headerElement = header;
    if(!options.authentication.demo){
        allColHiddenMessage(table);
    }
    return table;
}

function createPivotTable(pivotArray, oldComponent, options, action='replace', uuid='', tableClass='autoql-vanilla-table-response'){
    var header = document.createElement('tr');
    var table = document.createElement('table');
    var jsonResponse = ChataUtils.responses[
        oldComponent.dataset.componentid || uuid
    ]
    var groupField = getGroupableField(jsonResponse);

    var thArray = [];
    table.classList.add(tableClass);
    oldComponent.parentElement.parentElement.classList.remove(
        'chata-hidden-scrollbox'
    );
    if(oldComponent.dataset.componentid){
        table.setAttribute('data-componentid', oldComponent.dataset.componentid);
        if(oldComponent.parentElement.classList.contains('chata-chart-container')){
            oldComponent.parentElement.classList.remove('chata-chart-container');
            oldComponent.parentElement.classList.add('chata-table-container');
        }
    }else{
        table.setAttribute('data-componentid', uuid);
    }
    for (var i = 0; i < pivotArray[0].length; i++) {
        var colName = pivotArray[0][i];
        var th = document.createElement('th');
        var arrow = document.createElement('div');
        var col = document.createElement('div');
        col.textContent = colName;
        arrow.classList.add('autoql-vanilla-tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column-pivot');
        col.setAttribute('data-type', 'PIVOT');
        col.setAttribute('data-index', i);
        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('autoql-vanilla-tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        if(i == 0){
            filter.colType = ChataUtils.responses[
                oldComponent.dataset.componentid || uuid
            ]['data']['columns'][0];
        }else if(i >= 1){
            filter.colType = ChataUtils.responses[
                oldComponent.dataset.componentid || uuid
            ]['data']['columns'][2];
        }
        filter.onkeyup = function(event){
            var _json = cloneObject(
                ChataUtils.responses[oldComponent.dataset.componentid]
            );
            var _table = document.querySelector(
                `[data-componentid='${oldComponent.dataset.componentid}']`
            );

            var _columns = _json['data']['columns'];
            if(_columns[0].type === 'DATE' &&
                _columns[0].name.includes('month')){
                var pivotArray = getDatePivotArray(
                    _json,
                    options,
                    cloneObject(_json['data']['rows'])
                );
            }else{
                var pivotArray = getPivotColumnArray(
                    _json,
                    options,
                    cloneObject(_json['data']['rows'])
                );
            }
            pivotArray.shift();
            var rows = applyFilter(oldComponent.dataset.componentid, pivotArray);
            // rows.unshift([]);
            ChataUtils.refreshPivotTable(_table, rows);
        }
        col.appendChild(divFilter);
        if(i == 0){
            th.classList.add('autoql-vanilla-sticky-col');
        }
        th.appendChild(col);
        th.appendChild(arrow);
        th.onclick = (evt) => {
            ChataUtils.onClickPivotColumn(evt, table, options);
        }
        header.appendChild(th);
        thArray.push(th);
    }
    header.classList.add('autoql-vanilla-table-header');

    for (var i = 1; i < pivotArray.length; i++) {
        var tr = document.createElement('tr');
        for (var x = 0; x < pivotArray[i].length; x++) {
            var td = document.createElement('td');
            td.textContent = pivotArray[i][x];
            if(x == 0){
                td.classList.add('autoql-vanilla-sticky-col');
            }
            tr.appendChild(td);
        }
        if(action == 'replace'){
            tr.setAttribute('data-indexrow', i);
        }else{
            tr.setAttribute('data-indexrowrenderer', i);
        }
        if(typeof groupField !== 'number'){
            tr.setAttribute('data-has-drilldown', true);
        }else{
            tr.setAttribute('data-has-drilldown', false);
        }
        table.appendChild(tr);
    }
    let selector;
    if(action == 'replace'){
        if(oldComponent.headerElement){
            oldComponent.parentElement.parentElement.replaceChild(
                header, oldComponent.headerElement
            );
            selector = '[data-indexrow]';
        }else{
            oldComponent.parentElement.parentElement.insertBefore(
                header, oldComponent.parentElement
            );
        }
        oldComponent.parentElement.replaceChild(table, oldComponent);
    }else{
        oldComponent.appendChild(table);
        selector = '[data-indexrowrenderer]';
    }
    var cols = jsonResponse['data']['columns'];
    console.log(cols);
    let headerWidth = adjustTableWidth(table, thArray, cols, selector, 25);
    table.style.width = (headerWidth) + 'px';
    header.style.width = (headerWidth) + 'px';
    table.headerElement = header;
    table.sort = 'asc';
    return table;
}

function ChataTable(idRequest, json, options, onRowClick, onRender = () => {}){

    var tableData = getTableData(json, options);
    var columns = getColumnsData(json);

    var table = new Tabulator(`[data-componentid='${idRequest}']`, {
        layout: 'fitDataFill',
        textSize: '9px',
        virtualDomBuffer:300,
        movableColumns: true,
        progressiveRender: true,
        progressiveRenderSize: 5,
        progressiveRenderMargin: 100,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
        },
        columns: columns,
        data: tableData,
        renderComplete: onRender,
        rowClick: onRowClick
    })
    table.setHeight('100%');

    table.toggleFilters = () => {
        var domTable = table.element;
        var filters = domTable.querySelectorAll('.tabulator-header-filter');
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if(filter.style.display == 'none'){
                filter.style.display = 'inline-block';
            }else{
                filter.style.display = 'none';
            }
        }
    }

    table.toggleFilters();

    return table;
}
