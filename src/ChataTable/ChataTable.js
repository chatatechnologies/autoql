import axios from 'axios';
import {
    runQueryNewPage,
    formatTableParams,
    currentEventLoopEnd,
    REQUEST_CANCELLED_ERROR,
    generatePivotData,
    getColumnIndexConfig,
    formatQueryColumns,
    onTableCellClick,
} from 'autoql-fe-utils';
import _isEqual from 'lodash.isequal';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { Scrollbars } from '../Scrollbars';
import { ChataUtils } from '../ChataUtils';
import { DatePicker } from './DatePicker';
import { strings } from '../Strings';
import { getNumberOfGroupables, allColHiddenMessage, cloneObject, uuidv4 } from '../Utils';

import 'tabulator-tables/dist/css/tabulator.min.css';
import './ChataTable.css';
import './ChataTable.scss';

function replaceScrollbar(table) {
    var tableholder = table.element?.querySelector('.tabulator-tableholder');

    if (tableholder) {
        return new Scrollbars(tableholder);
    }
}

function instantiateTabulator(component, tableOptions, table) {
    // Instantiate Tabulator when element is mounted
    var tabulator = new Tabulator(component, tableOptions);

    tabulator.on('dataLoadError', component.onDataLoadError);
    tabulator.on('cellClick', component.onCellClick);
    tabulator.on('dataSorting', component.onDataSorting);
    tabulator.on('dataSorted', component.onDataSorted);
    tabulator.on('dataFiltering', component.onDataFiltering);
    tabulator.on('dataFiltered', component.onDataFiltered);

    tabulator.on('tableBuilt', async () => {
        table.isInitialized = true;

        if (tableOptions.ajaxRequestFunc) {
            await tabulator.setData();
        }

        allColHiddenMessage(component);

        await currentEventLoopEnd();

        component.createPageLoader();
        component.createScrollLoader();

        tabulator.setHeaderInputEventListeners();
        tabulator.toggleFilters();

        // Remove for now - causing buggy behavious
        // component.ps = replaceScrollbar(tabulator);
    });

    return tabulator;
}

