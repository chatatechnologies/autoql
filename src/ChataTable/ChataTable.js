import axios from 'axios';
import _isEqual from 'lodash.isequal';
import dayjs from '../Utils/dayjsPlugins';
import _cloneDeep from 'lodash.clonedeep';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

import {
    onTableCellClick,
    formatTableParams,
    generatePivotData,
    formatQueryColumns,
    getFilterPrecision,
    currentEventLoopEnd,
    getColumnIndexConfig,
    DAYJS_PRECISION_FORMATS,
    REQUEST_CANCELLED_ERROR,
    getDataFormatting,
    filterDataByColumn,
    sortDataByColumn,
} from 'autoql-fe-utils';

import { strings } from '../Strings';
import { Scrollbars } from '../Scrollbars';
import { ChataUtils } from '../ChataUtils';
import { DateRangePicker } from '../ChataComponents/DateRangePicker/DateRangePicker';
import { getNumberOfGroupables, allColHiddenMessage, cloneObject, uuidv4 } from '../Utils';

import './ChataTable.css';
import './ChataTable.scss';
import 'tabulator-tables/dist/css/tabulator.min.css';

const commonTableOptions = {
    layout: 'fitDataFill',
    clipboard: true,
    height: '100%',
    rowHeight: 25,
    invalidOptionWarnings: false,
    virtualDomBuffer: 300,
    virtualDom: true,
    reactiveData: false,
    autoResize: false,
    downloadConfig: {
        columnGroups: false,
        rowGroups: false,
        columnCalcs: false,
    },
    selectableCheck: () => false,
    downloadEncoder: function (fileContents, mimeType) {
        //fileContents - the unencoded contents of the file
        //mimeType - the suggested mime type for the output
        return new Blob([fileContents], { type: mimeType }); //must return a blob to proceed with the download, return false to abort download
    },
};

function toggleFilters(component, table) {
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
}

function replaceScrollbar(table) {
    var tableholder = table.element?.querySelector('.tabulator-tableholder');

    if (tableholder) {
        return new Scrollbars(tableholder);
    }
}

