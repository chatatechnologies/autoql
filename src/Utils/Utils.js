import { areAllColumnsHidden, formatChartLabel, formatElement, getVisibleColumns } from 'autoql-fe-utils'
import { ChataUtils } from '../ChataUtils'
import { WARNING, COLUMN_EDITOR } from '../Svg'
import { strings } from '../Strings'

export function formatChartData(d, column, options, scale){
    // return formatData(val, col, options, true);
    const formattedLabel = formatChartLabel({
        d,
        column,
        scale,
        dataFormatting: options.dataFormatting,
    })

    return formattedLabel?.formattedLabel ?? d
}

export function formatData(val, col, allOptions={}, isChart){
    return formatElement({element: val, column: col, config: allOptions.dataFormatting, isChart })
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

export function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error(err);
    }

    document.body.removeChild(textArea);
}

export function putLoadingContainer(target){
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');

    responseLoadingContainer.classList.add('chat-bar-loading');
    responseLoading.classList.add('autoql-vanilla-response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);
    target.appendChild(responseLoadingContainer);
    return responseLoadingContainer;
}

export function getSafetynetUserSelection(node){
    var nodes = node.getElementsByClassName(
        'autoql-vanilla-chata-safetynet-select'
    );
    var selections = []
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        const { start } = n.suggestion
        selections.push({
            start: start,
            end: (start + n.option.text.length),
            value: n.option.text,
            canonical: n.option.canonical || 'ORIGINAL_TEXT',
            value_label: n.option.value_label || 'ORIGINAL_TEXT'
        })
    }

    return selections
}

export function getSafetynetValues(node){
    var nodes = node.getElementsByClassName('safetynet-value');
    var words = [];
    for (var i = 0; i < nodes.length; i++) {
        words.push(nodes[i].textContent.trim());
    }
    return words;
}

export function deleteSuggestion(event){
    let node

    if(event.target.tagName == 'svg'){
        node = event.target.parentElement;
    }else{
        node = event.target.parentElement.parentElement;
    }
    node.parentElement.removeChild(node);
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
    var name = json['data']['columns'][1]['display_name'] ||
    json['data']['columns'][1]['name'];
    firstColName = name.charAt(0).toUpperCase() + name.slice(1);

    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {

            row.push(data[x]);
        }
        values.push(row);
    }
    var pivotArray = getPivotArray(values, 1, 0, 2, firstColName);
    return pivotArray;
}

export function getDatePivotArray(json, options, _data){
    var lines = _data;
    var values = [];
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            var col = json['data']['columns'][x]
            var {
                type
            } = col

            switch (type) {
                case 'DATE_STRING':
                    var vals = data[x].split('-')
                    row.unshift(vals[0], vals[1])
                    break
                default:
                    row.push(data[x])
            }
        }
        values.push(row);
    }

    var pivotArray = getPivotArray(values, 1, 0, 2, 'Month');
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
        for (let i = 0; i < newCols.length; i++) {
            item.push(result[key][newCols[i]] || "");
        }
        ret.push(item);
    }
    return ret;
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

export function getSpeech(){
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
        'pivot_column',
        'stacked_line',
        'line',
        'bar',
        'column',
        'heatmap',
        'bubble',
        'stacked_bar',
        'stacked_column'
    ];
}

export function cloneObject(from, to) {
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (
        from.constructor == Date || from.constructor == RegExp
        || from.constructor == Function ||
        from.constructor == String || from.constructor == Number
        || from.constructor == Boolean
    ){
        return new from.constructor(from);
    }

    to = to || new from.constructor();

    for (var name in from)
    {
        to[name] = typeof to[name] == "undefined" ?
        cloneObject(from[name], null) : to[name];
    }

    return to;
}

