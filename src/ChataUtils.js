var ChataUtils = {
    xhr: new XMLHttpRequest(),
    responses: []
};

ChataUtils.sendReport = (idRequest, options, menu, toolbar) => {
    var json = ChataUtils.responses[idRequest];
    var queryId = json['data']['query_id'];
    const URL = options.authentication.demo
      ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
      : `${options.authentication.domain}/autoql/api/v1/query/${queryId}?key=${options.authentication.apiKey}`;

    return new Promise(resolve => {
        ChataUtils.putCall(
            URL, {is_correct: false}, function(r, s){
                menu.classList.remove('show');
                toolbar.classList.remove('show');
                new AntdMessage('Thank you for your feedback.', 3000);
                resolve();
            }, options
        )
    })
}


ChataUtils.getReportProblemMenu = (toolbar, idRequest, type, options) => {
    var menu = ChataUtils.getPopover();
    if(type === 'simple'){
        menu.classList.add('chata-popover-single-message');
    }
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'The data is incorrect',
            ChataUtils.sendReport,
            [idRequest, options, menu, toolbar]
        )
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'The data is incomplete',
            ChataUtils.sendReport,
            [idRequest, options, menu, toolbar]
        )
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'Other...',
            ChataUtils.openModalReport,
            [idRequest, options, menu, toolbar]
        )
    );

    return menu;
}

ChataUtils.reportProblemHandler = (
    evt, idRequest, reportProblem, toolbar) => {
    // closeAllToolbars();
    reportProblem.classList.toggle('show');
    toolbar.classList.toggle('show');
}

ChataUtils.downloadCsvHandler = () => {

}
ChataUtils.copyHandler = () => {

}
ChataUtils.copySqlHandler = () => {

}

ChataUtils.exportPNGHandler = () => {
    
}

ChataUtils.getMoreOptionsMenu = (options, idRequest, type) => {
    var menu = ChataUtils.getPopover();
    if(type === 'simple'){
        menu.classList.add('chata-popover-single-message');
    }

    for (var i = 0; i < options.length; i++) {
        let opt = options[i]
        switch (opt) {
            case 'csv':
                var action = ChataUtils.getActionOption(
                    DOWNLOAD_CSV_ICON, 'Download as CSV',
                    ChataUtils.downloadCsvHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
                break;
            case 'copy':
                var action = ChataUtils.getActionOption(
                    CLIPBOARD_ICON, 'Copy table to clipboard',
                    ChataUtils.copyHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
                break;
            case 'copy_sql':
                var action = ChataUtils.getActionOption(
                    COPY_SQL, 'Copy generated query to clipboard',
                    ChataUtils.copySqlHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
                break;
            case 'png':
                var action = ChataUtils.getActionOption(
                    EXPORT_PNG_ICON, 'Download as PNG',
                    ChataUtils.exportPNGHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
            default:

        }
    }

    return menu;
}

ChataUtils.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
    var button =  htmlToElement(`
        <button
            class="autoql-vanilla-chata-toolbar-btn"
            data-tippy-content="${tooltip}"
            data-id="${idRequest}">
            ${svg}
        </button>
    `)

    button.onclick = (evt) => {
        onClick.apply(null, [evt, idRequest, ...evtParams]);
    }

    return button;
}

ChataUtils.getActionOption = (svg, text, onClick, params) => {
    var element = htmlToElement(`
        <li>
            <span data-test="chata-icon" class="chata-icon">
                ${svg}
            </span>
            ${text}
        </li>
    `);
    element.onclick = (evt) => {
        onClick.apply(null, params);
    }
    return element;
}

ChataUtils.getPopover = () => {
    var optionsMenu = htmlToElement(`
        <div class="chata-more-options-menu">
        </div>
    `);
    var menu = htmlToElement(`
        <div class="chata-popover-wrapper">
        </div>`
    );
    var ul = htmlToElement(`
        <ul class="chata-menu-list">
        </ul>
    `);
    menu.ul = ul;
    optionsMenu.appendChild(ul);
    menu.appendChild(optionsMenu);
    return menu;
}

ChataUtils.openModalReport = (idRequest, options, menu, toolbar) => {
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true
    });
    modal.setTitle('Report a Problem');
    var container = document.createElement('div');
    var textArea = document.createElement('textarea');
    textArea.classList.add('autoql-vanilla-report-problem-text-area');
    var cancelButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn default"
        style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
    )

    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `)

    var reportButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 2px 5px;">
        </div>`
    )

    reportButton.appendChild(spinner);
    reportButton.appendChild(document.createTextNode('Report'));
    container.appendChild(document.createTextNode(
        'Please tell us more about the problem you are experiencing:'
    ));
    container.appendChild(textArea);
    modal.addView(container);
    modal.addFooterElement(cancelButton);
    modal.addFooterElement(reportButton);

    cancelButton.onclick = (evt) => {
        modal.close()
    }

    reportButton.onclick = async (evt) => {
        var reportMessage = textArea.value;
        spinner.classList.remove('hidden');
        await ChataUtils.sendReport(idRequest, options, menu, toolbar);
        modal.close();
    }

    modal.show();
}

