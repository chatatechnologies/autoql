function formatChartData(val, col, options){
    var clone = cloneObject(options);
    clone.dataFormatting.currencyDecimals = 0;
    return formatData(val, col, clone);
}

function formatData(val, col, allOptions={}){
    const options = allOptions.dataFormatting;
    value = '';
    let type = col['type'];
    switch (type) {
        case 'DOLLAR_AMT':
            val = parseFloat(val);
            if(isNaN(val))val = 0;
            const sigDigs = String(parseInt(val.toFixed(2))).length
            if(val != 0){
                value = new Intl.NumberFormat(options.languageCode, {
                        style: 'currency',
                        currency: options.currencyCode,
                        minimumFractionDigits: options.currencyDecimals
                    }
                ).format(val);
            }else{
                value = val.toFixed(2);
            }
        break;
        case 'DATE':
            var colName = col.name;
            if(colName.includes('year')){
                value = moment(parseInt(val)*1000).format('YYYY');
            }else if(colName.includes('month')){
                value = moment(parseInt(val)*1000).format(
                    options.monthYearFormat
                );
            }else{
                value = moment(parseInt(val)*1000).format(
                    options.dayMonthYearFormat
                );
            }
        break;
        case 'PERCENT':
            if(allOptions.dataFormatting.comparisonDisplay == 'PERCENT'){
                val = parseFloat(val) * 100;
                if(!isNaN(val)){
                    value =  val.toFixed(2) + '%';
                }else{
                    value = '';
                }
            }else{
                value = parseFloat(val).toFixed(4);
            }
        break;
        case 'QUANTITY':
            var n = Math.abs(parseFloat(val)); // Change to positive
            var decimal = n - Math.floor(n);
            if(decimal > 0){
                value = parseFloat(val).toFixed(options.quantityDecimals);
            }else{
                value = parseInt(val);
            }

        break;
        case 'RATIO':
            if(allOptions.dataFormatting.comparisonDisplay == 'PERCENT'){
                val = parseFloat(val) * 100;
                if(!isNaN(val)){
                    value =  val.toFixed(2) + '%';
                }else{
                    value = '';
                }
            }else{
                value = parseFloat(val).toFixed(4);
            }
        break;
        case 'NUMBER':
            val = parseFloat(val) * 100;
            if(!isNaN(val)){
                value =  val.toFixed(2) + '%';
            }else{
                value = '';
            }
        break;
        case 'DATE_STRING':
            var momentObj = moment(val, 'YYYY-MM');
            value = momentObj.format(options.monthYearFormat);
        break;
        default:
            if(Object.prototype.toString.call(val) === '[object Object]'){
                value = '';
            }else{
                value = val;
            }
    }
    if(value === undefined)return '';
    else return value;
}

function formatColumnName(col){
    return col.replace(/__/g, ' ').replace(/_/g, ' ').
    replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    // NOTE: this case only occurs in tests
    if(Number.isNaN(monthIndex)){
        year = '1969';
        day = '31';
        monthIndex = 11;
    }
    // return MONTH_NAMES[monthIndex] + ' ' + day + ', ' + year;
    return MONTH_NAMES[monthIndex] + ' ' + year;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
    } catch (err) {
    }

    document.body.removeChild(textArea);
}

function putLoadingContainer(target){
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');

    responseLoadingContainer.classList.add('chat-bar-loading');
    responseLoading.classList.add('response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    target.appendChild(responseLoadingContainer);
    return responseLoadingContainer;
}

function getSafetynetValues(node){
    var nodes = node.getElementsByClassName('safetynet-value');
    var words = [];
    for (var i = 0; i < nodes.length; i++) {
        words.push(nodes[i].textContent.trim());
    }
    return words;
}

function runQuery(event, objContext){

    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement.parentElement;
    }else if(event.target.tagName == 'path'){
        var node = event.target.parentElement.parentElement.parentElement;
    }else{
        var node = event.target.parentElement;
    }
    var words = getSafetynetValues(node);

    switch (objContext.constructor) {
        case DataMessenger:
            objContext.sendMessage(
                words.join(' '),
                'data_messenger.validation'
            );
            break;
        default:
            objContext.sendMessageToResponseRenderer(
                words.join(' ')
            );
        ;
    }
}

