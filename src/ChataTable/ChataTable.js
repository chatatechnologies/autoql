import { ChataUtils } from '../ChataUtils';
import Tabulator from 'tabulator-tables';
import {
    formatData,
    formatColumnName,
    getDatePivotArray,
    getPivotColumnArray,
    htmlToElement,
    cloneObject,
    getNumberOfGroupables
} from '../Utils';
import './Tabulator.css';
import './TabulatorBootstrap.css';
import './ChataTable.css';
import { strings } from '../Strings'
import moment from 'moment'

function callTableFilter(col, headerValue, rowValue, options){
    const colType = col.type
    if(
        !rowValue && (!['DOLLAR_AMT', 'QUANTITY', 'PERCENT'].includes(colType))
    ){
        rowValue = ''
    }

    if(colType == 'DATE' || colType == 'DATE_STRING'){
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
        var trimmedValue = headerValue.trim()
        if(!rowValue)rowValue = 0
        if (trimmedValue.length >= 2) {
            let number
            if(trimmedValue[1] === '='){
                number = trimmedValue.substr(2)
            }else{
                number = parseFloat(trimmedValue.substr(1));
            }
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
        if(index > 1)colIndex = 1

        if(!title)title = 'null'
        if(!col)col = 'null'

        columnsData.push({
            title: title.toString(),
            field: col.toString(),
            index: index,
            headerFilterPlaceholder: strings.headerFilterPlaceholder,
            headerFilter: "input",
            headerFilterFunc: (
                headerValue, rowValue) => {
                return callTableFilter(
                    columns[colIndex],
                    headerValue.toLowerCase(), rowValue, options
                );
            },
            formatter: (cell) => {
                let value;
                if(
                    cell.getValue() === '' &&
                    (
                        columns[colIndex].type == 'DOLLAR_AMT' ||
                        columns[colIndex].type === 'QUANTITY'
                    )
                ){
                    value = 0;
                }else{
                    value = cell.getValue();
                }

                return formatData(value, columns[colIndex], options);
            },
            frozen: colIndex === 0 ? true : false,
            sorter: setSorterFunction(columns[colIndex])
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
            var colName = pivotColumns[x].field;
            row[colName] = line[x];
        }
        tableData.push(row);
    }
    return tableData;
}

const dateSortFn = (a, b) => {
    // First try to convert to number. It will sort properly if its a plain year or a unix timestamp
    let aDate = Number(a)
    let bDate = Number(b)

    // If one is not a number, use dayjs to format
    if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
        aDate = moment(a).unix()
        bDate = moment(b).unix()
    }

    // Finally if all else fails, just compare the 2 values directly
    if (!aDate || !bDate) {
        return b - a
    }

    return bDate - aDate
}

const setSorterFunction = (col) => {
    if(!col) return undefined
    if (col.type === 'DATE' || col.type === 'DATE_STRING') {
        return (a, b) => dateSortFn(a, b)
    } else if (col.type === 'STRING') {
        // There is some bug in tabulator where its not sorting
        // certain columns. This explicitly sets the sorter so
        // it works every time
        return 'string'
    }

    return undefined
}

function getColumnsData(json, options, onHeaderClick){
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
            field: 'col_' + index,
            headerFilter: "input",
            headerFilterPlaceholder: strings.headerFilterPlaceholder,
            visible: isVisible,
            formatter: (cell) => {
                return formatData(cell.getValue(), col, options);
            },
            headerFilterFunc: (
                headerValue, rowValue) => {
                return callTableFilter(col,
                    headerValue.toLowerCase(), rowValue, options);
            },
            headerClick: () => {
                onHeaderClick()
            },
            sorter: setSorterFunction(col)
        })
    })

    return columnsData;
}

function getFirstDateColumn (json) {
    const columns = json['data']['columns']
    var firstDateFinded = ''
    for (var i = 0; i < columns.length; i++) {
        const {
            type
        } = columns[i]
        if(['DATE_STRING', 'DATE'].includes(type)){
            firstDateFinded = 'col_' + i
            break
        }
    }
    return firstDateFinded
}

