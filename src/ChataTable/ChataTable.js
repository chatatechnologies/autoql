import axios from 'axios';
import moment from 'moment';
import {
    runQueryNewPage,
    formatTableParams,
    currentEventLoopEnd,
    REQUEST_CANCELLED_ERROR,
    isColumnNumberType,
    formatElement,
} from 'autoql-fe-utils';
import _isEqual from 'lodash.isequal';
import _cloneDeep from 'lodash.clonedeep';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { Scrollbars } from '../Scrollbars'
import { ChataUtils } from '../ChataUtils';
import {
    formatData,
    formatColumnName,
    getDatePivotArray,
    getPivotColumnArray,
    htmlToElement,
    cloneObject,
    getNumberOfGroupables,
    allColHiddenMessage,
} from '../Utils';
import { strings } from '../Strings';

import 'tabulator-tables/dist/css/tabulator.min.css';
import './ChataTable.css';
import './ChataTable.scss';

function replaceScrollbar (table) {
    var tableholder = table.element?.querySelector('.tabulator-tableholder')

    if (tableholder) {
        return new Scrollbars(tableholder)
    }
}

function instantiateTabulator(component, tableOptions) {
    // Instantiate Tabulator when element is mounted
    var tabulator = new Tabulator(component, tableOptions);

    tabulator.on('dataLoadError', component.onDataLoadError);
    tabulator.on('cellClick', component.onCellClick);
    tabulator.on('dataSorting', component.onDataSorting);
    tabulator.on('dataSorted', component.onDataSorted);
    tabulator.on('dataFiltering', component.onDataFiltering);
    tabulator.on('dataFiltered', component.onDataFiltered);

    tabulator.on('tableBuilt', async () => {
        component.isInitialized = true;
        if (tableOptions.ajaxRequestFunc) {
            await tabulator.setData();
        }

        allColHiddenMessage(component);

        await currentEventLoopEnd();

        component.createPageLoader();
        component.createScrollLoader();
        component.ps = replaceScrollbar(tabulator);
    });

    return tabulator;
}