function deleteSuggestion(event){
    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement;
    }else{
        var node = event.target.parentElement.parentElement;
    }
    node.parentElement.removeChild(node);
}


function csvTo2dArray(parseMe) {
    const splitFinder = /,|\r?\n|"(\\"|[^"])*?"/g;
    let currentRow = [];
    const rowsOut = [currentRow];
    let lastIndex = splitFinder.lastIndex = 0;

    const pushCell = (endIndex) => {
        endIndex = endIndex || parseMe.length;
        const addMe = parseMe.substring(lastIndex, endIndex);
        currentRow.push(addMe.replace(/^"|"$/g, ""));
        lastIndex = splitFinder.lastIndex;
    }

    let regexResp;
    while (regexResp = splitFinder.exec(parseMe)) {
        const split = regexResp[0];

        if (split.startsWith(`"`) === false) {
            const splitStartIndex = splitFinder.lastIndex - split.length;
            pushCell(splitStartIndex);

            const isNewLine = /^\r?\n$/.test(split);
            if (isNewLine) { rowsOut.push(currentRow = []); }
        }
    }
    pushCell();
    return rowsOut;
}

function getGroupableField(json){
    var r = {
        indexCol: -1,
        jsonCol: {},
        name: ''
    }
    for (var i = 0; i < json['data']['columns'].length; i++) {
        if(json['data']['columns'][i]['groupable']){
            r['indexCol'] = i;
            r['jsonCol'] = json['data']['columns'][i];
            r['name'] = json['data']['columns'][i]['name'];
            return r;
        }
    }
    return -1;
}

function getNotGroupableField(json){
    var r = {
        indexCol: -1,
        jsonCol: {},
        name: ''
    }
    for (var i = 0; i < json['data']['columns'].length; i++) {
        if(!json['data']['columns'][i]['groupable']){
            r['indexCol'] = i;
            r['jsonCol'] = json['data']['columns'][i];
            r['name'] = json['data']['columns'][i]['name'];
            return r;
        }
    }
    return -1;
}



function getGroupables(json){
    var cont = 0;
    var groups = []
    for (var i = 0; i < json['data']['columns'].length; i++) {
        if(json['data']['columns'][i]['groupable']){
            groups.push(json['data']['columns'][i]);
        }
    }
    return groups;
}

function getGroupableCount(json){
    var cont = 0;
    for (var i = 0; i < json['data']['columns'].length; i++) {
        if(json['data']['columns'][i]['groupable']){
            cont++;
        }
    }
    return cont;
}

function getPivotColumnArray(json, options, _data){
    var lines = _data;
    var values = [];
    var firstColName = '';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            if(firstColName == '' && json['data']['columns'][x]['groupable']){
                var name = json['data']['columns'][x]['display_name'] ||
                json['data']['columns'][x]['name'];
                firstColName = name.charAt(0).toUpperCase() + name.slice(1);
            }
            // row.push(formatData(
            //     data[x],
            //     json['data']['columns'][x],
            //     options
            // ));
            row.push(data[x]);
        }
        values.push(row);
    }
    var pivotArray = getPivotArray(values, 0, 1, 2, firstColName);
    return pivotArray;
}

function sortPivot(pivotArray, colIndex, operator){
    pivotArray.shift();
    pivotArray.shift();


    if(operator == 'asc'){
        var comparator = function(a, b) {

            if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                return parseFloat(
                    a[colIndex].toString().slice(1)
                ) > parseFloat(b[colIndex].toString().slice(1)) ? 1 : -1;
            }else{
                return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
            }
        }
    }else{
        var comparator = function(a, b) {
            if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                return parseFloat(
                    a[colIndex].toString().slice(1)
                ) < parseFloat(b[colIndex].toString().slice(1)) ? 1 : -1;
            }else{
                return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
            }
        }
    }
    return cloneObject(pivotArray.sort(comparator));
}

