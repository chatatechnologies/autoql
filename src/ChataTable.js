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

function callTableFilter(col, headerValue, rowValue, options){
    const colType = col.type
    if(colType == 'DATE'){
        var formatDate = formatData(
            rowValue,
            col,
            options
    );
        return formatDate.toLowerCase().includes(headerValue);
    }else if(
        colType == 'DOLLAR_AMT' ||
        colType == 'QUANTITY' ||
        colType == 'PERCENT'
    ) {
        var trimmedValue = headerValue.trim();
        if (trimmedValue.length >= 2) {
            const number = parseFloat(trimmedValue.substr(1));
            if (trimmedValue[0] === '>' && trimmedValue[1] === '=') {
                return rowValue >= number;
            } else if (trimmedValue[0] === '>') {
                return rowValue > number;
            } else if (trimmedValue[0] === '<' && trimmedValue[1] === '=') {
                return rowValue <= number;
            } else if (trimmedValue[0] === '<') {
                return rowValue < number;
            } else if (trimmedValue[0] === '!' && trimmedValue[1] === '=') {
                return rowValue !== number;
            } else if (trimmedValue[0] === '=') {
                return rowValue === number;
            }
        }
        return rowValue.toString().includes(headerValue);
    }else{
        return rowValue.toString().toLowerCase().includes(headerValue);
    }
}

function getPivotColumns(json, pivotColumns, options){
    const columns = json['data']['columns'];
    var columnsData = [];
    pivotColumns.map((col, index) => {
        var colIndex = index;
        var title = col;
        if(colIndex > 0)colIndex = 2;

        if(index > 0){
            title = formatData(col, columns[1], options);
        }

        columnsData.push({
            title: title,
            field: col,
            headerFilter: "input",
            formatter: (cell, formatterParams, onRendered) => {
                let value;
                if(
                    cell.getValue() === '' &&
                    columns[colIndex].type == 'DOLLAR_AMT'
                ){
                    value = 0;
                }else{
                    value = cell.getValue();
                }
                return formatData(value, columns[colIndex], options);
            }
        })
    });

    return columnsData;
}

function getPivotData(pivotArray, pivotColumns){
    var tableData = [];
    for (var i = 0; i < pivotArray.length; i++) {
        var line = pivotArray[i];
        var row = {};
        for (var x = 0; x < line.length; x++) {
            colName = pivotColumns[x].field;
            row[colName] = line[x];
        }
        tableData.push(row);
    }

    return tableData;
}

function getColumnsData(json, options){
    const columns = json['data']['columns'];
    var columnsData = []
    columns.map((col, index) => {
        var colName = col['display_name'] || col['name'];
        var isVisible = true;
        if('is_visible' in col){
            isVisible = col['is_visible']
            || false;
        }
        columnsData.push({
            title: formatColumnName(colName),
            field: colName,
            headerFilter: "input",
            visible: isVisible,
            formatter: (cell, formatterParams, onRendered) => {
                return formatData(cell.getValue(), col, options);
            },
            headerFilterFunc: (
                headerValue, rowValue, rowData, filterParams) => {
                return callTableFilter(col, headerValue, rowValue, options);
            }
        })
    })
    return columnsData;
}

function getTableData(json, options) {
    const data = json['data']['rows'];
    const columns = json['data']['columns'];
    var tableData = [];
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var rowData = {}
        for (var x = 0; x < row.length; x++) {
            var col = columns[x];
            var colName = col['display_name'] || col['name'];
            rowData[colName] = row[x];
        }
        tableData.push(rowData);
    }

    return tableData;
}

function ChataPivotTable(idRequest, options, onRender = () => {}){
    var json = ChataUtils.responses[idRequest];
    var cols = json['data']['columns'];
    let pivotArray;
    if(cols[0].type === 'DATE' && cols[0].name.includes('month')){
        pivotArray = getDatePivotArray(
            json, options, json['data']['rows']
        );
    }else{
        pivotArray = getPivotColumnArray(
            json, options, json['data']['rows']
        );
    }

    var pivotColumns = pivotArray.shift();
    var columns = getPivotColumns(json, pivotColumns, options)
    var tableData = getPivotData(pivotArray, columns);

    var table = new Tabulator(`[data-componentid='${idRequest}']`, {
        layout: 'fitDataFill',
        textSize: '9px',
        virtualDomBuffer: 300,
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
        rowClick: (e, row) =>{
            onRowClick(e, row, cloneObject(json));
        }
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

function ChataTable(
    idRequest, options, onRowClick, isPivot=false, onRender = () => {}){

    var json = ChataUtils.responses[idRequest];
    var tableData = getTableData(json, options);
    var columns = getColumnsData(json, options);

    var table = new Tabulator(`[data-componentid='${idRequest}']`, {
        layout: 'fitDataFill',
        textSize: '9px',
        virtualDomBuffer: 300,
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
        rowClick: (e, row) =>{
            onRowClick(e, row, cloneObject(json));
        }
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
