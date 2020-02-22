function createTable(jsonResponse, oldComponent, options, action='replace', uuid, tableClass='table-response', selector='[data-indexrow]'){
    var groupField = getGroupableField(jsonResponse);
    var table = document.createElement('table');
    var header = document.createElement('tr');
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
    var dataLines = jsonResponse['data']['rows'];

    for (var i = 0; i < jsonResponse['data']['columns'].length; i++) {
        var colName = formatColumnName(jsonResponse['data']['columns'][i]['name']);
        var th = document.createElement('th');
        var arrow = document.createElement('div');
        var col = document.createElement('div');
        col.textContent = colName;
        arrow.classList.add('tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column');
        col.setAttribute('data-type', jsonResponse['data']['columns'][i]['type']);
        col.setAttribute('data-index', i);

        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        filter.colType = jsonResponse['data']['columns'][i]['type'];
        filter.onkeyup = function(event){
            var _table = document.querySelector(`[data-componentid='${oldComponent.dataset.componentid}']`);
            var rows = applyFilter(oldComponent.dataset.componentid);
            DataMessenger.refreshTableData(_table, cloneObject(rows), DataMessenger.options, false);
        }
        col.appendChild(divFilter);

        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
        thArray.push(th);
    }
    header.classList.add('table-header');
    // table.appendChild(header);
    for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i];
        var tr = document.createElement('tr');
        for (var x = 0; x < data.length; x++) {
            value = formatData(
                data[x], jsonResponse['data']['columns'][x],
                options
            );
            var td = document.createElement('td');
            td.textContent = value;
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
        // oldComponent.parentElement.appendChild(header);
        oldComponent.appendChild(table);
    }
    let headerWidth = adjustTableWidth(table, thArray, selector);
    table.style.width = headerWidth + 'px';
    header.style.width = headerWidth + 'px';
    table.headerElement = header;
    return table;
}

function createPivotTable(pivotArray, oldComponent, action='replace', uuid='', tableClass='table-response'){
    var header = document.createElement('tr');
    var table = document.createElement('table');
    var jsonResponse = DataMessenger.responses[
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
        arrow.classList.add('tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column-pivot');
        col.setAttribute('data-type', 'PIVOT');
        col.setAttribute('data-index', i);
        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        if(i == 0){
            filter.colType = DataMessenger.responses[
                oldComponent.dataset.componentid || uuid
            ]['data']['columns'][0];
        }else if(i >= 1){
            filter.colType = DataMessenger.responses[
                oldComponent.dataset.componentid || uuid
            ]['data']['columns'][2];
        }
        filter.onkeyup = function(event){
            var _json = cloneObject(
                DataMessenger.responses[oldComponent.dataset.componentid]
            );
            var _table = document.querySelector(
                `[data-componentid='${oldComponent.dataset.componentid}']`
            );

            var _columns = _json['data']['columns'];
            if(_columns[0].type === 'DATE' &&
                _columns[0].name.includes('month')){
                var pivotArray = getDatePivotArray(
                    _json,
                    DataMessenger.options,
                    cloneObject(_json['data']['rows'])
                );
            }else{
                var pivotArray = getPivotColumnArray(
                    _json,
                    DataMessenger.options,
                    cloneObject(_json['data']['rows'])
                );
            }
            pivotArray.shift();
            var rows = applyFilter(oldComponent.dataset.componentid, pivotArray);
            // rows.unshift([]);
            DataMessenger.refreshPivotTable(_table, rows);
        }
        col.appendChild(divFilter);
        if(i == 0){
            th.classList.add('sticky-col');
        }
        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
        thArray.push(th);
    }
    header.classList.add('table-header');

    for (var i = 1; i < pivotArray.length; i++) {
        var tr = document.createElement('tr');
        for (var x = 0; x < pivotArray[i].length; x++) {
            var td = document.createElement('td');
            td.textContent = pivotArray[i][x];
            if(x == 0){
                td.classList.add('sticky-col');
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
    let headerWidth = adjustTableWidth(table, thArray, selector, 25);
    table.style.width = (headerWidth) + 'px';
    header.style.width = (headerWidth) + 'px';
    table.headerElement = header;
    return table;
}