function getDatePivotArray(json, options, _data){
    var lines = _data;
    var values = [];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {

            switch (json['data']['columns'][x]['type']) {
                case 'DATE':
                    var value = data[x];
                    var date = new Date( parseInt(value) * 1000);
                    row.unshift(
                        MONTH_NAMES[date.getMonth()], date.getFullYear()
                    );
                    break;
                default:
                    // row.push(formatData(
                    //     data[x], json['data']['columns'][x],
                    //     options
                    // )
                    // );
                    row.push(data[x])
            }
        }
        values.push(row);
    }

    var pivotArray = getPivotArray(values, 0, 1, 2, 'Month');
    return pivotArray;
}

function getPivotArray(dataArray, rowIndex, colIndex, dataIndex, firstColName) {
    var result = {}, ret = [];
    var newCols = [];
    for (var i = 0; i < dataArray.length; i++) {

        if (!result[dataArray[i][rowIndex]]) {
            result[dataArray[i][rowIndex]] = {};
        }
        result[dataArray[i][rowIndex]][dataArray[i][colIndex]] = dataArray[i][dataIndex];

        if (newCols.indexOf(dataArray[i][colIndex]) == -1) {
            newCols.push(dataArray[i][colIndex]);
        }
    }

    newCols.sort();
    var item = [];

    item.push(firstColName);
    item.push.apply(item, newCols);
    ret.push(item);

    for (var key in result) {
        item = [];
        item.push(key);
        for (var i = 0; i < newCols.length; i++) {
            item.push(result[key][newCols[i]] || "");
        }
        ret.push(item);
    }
    return ret;
}

function getSVGString(svgNode) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles( svgNode );
    appendCSS( cssStyleText, svgNode );

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    return svgString;

    function getCSSStyles( parentElement ) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push( '#'+parentElement.id );
        for (var c = 0; c < parentElement.classList.length; c++)
        if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
        selectorTextArr.push( '.'+parentElement.classList[c] );

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if ( !contains('#'+id, selectorTextArr) )
            selectorTextArr.push( '#'+id );

            var classes = nodes[i].classList;
            for (var c = 0; c < classes.length; c++)
            if ( !contains('.'+classes[c], selectorTextArr) )
            selectorTextArr.push( '.'+classes[c] );
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            var s = document.styleSheets[i];

            try {
                if(!s.cssRules) continue;
            } catch( e ) {
                if(e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            var cssRules = s.cssRules;
            for (var r = 0; r < cssRules.length; r++) {
                if ( contains( cssRules[r].selectorText, selectorTextArr ) )
                extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str,arr) {
            return arr.indexOf( str ) === -1 ? false : true;
        }

    }

    function appendCSS( cssText, element ) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type","text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore( styleElement, refNode );
    }
}

function svgString2Image(svgString, width, height) {
    var imgsrc = 'data:image/svg+xml;base64,'+ btoa(
        unescape(encodeURIComponent(svgString))
    );

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var image = new Image();
    image.onload = function() {
        context.clearRect ( 0, 0, width, height );
        context.drawImage(image, 0, 0, width, height);
        var link = document.createElement("a");
        link.setAttribute('href', canvas.toDataURL("image/png;base64"));
        link.setAttribute('download', 'Chart.png');
        link.click();
    };


    image.src = imgsrc;
}

function mergeOptions(objList){
    var output = [];
    for (var i = 0; i < objList.length; i++) {
        let obj = objList[i];
        for (var [key, value] of Object.entries(obj)) {
            output[key] = value;
        }
    }
    return output;
}

function getSpeech(button){
    window.SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;
    if(window.SpeechRecognition){
        let recognition = new window.SpeechRecognition();
        recognition.interimResults = true;
        recognition.maxAlternatives = 10;
        recognition.continuous = true;
        return recognition;
    }else{
        return false
    }
}

function formatLabels(labels, col, options){
    labels = labels.sort();
    for (var i = 0; i < labels.length; i++) {
        labels[i] = formatData(labels[i], col, options);
    }
    return labels;
}

function formatDataToHeatmap(json, options){
    var lines = json['data']['rows'];
    var values = [];
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var groupableIndex1 = groupables[0].indexCol;
    var groupableIndex2 = groupables[1].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;

    var col1 = json['data']['columns'][groupableIndex1];
    var col2 = json['data']['columns'][groupableIndex2];

    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['labelY'] = formatData(data[groupableIndex1], col1, options);
        row['labelX'] = formatData(data[groupableIndex2], col2, options);
        row['unformatY'] = data[groupableIndex1];
        row['unformatX'] = data[groupableIndex2];
        var value = parseFloat(data[notGroupableIndex]);
        row['value'] = value;
        values.push(row);
    }
    return values;
}