function instantiateTabulator(component, tableOptions, table) {
    // Instantiate Tabulator when element is mounted
    var tabulator = new Tabulator(component, tableOptions);

    component.onDataLoadError && tabulator.on('dataLoadError', component.onDataLoadError);
    component.onCellClick && tabulator.on('cellClick', component.onCellClick);
    component.onDataSorting && tabulator.on('dataSorting', component.onDataSorting);
    component.onDataSorted && tabulator.on('dataSorted', component.onDataSorted);
    component.onDataFiltering && tabulator.on('dataFiltering', component.onDataFiltering);
    component.onDataFiltered && tabulator.on('dataFiltered', component.onDataFiltered);
    component.onDataLoaded && tabulator.on('dataLoaded', component.onDataLoaded);

    tabulator.on('tableBuilt', async () => {
        table.isInitialized = true;

        if (tableOptions.ajaxRequestFunc) {
            await tabulator.setData();
        }

        allColHiddenMessage(component);

        await currentEventLoopEnd();

        component.createPageLoader?.();
        component.createScrollLoader?.();

        tabulator.setFilters?.();

        tabulator.setHeaderInputEventListeners?.();
        tabulator.toggleFilters?.();

        tabulator.setHeaderInputEventListeners?.();
        tabulator.toggleFilters?.();

        component.updateScrollSummaryFooter?.();

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

const getTotalPages = (response, component) => {
    const rows = response?.data?.data?.rows;
    if (!rows?.length) {
        return 1;
    }

    const totalPages = Math.ceil(rows.length / component.pageSize);

    if (totalPages >= 1 && totalPages !== Infinity) {
        return totalPages;
    }

    return 1;
};

const ajaxRequestFunc = async (params, idRequest, component, columns, table) => {
    const initialData = {
        rows: component?.getRows(1) ?? [],
        page: 1,
        isInitialData: true,
    };

    if (!component) {
        return initialData;
    }

    const json = ChataUtils.responses[idRequest];

    try {
        if (component.style.display === 'none' || component.hidden || !table.isInitialized) {
            return initialData;
        }

        const requestedNewPageWhileLoadingFilter = params?.page > 1 && component.isPageLoading;
        if (!table.hasSetInitialData) {
            table.hasSetInitialData = true;
            return initialData;
        }

        if (requestedNewPageWhileLoadingFilter) {
            return initialData;
        }

        const tableParamsFormatted = formatTableParams(component.tableParams, columns);
        const nextTableParamsFormatted = formatTableParams(params, columns);

        if (_isEqual(tableParamsFormatted, nextTableParamsFormatted)) {
            return initialData;
        }

        component.tableParams = cloneObject(params);

        if (!json?.data?.fe_req) {
            console.warn(
                'Original request data was not provided to ChataTable, unable to filter or sort table',
                json,
                json?.data,
                json?.data?.fe_req,
            );
            return initialData;
        }

        component.cancelCurrentRequest();
        component.axiosSource = axios.CancelToken?.source();

        let newResponse;
        if (params?.page > 1) {
            component.setScrollLoading(true);

            newResponse = await component.getNewPage(nextTableParamsFormatted);
        } else {
            component.setPageLoading(true);

            const responseWrapper = await component.sortOrFilterData(nextTableParamsFormatted);

            ChataUtils.responses[idRequest] = responseWrapper?.data;

            component.queryFn = responseWrapper?.data?.queryFn;
            component.queryID = responseWrapper?.data?.data?.query_id;

            component.scrollLeft = component.tabulator?.rowManager?.element?.scrollLeft;

            component.onTableParamsChange(params, nextTableParamsFormatted);
            component.isOriginalData = false;
            component.onNewData?.(responseWrapper);

            const totalPages = getTotalPages(responseWrapper, component);

            newResponse = {
                rows: responseWrapper?.data?.data?.rows?.slice(0, component.pageSize) ?? [],
                page: 1,
                last_page: totalPages,
            };
        }

        component.clearLoadingIndicators();
        return newResponse;
    } catch (error) {
        if (error?.data?.message === REQUEST_CANCELLED_ERROR) {
            return initialData;
        }

        console.error(error);
        component.clearLoadingIndicators();
        // Send empty promise so data doesn't change
        return initialData;
    }
};

const ajaxResponseFunc = (response, component) => {
    if (response) {
        const isLastPage = (response?.rows?.length ?? 0) < component.pageSize;

        component.currentPage = response.page;
        component.lastPage = isLastPage ? component.currentPage : component.currentPage + 1;

        const modResponse = {};
        modResponse.data = getTableData(response.rows);
        modResponse.last_page = component.lastPage;

        setTimeout(() => {
            component?.updateScrollSummaryFooter?.();
        }, 0);

        return modResponse;
    }

    return {
        data: [],
        last_page: component.lastPage,
    };
};

export function ChataTable(idRequest, options, onClick = () => {}, useInfiniteScroll = true, tableParams, onNewData) {
    const self = this;

    const TABLE_ID = uuidv4();

    const component = document.querySelector(`[data-componentid='${idRequest}']`);

    if (!component) {
        return;
    }

    const json = ChataUtils.responses[idRequest];
    if (!json?.data?.rows?.length || !json?.data?.columns?.length) {
        return;
    }

    const columns = formatQueryColumns({ columns: json.data.columns, queryResponse: { data: json } });
    const tableConfig = getColumnIndexConfig({ response: { data: json } });

    this.isInitialized = false;
    this.hasSetInitialData = false;

    component.getRows = (pageNumber) => {
        const page = pageNumber ?? component.tableParams?.page ?? 1;
        const start = (page - 1) * component.pageSize;
        const end = start + component.pageSize;

        const queryResponse = ChataUtils.responses[idRequest];

        return queryResponse?.data?.rows?.slice(start, end) ?? [];
    };

    const tableData = component.getRows(1);

    if (component) {
        component.columnIndexConfig = tableConfig;
    }

    // TODO - move this to its parent element instead
    var groupableCount = getNumberOfGroupables(json?.data?.columns);
    if (groupableCount === 0) {
        component.classList.add('no-drilldown');
    }

    component.classList.add('table-condensed');
    component.isOriginalData = true;
    component.pageSize = 50;
    component.lastPage = tableData?.length < component.pageSize ? 1 : 2;

    component.isLastPage = component.lastPage === 1;
    component.useInfiniteScroll = !!useInfiniteScroll;
    component.isFiltering = false;
    component.tableParams = tableParams ?? { sort: undefined, filter: undefined };

    component.queryFn = json?.queryFn;

    component.getCurrentRowCount = () => {
        const queryResponse = ChataUtils.responses[idRequest];

        let rowCount = table?.getDataCount('active');

        if (rowCount === undefined) {
            rowCount = component.tableParams.page * component.pageSize;
        }

        if (rowCount > queryResponse?.data?.rows?.length) {
            rowCount = queryResponse?.data?.rows?.length;
        }

        return rowCount;
    };

    // TODO(Nikki) - update parent component with changes
    component.updateScrollSummaryFooter = () => {
        try {
            if (!component.tableRowCount) {
                const tableRowCount = document.createElement('div');
                tableRowCount.classList.add('autoql-vanilla-chata-table-row-count');
                component.parentElement.appendChild(tableRowCount);
                component.tableRowCount = tableRowCount;
            }

            const queryResponse = ChataUtils.responses[idRequest];

            const totalRows = queryResponse?.data?.count_rows ?? 0;
            const currentRows = component.getCurrentRowCount();

            if (!!totalRows && !currentRows) {
                return;
            }

            const languageCode = getDataFormatting(options.dataFormatting).languageCode;
            const currentRowsFormatted = new Intl.NumberFormat(languageCode, {}).format(currentRows);
            const totalRowsFormatted = new Intl.NumberFormat(languageCode, {}).format(totalRows);

            component.tableRowCount.textContent = `${strings.scrolledText} ${currentRowsFormatted} / ${totalRowsFormatted} ${strings.rowsText}`;
        } catch (error) {
            console.error(error);
        }
    };

    // TODO(Nikki) - update parent component with changes
    component.onTableParamsChange = (params, nextTableParamsFormatted) => {};

    // TODO(Nikki) - update parent component with changes
    component.onNewData = (response) => {
        onNewData?.(response, component.tableParams);
    };

    component.getNewPage = (tableParams) => {
        try {
            const rows = component.getRows(tableParams.page);
            const response = {
                page: tableParams.page,
                rows,
            };

            return Promise.resolve(response);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    };

    component.clientSortAndFilterData = (params) => {
        // Use FE for sorting and filtering
        let response = _cloneDeep(ChataUtils.responses[idRequest]);
        let data = _cloneDeep(json.data.rows);

        // Filters
        if (params.filters?.length) {
            params.filters.forEach((filter) => {
                const filterColumnName = filter.name;
                const filterColumnIndex = response.data.columns.find((col) => col.name === filterColumnName)?.index;

                data = filterDataByColumn(
                    data,
                    response.data.columns,
                    filterColumnIndex,
                    filter.value,
                    filter.operator,
                );
            });
        }

        // Sorters
        if (params.sorters?.length) {
            const sortColumnName = params.sorters[0].name;
            const sortColumnIndex = response.data.columns.find((col) => col.name === sortColumnName)?.index;
            const sortDirection = params.sorters[0].sort === 'DESC' ? 'desc' : 'asc';

            data = sortDataByColumn(data, response.data.columns, sortColumnIndex, sortDirection);
        }

        response.data.rows = data;

        return { data: response };
    };

    component.sortOrFilterData = (tableParams) => {
        if (options.useInfiniteScroll) {
            return component.queryFn({
                ...(options.authentication ?? {}),
                tableFilters: tableParams?.filters,
                orders: tableParams?.sorters,
                cancelToken: component.axiosSource?.token,
            });
        } else {
            return Promise.resolve(component.clientSortAndFilterData(tableParams));
        }
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
        ...commonTableOptions,
        headerFilterLiveFilterDelay: 300,
        columns,
        data: tableData,
        initialSort: component.tableParams?.sort,
        initialFilter: component.tableParams?.filter,
        progressiveLoadScrollMargin: 100, // Trigger next ajax load when scroll bar is 800px or less from the bottom of the table.
    };

    if (json?.data?.rows?.length) {
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
            return ajaxRequestFunc(params, idRequest, component, columns, self);
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
    component.onDataLoaded = () => {};

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
    };

    table.onDateRangeSelectionApplied = (dateRangeSelection, column, inputElement) => {
        if (!dateRangeSelection || !column || !inputElement) {
            return;
        }

        const { startDate, endDate } = dateRangeSelection;

        let start = startDate;
        let end = endDate;
        if (startDate && !endDate) {
            end = start;
        } else if (!startDate && endDate) {
            start = end;
        }

        if (inputElement) {
            const filterPrecision = getFilterPrecision(column);
            const dayJSFormatStr = DAYJS_PRECISION_FORMATS[filterPrecision];

            const startDateStr = dayjs(start).format(dayJSFormatStr);
            const startDateUTC = dayjs.utc(startDateStr).toISOString();
            const formattedStartDate = dayjs(startDateUTC).utc().format(dayJSFormatStr);

            const endDateStr = dayjs(end).format(dayJSFormatStr);
            const endDateUTC = dayjs.utc(endDateStr).toISOString();
            const formattedEndDate = dayjs(endDateUTC).utc().format(dayJSFormatStr);

            let filterInputText = `${formattedStartDate} to ${formattedEndDate}`;
            if (formattedStartDate === formattedEndDate) {
                filterInputText = formattedStartDate;
            }

            table.setHeaderInputValue(inputElement, filterInputText);
            this.currentDateRangeSelections = {
                [column.field]: dateRangeSelection,
            };
        }
    };

    table.inputDateClickListener = (e, col, inputElement) => {
        const coords = inputElement.getBoundingClientRect();
        const tableCoords = table.element?.getBoundingClientRect();
        if (coords?.top && coords?.left) {
            this.datePickerLocation = {
                top: coords.top - tableCoords.top + coords.height + 5,
                left: coords.left - tableCoords.left,
            };

            if (inputElement.datePicker) {
                inputElement.datePicker.show();
            } else {
                const datePickerPopover = new DateRangePicker(e, {
                    title: col.display_name,
                    initialRange: this.currentDateRangeSelections?.[col.field],
                    onSelection: this.onDateRangeSelection,
                    validRange: col.dateRange,
                    type: col.precision,
                    onSelectionApplied: (selection) => table.onDateRangeSelectionApplied(selection, col, inputElement),
                });

                inputElement.datePicker = datePickerPopover;

                datePickerPopover.show();
            }
        }
    };

    table.inputDateKeypressListener = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    table.setFilters = () => {
        const filterValues = component.tableParams?.filter;

        if (filterValues) {
            filterValues.forEach((filter, i) => {
                try {
                    table?.setHeaderFilterValue(filter.field, filter.value);
                    if (!useInfiniteScroll) {
                        table?.setFilter(filter.field, filter.type, filter.value);
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        }
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

                inputElement.column = col;

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

    table.toggleFilters = () => toggleFilters(component, table);

    return table;
}

export function ChataPivotTable(idRequest, options = {}, onClick = () => {}) {
    const component = document.querySelector(`[data-componentid='${idRequest}']`);
    const json = _cloneDeep(ChataUtils.responses[idRequest]);

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
        ...commonTableOptions,
        movableColumns: true,
        columns: pivotColumns,
        data: pivotTableData,
    };

    var table = instantiateTabulator(component, tableOptions, this);

    return table;
}