ChataUtils.getQueryInput = function(options={}){
    return QueryInput(options);
}

ChataUtils.getQueryOutput = function(options){
    return QueryOutput(options);
}

ChataUtils.sendDrilldownMessage = function(
    json, indexData, options, context='ChataUtils',
    responseRenderer=undefined, loading=undefined){
    var queryId = json['data']['query_id'];
    var obj = {};
    var groupables = getGroupableFields(json);
    if(indexData != -1){
        for (var i = 0; i < groupables.length; i++) {
            var index = groupables[i].indexCol;
            var value = json['data']['rows'][parseInt(indexData)][index];
            var colData = json['data']['columns'][index]['name'];
            obj[colData] = value.toString();
        }
    }

    const URL = options.authentication.demo
      ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
      : `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`;
    let data;

    if(options.authentication.demo){
        data = {
            query_id: queryId,
            group_bys: obj,
            username: 'demo',
            customer_id: options.authentication.customerId || "",
            user_id: options.authentication.userId || "",
            debug: options.autoQLConfig.debug
        }
    }else{
        var cols = [];
        for(var [key, value] of Object.entries(obj)){
            cols.push({
                name: key,
                value: value
            })
        }
        data = {
            debug: options.autoQLConfig.debug,
            columns: cols
        }
    }

    if(context == 'ChataUtils'){
        // var responseLoadingContainer = ChataUtils.putMessage(msg);
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        ChataUtils.drawerContent.appendChild(responseLoadingContainer);
        ChataUtils.ajaxCallPost(URL, function(response, status){
            if(response['data']['rows'].length > 0){
                ChataUtils.putTableResponse(response);
            }else{
                ChataUtils.putSimpleResponse(response);
            }
            ChataUtils.drawerContent.removeChild(responseLoadingContainer);
            refreshTooltips();
        }, data, options);
    }else{
        ChataUtils.ajaxCallPost(URL, function(response, status){
            responseRenderer.innerHTML = '';
            var topBar = responseRenderer.chataBarContainer.getElementsByClassName(
                'autoql-vanilla-chat-bar-text'
            )[0]
            topBar.removeChild(loading);
            var uuid = uuidv4();
            ChataUtils.responses[uuid] = response;
            var div = document.createElement('div');
            div.classList.add('autoql-vanilla-chata-table-container');
            div.classList.add('autoql-vanilla-chata-table-container-renderer');
            var scrollbox = document.createElement('div');
            scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
            scrollbox.appendChild(div);
            responseRenderer.appendChild(scrollbox);
            if(response['data']['rows'].length == 0){
                responseRenderer.innerHTML = `<div>No data found.</div>`;
            }
            if(response['data']['columns'].length == 1){
                var data = response['data'];
                responseRenderer.innerHTML = `<div>${data}</div>`;
            }else{
                var table = createTable(
                    response,
                    div,
                    options,
                    'append',
                    uuid,
                    'autoql-vanilla-table-response-renderer',
                    '[data-indexrowrenderer]'
                );
                table.classList.add('renderer-table');
                scrollbox.insertBefore(table.headerElement, div);
            }
        }, data, options);
    }
}

ChataUtils.makeBarChartDomain = function(data, hasNegativeValues){
    if(hasNegativeValues){
        return d3.extent(data, function(d) { return d.value; });
    }else{
        return [0, d3.max(data, function(d) {
            return d.value;
        })];
    }
}

ChataUtils.getUniqueValues = function(data, getter){
    let unique = {};
    data.forEach(function(i) {
        console.log();
        if(!unique[getter(i)] && typeof getter(i) === 'string') {
            unique[getter(i)] = true;
        }
    });
    return Object.keys(unique);
}

ChataUtils.formatCompareData = function(col, data, groups){
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][0] == group){
                dataGrouped[i]['value1'] = parseFloat(data[x][1]);
                dataGrouped[i]['value2'] = parseFloat(data[x][2]);
            }
        }
    }
    return dataGrouped;
}

