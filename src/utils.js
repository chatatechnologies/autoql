function formatData(val, type){
    value = '';
    switch (type) {
        case 'DOLLAR_AMT':
        if(parseFloat(val) != 0){
            value = '$' + val;
        }else{
            value = val;
        }
        break;
        case 'DATE':
        value = formatDate(new Date( parseInt(val) * 1000 ) );
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
    return MONTH_NAMES[monthIndex] + ' ' + day + ', ' + year;
    // return MONTH_NAMES[monthIndex] + ' ' + year;
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

function runQuery(event, context){

    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement.parentElement;
    }else if(event.target.tagName == 'path'){
        var node = event.target.parentElement.parentElement.parentElement;
    }else{
        var node = event.target.parentElement;
    }
    var nodes = node.getElementsByClassName('safetynet-value');
    var words = [];
    for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].tagName == 'SPAN'){
            words.push(nodes[i].textContent.trim());
        }else{
            words.push(nodes[i].value.trim());
        }
    }
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
    for (var i = 0; i < json['columns'].length; i++) {
        if(json['columns'][i]['groupable']){
            r['indexCol'] = i;
            r['jsonCol'] = json['columns'][i];
            r['name'] = json['columns'][i]['name'];
            return r;
        }
    }
    return -1;
}


function getPivotColumnArray(json){
    var lines = csvTo2dArray(json['data']);
    var values = [];
    var firstColName = '';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            if(firstColName == '' && json['columns'][x]['groupable']){
                var name = json['columns'][x]['name'];
                firstColName = name.charAt(0).toUpperCase() + name.slice(1);
            }
            row.push(formatData(data[x], json['columns'][x]['type']));
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

function getDatePivotArray(json){
    var lines = csvTo2dArray(json['data']);
    var values = [];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {

            switch (json['columns'][x]['type']) {
                case 'DATE':
                    var value = data[x];
                    var date = new Date( parseInt(value) * 1000);
                    row.unshift(MONTH_NAMES[date.getMonth()], date.getFullYear());
                    break;
                default:
                    row.push(formatData(data[x], json['columns'][x]['type']));
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
    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');

    return svgString;
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
        var imgPixels = context.getImageData(0, 0, canvas.width, canvas.height);
        for(var y = 0; y < imgPixels.height; y++){
            for(var x = 0; x < imgPixels.width; x++){
                var i = (y * 4) * imgPixels.width + x * 4;
                imgPixels.data[i] = 0;
                imgPixels.data[i + 1] = 0;
                imgPixels.data[i + 2] = 0;
            }
        }
        context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

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

function formatLabels(labels, colType){
    labels = labels.sort();
    for (var i = 0; i < labels.length; i++) {
        labels[i] = formatData(labels[i], colType);
    }
    return labels;
}

formatDataToHeatmap = function(json){
    var lines = csvTo2dArray(json['data']);
    var values = [];
    var colType1 = json['columns'][0]['type'];
    var colType2 = json['columns'][1]['type'];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['labelY'] = formatData(data[0], colType1);
        row['labelX'] = formatData(data[1], colType2);
        row['unformatY'] = data[0];
        row['unformatX'] = data[1];
        var value = parseFloat(data[2]);
        row['value'] = value;
        values.push(row);
    }
    return values;
}

formatDataToBarChart = function(json){
    var lines = csvTo2dArray(json['data']);
    var values = [];
    var colType1 = json['columns'][0]['type'];
    var hasNegativeValues = false;
    // var colType2 = json['columns'][1]['type'];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['label'] = formatData(data[0], colType1);
        var value = parseFloat(data[1]);
        if(value < 0 && !hasNegativeValues){
            hasNegativeValues = true;
        }
        row['value'] = value;


        values.push(row);
    }
    return [values, hasNegativeValues];
}