function callTableFilter(col, headerValue, rowValue, options) {
    const colType = col.type;
    if (!rowValue && !['DOLLAR_AMT', 'QUANTITY', 'PERCENT'].includes(colType)) {
        rowValue = '';
    }

    if (colType == 'DATE' || colType == 'DATE_STRING') {
        var formatDate = formatData(rowValue, col, options);
        return formatDate.toLowerCase().includes(headerValue);
    } else if (colType == 'DOLLAR_AMT' || colType == 'QUANTITY' || colType == 'PERCENT') {
        var trimmedValue = headerValue.trim();
        if (!rowValue) rowValue = 0;
        if (trimmedValue.length >= 2) {
            let number;
            if (trimmedValue[1] === '=') {
                number = trimmedValue.substr(2);
            } else {
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
    } else {
        return rowValue.toString().toLowerCase().includes(headerValue);
    }
}

function getPivotColumns(json, pivotColumns, options) {
    const columns = json['data']['columns'];

    var columnsData = [];
    pivotColumns.map((col, index) => {
        var colIndex = index + 1;
        var title = col;

        if (colIndex > 2) colIndex = 2;

        if (!title) title = 'null';
        if (!col) col = 'null';

        columnsData.push({
            title: title.toString(),
            field: col.toString(),
            index: index,
            headerFilterPlaceholder: strings.headerFilterPlaceholder,
            headerFilter: 'input',
            headerFilterFunc: (headerValue, rowValue) => {
                return callTableFilter(columns[colIndex], headerValue.toLowerCase(), rowValue, options);
            },
            hozAlign: col.type === 'DOLLAR_AMT' || col.type === 'RATIO' || col.type === 'NUMBER' ? 'right' : 'center',
            formatter: (cell) => {
                let value;
                if (
                    cell.getValue() === '' &&
                    (columns[colIndex].type == 'DOLLAR_AMT' || columns[colIndex].type === 'QUANTITY')
                ) {
                    value = 0;
                } else {
                    value = cell.getValue();
                }

                return formatData(value, columns[colIndex], options);
            },
            frozen: index === 0 ? true : false,
            sorter: setSorterFunction(columns[colIndex]),
        });
    });

    return columnsData;
}

function getPivotData(pivotArray, pivotColumns) {
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
    let aDate = Number(a);
    let bDate = Number(b);

    // If one is not a number, use dayjs to format
    if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
        aDate = moment(a).unix();
        bDate = moment(b).unix();
    }

    // Finally if all else fails, just compare the 2 values directly
    if (!aDate || !bDate) {
        return b - a;
    }

    return bDate - aDate;
};

const setSorterFunction = (col) => {
    if (!col) return undefined;
    if (col.type === 'DATE' || col.type === 'DATE_STRING') {
        return (a, b) => dateSortFn(a, b);
    } else if (col.type === 'STRING') {
        // There is some bug in tabulator where its not sorting
        // certain columns. This explicitly sets the sorter so
        // it works every time
        return 'string';
    }

    return undefined;
};

function getColumnsData(json, options, onHeaderClick) {
    const columns = json['data']['columns'];
    var columnsData = [];
    columns.map((col, index) => {
        var colName = col['display_name'] || col['name'];
        var isVisible = true;
        if ('is_visible' in col) {
            isVisible = col['is_visible'] || false;
        }
        columnsData.push({
            title: formatColumnName(colName),
            name: col.name,
            field: `${index}`,
            headerFilter: 'input',
            headerFilterPlaceholder: strings.headerFilterPlaceholder,
            visible: isVisible,
            hozAlign: isColumnNumberType(col) ? 'right' : 'center',
            formatter: (cell) => {
                return formatElement({
                    element: cell.getValue(),
                    column: col,
                    config: options.dataFormatting,
                    htmlElement: cell.getElement(),
                });
            },
            headerFilterFunc: (headerValue, rowValue) => {
                return callTableFilter(col, headerValue.toLowerCase(), rowValue, options);
            },
            headerClick: () => {
                onHeaderClick();
            },
            sorter: setSorterFunction(col),
        });
    });

    return columnsData;
}

function getFirstDateColumn(json) {
    const columns = json['data']['columns'];
    var firstDateFound = '';
    for (var i = 0; i < columns.length; i++) {
        const { type } = columns[i];
        if (['DATE_STRING', 'DATE'].includes(type)) {
            firstDateFound = `${i}`;
            break;
        }
    }
    return firstDateFound;
}

function getTableData(rows) {
    // const data = json?.data?.rows;
    var tableData = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var rowData = {};
        for (var x = 0; x < row.length; x++) {
            rowData[x] = row[x];
        }
        tableData.push(rowData);
    }

    return tableData;
}

const ajaxRequesting = (params) => {
    // Use this fn to abort a request
};

const ajaxRequestFunc = async (params, response, component, columns, table) => {
    const previousResponseData = response?.data ?? {};
    const previousData = { ...previousResponseData, page: 1, isPreviousData: true };

    try {
        if (component.hidden) {
            return previousData;
        }

        const requestedNewPageWhileLoadingFilter = params?.page > 1 && component.isPageLoading;
        if (!component.hasSetInitialData) {
            component.hasSetInitialData = true;
            return previousData;
        }

        if (requestedNewPageWhileLoadingFilter) {
            return previousData;
        }

        const tableParamsFormatted = formatTableParams(component.tableParams, columns);
        const nextTableParamsFormatted = formatTableParams(params, columns);


        if (_isEqual(tableParamsFormatted, nextTableParamsFormatted)) {
            return previousData;
        }

        component.tableParams = _cloneDeep(params);

        if (!response?.data?.fe_req) {
            console.warn(
                'Original request data was not provided to ChataTable, unable to filter or sort table',
                response,
                response?.data,
                response?.data?.fe_req,
            );
            return previousData;
        }

        component.cancelCurrentRequest();
        component.axiosSource = axios.CancelToken?.source();

        let newResponse;
        if (params?.page > 1) {
            component.setScrollLoading(true);

            newResponse = await component.getNewPage(nextTableParamsFormatted);
            component.onNewPage(newResponse?.rows);
        } else {
            component.setPageLoading(true);

            const responseWrapper = await component.queryFn({
                tableFilters: nextTableParamsFormatted?.filters,
                orders: nextTableParamsFormatted?.sorters,
                cancelToken: component.axiosSource?.token,
            });

            component.queryID = responseWrapper?.data?.data?.query_id;
            newResponse = { ...(responseWrapper?.data?.data ?? {}), page: 1 };

            component.scrollLeft = component.tabulator?.rowManager?.element?.scrollLeft; 

            /* wait for current event loop to end so table is updated before callbacks are invoked */
            await currentEventLoopEnd();

            component.onTableParamsChange(params, nextTableParamsFormatted);
            component.isOriginalData = false;
            component.onNewData(responseWrapper);
        }

        component.clearLoadingIndicators();
        return newResponse;
    } catch (error) {
        if (error?.data?.message === REQUEST_CANCELLED_ERROR) {
            return previousData;
        }

        console.error(error);
        component.clearLoadingIndicators();
        // Send empty promise so data doesn't change
        return previousData;
    }
};