ChataUtils.format3dData = function(json, groups, metadata){
    var dataGrouped = [];
    var data = json['data']['rows'];
    var notGroupableField = getNotGroupableField(json);

    var groupableIndex1 = metadata.groupBy.groupable1;
    var groupableIndex2 = metadata.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][groupableIndex2] == group){
                if(typeof data[x][groupableIndex1] === 'string'){
                    dataGrouped[i][data[x][groupableIndex1]]
                    = parseFloat(data[x][notGroupableIndex]);
                }
            }
        }
    }

    return dataGrouped;
}

ChataUtils.groupBy = function(list, keyGetter, indexData) {
    obj = {};
    list.forEach((item) => {
        const key = keyGetter(item);
        if (!obj.hasOwnProperty(key)) {
            obj[key] = item[indexData];
        }else{
            obj[key] += item[indexData];
        }
    });

    return obj;
}

ChataUtils.sort = function(data, operator, colIndex, colType){
    var lines = data;
    var values = []
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            row.push(data[x]);
        }
        values.push(row);
    }
    if(operator == 'asc'){
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) > parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
            }
        }
    }else{
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) < parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
            }
        }
    }
    var sortedArray = values.sort(comparator);

    return sortedArray;
}

ChataUtils.refreshPivotTable = function(table, pivotArray){
    var rows = table.childNodes;
    var cols = ChataUtils.responses[table.dataset.componentid]['columns'];
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'table-row';
    }

    for (var i = 0; i < pivotArray.length; i++) {
        var tdList = rows[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = pivotArray[i][x];
        }
    }

    for (var i = pivotArray.length; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
}

ChataUtils.refreshTableData = function(table, newData, options){
    var rows = newData;//table.childNodes;
    var nodes = table.childNodes;
    var cols = ChataUtils.responses[table.dataset.componentid]['data']['columns'];
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = 'table-row';
    }
    for (var i = 0; i < newData.length; i++) {
        var tdList = nodes[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = formatData(newData[i][x], cols[x], options);
        }
    }
    for (var i = newData.length; i < nodes.length; i++) {
        nodes[i].style.display = 'none';
    }
}

ChataUtils.onClickColumn = function(evt, tableElement, options){
    let sortBy;
    let newClassArrow;
    let parent = evt.target;
    evt.preventDefault();

    if(parent.tagName === 'INPUT'){
        return;
    }

    if(parent.tagName === 'TH'){
        parent = parent.childNodes[0];
    }
    if(tableElement.sort === 'asc'){
        sortBy = 'desc';
        newClassArrow = 'down';
    }else{
        sortBy = 'asc';
        newClassArrow = 'up';
    }

    tableElement.sort = sortBy;
    parent.nextSibling.classList.remove('up');
    parent.nextSibling.classList.remove('down');
    parent.nextSibling.classList.add(newClassArrow);

    var data = applyFilter(tableElement.dataset.componentid);
    var sortData = ChataUtils.sort(
        data, sortBy, parent.dataset.index, parent.dataset.type
    );

    ChataUtils.refreshTableData(
        tableElement, sortData, options
    );
}

ChataUtils.onClickPivotColumn = function(evt, tableElement, options){
    var pivotArray = [];
    var json = cloneObject(ChataUtils.responses[
        tableElement.dataset.componentid
    ]);
    var columns = json['data']['columns'];
    let sortBy;
    let newClassArrow;
    let parent = evt.target;
    evt.preventDefault();

    if(parent.tagName === 'INPUT'){
        return;
    }

    if(parent.tagName === 'TH'){
        parent = parent.childNodes[0];
    }

    if(columns[0].type === 'DATE' &&
        columns[0].name.includes('month')){
        pivotArray = getDatePivotArray(
            json, options, cloneObject(json['data']['rows'])
        );
    }else{
        pivotArray = getPivotColumnArray(
            json, options, cloneObject(json['data']['rows'])
        );
    }

    if(tableElement.sort === 'asc'){
        sortBy = 'desc';
        newClassArrow = 'down';
    }else{
        sortBy = 'asc';
        newClassArrow = 'up';
    }

    tableElement.sort = sortBy;
    parent.nextSibling.classList.remove('up');
    parent.nextSibling.classList.remove('down');
    parent.nextSibling.classList.add(newClassArrow);

    var rows = applyFilter(tableElement.dataset.componentid, pivotArray);
    rows.unshift([]); //Simulate header
    var sortData = sortPivot(rows, parent.dataset.index, sortBy);
    // sortData.unshift([]); //Simulate header
    ChataUtils.refreshPivotTable(tableElement, sortData);

}


