import { ChataUtils } from '../ChataUtils';
import Tabulator from 'tabulator-tables';
import {
    formatData,
    formatColumnName,
    getDatePivotArray,
    getPivotColumnArray,
    cloneObject
} from '../Utils';
import './Tabulator.css';
import './TabulatorBootstrap.css';
import './ChataTable.css';

function callTableFilter(col, headerValue, rowValue, options){
    const colType = col.type

    if(!rowValue)rowValue = '';

    if(colType == 'DATE'){
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
        if(colIndex > 0)colIndex = 2;

        if(index > 0){
            title = formatData(col, columns[1], options);
        }

        columnsData.push({
            title: title,
            field: col,
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

function getColumnsData(json, options){
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
            field: 'col' + index,
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
        })
    })

    return columnsData;
}

function getTableData(json, options) {
    const data = json['data']['rows'];
    const columns = json['data']['columns'];
    var tableData = [];
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var rowData = {}
        for (var x = 0; x < row.length; x++) {
            var col = columns[x];
            var colName = col['display_name'] || col['name'];
            rowData['col' + x] = row[x];
        }
        tableData.push(rowData);
    }


    return tableData;
}

export function ChataPivotTable(idRequest, options, onCellClick, onRender = () => {}){
    var json = ChataUtils.responses[idRequest];
    var cols = json['data']['columns'];
    let pivotArray;
    if(cols[0].type === 'DATE' && cols[0].name.includes('month')){
        pivotArray = getDatePivotArray(
            json, options, json['data']['rows']
        );
    }else{
        pivotArray = getPivotColumnArray(
            json, options, json['data']['rows']
        );
    }

    var pivotColumns = pivotArray.shift();
    var columns = getPivotColumns(json, pivotColumns, options)
    var tableData = getPivotData(pivotArray, columns);

    var table = new Tabulator(`[data-componentid='${idRequest}']`, {
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

export function ChataTable(idRequest, options, onRowClick, onRenderedTable=()=>{}){

    var json = ChataUtils.responses[idRequest];
    var tableData = getTableData(json, options);
    var columns = getColumnsData(json, options);
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