function formatDataToBarChart(json, options){
    var lines = json['data']['rows'];
    var values = [];
    var col1 = json['data']['columns'][0];
    var hasNegativeValues = false;
    var groupableField = getGroupableField(json);
    var notGroupableField = getNotGroupableField(json);

    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['label'] = formatData(
            data[groupableField.indexCol], groupableField.jsonCol, options
        );
        var value = parseFloat(data[notGroupableField.indexCol]);
        if(value < 0 && !hasNegativeValues){
            hasNegativeValues = true;
        }
        row['value'] = value;


        values.push(row);
    }
    return [values, hasNegativeValues];
}

function getSupportedDisplayTypesArray(){
    return [
        'table',
        // 'date_pivot',
        'pivot_column',
        'line',
        'bar',
        'column',
        'heatmap',
        'bubble',
        'stacked_bar',
        'stacked_column'
    ];
}


function cloneObject(source) {
    if (Object.prototype.toString.call(source) === '[object Array]') {
        var clone = [];
        for (var i=0; i<source.length; i++) {
            clone[i] = cloneObject(source[i]);
        }
        return clone;
    } else if (typeof(source)=="object") {
        var clone = {};
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                clone[prop] = cloneObject(source[prop]);
            }
        }
        return clone;
    } else {
        return source;
    }
}

function refreshTooltips(){
    tippy('.chata-interpretation', {
        theme: 'chata',
        onShow: function(instance){
            var data = ChataUtils.responses[instance.reference.dataset.id]['data'];
            var content  = `<span class='title-tip'>Interpretation:</span> <span class="text-tip">${data['interpretation']}</span>`;
            // if(ChataUtils.options.debug){
            //     content += `</br></br>
            //     <span class='title-tip'>SQL:</span> <span class="text-tip">${data['sql']}</span>
            //     `;
            // }
            instance.setContent(
                content
            );
        }
    });
    tippy('[data-tippy-content]', {
        theme: 'chata',
        delay: [500]
    })
}

function tooltipCharts(){
    var get2dContent = (instance) => {
        var dataset = instance.reference.dataset;
        var content  = `<span class='title-tip'>${dataset.col1}:</span> <span class="text-tip">${dataset.colvalue1}</span>`;
        content += '<br/>';
        content += `<span class='title-tip'>${dataset.col2}:</span> <span class="text-tip">${dataset.colvalue2}</span>`
        return content;
    }

    tippy('.tooltip-2d', {
        theme: 'chata',
        onShow: function(instance){
            instance.setContent(
                get2dContent(instance)
            );
        }
    })

    tippy('.tooltip-3d', {
        theme: 'chata',
        onShow: function(instance){
            var dataset = instance.reference.dataset;
            var content = get2dContent(instance);
            content += '<br/>';
            content += `<span class='title-tip'>${dataset.col3}:</span> <span class="text-tip">${dataset.colvalue3}</span>`;
            instance.setContent(
                content
            );
        }
    })
}

