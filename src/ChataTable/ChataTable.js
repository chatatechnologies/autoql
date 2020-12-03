import { ChataUtils } from '../ChataUtils';
import Tabulator from 'tabulator-tables';
import {
    formatData,
    formatColumnName,
    getDatePivotArray,
    getPivotColumnArray,
    htmlToElement,
    cloneObject
} from '../Utils';
import './Tabulator.css';
import './TabulatorBootstrap.css';
import './ChataTable.css';
import moment from 'moment'

function callTableFilter(col, headerValue, rowValue, options){
    const colType = col.type

    if(!rowValue)rowValue = '';
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
        var trimmedValue = headerValue.trim();
        if (trimmedValue.length >= 2) {
            const number = parseFloat(trimmedValue.substr(1));
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
        if(colIndex > 0){
            if(columns.length === 2)colIndex = 1;
            else colIndex = 2;
        }

        if(index > 0){
            if(columns.length === 2){
                title = col
            }else{
                title = formatData(col, columns[1], options);
            }
        }
        if(!title)title = 'null'
        if(!col)col = 'null'

        columnsData.push({
            title: title.toString(),
            field: col.toString(),
            index: index,
            headerFilter: "input",
            headerFilterFunc: (
                headerValue, rowValue, rowData, filterParams) => {
                return callTableFilter(
                    columns[colIndex],
                    headerValue.toLowerCase(), rowValue, options
                );
            },
            formatter: (cell, formatterParams, onRendered) => {
                let value;
                if(
                    cell.getValue() === '' &&
                    columns[colIndex].type == 'DOLLAR_AMT'
                ){
                    value = 0;
                }else{
                    value = cell.getValue();
                }
                if(columns[colIndex].type === 'DATE_STRING'){
                    return moment().month(parseInt(value)-1).format('MMM')
                }
                return formatData(value, columns[colIndex], options);
            },
            frozen: colIndex == 0 ? true : false
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
            visible: isVisible,
            formatter: (cell, formatterParams, onRendered) => {
                return formatData(cell.getValue(), col, options);
            },
            headerFilterFunc: (
                headerValue, rowValue, rowData, filterParams) => {
                return callTableFilter(col,
                    headerValue.toLowerCase(), rowValue, options);
            },
            headerClick: (e, column) => {
                onHeaderClick()
            }
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

function getTableData(json, options) {
    const data = json['data']['rows'];
    const columns = json['data']['columns'];
    var tableData = [];
    let firstDateFinded = ''
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var rowData = {}
        for (var x = 0; x < row.length; x++) {
            var col = columns[x];
            var colName = col['display_name'] || col['name'];
            var type = col['type']
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

    table.setHeight('100%');

    if(firstDateFinded != ''){
        table.setSort(firstDateFinded, "desc");
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