const ajaxResponseFunc = (response, component) => {
    if (response) {
        if (!response.isPreviousData) {
            // component.tablulator?.restoreRedraw();
        }

        const isLastPage = (response?.rows?.length ?? 0) < component.pageSize;

        component.currentPage = response.page;
        component.lastPage = isLastPage ? component.currentPage : component.currentPage + 1;

        const modResponse = {};
        modResponse.data = getTableData(response.rows);
        modResponse.last_page = component.lastPage;

        return modResponse;
    }

    return {
        data: [],
        last_page: component.lastPage,
    };
};

export function ChataTable(
    idRequest,
    options,
    onRowClick,
    onHeaderClick = () => {},
    useInfiniteScroll = true,
    tableParams,
) {
    const json = ChataUtils.responses[idRequest];
    if (!json?.data?.rows) {
        return;
    }

    var tableData = getTableData(json.data.rows);
    var columns = getColumnsData(json, options, onHeaderClick);
    var firstDateFound = getFirstDateColumn(json);
    var defaultInitialSort = firstDateFound ? [{ column: firstDateFound, dir: 'asc' }] : undefined;

    const component = document.querySelector(`[data-componentid='${idRequest}']`);
    component.classList.add('table-condensed');
    component.isOriginalData = true;
    component.pageSize = json.data.fe_req.page_size;
    component.lastPage = tableData?.length < component.pageSize ? 1 : 2;

    component.isLastPage = component.lastPage === 1;
    component.useInfiniteScroll = !!useInfiniteScroll;
    component.isFiltering = true;
    component.tableParams = tableParams ?? { sort: defaultInitialSort, filter: undefined };

    component.queryFn = json?.queryFn;

    component.onNewPage = (newRows) => {};

    component.onTableParamsChange = (params, nextTableParamsFormatted) => {};

    component.onNewData = (response, component) => {
        // console.log('ON NEW DATA CALLBACK GOES HERE', { response });
        // this.queryResponse = response
        // const responseData = response?.data?.data;
        // tableData = responseData?.rows || [];

        // if (this.state.displayType !== 'table' && this.props.allowDisplayTypeChange) {
        //   // The rows were changed from a chart, update data manually. ChataTable will handle
        //   // toggling infinite scroll on or off
        //   const stillHasMoreData = hasMoreData(tableData?.length, response)
        //   component.table?.updateData(tableData, stillHasMoreData)
        // }

        // this.setState(
        //   {
        //     visibleRows: response.data.data.rows,
        //     visibleRowChangeCount: this.state.visibleRowChangeCount + 1,
        //   },
        //   () => {
        //     const dataPageSize = pageSize ?? response?.data?.data?.fe_req?.page_size
        //     this.props.onPageSizeChange(dataPageSize, this.state.visibleRows)
        //   },
        // )
    };

    component.getNewPage = (tableParams) => {
        return runQueryNewPage({
            ...(options.authentication ?? {}),
            tableFilters: tableParams?.filters,
            orders: tableParams?.sorters,
            page: tableParams?.page,
            queryId: json.data.query_id,
            cancelToken: component.axiosSource?.token,
        });
    };

    component.cancelCurrentRequest = () => {
        component.axiosSource?.cancel(REQUEST_CANCELLED_ERROR);
    };

    component.setScrollLoading = (isScrollLoading) => {
        component.isScrollLoading = isScrollLoading;

        if (isScrollLoading) {
            component.scrollLoader?.classList.remove('autoql-vanilla-table-loader-hidden');
        } else {
            component.scrollLoader?.classList.add('autoql-vanilla-table-loader-hidden');
        }
    };

    component.setPageLoading = (isPageLoading) => {
        component.isPageLoading = isPageLoading;

        if (isPageLoading) {
            component.pageLoader?.classList.remove('autoql-vanilla-table-loader-hidden');
        } else {
            component.pageLoader?.classList.add('autoql-vanilla-table-loader-hidden');
        }
    };

    component.clearLoadingIndicators = () => {
        component.setScrollLoading(false)
        component.setPageLoading(false)
    };

    component.createScrollLoader = () => {
        var scrollLoader = document.createElement('div');
        var spinner = document.createElement('div');

        scrollLoader.classList.add('autoql-vanilla-table-loader');
        scrollLoader.classList.add('autoql-vanilla-table-scroll-loader');
        scrollLoader.classList.add('autoql-vanilla-table-loader-hidden');
        spinner.classList.add('autoql-vanilla-spinner-loader');

        scrollLoader.appendChild(spinner);

        component.scrollLoader = scrollLoader;
        component.parentElement.appendChild(scrollLoader)
    };

    component.createPageLoader = () => {
        var pageLoader = document.createElement('div');
        var spinnerContainer = document.createElement('div');
        var spinner = document.createElement('div');

        pageLoader.classList.add('autoql-vanilla-table-loader');
        pageLoader.classList.add('autoql-vanilla-table-page-loader');
        pageLoader.classList.add('autoql-vanilla-table-loader-hidden');
        spinnerContainer.classList.add('autoql-vanilla-page-loader-spinner');
        spinner.classList.add('autoql-vanilla-spinner-loader');

        pageLoader.appendChild(spinnerContainer);
        spinnerContainer.appendChild(spinner);

        component.pageLoader = pageLoader;
        component.parentElement.appendChild(pageLoader);
    };

    const tableOptions = {
        layout: 'fitDataFill',
        clipboard: true,
        height: '100%',
        headerFilterLiveFilterDelay: 300,
        virtualDomBuffer: 350,
        virtualDom: true,
        reactiveData: false,
        autoResize: false,
        movableColumns: true,
        columns: columns,
        data: tableData,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
        },
        rowClick: (e, row) => {
            onRowClick(e, row, cloneObject(json));
        },
        selectableCheck: () => false,
        initialSort: component.tableParams?.sort,
        initialFilter: component.tableParams?.filter,
        progressiveLoadScrollMargin: 100, // Trigger next ajax load when scroll bar is 800px or less from the bottom of the table.
        downloadEncoder: function (fileContents, mimeType) {
            //fileContents - the unencoded contents of the file
            //mimeType - the suggested mime type for the output
            return new Blob([fileContents], { type: mimeType }); //must return a blob to proceed with the download, return false to abort download
        },
    };

    if (component.useInfiniteScroll && component.queryFn) {
        tableOptions.sortMode = 'remote'; // v4: ajaxSorting = true
        tableOptions.filterMode = 'remote'; // v4: ajaxFiltering = true
        tableOptions.paginationMode = 'remote';
        tableOptions.progressiveLoad = 'scroll'; // v4: ajaxProgressiveLoad
        tableOptions.ajaxURL = 'https://required-placeholder-url.com';
        tableOptions.paginationSize = component.pageSize;
        tableOptions.paginationInitialPage = 1;
        tableOptions.initialSort = undefined;
        tableOptions.initialFilter = undefined;
        tableOptions.ajaxRequesting = (url, params) => ajaxRequesting(params);
        tableOptions.ajaxRequestFunc = function (url, config, params) {
            return ajaxRequestFunc(params, json, component, columns, this);
        };
        tableOptions.ajaxResponse = (url, params, response) => ajaxResponseFunc(response, component);
    }

    component.onDataLoadError = (error) => {
        console.warn('on Data Load Error', { error });
    };
    component.onCellClick = () => {
    };
    component.onDataSorting = () => {
    };
    component.onDataSorted = () => {
    };
    component.onDataFiltering = () => {
    };
    component.onDataFiltered = () => {
    };

    var table = instantiateTabulator(component, tableOptions);

    if (!table) {
        return;
    }

    // console.log('TODO - move this to its parent element instead')
    var groupableCount = getNumberOfGroupables(json?.data?.columns);
    if (groupableCount === 0) {
        component.classList.add('no-drilldown');
    }

    table.addFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = htmlToElement(`
            <span class="autoql-vanilla-filter-tag">F</span>
        `);

        colTitle.insertBefore(tag, colTitle.firstChild);
    };

    table.removeFilterTag = (col) => {
        const colTitle = col.querySelector('.tabulator-col-title');
        const tag = colTitle.querySelector('.autoql-vanilla-filter-tag');
        if (tag) colTitle.removeChild(tag);
    };

    table.createInputClearButtons = () => {
        var domTable = table.element;
        var filters = domTable.querySelectorAll('.tabulator-header-filter');

        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            var inputElement = filter.children[0];

            const clearBtnText = document.createElement('span');
            clearBtnText.innerHTML = '&#x00d7;';

            const clearBtn = document.createElement('div');
            clearBtn.className = 'autoql-vanilla-input-clear-btn';
            clearBtn.setAttribute('data-tippy-content', 'Clear filter')
            clearBtn.appendChild(clearBtnText);

            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                //   this.setHeaderInputValue(inputElement, '') console.log('TODO')
                //   if (col.type === 'DATE' && !col.pivot) {
                //     this.currentDateRangeSelections = {}
                //     this.debounceSetState({
                //       datePickerColumn: undefined,
                //     })
                //   }
            });

            inputElement.parentNode.appendChild(clearBtn);
        }
    };

    table.toggleFilters = () => {
        var domTable = table.element;
        var filters = domTable.querySelectorAll('.tabulator-header-filter');
        component.isFiltering = !component.isFiltering;

        if (component.isFiltering) {
            component.classList.add('is-filtering');
        } else {
            component.classList.remove('is-filtering');
        }

        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            var input = filter.children[0];
            if (input.value) {
                filter.parentElement.classList.add('is-filtered');
            } else {
                filter.parentElement.classList.remove('is-filtered');
            }
        }
    };

    table.createInputClearButtons();
    table.toggleFilters();

    return table;
}

