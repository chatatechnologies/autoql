function createTable(jsonResponse, oldComponent, options, action='replace', uuid, tableClass='table-response'){
    var groupField = getGroupableField(jsonResponse);
    var table = document.createElement('table');
    var header = document.createElement('tr');
    table.classList.add(tableClass);
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
        var col = document .createElement('div');
        col.textContent = colName;
        arrow.classList.add('tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column');
        col.setAttribute('data-type', jsonResponse['data']['columns'][i]['type']);
        col.setAttribute('data-index', i);

        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
    }
    table.appendChild(header);
    for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i];
        var tr = document.createElement('tr');
        for (var x = 0; x < data.length; x++) {
            value = formatData(
                data[x], jsonResponse['data']['columns'][x]['type'],
                options.languageCode,
                options.currencyCode
            );
            var td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        }
        if(typeof groupField !== 'number'){
            if(action == 'replace'){
                tr.setAttribute('data-indexrow', i);
            }else{
                tr.setAttribute('data-indexrowrenderer', i);
            }
        }
        table.appendChild(tr);
    }
    if(action == 'replace'){
        oldComponent.parentElement.replaceChild(table, oldComponent);
    }else{
        oldComponent.appendChild(table);
    }
    return table;
}


function createPivotTable(pivotArray, oldComponent, action='replace', uuid='', tableClass='table-response'){
    var header = document.createElement('tr');
    var table = document.createElement('table');
    table.classList.add(tableClass);
    if(oldComponent.dataset.componentid){
        table.setAttribute('data-componentid', oldComponent.dataset.componentid);
        if(oldComponent.parentElement.classList.contains('chata-chart-container')){
            oldComponent.parentElement.classList.remove('chata-chart-container');
            oldComponent.parentElement.classList.add('chata-table-container');
            // oldComponent.parentElement.parentElement.parentElement.classList.remove('chart-full-width');
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
        if(i == 0){
            th.classList.add('sticky-col');
        }
        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
    }

    table.appendChild(header);

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
        table.appendChild(tr);
    }
    if(action == 'replace'){
        oldComponent.parentElement.replaceChild(table, oldComponent);
    }else{
        oldComponent.appendChild(table);
    }
    return table;
}