ChataUtils.createCsvData = function(json, separator=','){
    var output = '';
    var lines = json['data']['rows'];
    for(var i = 0; i<json['data']['columns'].length; i++){
        var colStr = json['data']['columns'][i]['display_name'] ||
            json['data']['columns'][i]['name'];
        var colName = formatColumnName(colStr);
        output += colName + separator;
    }
    output += '\n';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        for (var x = 0; x < data.length; x++) {
            output += data[x] + separator;
        }
        output += '\n';
    }
    return output
}

ChataUtils.safetynetCall = function(url, callback, options){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = undefined;
            if(xhr.status == 200){
                jsonResponse = JSON.parse(xhr.responseText);
            }
            callback(jsonResponse, xhr.status);
        }
    };
    xhr.open('GET', url);
    // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    xhr.send();
}

ChataUtils.ajaxCall = function(val, callback, options, source){
    const url = options.authentication.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query`
    : `${options.authentication.domain}/autoql/api/v1/query?key=${options.authentication.apiKey}`

    const data = {
        text: val,
        source: source,
        // username: options.authentication.demo ? 'widget-demo' : options.authentication.userId || 'widget-user',
        // customer_id: options.authentication.customerId || "",
        // user_id: options.authentication.userId || "",
        debug: options.autoQLConfig.debug,
        test: options.autoQLConfig.test
    }
    if(options.authentication.demo){
        data['user_id'] = 'demo';
        data['customer_id'] = 'demo';
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse, xhr.status);
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xhr.send(JSON.stringify(data));
}

ChataUtils.putCall = function(url, data, callback, options){

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    }

    xhr.open('PUT', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        xhr.setRequestHeader(
            "Authorization", `Bearer ${options.authentication.token}`
        );
    }
    xhr.send(JSON.stringify(data));

}

ChataUtils.ajaxCallPost = function(url, callback, data, options){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Origin","*");
    if(!options.authentication.demo){
        xmlhttp.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4){
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            callback(jsonResponse, xmlhttp.status);
        }
    };
    xmlhttp.send(JSON.stringify(data));
}

ChataUtils.ajaxCallAutoComplete = function(url, callback, options){

    ChataUtils.xhr.onreadystatechange = function() {
        if (ChataUtils.xhr.readyState === 4){
            var jsonResponse = JSON.parse(ChataUtils.xhr.responseText);
            callback(jsonResponse);
        }
    };
    ChataUtils.xhr.open('GET', url);
    ChataUtils.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    ChataUtils.xhr.setRequestHeader("Authorization", options.authentication.token ? `Bearer ${options.authentication.token}` : undefined);
    ChataUtils.xhr.send();
}

ChataUtils.autocomplete = function(suggestion, suggestionList, liClass='suggestion', options){
    const URL = options.authentication.demo
      ? `https://backend.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
        suggestion
      )}&projectid=1`
      : `${options.authentication.domain}/autoql/api/v1/query/autocomplete?text=${encodeURIComponent(
        suggestion
      )}&key=${options.authentication.apiKey}`
      // &customer_id=${options.authentication.customerId}&user_id=${options.authentication.userId}

    ChataUtils.ajaxCallAutoComplete(URL, function(jsonResponse){
        suggestionList.innerHTML = '';
        console.log(URL);
        var matches = jsonResponse['matches'] || jsonResponse['data']['matches'];
        if(matches.length > 0){
            for(var [key, value] of Object.entries(options.autocompleteStyles)){
                suggestionList.style.setProperty(key, value, '');
            }
            for (var i = matches.length-1; i >= 0; i--) {
                var li = document.createElement('li');
                li.classList.add(liClass);
                li.textContent = matches[i];
                suggestionList.appendChild(li);
                console.log(matches[i]);
            }
            suggestionList.style.display = 'block';
        }else{
            suggestionList.style.display = 'none';
        }
    }, options);
}

ChataUtils.getSupportedDisplayTypesArray = function(){
    return getSupportedDisplayTypesArray();
}

ChataUtils.createSuggestions = function(responseContentContainer, data, classButton='autoql-vanilla-chata-suggestion-btn'){
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement('div');
        var button = document.createElement('button');
        button.classList.add(classButton);
        button.textContent = data[i][0];
        div.appendChild(button);
        responseContentContainer.appendChild(div);
        if(i == data.length-1){
            button.classList.add('none-of-these-btn');
        }
    }
}