function getTableData(rows) {
    if (!rows) {
        return [];
    }

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
        if (component.style.display === 'none' || component.hidden || !table.isInitialized) {
            return previousData;
        }

        const requestedNewPageWhileLoadingFilter = params?.page > 1 && component.isPageLoading;
        if (!table.hasSetInitialData) {
            table.hasSetInitialData = true;
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

        component.tableParams = cloneObject(params);

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

export function ChataTable(idRequest, options, onClick = () => {}, useInfiniteScroll = true, tableParams) {
    const self = this;

    const TABLE_ID = uuidv4();

    const json = ChataUtils.responses[idRequest];
    if (!json?.data?.rows?.length || !json?.data?.columns?.length) {
        return;
    }

    const tableData = getTableData(json.data.rows);
    const columns = formatQueryColumns({ columns: json.data.columns, queryResponse: { data: json } });
    const tableConfig = getColumnIndexConfig({ response: { data: json } });

    this.isInitialized = false;
    this.hasSetInitialData = false;

    const component = document.querySelector(`[data-componentid='${idRequest}']`);

    component.columnIndexConfig = tableConfig;

    // TODO - move this to its parent element instead
    var groupableCount = getNumberOfGroupables(json?.data?.columns);
    if (groupableCount === 0) {
        component.classList.add('no-drilldown');
    }

    component.classList.add('table-condensed');
    component.isOriginalData = true;
    component.pageSize = json.data.fe_req.page_size;
    component.lastPage = tableData?.length < component.pageSize ? 1 : 2;

    component.isLastPage = component.lastPage === 1;
    component.useInfiniteScroll = !!useInfiniteScroll;
    component.isFiltering = true;
    component.tableParams = tableParams ?? { sort: undefined, filter: undefined };

    component.queryFn = json?.queryFn;

    // TODO(Nikki) - update parent component with changes
    component.onNewPage = (newRows) => {
        var tableRowCountElement = component.parentElement.querySelector('.autoql-vanilla-chata-table-row-count');
        var currentText = tableRowCountElement.textContent;
        var matches = currentText.match(/(\d+)/);
        if (matches && matches.length > 0) {
            var currentTableRowCount = parseInt(matches[0]);
            var newCurrentTableRowCount = currentTableRowCount + newRows.length;
            var newText = currentText.replace(currentTableRowCount, newCurrentTableRowCount);
            tableRowCountElement.textContent = newText;
        }
    };

    // TODO(Nikki) - update parent component with changes
    component.onTableParamsChange = (params, nextTableParamsFormatted) => {};

    // TODO(Nikki) - update parent component with changes
    component.onNewData = (response, component) => {};

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
        component.setScrollLoading(false);
        component.setPageLoading(false);
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
        component.parentElement.appendChild(scrollLoader);
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
        columns,
        data: tableData,
        downloadConfig: {
            columnGroups: false,
            rowGroups: false,
            columnCalcs: false,
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
            return ajaxRequestFunc(params, json, component, columns, self);
        };
        tableOptions.ajaxResponse = (url, params, response) => ajaxResponseFunc(response, component);
    }

    component.onDataLoadError = (error) => {
        console.warn('on Data Load Error', { error });
    };
    component.onCellClick = (e, cell) => {
        const drilldownData = onTableCellClick({ cell, columns, tableConfig });

        if (!drilldownData?.groupBys) {
            return;
        }

        onClick(drilldownData);
    };
    component.onDataSorting = () => {};
    component.onDataSorted = () => {};
    component.onDataFiltering = () => {};
    component.onDataFiltered = () => {};

    var table = instantiateTabulator(component, tableOptions, this);

    table.setHeaderInputValue = (inputElement, value) => {
        if (!inputElement) {
            return;
        }

        inputElement.focus();
        table?.restoreRedraw();
        inputElement.value = value;
        inputElement.title = value;
        inputElement.blur();
    };

    if (!table) {
        return;
    }

    table.inputKeydownListener = () => {
        if (!useInfiniteScroll) {
            // TODO - uncomment if blockRedraw function is implemented
            // table?.restoreRedraw()
        }
    };

    table.inputSearchListener = () => {
        // When "x" button is clicked in the input box
        if (!useInfiniteScroll) {
            // TODO - uncomment if blockRedraw function is implemented
            //   table?.restoreRedraw()
        }
    };

    table.inputDateSearchListener = () => {
        this.currentDateRangeSelections = {};
        this.datePickerColumn = undefined;
    };

    table.inputDateClickListener = (e, col, inputElement) => {
        const coords = inputElement.getBoundingClientRect();
        const tableCoords = table.element?.getBoundingClientRect();
        if (coords?.top && coords?.left) {
            this.datePickerLocation = {
                top: coords.top - tableCoords.top + coords.height + 5,
                left: coords.left - tableCoords.left,
            };

            this.datePickerColumn = col;

            if (inputElement.datePicker) {
                inputElement.datePicker.show();
            } else {
                const datePickerPopover = new DatePicker(e, {});
                inputElement.datePicker = datePickerPopover

                datePickerPopover.show();
            }
        }
    };

    table.inputDateKeypressListener = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    table.setHeaderInputEventListeners = () => {
        if (!columns) {
            return;
        }

        columns.forEach((col) => {
            const inputElement = table.element?.querySelector(
                `.tabulator-col[tabulator-field="${col.field}"] .tabulator-col-content input`,
            );

            if (inputElement) {
                inputElement.removeEventListener('keydown', table.inputKeydownListener);
                inputElement.addEventListener('keydown', table.inputKeydownListener);

                const clearBtn = inputElement.parentNode.querySelector('.autoql-vanilla-clear-btn');
                if (!clearBtn) {
                    table.createInputClearButton(inputElement, col);
                }

                if (col.type === 'DATE' && !col.pivot) {
                    // Open Calendar Picker when user clicks on this field
                    inputElement.removeEventListener('click', (e) =>
                        table.inputDateClickListener(e, col, inputElement),
                    );
                    inputElement.addEventListener('click', (e) => table.inputDateClickListener(e, col, inputElement));

                    // Do not allow user to type in this field
                    const keyboardEvents = ['keypress', 'keydown', 'keyup'];
                    keyboardEvents.forEach((evt) => {
                        inputElement.removeEventListener(evt, table.inputDateKeypressListener);
                        inputElement.addEventListener(evt, table.inputDateKeypressListener);
                    });
                }
            }
        });
    };

    table.createInputClearButton = (inputElement, column) => {
        const clearBtnText = document.createElement('span');
        clearBtnText.innerHTML = '&#x00d7;';

        const clearBtn = document.createElement('div');
        clearBtn.className = 'autoql-vanilla-input-clear-btn';
        clearBtn.id = `autoql-vanilla-clear-btn-${TABLE_ID}-${column.field}`;
        clearBtn.setAttribute('data-tippy-content', strings.clearFilter);
        clearBtn.appendChild(clearBtnText);

        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            table.setHeaderInputValue(inputElement, '');

            if (column.type === 'DATE' && !column.pivot) {
                this.currentDateRangeSelections = {};
            }
        });

        inputElement.parentNode.appendChild(clearBtn);
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

    return table;
}

export function ChataPivotTable(idRequest, options = {}, onClick = () => {}) {
    const component = document.querySelector(`[data-componentid='${idRequest}']`);
    const json = ChataUtils.responses[idRequest];

    if (!json?.data?.rows) {
        return;
    }

    const { dataFormatting } = options;

    const columns = formatQueryColumns({ columns: json?.data?.columns, queryResponse: { data: json } });

    const tableConfig = getColumnIndexConfig({ response: { data: json } });
    const pivotData = generatePivotData({
        rows: json?.data?.rows,
        columns,
        tableConfig,
        dataFormatting,
        isFirstGeneration: true,
    });

    tableConfig.stringColumnIndex = pivotData.stringColumnIndex;
    tableConfig.legendColumnIndex = pivotData.legendColumnIndex;

    const pivotTableData = pivotData.pivotTableData;
    const pivotColumns = pivotData.pivotTableColumns;

    component.columnIndexConfig = tableConfig;

    component.classList.add('table-condensed');

    component.onCellClick = (e, cell) => {
        const drilldownData = onTableCellClick({ cell, columns, pivotData, tableConfig });

        if (!drilldownData?.groupBys) {
            return;
        }

        onClick(drilldownData);
    };

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
        columns: pivotColumns,
        data: pivotTableData,
    };

    var table = instantiateTabulator(component, tableOptions, this);

    return table;
}