export function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export function createIcon(icon) {
    const span = document.createElement('span');
    span.appendChild(htmlToElement(icon));
    span.classList.add('autoql-vanilla-icon');
    
    return span;
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

export const isAggregation = (columns) => {
    try {
        let isAgg = false
        if (columns) {
            isAgg = !!columns.find((col) => col.groupable)
        }
        return isAgg
    } catch (error) {
        console.error(error)
        return false
    }
}

export const shouldPlotMultiSeries = (columns) => {
    if (isAggregation(columns)) {
        return false
    }

    const multiSeriesIndex = columns.findIndex((col) => col.multi_series === true)
    return multiSeriesIndex >= 0
}

export const supportsPieChart = (columns, chartData) => {
    if (shouldPlotMultiSeries(columns)) {
        return false
    }

    if (chartData) {
        return chartData.length < 7
    }

    return true
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

        const columns = getVisibleColumns(response.data.columns || []);

        const rows = response.data.rows || [];
        if (!columns || rows.length <= 1) {
            return []
        }

        if (supportsRegularPivotTable(columns)) {
            let supportedDisplayTypes = [
                'table',
                'pivot_table',
                'column',
                'bar',
                'line',
                'heatmap',
                'bubble',
                'stacked_bar',
                'stacked_column',
                'stacked_line',
            ]
            return supportedDisplayTypes
        } else if (supports2DCharts(columns)) {
            const supportedDisplayTypes = ['table', 'column', 'bar', 'line']
            if(supportsPieChart(columns, rows)){
                supportedDisplayTypes.push('pie')
            }

            const { amountOfNumberColumns } = getColumnTypeAmounts(columns)
            if (amountOfNumberColumns > 1) {
              supportedDisplayTypes.push('column_line')
              supportedDisplayTypes.push('scatterplot')
            }

                const dateColumnIndex = columns.findIndex(
                    (col) => col.type === 'DATE' || col.type === 'DATE_STRING'
                )
                const dateColumn = columns[dateColumnIndex]

                if(dateColumn){
                    if (
                        dateColumn.display_name &&
                        dateColumn.display_name.toLowerCase().includes('month')
                        &&
                        columns.length === 2
                    ) {
                        const uniqueYears = []
                        rows.forEach((row) => {
                            const year = formatData(
                                row[dateColumnIndex],
                                dateColumn,
                                {
                                    dataFormatting: {
                                        monthYearFormat: 'YYYY',
                                        dayMonthYearFormat: 'YYYY'
                                    }
                                }
                            )

                            if (!uniqueYears.includes(year)) {
                                uniqueYears.push(year)
                            }
                        })

                        if (uniqueYears.length > 1) {
                            supportedDisplayTypes.push('pivot_table')
                        }
                    }
                }
                return supportedDisplayTypes
            }
            return ['table']
        } catch (error) {
            return ['table']
        }
}

