import { ChataUtils } from '../ChataUtils'
import { DataMessenger } from '../DataMessenger'
import { WARNING, COLUMN_EDITOR } from '../Svg'
import axios from 'axios'
import _get from 'lodash.get'
import moment from 'moment'

export function formatChartData(val, col, options){
    var clone = cloneObject(options);
    clone.dataFormatting.currencyDecimals = 0;
    return formatData(val, col, clone);
}

export function formatData(val, col, allOptions={}){
    const options = allOptions.dataFormatting;
    var value = '';
    let type = col['type'];
    switch (type) {
        case 'DOLLAR_AMT':
            val = parseFloat(val);
            if(isNaN(val))val = 0;
            const sigDigs = String(parseInt(val.toFixed(2))).length
            value = new Intl.NumberFormat(options.languageCode, {
                style: 'currency',
                currency: options.currencyCode,
                minimumFractionDigits: options.currencyDecimals
            }).format(val);
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
            value = formatStringDate(val, options)
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

export const isDayJSDateValid = date => {
  return date !== 'Invalid Date'
}

export const formatStringDate = (value, config) => {
    if (!value) {
        return undefined
    }

    if (value && typeof value === 'string') {
        const dateArray = value.split('-')
        const year = dateArray[0]
        const month = dateArray[1]
        const day = dateArray[2]

        const { monthYearFormat, dayMonthYearFormat } = config
        const monthYear = monthYearFormat || 'MMM YYYY'
        const dayMonthYear = dayMonthYearFormat || 'll'

        if (day) {
            const date = moment(value).format(dayMonthYear)
            if (isDayJSDateValid(date)) {
                return date
            }
        } else if (month) {
            const date = moment(value).format(monthYear)
            if (isDayJSDateValid(date)) {
                return date
            }
        } else if (year) {
            return year
        }
    }

    return value
}

export function formatColumnName(col){
    return col.replace(/__/g, ' ').replace(/_/g, ' ').
    replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatDate(date) {
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

export function copyTextToClipboard(text) {
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

export function putLoadingContainer(target){
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

export function getSafetynetValues(node){
    var nodes = node.getElementsByClassName('safetynet-value');
    var words = [];
    for (var i = 0; i < nodes.length; i++) {
        words.push(nodes[i].textContent.trim());
    }
    return words;
}

export function runQuery(event, objContext){

    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement.parentElement;
    }else if(event.target.tagName == 'path'){
        var node = event.target.parentElement.parentElement.parentElement;
    }else{
        var node = event.target.parentElement;
    }
    if(node.classList.contains('autoql-vanilla-chata-safety-net-execute-btn')){
        node = node.parentElement;
    }
    var words = getSafetynetValues(node);

    switch (objContext.constructor) {
        case DataMessenger:
            objContext.keyboardAnimation(words.join(' '));
            // objContext.sendMessage(
            //     words.join(' '),
            //     'data_messenger.validation'
            // );
            break;
        default:
            objContext.sendMessageToResponseRenderer(
                words.join(' ')
            );
        ;
    }
}

export function deleteSuggestion(event){
    if(event.target.tagName == 'svg'){
        var node = event.target.parentElement;
    }else{
        var node = event.target.parentElement.parentElement;
    }
    node.parentElement.removeChild(node);
}

export function csvTo2dArray(parseMe) {
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

export function getGroupableField(json){
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

export function getNotGroupableField(json){
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

export function getGroupables(json){
    var clone = cloneObject(json);
    var cont = 0;
    var groups = []
    for (var i = 0; i < clone['data']['columns'].length; i++) {
        if(clone['data']['columns'][i]['groupable']){
            clone['data']['columns'][i].index = i;
            groups.push(clone['data']['columns'][i]);
        }
    }
    return groups;
}

export function getClickedData(json, ...params){
    var groupables = getGroupables(json);
    var data = {
        supportedByAPI: true,
        data: []
    }

    for (var i = 0; i < groupables.length; i++) {
        var indexData = groupables[i].index;
        data.data.push({
            name: groupables[i].name,
            value: params[indexData]
        })
    }

    return data;
}

export function getGroupableCount(json){
    var cont = 0;
    for (var i = 0; i < json['data']['columns'].length; i++) {
        if(json['data']['columns'][i]['groupable']){
            cont++;
        }
    }
    return cont;
}

export function getPivotColumnArray(json, options, _data){
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

export function sortPivot(pivotArray, colIndex, operator){
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

export function getDatePivotArray(json, options, _data){
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

export function getPivotArray(dataArray, rowIndex, colIndex, dataIndex, firstColName) {
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

export function getSVGString(svgNode) {
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

export function svgString2Image(svgString, width, height) {
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

export function mergeOptions(objList){
    var output = [];
    for (var i = 0; i < objList.length; i++) {
        let obj = objList[i];
        for (var [key, value] of Object.entries(obj)) {
            output[key] = value;
        }
    }
    return output;
}

export function getSpeech(button){
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

export function formatLabels(labels, col, options){
    labels = labels.sort();
    for (var i = 0; i < labels.length; i++) {
        labels[i] = formatData(labels[i], col, options);
    }
    return labels;
}

export function formatDataToBarChart(json, options){
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

export function getSupportedDisplayTypesArray(){
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

export function cloneObject(source) {
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

export function applyFilter(idRequest, array){
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

export function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export function createTableContainer(){
    var div = document.createElement('div');
    div.classList.add('autoql-vanilla-chata-table');
    return div;
}

export const getNumberOfGroupables = columns => {
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

export const supportsRegularPivotTable = columns => {
    const hasTwoGroupables = getNumberOfGroupables(columns) === 2
    return hasTwoGroupables && columns.length === 3
}

export const isColumnNumberType = col => {
    const type = col.type
    return (
        type === 'DOLLAR_AMT' ||
        type === 'QUANTITY' ||
        type === 'PERCENT' ||
        type === 'RATIO'
    )
}

export const isColumnStringType = col => {
    const  type = col.type
    return type === 'STRING' || type === 'DATE_STRING' || type === 'DATE'
}

export const getColumnTypeAmounts = columns => {
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

export const supports2DCharts = columns => {
    const amounts =
    getColumnTypeAmounts(
        columns
    )

    return amounts.amountOfNumberColumns > 0
    && amounts.amountOfStringColumns > 0
}

export const getSupportedDisplayTypes = response => {
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

export async function adjustTableWidth(table, thArray, cols, selector='[data-indexrow]', offset=0){

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

export function hideShowTableCols(table){
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

export function getStringWidth(string){
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

export function allColsHidden(json){
    var cols = json['data']['columns'];
    var isAllHidden = true;
    for (var i = 0; i < cols.length; i++) {
        if(cols[i].is_visible){
            isAllHidden = false;
            break;
        }
    }

    return isAllHidden;
}

export function allColHiddenMessage(table){
    const requestId = table.dataset.componentid;
    var csvHandlerOption = table.tabulator.parentContainer.querySelector(
        '[data-name-option="csv-handler"]'
    );

    var csvCopyOption = table.tabulator.parentContainer.querySelector(
        '[data-name-option="copy-csv-handler"]'
    );

    var filterOption = table.tabulator.parentContainer.querySelector(
        '[data-name-option="filter-action"]'
    );
    const json = ChataUtils.responses[requestId];
    var isAllHidden = allColsHidden(json);
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
        csvHandlerOption.style.display = 'none';
        csvCopyOption.style.display = 'none';
        filterOption.style.display = 'none';

    }else{
        message.style.display = 'none';
        table.style.display = 'block';
        csvHandlerOption.style.display = 'block';
        csvCopyOption.style.display = 'block';
        filterOption.style.display = 'inline-block';
        table.tabulator.redraw();
    }
}

export function mouseX(evt) {
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

export function mouseY(evt) {
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

export function closeAllChartPopovers(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-popover-selector'
    )
    for (var i = 0; i < list.length; i++) {
        if(list[i].isOpen)list[i].close();
    }
}

export function closeAllSafetynetSelectors(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-safetynet-selector'
    )
    for (var i = 0; i < list.length; i++) {
        if(list[i].isOpen)list[i].hide();
    }
}

export function closeAllToolbars(){
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

export function getSuggestionLists (query, fullSuggestions) {
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

export function getPlainTextList(query, fullSuggestions) {
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

export function getFirstNotificationLine (step1) {
    return step1.findElement('.autoql-vanilla-chata-input-settings')
}

export function getRecommendationPath(options, text) {
    return `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${text}&scope=narrow`;
}


export const apiCall = (val, options, source) => {
    const {
        token,
        apiKey,
        domain
    } = options.authentication

    const {
        debug,
        test
    } = options.autoQLConfig

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const url = `${domain}/autoql/api/v1/query?key=${apiKey}`

    const data = {
        text: val,
        source: source,
        debug: debug,
        test: test
    }

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallPost = (url, data, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.post(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallPut = (url, data, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.put(url, data, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallDelete = (url, options) => {
    const {
        token,
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    return axios.delete(url, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.resolve(_get(error, 'response'))
    })
}

export const apiCallGet = (url, options, extraHeaders={}) => {
    const {
        token
    } = options.authentication

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            ...extraHeaders
        },
    }

    return axios.get(url, config).then((response) => {
        return Promise.resolve(response)
    }).catch((error) => {
        return Promise.reject(error)
    })
}

export const apiCallNotificationCount = (url, options) => {
    const {
        token
    } = options.authentication

    const axiosInstance = axios.create({
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    const config = {
        timeout: 180000,
    }

    return axiosInstance
    .get(url, config)
    .then((response) => {
        return Promise.resolve(response)
    })
    .catch((error) => {
        return Promise.resolve(error)
    })
}