export function ChataPivotTable(idRequest, options, onCellClick, onRender = () => {}) {
    var json = ChataUtils.responses[idRequest];
    var cols = json['data']['columns'];
    var isDatePivot = false;
    let pivotArray;

    if (
        (cols[0].type === 'DATE' || cols[0].type === 'DATE_STRING') &&
        cols[0].display_name.toLowerCase().includes('month')
    ) {
        pivotArray = getDatePivotArray(json, options, json['data']['rows']);
        isDatePivot = true;
    } else {
        pivotArray = getPivotColumnArray(json, options, json['data']['rows']);
    }

    var pivotColumns = pivotArray.shift();
    var columns = getPivotColumns(json, pivotColumns, options);
    var tableData = getPivotData(pivotArray, columns);
    const component = document.querySelector(`[data-componentid='${idRequest}']`);

    component.classList.add('table-condensed');

    const tableOptions = {
        layout: 'fitDataFill',
        rowHeight: 25,
        height: '100%',
        invalidOptionWarnings: false,
        virtualDomBuffer: 300,
        movableColumns: true,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
        },
        initialSort: isDatePivot ? [{ column: 'Month', dir: 'asc' }] : undefined,
        columns: columns,
        data: tableData,
        renderComplete: onRender,
        cellClick: (e, cell) => {
            onCellClick(e, cell, cloneObject(json));
        },
    }

    // function instantiateTabulator(tableOptions) {
    //     // Instantiate Tabulator when element is mounted
    //     var tabulator = new Tabulator(component, tableOptions);

    //     tabulator.on('tableBuilt', async () => {
    //         component.isInitialized = true;
    //         component.ps = replaceScrollbar(tabulator);
    //     });

    //     return tabulator;
    // }

    var table = instantiateTabulator(component, tableOptions);

    return table;
}