export function hideShowTableCols(table){
    var json = ChataUtils.responses[table.dataset.componentid];
    var cols = json['data']['columns'];
    const thList = table.headerElement.childNodes;
    const trList = table.childNodes;
    for (let i = 0; i < thList.length; i++) {
        if(!cols[i]['is_visible']){
            thList[i].classList.add('chata-hidden');
        }else{
            thList[i].classList.remove('chata-hidden');
        }
    }

    for (let i = 0; i < trList.length; i++) {
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
    var width = div?.offsetWidth ?? 0;
    document.body.removeChild(div);
    return width;
}

export function getChartLeftMargin(yValue, col, options){
    let value = yValue;
    if (col && options) {
        value = formatChartData(yValue, col, options)
    }

    const { length } = value
    if(length < 9)return 0

    return value.length * 2
}

export function showBadge(json){
    const cols = json.data.columns
    for (let i = 0; i < cols.length; i++) {
        if(!cols[i].is_visible)return true
    }

    return false
}

export function allColHiddenMessage(table) {
    try {
        const requestId = table?.dataset?.componentid;
        if (!requestId || !table?.tabulator?.parentContainer) {
            return;
        }

        var csvHandlerOption = table.tabulator.parentContainer.querySelector('[data-name-option="csv-handler"]');

        var csvCopyOption = table.tabulator.parentContainer.querySelector('[data-name-option="copy-csv-handler"]');

        var filterOption = table.tabulator.parentContainer.querySelector('[data-name-option="filter-action"]');

		var tableRowCount = table.parentElement.querySelector('.autoql-vanilla-chata-table-row-count');
        const json = ChataUtils.responses[requestId];
        var isAllHidden = areAllColumnsHidden(json?.data?.columns);
        let message;
        if (table.noColumnsElement) {
            message = table.noColumnsElement;
        } else {
            message = htmlToElement(
                `<div class="autoql-vanilla-no-columns-error-message">
            <div>
                <span class="chata-icon warning-icon">
                    ${WARNING}
                </span>
                ${strings.allColsHidden.chataFormat(COLUMN_EDITOR)}
            </div>
        </div>`,
            );
            table.parentElement.appendChild(message);
            table.noColumnsElement = message;
        }

        if (isAllHidden) {
            message.style.display = 'flex';
            table.style.display = 'none';
			tableRowCount.style.display = 'none';
            csvHandlerOption.style.display = 'none';
            csvCopyOption.style.display = 'none';
            filterOption.style.display = 'none';

            if (table.isInitialized) {
                table.tabulator.blockRedraw();
            }
        } else {
            message.style.display = 'none';
            table.style.display = 'inline-block';
			tableRowCount.style.display = '';
            csvHandlerOption.style.display = 'block';
            csvCopyOption.style.display = 'block';
            filterOption.style.display = 'flex';

            if (table.isInitialized) {
                table.tabulator.redraw();
            }
        }
    } catch (error) {
        return;
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

export function closeAutocompleteObjects() {
    var list = document.querySelectorAll(
        '.autoql-vanilla-data-explorer-autocomplete'
    )
    for (var i = 0; i < list.length; i++) {
        list[i].classList.remove('show');
    }

}

export function closeAllChartPopovers(){
    var list = document.querySelectorAll(
        '.autoql-vanilla-popover-selector'
    )

    for (var i = 0; i < list.length; i++) {
        if(list[i]?.style?.visibility === 'visible') {
            list[i].close();
        }
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

    var popovers = document.querySelectorAll(
        '.autoql-vanilla-popover'
    )

    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove('show');
    }

    for (let i = 0; i < submenus.length; i++) {
        submenus[i].classList.remove('show');
    }
    for (let i = 0; i < popovers.length; i++) {
        if(popovers[i].isOpen)popovers[i].close();
    }
}

export function getFirstNotificationLine (step1) {
    return step1.findElement('.autoql-vanilla-chata-input-settings')
}

export function getRecommendationPath(options, text) {
    return `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${text}&scope=narrow`;
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
        for (let i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if ( !contains('#'+id, selectorTextArr) )
            selectorTextArr.push( '#'+id );

            var classes = nodes[i].classList;
            for (let c = 0; c < classes.length; c++)
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

export const getPNGBase64 = (svgElement) => {
    try {
        const domUrl = window.URL || window.webkitURL || window
        if (!domUrl) {
            throw new Error('(browser doesnt support this)')
        } else if (!svgElement) {
            throw new Error('(svg element does not exist)')
        }

        // get svg data
        var xml = new XMLSerializer().serializeToString(svgElement)
        // make it base64
        var svg64 = btoa(unescape(encodeURIComponent(xml))) // we added non-Latin1 chars for the axis selector
        var b64Start = 'data:image/svg+xml;base64,'
        // prepend a "header"
        var image64 = b64Start + svg64
        return image64
    } catch (error) {
        return undefined
    }
}

/**
* converts an svg string to base64 png using the domUrl
* @param {string} svgElement the svgElement
* @param {number} [margin=0] the width of the border - the image size will be height+margin by width+margin
* @param {string} [fill] optionally backgrund canvas fill
* @return {Promise} a promise to the bas64 png image
*/
export const svgToPng = (svgElement, margin = 0, fill) => {
    return new Promise(function(resolve, reject) {
        try {
            const image64 = getPNGBase64(svgElement)

            const bbox = svgElement.getBoundingClientRect()
            const width = bbox.width * 2
            const height = bbox.height * 2

            // create a canvas element to pass through
            var canvas = document.createElement('canvas')
            canvas.width = width + margin
            canvas.height = height + margin

            var ctx = canvas.getContext('2d')
            // ctx.imageSmoothingEnabled = true

            // create a new image to hold it the converted type
            var img = new Image()

            // when the image is loaded we can get it as base64 url
            img.onload = function() {
                // draw it to the canvas
                ctx.drawImage(this, margin, margin, width, height)

                // if it needs some styling, we need a new canvas
                if (fill) {
                    var styled = document.createElement('canvas')
                    styled.width = canvas.width
                    styled.height = canvas.height
                    var styledCtx = styled.getContext('2d')
                    styledCtx.save()
                    styledCtx.fillStyle = fill
                    styledCtx.fillRect(0, 0, canvas.width, canvas.height)
                    styledCtx.strokeRect(0, 0, canvas.width, canvas.height)
                    styledCtx.restore()
                    styledCtx.drawImage(canvas, 0, 0)
                    canvas = styled
                }
                resolve(canvas.toDataURL('image/png', 1))
            }
            img.onerror = function(error) {
                console.error(error);
            }

            // load image
            img.src = image64
        } catch (error) {
            console.error(error)
            reject('failed to convert svg to png ' + error)
        }
    })
}

export const getFirstDateCol = (cols) => {
    for (var i = 0; i < cols.length; i++) {
        if(['DATE_STRING', 'DATE'].includes(cols[i].type)){
            return cols[i].index
        }
    }

    return -1
}

export const supportsVoiceRecord = () => {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome
    return isEdge || isChrome
}

export const getHeightForChildrens = (parent) => {
    var child = parent.childNodes;
    var totalH = 0
    for (var i = 0; i < child.length; i++) {
        totalH += child[i].offsetHeight;
    }

    return totalH;
}

export const hasErrorTag = (text) => {
    var values = text.split('<report>')
    if(values.length > 1)return true

    return false
}