function getTableData(json) {
    const data = json['data']['rows'];
    var tableData = [];

    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var rowData = {}
        for (var x = 0; x < row.length; x++) {
            rowData['col_' + x] = row[x];
        }
        tableData.push(rowData);
    }

    return tableData;
}

export function ChataPivotTable(idRequest, options, onCellClick, onRender = () => {}){
    var json = ChataUtils.responses[idRequest];
    var cols = json['data']['columns'];
    var isDatePivot = false
    let pivotArray;

    if(
        (cols[0].type === 'DATE' || cols[0].type === 'DATE_STRING') &&
        cols[0].display_name.toLowerCase().includes('month')
    ){
        pivotArray = getDatePivotArray(
            json, options, json['data']['rows']
        );
        isDatePivot = true
    }else{
        pivotArray = getPivotColumnArray(
            json, options, json['data']['rows']
        );
    }

    var pivotColumns = pivotArray.shift();
    var columns = getPivotColumns(json, pivotColumns, options)
    var tableData = getPivotData(pivotArray, columns);
    const component = document.querySelector(
        `[data-componentid='${idRequest}']`
    );

    var table = new Tabulator(component, {
        layout: 'fitDataFill',
        invalidOptionWarnings: false,
        virtualDomBuffer: 300,
        movableColumns: true,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
        },
        columns: columns,
        data: tableData,
        renderComplete: onRender,
        cellClick: (e, cell) =>{
            onCellClick(e, cell, cloneObject(json));
        }
    })
    table.setHeight('100%');

    if(isDatePivot)table.setSort('Month', 'asc')

    table.addFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = htmlToElement(`
            <span class="autoql-vanilla-filter-tag">F</span>
        `);

        colTitle.insertBefore(tag, colTitle.firstChild);
    }

    table.removeFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = colTitle.querySelector('.autoql-vanilla-filter-tag');
        if(tag)colTitle.removeChild(tag);
    }

    table.toggleFilters = () => {
        var domTable = table.element;
        var filters = domTable.querySelectorAll('.tabulator-header-filter');
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            var input = filter.children[0];
            if(filter.style.display == 'none'){
                filter.style.display = 'inline-block';
                table.removeFilterTag(filter.parentElement);
            }else{
                if(input.value){
                    table.addFilterTag(filter.parentElement);
                }
                filter.style.display = 'none';
            }
        }
    }

    table.toggleFilters();

    return table;
}

export function ChataTable(
    idRequest, options, onRowClick, onHeaderClick=()=>{}){

    var json = ChataUtils.responses[idRequest];
    var tableData = getTableData(json, options);
    var columns = getColumnsData(json, options, onHeaderClick);
    var firstDateFinded = getFirstDateColumn(json)

    const component = document.querySelector(
        `[data-componentid='${idRequest}']`
    );
    var table = new Tabulator(component, {
        layout: 'fitDataFill',
        virtualDomBuffer: 350,
        virtualDom: true,
        movableColumns: true,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
        },
        columns: columns,
        data: tableData,
        rowClick: (e, row) =>{
            onRowClick(e, row, cloneObject(json));
        },
    })
    var groupableCount = getNumberOfGroupables(json['data']['columns']);

    if(groupableCount === 0){
        component.classList.add('no-drilldown')
    }

    table.setHeight('100%');

    if(firstDateFinded != ''){
        table.setSort(firstDateFinded, "asc");
    }

    table.addFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = htmlToElement(`
            <span class="autoql-vanilla-filter-tag">F</span>
        `);

        colTitle.insertBefore(tag, colTitle.firstChild);
    }

    table.removeFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = colTitle.querySelector('.autoql-vanilla-filter-tag');
        if(tag)colTitle.removeChild(tag);
    }

    table.toggleFilters = () => {
        var domTable = table.element;
        var filters = domTable.querySelectorAll('.tabulator-header-filter');
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            var input = filter.children[0];
            if(filter.style.display == 'none'){
                filter.style.display = 'inline-block';
                table.removeFilterTag(filter.parentElement);
            }else{
                if(input.value){
                    table.addFilterTag(filter.parentElement);
                }
                filter.style.display = 'none';
            }
        }

    }

    table.toggleFilters();

    return table;
}
