import { ChataUtils } from '../ChataUtils'
import { DataMessenger } from '../DataMessenger'
import { WARNING, COLUMN_EDITOR } from '../Svg'
import {
    PRECISION_TYPES,
} from '../Constants'
import _get from 'lodash.get'
import { strings } from '../Strings'
import dayjs from './dayjsPlugins'
import { 
    dataFormattingDefault,
    supportsPieChart,
    supports2DCharts,
    supportsRegularPivotTable,
    isColumnNumberType,
    isColumnStringType,
    isAggregation,
} from 'autoql-fe-utils'

export function formatChartData(val, col, options){
    var clone = cloneObject(options);
    clone.dataFormatting.currencyDecimals = 0;
    return formatData(val, col, clone);
}

export function formatData(val, col, allOptions={}){
    const options = allOptions.dataFormatting;
    var value = '';
    let type = col['type'];
    const { percentDecimals } = allOptions.dataFormatting
    switch (type) {
        case 'DOLLAR_AMT':
            val = parseFloat(val);
            if(isNaN(val))val = 0;
            value = new Intl.NumberFormat(options.languageCode, {
                style: 'currency',
                currency: options.currencyCode,
                minimumFractionDigits: options.currencyDecimals
            }).format(val);
        break;
        case 'DATE':
            value = formatDateType(val, col, options, true)
        break;
        case 'DATE_STRING':
            value = formatDateStringType(val, col, options)
        break;
        case 'PERCENT':
            if(allOptions.dataFormatting.comparisonDisplay == 'PERCENT'){
                val = parseFloat(val);
                if(!isNaN(val)){
                    value =  val.toFixed(percentDecimals) + '%';
                }else{
                    value = '';
                }
            }else{
                value = parseFloat(val).toFixed(percentDecimals);
            }
        break;
        case 'QUANTITY':
            if (!isNaN(parseFloat(val))) {
                value = new Intl.NumberFormat(options.languageCode, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(val)
            }
        break;
        case 'RATIO':
            const { percentDecimals } = allOptions.dataFormatting
            if(allOptions.dataFormatting.comparisonDisplay == 'PERCENT'){
                val = parseFloat(val) * 100;
                if(!isNaN(val)){
                    value =  val.toFixed(percentDecimals) + '%';
                }else{
                    value = '';
                }
            }else{
                value = parseFloat(val).toFixed(percentDecimals);
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

export const isNumber = (str) => {
    return /^\d+$/.test(str)
}  

export const formatDateType = (element, column = {}, config = {}, isDateObj) => {
    if (isNumber(element)) {
      return formatEpochDate(element, column, config)
    }
  
    return formatISODateWithPrecision(element, column, config)
  }
  
  export const formatDateStringType = (element, column = {}, config = {}, scale) => {
    if (column.precision) {
      return formatStringDateWithPrecision(element, column, config)
    }
  
    return formatStringDate(element, config)
  }
  
  export const formatISODateWithPrecision = (value, col = {}, config = {}) => {
    if (!value) {
      return undefined
    }
  
    const precision = col.precision
    const dayMonthYearFormat = config.dayMonthYearFormat || dataFormattingDefault.dayMonthYearFormat
    const dateDayJS = dayjs.utc(value).utc()
  
    if (!dateDayJS.isValid()) {
      return value
    }
  
    let date = dateDayJS.format(dayMonthYearFormat)
  
    try {
      switch (precision) {
        case PRECISION_TYPES.DAY: {
          // default
          break
        }
        case PRECISION_TYPES.WEEK: {
          const dateJSStart = dateDayJS.startOf('week').format('MMM D')
          const dateJSEnd = dateDayJS.endOf('week').format('MMM D')
          const week = dateDayJS.week()
          const year = dateDayJS.format('YYYY')
          date = `${dateJSStart} - ${dateJSEnd}, ${year} (Week ${week})`
          break
        }
        case PRECISION_TYPES.MONTH: {
          const monthYearFormat = config.monthYearFormat || dataFormattingDefault.monthYearFormat
          date = dateDayJS.format(monthYearFormat)
          break
        }
        case PRECISION_TYPES.QUARTER: {
          const quarter = dateDayJS.quarter()
          const year = dateDayJS.format('YYYY')
          date = `${year}-Q${quarter}`
          break
        }
        case PRECISION_TYPES.YEAR: {
          date = dateDayJS.format('YYYY')
          break
        }
        case PRECISION_TYPES.DATE_HOUR: {
          date = dateDayJS.format(`${dayMonthYearFormat} h:00A`)
          break
        }
        case PRECISION_TYPES.DATE_MINUTE: {
          date = dateDayJS.format(`${dayMonthYearFormat} h:mmA`)
          break
        }
        default: {
          break
        }
      }
      return date
    } catch (error) {
      console.error(error)
    }
}

export const formatEpochDate = (value, col = {}, config = {}) => {
    if (!value) {
      // If this is 0, its most likely not the right date
      // Any other falsy values are invalid
      return undefined
    }
  
    try {
      const { monthYearFormat, dayMonthYearFormat } = config
      const year = 'YYYY'
      const monthYear = monthYearFormat || dataFormattingDefault.monthYearFormat
      const dayMonthYear = dayMonthYearFormat || dataFormattingDefault.dayMonthYearFormat
  
      // Use title to determine significant digits of date format
      const title = col.title
  
      let dayJSObj
      if (isNaN(parseFloat(value))) {
        dayJSObj = dayjs.utc(value).utc()
      } else {
        dayJSObj = dayjs.unix(value).utc()
      }
  
      if (!dayJSObj.isValid()) {
        return value
      }
  
      let date = dayJSObj.format(dayMonthYear)
  
      if (isNaN(parseFloat(value))) {
        // Not an epoch time. Try converting using dayjs
        if (title && title.toLowerCase().includes('year')) {
          date = dayJSObj.format(year)
        } else if (title && title.toLowerCase().includes('month')) {
          date = dayJSObj.format(monthYear)
        }
        date = dayJSObj.format(dayMonthYear)
      } else if (title && title.toLowerCase().includes('year')) {
        date = dayJSObj.format(year)
      } else if (title && title.toLowerCase().includes('month')) {
        date = dayJSObj.format(monthYear)
      }
  
      return date
    } catch (error) {
      console.error(error)
      return value
    }
}
  
const formatDOW = (value, col) => {
    let dowStyle = col.dow_style
  
    if (!dowStyle) {
      dowStyle = 'NUM_1_MON'
    }
  
    let formattedValue = value
    let weekdayNumber = Number(value)
    switch (dowStyle) {
      case 'NUM_1_MON': {
        const weekdays = WEEKDAY_NAMES_MON
        const index = weekdayNumber - 1
        if (index >= 0) {
          formattedValue = weekdays[index]
        } else {
          console.warn(`dow style is NUM_1_MON but the value could not be converted to a number: ${value}`)
        }
        break
      }
      case 'NUM_1_SUN': {
        const weekdays = WEEKDAY_NAMES_SUN
        const index = weekdayNumber - 1
        if (index >= 0) {
          formattedValue = weekdays[index]
        } else {
          console.warn(`dow style is NUM_1_SUN but the value could not be converted to a number: ${value}`)
        }
        break
      }
      case 'NUM_0_MON': {
        const weekdays = WEEKDAY_NAMES_MON
        if (weekdayNumber >= 0) {
          formattedValue = weekdays[weekdayNumber]
        } else {
          console.warn(`dow style is NUM_0_MON but the value could not be converted to a number: ${value}`)
        }
        break
      }
      case 'NUM_0_SUN': {
        const weekdays = WEEKDAY_NAMES_SUN
        if (weekdayNumber >= 0) {
          formattedValue = weekdays[weekdayNumber]
        } else {
          console.warn(`dow style is NUM_0_SUN but the value could not be converted to a number: ${value}`)
        }
        break
      }
      case 'ALPHA_MON':
      case 'ALPHA_SUN': {
        const weekday = WEEKDAY_NAMES_MON.find((weekday) => weekday.toLowerCase().includes(value.trim().toLowerCase()))
        if (weekday) {
          formattedValue = weekday
        } else {
          console.warn(`dow style is ALPHA but the value could not be matched to a weekday name: ${value}`)
        }
        break
      }
      default: {
        console.warn(`could not format dow value. dow_style was not recognized: ${col.dow_style}`)
        break
      }
    }
  
    return formattedValue
}
  
export const getDayjsObjForStringType = (value, col) => {
    if (!value) {
      return undefined
    }
  
    try {
      switch (col.precision) {
        case 'DOW': {
          return undefined
        }
        case 'HOUR':
        case 'MINUTE': {
          return dayjs.utc(value, 'THH:mm:ss.SSSZ').utc()
        }
        case 'MONTH': {
          return undefined
        }
        default: {
          return undefined
        }
      }
    } catch (error) {
      console.error(error)
      return undefined
    }
}
  
export const formatStringDateWithPrecision = (value, col, config = {}) => {
    if (!value) {
      return undefined
    }
  
    let formattedValue = value
    try {
      switch (col.precision) {
        case 'DOW': {
          formattedValue = formatDOW(value, col)
          break
        }
        case 'HOUR': {
          const dayjsTime = dayjs.utc(value, 'THH:mm:ss.SSSZ').utc()
          if (dayjsTime.isValid()) {
            formattedValue = dayjsTime.format('h:00A')
          }
          break
        }
        case 'MINUTE': {
          const dayjsTime = dayjs.utc(value, 'THH:mm:ss.SSSZ').utc()
          if (dayjsTime.isValid()) {
            formattedValue = dayjsTime.format('h:mmA')
          }
          break
        }
        case 'MONTH': {
          // This shouldnt be an ISO string since its a DATE_STRING, but
          // if it is valid, we should use it
          formattedValue = value
          break
        }
        default: {
          formattedValue = value
          break
        }
      }
      return formattedValue
    } catch (error) {
      console.error(error)
      return value
    }
}  

export const formatStringDate = (value, config) => {
    if (!value) {
      return undefined
    }
  
    if (value && typeof value === 'string') {
      const dateArray = value.split('-')
      const year = _get(dateArray, '[0]')
      const day = _get(dateArray, '[2]')
  
      let month
      let week
      if (_get(dateArray, '[1]', '').includes('W')) {
        week = _get(dateArray, '[1]')
      } else {
        month = _get(dateArray, '[1]')
      }
  
      const { monthYearFormat, dayMonthYearFormat } = config
      const monthYear = monthYearFormat || dataFormattingDefault.monthYearFormat
      const dayMonthYear = dayMonthYearFormat || dataFormattingDefault.dayMonthYearFormat
      const dayJSObj = dayjs.utc(value).utc()
  
      if (!dayJSObj.isValid()) {
        return value
      }
  
      let date = value
      if (day) {
        date = dayJSObj.format(dayMonthYear)
      } else if (month) {
        date = dayJSObj.format(monthYear)
      } else if (week) {
        // dayjs doesn't format this correctly
      } else if (year) {
        date = year
      }
      return date
    }
  
    // Unable to parse...
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
    responseLoading.classList.add('response-loading');
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

export function runQuery(event, objContext){
    let node
    if(event.target.tagName == 'svg'){
        node = event.target.parentElement.parentElement;
    }else if(event.target.tagName == 'path'){
        node = event.target.parentElement.parentElement.parentElement;
    }else{
        node = event.target.parentElement;
    }
    if(node.classList.contains('autoql-vanilla-chata-safety-net-execute-btn')){
        node = node.parentElement;
    }
    var words = getSafetynetValues(node);

    switch (objContext.constructor) {
        case DataMessenger:
            objContext.keyboardAnimation(words.join(' '));
            break;
        default:
            objContext.sendMessageToResponseRenderer(
                words.join(' ')
            );
        break
    }
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

export function createTableContainer(){
    var div = document.createElement('div');
    div.classList.add('autoql-vanilla-chata-table');
    return div;
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
    var width = div.offsetWidth;
    document.body.removeChild(div);
    return width;
}

export function getChartLeftMargin(yValue){
    const { length } = yValue
    if(length < 9)return 0

    return yValue.length * 2
}

export function showBadge(json){
    const cols = json.data.columns
    for (let i = 0; i < cols.length; i++) {
        if(!cols[i].is_visible)return true
    }

    return false
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
                ${strings.allColsHidden.chataFormat(COLUMN_EDITOR)}
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
        table.style.display = 'inline-block';
        csvHandlerOption.style.display = 'block';
        csvCopyOption.style.display = 'block';
        filterOption.style.display = 'flex';
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