function applyFilter(idRequest, array){
    var _table = document.querySelector(`[data-componentid='${idRequest}']`);
    var inputs = _table.headerElement.getElementsByTagName('input');
    var json = ChataUtils.responses[_table.dataset.componentid];
    var rows = array || cloneObject(json['data']['rows']);
    for (var i = 0; i < inputs.length; i++) {
        if(inputs[i].value == '')continue;
        var colType = inputs[i].colType;
        var compareValue = inputs[i].value.toLowerCase();
        rows = rows.filter(function(elem){
            var v = elem[i];
            if(colType == 'DATE'){
                var formatDate = formatData(
                    v,
                    json['data']['columns'][i],
                    ChataUtils.options
            );
                return formatDate.toLowerCase().includes(compareValue);
            }else if(
                colType == 'DOLLAR_AMT' ||
                colType == 'QUANTITY' ||
                colType == 'PERCENT'
            ) {
                var trimmedValue = compareValue.trim();
                if (trimmedValue.length >= 2) {
                    const number = parseFloat(trimmedValue.substr(1));
                    if (trimmedValue[0] === '>' && trimmedValue[1] === '=') {
                        return v >= number;
                    } else if (trimmedValue[0] === '>') {
                        return v > number;
                    } else if (trimmedValue[0] === '<' && trimmedValue[1] === '=') {
                        return v <= number;
                    } else if (trimmedValue[0] === '<') {
                        return v < number;
                    } else if (trimmedValue[0] === '!' && trimmedValue[1] === '=') {
                        return v !== number;
                    } else if (trimmedValue[0] === '=') {
                        return v === number;
                    }
                }
                return v.toString().includes(compareValue);
            }else{
                return v.toString().toLowerCase().includes(compareValue);
            }
        });
    }
    return rows;
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function createTableContainer(){
    var div = document.createElement('div');
    div.classList.add('autoql-vanilla-chata-table');
    return div;
}

const getNumberOfGroupables = columns => {
    if (columns) {
        let numberOfGroupables = 0
        columns.forEach(col => {
            if (col.groupable) {
                numberOfGroupables += 1
            }
        })
        return numberOfGroupables
    }
    return null
}

const supportsRegularPivotTable = columns => {
    const hasTwoGroupables = getNumberOfGroupables(columns) === 2
    return hasTwoGroupables && columns.length === 3
}

const isColumnNumberType = col => {
    const type = col.type
    return (
        type === 'DOLLAR_AMT' ||
        type === 'QUANTITY' ||
        type === 'PERCENT' ||
        type === 'RATIO'
    )
}

const isColumnStringType = col => {
    const  type = col.type
    return type === 'STRING' || type === 'DATE_STRING' || type === 'DATE'
}

const getColumnTypeAmounts = columns => {
    let amountOfStringColumns = 0
    let amountOfNumberColumns = 0

    columns.forEach(col => {
        if (isColumnNumberType(col)) {
            amountOfNumberColumns += 1
        } else if (isColumnStringType(col)) {
            amountOfStringColumns += 1
        }
    })

    return { amountOfNumberColumns, amountOfStringColumns }
}

const supports2DCharts = columns => {
    const amounts =
    getColumnTypeAmounts(
        columns
    )

    return amounts.amountOfNumberColumns > 0
    && amounts.amountOfStringColumns > 0
}

const getSupportedDisplayTypes = response => {
    try {
        if (!response.data.display_type) {
            return []
        }

        const displayType = response.data.display_type

        if (displayType === 'suggestion' || displayType === 'help') {
            return [displayType]
        }

        const columns = response.data.columns || [];
        const rows = response.data.rows || [];

        if (!columns || rows.length <= 1) {
            return []
        }

        if (supportsRegularPivotTable(columns)) {
            let supportedDisplayTypes = ['table']
            if (rows.length < 1000) {
                supportedDisplayTypes = [
                    'pivot_table',
                    'stacked_bar',
                    'stacked_column',
                    'stacked_line',
                    'bubble',
                    'heatmap',
                    'table'
                ]
            }
            return supportedDisplayTypes
        } else if (supports2DCharts(columns)) {
            const supportedDisplayTypes = ['table', 'bar', 'column', 'line']
            supportedDisplayTypes.push('pie')
                const dateColumn = columns.find(
                    col => col.type === 'DATE' || col.type === 'DATE_STRING'
                )

                if(dateColumn){
                    if (
                        dateColumn.name &&
                        dateColumn.name.toLowerCase().includes('month') &&
                        columns.length === 2
                    ) {
                        supportedDisplayTypes.push('pivot_table')
                    }
                }
                return supportedDisplayTypes
            }
            return ['table']
        } catch (error) {
            console.error(error)
            return ['table']
        }
}

// const getSupportedDisplayTypes = response => {
//     // For CaaS there should be 3 types: data, suggestion, help
//     const displayType = response['data']['display_type']
//
//     if (displayType === 'suggestion' || displayType === 'help') {
//         return [displayType]
//     }
//
//     const columns = response['data']['columns'];
//
//     if (!columns) {
//         return []
//     }
//
//     if (getNumberOfGroupables(columns) === 1) {
//         // Is direct key-value query (ie. Avg days to pay per customer)
//         const supportedDisplayTypes = ['bar', 'column', 'line', 'table']
//
//         if (columns.length === 2) {
//             supportedDisplayTypes.push('pie')
//         }
//
//         // create pivot based on month and year
//         if (
//             columns[0].type === 'DATE' &&
//             columns[0].name.includes('month') &&
//             columns.length === 2
//         ) {
//             supportedDisplayTypes.push('pivot_column')
//         }
//         return supportedDisplayTypes
//     } else if (getNumberOfGroupables(columns) === 2) {
//         // Is pivot query (ie. Sale per customer per month)
//         return [
//             'multi_line',
//             'stacked_bar',
//             'stacked_column',
//             'bubble',
//             'heatmap',
//             'table',
//             'pivot_column'
//         ]
//     }
//
//     // We should always be able to display the table type by default
//     return ['table']
// }

async function adjustTableWidth(table, thArray, cols,
    selector='[data-indexrow]', offset=0){

    var headerWidth = 0;
    var rowsElements = table.querySelectorAll(selector);
    var tdEl = rowsElements[0].getElementsByTagName('td');
    var sizes = [];
    for (var x = 0; x < tdEl.length; x++) {

        if(cols[x] && 'is_visible' in cols[x] && !cols[x]['is_visible'])continue;

        const div = document.createElement('div')
        div.innerHTML = thArray[x].textContent;
        div.style.display = 'inline-block';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        document.body.appendChild(div);

        w = tdEl[x].offsetWidth;

        if(div.offsetWidth > tdEl[x].offsetWidth){
            w = div.offsetWidth + 70;
        }
        w += offset;
        thArray[x].style.width = (w) + 'px';
        tdEl[x].style.width = (w) + 'px';

        headerWidth += w;
        document.body.removeChild(div);
    }

    return headerWidth;
}

function hideShowTableCols(table){
    var json = ChataUtils.responses[table.dataset.componentid];
    var cols = json['data']['columns'];
    const thList = table.headerElement.childNodes;
    const trList = table.childNodes;
    for (var i = 0; i < thList.length; i++) {
        if(!cols[i]['is_visible']){
            thList[i].classList.add('chata-hidden');
        }else{
            thList[i].classList.remove('chata-hidden');
        }
    }

    for (var i = 0; i < trList.length; i++) {
        var tdList = trList[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            if(!cols[x]['is_visible']){
                tdList[x].classList.add('chata-hidden');
            }else{
                tdList[x].classList.remove('chata-hidden');
            }
        }
    }
}

function getStringWidth(string){
    const div = document.createElement('div')
    div.innerHTML = string;
    div.style.display = 'inline-block';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    var width = div.offsetWidth;
    document.body.removeChild(div);
    return width;
}

function allColHiddenMessage(table){
    const requestId = table.dataset.componentid;
    const json = ChataUtils.responses[requestId];
    var cols = json['data']['columns'];
    var isAllHidden = true;
    for (var i = 0; i < cols.length; i++) {
        if(cols[i].is_visible){
            isAllHidden = false;
            break;
        }
    }
    let message;
    if(table.noColumnsElement){
        message = table.noColumnsElement;
    }else{
        message = htmlToElement(
        `<div class="autoql-vanilla-no-columns-error-message">
            <div>
                <span class="chata-icon warning-icon">
                    ${WARNING}
                </span>
                <br> All columns in this table are currently hidden.
                You can adjust your column visibility preferences using
                the Column Visibility Manager
                (<span class="chata-icon eye-icon">${COLUMN_EDITOR}</span>)
                in the Options Toolbar.
            </div>
        </div>`);
        table.parentElement.appendChild(message);
        table.noColumnsElement = message;
    }

    if(isAllHidden){
        message.style.display = 'flex';
        table.style.display = 'none';
    }else{
        message.style.display = 'none';
        table.style.display = 'block';
        table.tabulator.redraw();
    }
}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft);
    }else{
        return null;
    }
}

