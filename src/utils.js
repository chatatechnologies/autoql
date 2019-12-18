function formatChartData(val, type, options){
    var clone = cloneObject(options);
    clone.currencyDecimals = 0;
    return formatData(val, type, clone);
}

function formatData(val, type, options={}){
    value = '';
    switch (type) {
        case 'DOLLAR_AMT':
            val = parseFloat(val);
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
            // value = formatDate(new Date( parseInt(val) * 1000 ) );
            value = moment(parseInt(val)*1000).format(options.monthYearFormat);
        break;
        case 'PERCENT':
            val = parseFloat(val) * 100;
            if(!isNaN(val)){
                value =  val.toFixed(2) + '%';
            }else{
                value = '';
            }
        break;
        case 'QUANTITY':
            var n = Math.abs(parseFloat(val)); // Change to positive
            var decimal = n - Math.floor(n);
            console.log(decimal);
            if(decimal > 0){
                value = parseFloat(val).toFixed(options.quantityDecimals);
            }else{
                value = parseInt(val);
            }
        break;
        default:
            value = val;
    }
    return value;
}

function formatColumnName(col){
    return col.replace(/__/g, ' ').replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })
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
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
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
        if(nodes[i].tagName == 'SPAN'){
            words.push(nodes[i].textContent.trim());
        }else{
            words.push(nodes[i].value.trim());
        }
    }
    return words;
}

function runQuery(event, context){
    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement.parentElement;
    }else if(event.target.tagName == 'path'){
        var node = event.target.parentElement.parentElement.parentElement;
    }else{
        var node = event.target.parentElement;
    }
    var words = getSafetynetValues(node);
    if(context == 'ChatDrawer'){
        ChatDrawer.sendMessage(document.getElementById('chata-input'), words.join(' '));
    }else{
        node.parentElement.chataBarContainer.sendMessageToResponseRenderer(words.join(' '));
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
                var name = json['data']['columns'][x]['name'];
                firstColName = name.charAt(0).toUpperCase() + name.slice(1);
            }
            row.push(formatData(
                data[x],
                json['data']['columns'][x]['type'],
                options
            ));
        }
        values.push(row);
    }
    var pivotArray = getPivotArray(values, 0, 1, 2, firstColName);
    return pivotArray;
}

function sortPivot(pivotArray, colIndex, operator){
    pivotArray.shift();
    if(operator == 'asc'){
        var comparator = function(a, b) {
            if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                return parseFloat(a[colIndex].slice(1)) > parseFloat(b[colIndex].slice(1)) ? 1 : -1;
            }else{
                return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
            }
        }
    }else{
        var comparator = function(a, b) {
            if(a[colIndex].charAt(0) === '$' || a['colIndex'] === '0'){
                return parseFloat(a[colIndex].slice(1)) < parseFloat(b[colIndex].slice(1)) ? 1 : -1;
            }else{
                return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
            }
        }
    }
    return pivotArray.sort(comparator);
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
                    row.unshift(MONTH_NAMES[date.getMonth()], date.getFullYear());
                    break;
                default:
                    row.push(formatData(
                        data[x], json['data']['columns'][x]['type'],
                        options
                    )
                );
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
    var imgsrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svgString)));

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

function getSpeech(button){
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    let recognition = new window.SpeechRecognition();
    recognition.interimResults = true;
    recognition.maxAlternatives = 10;
    recognition.continuous = true;
    return recognition;
}

function formatLabels(labels, colType, options){
    labels = labels.sort();
    for (var i = 0; i < labels.length; i++) {
        labels[i] = formatData(labels[i], colType, options);
    }
    return labels;
}

function formatDataToHeatmap(json, options){
    var lines = json['data']['rows'];
    var values = [];
    var colType1 = json['data']['columns'][0]['type'];
    var colType2 = json['data']['columns'][1]['type'];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['labelY'] = formatData(data[0], colType1, options);
        row['labelX'] = formatData(data[1], colType2, options);
        row['unformatY'] = data[0];
        row['unformatX'] = data[1];
        var value = parseFloat(data[2]);
        row['value'] = value;
        values.push(row);
    }
    return values;
}

function formatDataToBarChart(json, options){
    var lines = json['data']['rows'];
    var values = [];
    var colType1 = json['data']['columns'][0]['type'];
    var hasNegativeValues = false;
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['label'] = formatData(data[0], colType1, options);
        var value = parseFloat(data[1]);
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
            var data = ChatDrawer.responses[instance.reference.dataset.id]['data'];
            var content  = `<span class='title-tip'>Interpretation:</span> <span class="text-tip">${data['interpretation']}</span>`;
            if(ChatDrawer.options.debug){
                content += `</br></br>
                <span class='title-tip'>SQL:</span> <span class="text-tip">${data['sql']}</span>
                `;
            }
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
    var inputs = _table.getElementsByTagName('input');
    var rows = array || cloneObject(ChatDrawer.responses[_table.dataset.componentid]['data']['rows']);
    for (var i = 0; i < inputs.length; i++) {
        if(inputs[i].value == '')continue;
        var colType = inputs[i].colType;
        var compareValue = inputs[i].value.toLowerCase();
        rows = rows.filter(function(elem){
            var v = elem[i];
            if(colType == 'DATE'){
                var formatDate = formatData(v, 'DATE');
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
    div.classList.add('chata-table-container');
    div.classList.add('chata-table-container-renderer');

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

const getSupportedDisplayTypes = response => {
    // For CaaS there should be 3 types: data, suggestion, help
    const displayType = response['data']['display_type']

    if (displayType === 'suggestion' || displayType === 'help') {
        return [displayType]
    }

    const columns = response['data']['columns'];

    if (!columns) {
        return []
    }

    if (getNumberOfGroupables(columns) === 1) {
        // Is direct key-value query (ie. Avg days to pay per customer)
        const supportedDisplayTypes = ['bar', 'column', 'line', 'table']

        if (columns.length === 2) {
            supportedDisplayTypes.push('pie')
        }

        // create pivot based on month and year
        if (
            columns[0].type === 'DATE' &&
            columns[0].name.includes('month') &&
            columns.length === 2
        ) {
            supportedDisplayTypes.push('pivot_column')
        }
        return supportedDisplayTypes
    } else if (getNumberOfGroupables(columns) === 2) {
        // Is pivot query (ie. Sale per customer per month)
        return [
            'multi_line',
            'stacked_bar',
            'stacked_column',
            'bubble',
            'heatmap',
            'table',
            'pivot_column'
        ]
    }

    // We should always be able to display the table type by default
    return ['table']
}