function mouseY(evt) {
    if(evt.pageY){
        return evt.pageY;
    }else if (evt.clientY){
        return evt.clientY + (document.documentElement.scrollTop ?
            document.documentElement.scrollTop :
            document.body.scrollTop);
    }else{
        return null;
    }
}

const getActiveIntegrator = (domain) => {
    if (domain.includes('spira')) {
        return 'spira'
    } else if (domain.includes('locate')) {
        return 'locate'
    } else if (domain.includes('purefacts')) {
        return 'purefacts'
    } else if (domain.includes('bluelink')) {
        return 'bluelink'
    } else if (domain.includes('lefort')) {
        return 'lefort'
    } else if (domain.includes('nbccontest')) {
        return 'nbcomp'
    } else if (domain.includes('vitruvi')) {
        return 'vitruvi'
    } else if (domain.includes('accounting-demo')) {
        return 'demo'
    }

    return '';
}

getIntroMessageTopics = (integrator) => {
    const topics =
    {
        spira: [
            {
                topic: 'Revenue',
                queries: [
                    'Total revenue this year',
                    'Total revenue by month for the last six months',
                    'Total revenue by area last year',
                    'Total revenue by customer for the last six months',
                    'Average revenue by area last year',
                    'Average revenue by ticket type for the last six months',
                ],
            },
            {
                topic: 'Estimates',
                queries: [
                    'Total estimates by area last year',
                    'Total estimates by ticket type last year',
                    'Number of estimates by customer this year',
                    'Number of estimates by job type last year',
                    'Average estimates by ticket type last year',
                    'Average estimates by month last year',
                ],
            },
            {
                topic: 'Utilization',
                queries: [
                    'Total utilization on resources last month',
                    'Total resource hours by area last month ',
                    'Total hours utilized for personnel last month',
                    'Total hours utilization by job last month',
                    'Total hours utilization on equipment last year',
                    'Average hours utilization by job type last month',
                ],
            },
            {
                topic: 'Jobs',
                queries: [
                    'All jobs scheduled to start this year',
                    'All active jobs scheduled to end last year',
                    'All jobs still open from last year',
                    'All jobs in bid state',
                    'Number of scheduled jobs by area',
                    'Number of open jobs by customer',
                ],
            },
            {
                topic: 'Tickets',
                queries: [
                    'Total tickets by month last year',
                    'Total tickets by customer this year',
                    'Average ticket by area last year',
                    'All void tickets over 10000',
                    'Average ticket by ticket type last year',
                    'Total tickets by type by month for the last six months',
                ],
            },
        ],
        locate: [
            {
                topic: 'Sales',
                queries: [
                    'Total sales by state last year',
                    'Average sales by month last year',
                    'Total sales by customer this year',
                ],
            },
            {
                topic: 'Purchase Orders',
                queries: [
                    'Last purchase order over 10000',
                    'Total purchase orders by vendor this year',
                    'All unissued purchase orders from last year',
                ],
            },
            {
                topic: 'Parts',
                queries: [
                    'Top 5 parts by sales order',
                    'Show me all parts expiring this year',
                    'All parts priced below last cost',
                ],
            },
            {
                topic: 'Margins',
                queries: [
                    'Gross margin by part this year',
                    'Gross margin by customer last year',
                    'Gross margin by invoice this year',
                ],
            },
        ],
        demo: [
            {
                topic: 'Sales',
                queries: [
                    'Total sales last month',
                    'Top 5 customers by sales this year',
                    'Total sales by revenue account last year',
                    'Total sales by item from services last year',
                    'Average sales per month last year',
                ],
            },
            {
                topic: 'Items',
                queries: [
                    'Top 5 items by sales',
                    'Which items were sold the least last year',
                    'Average items sold per month last year',
                    'Total profit per item last month',
                    'Total items sold for services last month',
                ],
            },
            {
                topic: 'Expenses',
                queries: [
                    'All expenses last month',
                    'Monthly expenses by vendor last year',
                    'Total expenses by account last quarter',
                    'Total expenses by quarter last year',
                    'Show me expenses last year over 10000',
                ],
            },
            {
                topic: 'Purchase Orders',
                queries: [
                    'All purchases over 10000 this year',
                    'All open purchase orders',
                    'Total purchase orders by vendor this year',
                    'Total purchase orders by quarter last year',
                    'Top 5 vendors by purchase orders',
                ],
            },
        ],
        lefort: [
            {
                topic: 'Ingresos',
                queries: [
                    'ingresos el año pasado',
                    'ingresos totales por mes 2017',
                    'promedio de las facturas de ingresos por mes 2017',
                    'cuántos facturas de ingresos hay por mes 2017',
                ],
            },
            {
                topic: 'Egresos',
                queries: [
                    'egresos para MXN',
                    'egresos totales para MXN',
                    'promedio de las facturas de egresos por mes 2017',
                    'cuántos facturas de egresos hay por mes 2017',
                ],
            },
            {
                topic: 'Pagos',
                queries: [
                    'pagos el año pasado',
                    'promedio de pagos por año',
                    'pagos totales 2017',
                    'pagos totales por autorizado por tipo',
                ],
            },
            {
                topic: 'Nómina',
                queries: [
                    'nóminas',
                    'nómina total por año',
                    'promedio de nómina por año',
                    'cuántas nóminas hay por mes',
                ],
            },
        ],
        vitruvi: [
            {
                topic: 'Tickets',
                queries: [
                    'All open tickets due this year',
                    'All tickets created last year',
                    'Number of tickets by status',
                ],
            },
            {
                topic: 'Work Package',
                queries: [
                    'All work packages created this year',
                    'how many work packages for each manager this year',
                    'how many work packages by type last year',
                ],
            },
            {
                topic: 'Work Order',
                queries: [
                    'List all work orders created this year',
                    'Number of working orders in progress by region this year',
                    'Number of work orders by program this year',
                ],
            },
        ],
        bluelink: [
            {
                topic: 'Sales orders',
                queries: [
                    'All open sales orders from last year',
                    'Total sales orders by customer last year',
                    'Total sales orders by month last year',
                ],
            },
            {
                topic: 'Products',
                queries: [
                    'All products sold at a loss last year',
                    'Top 5 average sales orders by product last year',
                    'Total sales by product by month last year',
                ],
            },
            {
                topic: 'Gross margin',
                queries: [
                    'Total gross margin by country last year',
                    'Total gross margin by customer last year',
                    'Total gross margin by product last year',
                ],
            },
        ]
    }

    return topics[integrator]
}

function closeAllChartPopovers(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-popover-selector'
    )
    for (var i = 0; i < list.length; i++) {
        if(list[i].isOpen)list[i].close();
    }
}

function closeAllSafetynetSelectors(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-safetynet-selector'
    )
    for (var i = 0; i < list.length; i++) {
        if(list[i].isOpen)list[i].hide();
    }
}

function closeAllToolbars(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-chat-message-toolbar.show'
    )

    var submenus = document.querySelectorAll(
        '.chata-popover-wrapper.show'
    )

    for (var i = 0; i < list.length; i++) {
        list[i].classList.remove('show');
    }

    for (var i = 0; i < submenus.length; i++) {
        submenus[i].classList.remove('show');
    }
}


getSuggestionLists = (query, fullSuggestions) => {
    const suggestionLists = []
    if (fullSuggestions.length) {
        fullSuggestions.forEach((suggestionInfo, index) => {
            const originalWord = query.slice(
                suggestionInfo.start,
                suggestionInfo.end
            )

            // Add ID to each original suggestion
            const originalSuggestionList = suggestionInfo.suggestions.map(
                suggestion => {
                    return {
                        index: i,
                        ...suggestion,
                    }
                }
            )

            // Add original query value to suggestion list
            const list = [
                ...originalSuggestionList,
                { text: originalWord, value_label: 'Original term' },
            ]

            suggestionLists.push(list)
        })
    }
    return suggestionLists
}

getPlainTextList = (query, fullSuggestions) => {
    const textList = []
    let lastEndIndex = 0

    fullSuggestions.forEach((fullSuggestion, index) => {
        textList.push(query.slice(lastEndIndex, fullSuggestion.start))
        if (index === fullSuggestions.length - 1) {
            textList.push(query.slice(fullSuggestion.end, query.length))
        }
        lastEndIndex = fullSuggestion.end
    })

    return textList
}
