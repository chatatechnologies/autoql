import "regenerator-runtime/runtime.js";
import {
    htmlToElement,
    closeAllChartPopovers,
    closeAllToolbars,
    closeAllSafetynetSelectors,
    formatColumnName,
    allColHiddenMessage,
    getNotGroupableField,
    getSVGString,
    copyTextToClipboard,
    svgString2Image,
    apiCallPut,
    apiCallPost
} from '../Utils'
import sqlFormatter from "sql-formatter";
import { ChataConfirmDialog } from '../ChataComponents'
import {
    DOWNLOAD_CSV_ICON,
    CLIPBOARD_ICON,
    EXPORT_PNG_ICON,
    TICK,
    CHECK,
    COPY_SQL,
    NOTIFICATION_BUTTON
} from '../Svg'
import { refreshTooltips } from '../Tooltips'
import { Modal } from '../Modal'
import { NotificationSettingsModal } from '../Notifications'
import { AntdMessage } from '../Antd'
import '../../css/PopoverMenu.css'


export var ChataUtils = {
    xhr: new XMLHttpRequest(),
    responses: []
};

ChataUtils.sendReport = async (idRequest, options, menu, toolbar) => {
    var json = ChataUtils.responses[idRequest];
    var queryId = json['data']['query_id'];
    const URL = options.authentication.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
    : `${options.authentication.domain}/autoql/api/v1/query/${queryId}?key=${options.authentication.apiKey}`;

    var response = await apiCallPut(URL, {is_correct: false}, options)
    menu.classList.remove('show');
    toolbar.classList.remove('show');
    new AntdMessage('Thank you for your feedback.', 3000);

    return Promise.resolve()
}

ChataUtils.getRecommendationPath = (options, text) => {
    return `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${text}&scope=narrow`;
}


ChataUtils.getReportProblemMenu = (
    toolbar, idRequest, type, options, singleMessage=false) => {
    var menu = ChataUtils.getPopover();
    if(type === 'simple'){
        menu.classList.add('chata-popover-single-message');
    }
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'The data is incorrect',
            ChataUtils.sendReport,
            [idRequest, options, menu, toolbar]
        )
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'The data is incomplete',
            ChataUtils.sendReport,
            [idRequest, options, menu, toolbar]
        )
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption(
            '', 'Other...',
            ChataUtils.openModalReport,
            [idRequest, options, menu, toolbar]
        )
    );

    return menu;
}

ChataUtils.reportProblemHandler = (
    evt, idRequest, reportProblem, toolbar) => {
    // closeAllToolbars();
    reportProblem.classList.toggle('show');
    toolbar.classList.toggle('show');
}


ChataUtils.downloadCsvHandler = (idRequest) => {
    var json = ChataUtils.responses[idRequest];
    var csvData = ChataUtils.createCsvData(json);
    var link = document.createElement("a");
    link.setAttribute(
        'href', 'data:text/csv;charset=utf-8,'
        + encodeURIComponent(csvData)
    );
    link.setAttribute('download', 'table.csv');
    link.click();
}

ChataUtils.copySqlHandler = (idRequest) => {
    var json = ChataUtils.responses[idRequest];
    console.log(json);
    console.log(JSON.stringify(json));
    var sql = json['data']['sql'][0];
    var copyButton = document.createElement('button');
    var okBtn = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary "
        style="padding: 5px 16px; margin: 2px 5px;">Ok</div>`
    )
    var modalContent = document.createElement('div');
    var text = document.createElement('textarea');
    text.classList.add('copy-sql-formatted-text');
    text.setAttribute('disabled', 'true');
    text.value = sqlFormatter.format(sql);
    modalContent.classList.add('copy-sql-modal-content');
    copyButton.classList.add('autoql-vanilla-chata-btn');
    copyButton.classList.add('copy-sql-btn');
    copyButton.classList.add('default');
    copyButton.classList.add('large');
    copyButton.setAttribute('data-tippy-content', 'Copy to Clipboard');
    copyButton.appendChild(htmlToElement(`
        <span class="chata-icon">
            ${CLIPBOARD_ICON}
        </span>
    `))

    modalContent.appendChild(text);
    modalContent.appendChild(copyButton);
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true
    });
    modal.setTitle('Generated SQL');
    modal.addView(modalContent);
    modal.addFooterElement(okBtn);
    modal.show(okBtn);
    refreshTooltips()
    okBtn.onclick = (evt) => {
        modal.close()
    }

    copyButton.onclick = (evt) => {
        if(!copyButton.classList.contains('sql-copied')){
            copyButton.classList.add('sql-copied');
            copyButton.appendChild(htmlToElement(`
                <span class="chata-icon">
                    ${CHECK}
                </span>
            `));
        }

        copyTextToClipboard(sql);
        new AntdMessage(
            'Successfully copied generated query to clipboard!', 3000
        )

    }
}

ChataUtils.copyHandler = (idRequest) => {
    var json = ChataUtils.responses[idRequest];
    copyTextToClipboard(ChataUtils.createCsvData(json, '\t'));
    new AntdMessage('Successfully copied table to clipboard!', 3000)
}
ChataUtils.exportPNGHandler = (idRequest) => {
    var component = document.querySelector(
        `[data-componentid='${idRequest}']`
    );
    var svg = component.getElementsByTagName('svg')[0];
    var svgString = getSVGString(svg);

    svgString2Image(
        svgString,
        2*component.clientWidth,
        2*component.clientHeight
    );
}

ChataUtils.filterTableHandler = (evt, idRequest) => {
    var table = document.querySelector(
        `[data-componentid="${idRequest}"]`
    );
    var tabulator = table.tabulator;
    tabulator.toggleFilters();
}

ChataUtils.createNotificationHandler = (idRequest, extraParams) => {
    var o = extraParams.caller.options;
    var modalView = new NotificationSettingsModal(o);
    var configModal = new Modal({
        withFooter: true,
        destroyOnClose: true
    }, () => {modalView.step1.expand();})
    var cancelButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn default"
        style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
    )
    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
        `)
    var saveButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary disabled"
        style="padding: 5px 16px; margin: 2px 5px;"></div>`
    )

    modalView.checkSteps = () => {
        if(modalView.isValid()){
            saveButton.classList.remove('disabled')
        }else{
            saveButton.classList.add('disabled')
        }
    }

    saveButton.appendChild(spinner);
    saveButton.appendChild(document.createTextNode('Save'));
    configModal.addFooterElement(cancelButton);
    configModal.addFooterElement(saveButton);
    configModal.show();
    refreshTooltips();
    configModal.chataModal.style.width = '95vw';
    configModal.addView(modalView);
    configModal.setTitle('Custom Notification');
    configModal.show();

    var input = modalView.querySelectorAll(
        '.autoql-vanilla-chata-input-settings'
    )[1]
    var returnInput = modalView.querySelector(
        '.autoql-vanilla-query-return-input'
    )

    input.value = extraParams.query
    returnInput.value = extraParams.query

    cancelButton.onclick = (e) => {
        new ChataConfirmDialog(
            'Are you sure you want to leave this page?',
            'All unsaved changes will be lost.',
            (evt) => {
                configModal.close()
            }
        )
    }
    saveButton.onclick = async(e) => {
        spinner.classList.remove('hidden')
        saveButton.setAttribute('disabled', 'true')
        const URL = `${o.authentication.domain}/autoql/api/v1/rules?key=${o.authentication.apiKey}`;
        var response = await apiCallPost(URL, modalView.getValues, o)
        configModal.close();
    }
}

ChataUtils.getMoreOptionsMenu = (options, idRequest, type, extraParams={}) => {
    var menu = ChataUtils.getPopover();
    if(type === 'simple'){
        menu.classList.add('chata-popover-single-message');
    }

    for (var i = 0; i < options.length; i++) {
        let opt = options[i]
        switch (opt) {
            case 'csv':
                var action = ChataUtils.getActionOption(
                    DOWNLOAD_CSV_ICON, 'Download as CSV',
                    ChataUtils.downloadCsvHandler,
                    [idRequest]
                );
                action.setAttribute('data-name-option', 'csv-handler');
                menu.ul.appendChild(action);
                break;
            case 'copy':
                var action = ChataUtils.getActionOption(
                    CLIPBOARD_ICON, 'Copy table to clipboard',
                    ChataUtils.copyHandler,
                    [idRequest]
                );
                action.setAttribute('data-name-option', 'copy-csv-handler');
                menu.ul.appendChild(action);
                break;
            case 'copy_sql':
                var action = ChataUtils.getActionOption(
                    COPY_SQL, 'View generated SQL',
                    ChataUtils.copySqlHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
                break;
            case 'png':
                var action = ChataUtils.getActionOption(
                    EXPORT_PNG_ICON, 'Download as PNG',
                    ChataUtils.exportPNGHandler,
                    [idRequest]
                );
                menu.ul.appendChild(action);
                break;
            case 'notification':
                var action = ChataUtils.getActionOption(
                    NOTIFICATION_BUTTON,
                    'Create a Data Alert...',
                    ChataUtils.createNotificationHandler,
                    [idRequest, extraParams]
                );
                menu.ul.appendChild(action);

                break;
            default:

        }
    }

    return menu;
}

ChataUtils.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
    var button =  htmlToElement(`
        <button
            class="autoql-vanilla-chata-toolbar-btn"
            data-tippy-content="${tooltip}"
            data-id="${idRequest}">
            ${svg}
        </button>
    `)
    button.onclick = (evt) => {
        onClick.apply(null, [evt, idRequest, ...evtParams]);
    }

    return button;
}

ChataUtils.getActionOption = (svg, text, onClick, params) => {
    var element = htmlToElement(`
        <li>
            <span class="chata-icon more-options-icon">
                ${svg}
            </span>
            ${text}
        </li>
    `);
    element.onclick = (evt) => {
        onClick.apply(null, params);
    }
    return element;
}

ChataUtils.getPopover = () => {
    var optionsMenu = htmlToElement(`
        <div class="chata-more-options-menu">
        </div>
    `);
    var menu = htmlToElement(`
        <div class="chata-popover-wrapper">
        </div>`
    );
    var ul = htmlToElement(`
        <ul class="chata-menu-list">
        </ul>
    `);
    menu.ul = ul;
    optionsMenu.appendChild(ul);
    menu.appendChild(optionsMenu);
    return menu;
}

ChataUtils.openModalReport = (idRequest, options, menu, toolbar) => {
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true
    });
    modal.setTitle('Report a Problem');
    var container = document.createElement('div');
    var textArea = document.createElement('textarea');
    textArea.classList.add('autoql-vanilla-report-problem-text-area');
    var cancelButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn default"
        style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
    )

    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `)

    var reportButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 2px 5px;">
        </div>`
    )

    reportButton.appendChild(spinner);
    reportButton.appendChild(document.createTextNode('Report'));
    container.appendChild(document.createTextNode(
        'Please tell us more about the problem you are experiencing:'
    ));

    modal.addView(container);
    modal.addView(textArea);
    modal.addFooterElement(cancelButton);
    modal.addFooterElement(reportButton);

    cancelButton.onclick = (evt) => {
        modal.close()
    }

    reportButton.onclick = async (evt) => {
        var reportMessage = textArea.value;
        spinner.classList.remove('hidden');
        await ChataUtils.sendReport(idRequest, options, menu, toolbar);
        modal.close();
    }

    modal.show();
}

ChataUtils.showColumnEditor = (id, options, onHideCols=()=>{}) => {
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true
    })
    var json = ChataUtils.responses[id];
    var columns = json['data']['columns'];
    var container = document.createElement('div');
    var headerEditor = document.createElement('div');

    var createCheckbox = (name, checked, colIndex, isLine=false) => {
        var tick = htmlToElement(`
            <div class="autoql-vanilla-chata-checkbox-tick">
            <span class="chata-icon">${TICK}</span>
            </div>
        `);
        var checkboxContainer = document.createElement('div');
        var checkboxWrapper = document.createElement('div');
        var checkboxInput = document.createElement('input');
        checkboxInput.setAttribute('type', 'checkbox');
        checkboxInput.classList.add('autoql-vanilla-m-checkbox__input');
        if(name){
            checkboxInput.setAttribute('data-col-name', name);
        }
        if(isLine){
            checkboxInput.setAttribute('data-line', 'true');
        }
        checkboxInput.setAttribute('data-col-index', colIndex);
        checkboxContainer.style.width = '36px';
        checkboxContainer.style.height = '36px';
        checkboxWrapper.style.width = '36px';
        checkboxWrapper.style.height = '36px';
        checkboxWrapper.style.position = 'relative';

        if(checked){
            checkboxInput.setAttribute('checked', 'true');
        }

        checkboxWrapper.appendChild(checkboxInput);
        checkboxWrapper.appendChild(tick);

        checkboxContainer.appendChild(checkboxWrapper);
        checkboxContainer.input = checkboxInput;
        return checkboxContainer;
    }


    container.style.padding = '0px 15px';
    headerEditor.classList.add('col-visibility-header');
    headerEditor.appendChild(htmlToElement(`
        <div>Column Name</div>
    `))
    var divVisibility = htmlToElement(`
        <div>Visibility</div>
    `);
    divVisibility.style.display = 'flex';
    container.appendChild(headerEditor);
    modal.chataModal.classList.add('chata-modal-column-editor')
    modal.setTitle('Show/Hide Columns')
    var headerCheckbox = createCheckbox(null, true, -1);
    headerEditor.appendChild(divVisibility);
    headerCheckbox.style.marginLeft = '12px';
    headerCheckbox.style.marginTop = '1px';
    divVisibility.appendChild(headerCheckbox);
    for (var i = 0; i < columns.length; i++) {
        var lineItem = document.createElement('div');
        var isVisible = columns[i]['is_visible'] || false;
        var colStr = columns[i]['display_name'] ||
            columns[i]['name'];
        var colName = formatColumnName(colStr);

        lineItem.classList.add('col-visibility-line-item');
        lineItem.appendChild(htmlToElement(`
            <div>${colName}</div>
        `))
        var checkboxContainer = createCheckbox(
            columns[i]['name'], isVisible, i, true
        );

        checkboxContainer.input.onchange = (evt) => {
            var headerChecked = true;
            var inputs = container.querySelectorAll('[data-line]');

            for (var x = 0; x < inputs.length; x++) {
                if(!inputs[x].checked){
                    headerChecked = false;
                    break;
                }
            }
            headerCheckbox.input.checked = headerChecked;
        }

        if(!isVisible){
            headerCheckbox.input.checked = false;
        }
        lineItem.appendChild(checkboxContainer);
        container.appendChild(lineItem);
    }

    headerCheckbox.onchange = (evt) => {
        var inputs = container.querySelectorAll('[data-line]');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].checked = evt.target.checked;
        }
    }

    var cancelButton = htmlToElement(
        `<div
            class="autoql-vanilla-chata-btn default"
            style="padding: 5px 16px; margin: 2px 5px;">
                Cancel
            </div>`
    )

    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `)

    var saveButton = htmlToElement(
        `<div
            class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 2px 5px;">
        </div>`
    )

    saveButton.appendChild(spinner);
    saveButton.appendChild(document.createTextNode('Apply'));


    cancelButton.onclick = function(event){
        modal.close();
    }

    saveButton.onclick = async function(event){
        var opts = options
        const url = opts.authentication.demo
        ? `https://backend-staging.chata.ai/api/v1/chata/query`
        : `${opts.authentication.domain}/autoql/api/v1/query/column-visibility?key=${opts.authentication.apiKey}`
        this.classList.add('disabled');
        spinner.classList.remove('hidden');
        var inputs = container.querySelectorAll('[data-line]');
        var data = [];
        var table = document.querySelector(`[data-componentid='${id}']`);

        const tableCols = table.tabulator.getColumns();
        for (var i = 0; i < inputs.length; i++) {
            var colName = inputs[i].dataset.colName;
            data.push({
                name: colName,
                is_visible: inputs[i].checked
            })
            json['data']['columns'][i]['is_visible'] = inputs[i].checked;
            if(inputs[i].checked){
                tableCols[i].show();
            }else{
                tableCols[i].hide();
            }
            table.tabulator.redraw();
        }
        var response = await apiCallPut(url, {columns: data}, opts)
        modal.close();
        allColHiddenMessage(table);
        onHideCols();
    }

    modal.addView(container);
    modal.addFooterElement(cancelButton);
    modal.addFooterElement(saveButton);
    modal.show();
}

ChataUtils.makeBarChartDomain = function(data, hasNegativeValues){
    if(hasNegativeValues){
        return chataD3.extent(data, function(d) { return d.value; });
    }else{
        return [0, chataD3.max(data, function(d) {
            return d.value;
        })];
    }
}

ChataUtils.getUniqueValues = function(data, getter){
    let unique = {};
    data.forEach(function(i) {
        // &&
        // if(typeof getter(i) !== 'string')return
        if(!unique[getter(i)]) {
            unique[getter(i)] = true;
        }
    });
    return Object.keys(unique);
}

ChataUtils.formatCompareData = function(col, data, groups){
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][0] == group){
                dataGrouped[i]['value1'] = parseFloat(data[x][1]);
                dataGrouped[i]['value2'] = parseFloat(data[x][2]);
            }
        }
    }
    return dataGrouped;
}

ChataUtils.format3dData = function(json, groups, metadata){
    var dataGrouped = [];
    var data = json['data']['rows'];
    var notGroupableField = getNotGroupableField(json);

    var groupableIndex1 = metadata.groupBy.groupable1;
    var groupableIndex2 = metadata.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][groupableIndex2] == group){
                if(typeof data[x][groupableIndex1] === 'string' ||
                   typeof data[x][groupableIndex1] === 'number'){
                    dataGrouped[i][data[x][groupableIndex1]]
                    = parseFloat(data[x][notGroupableIndex]);
                }
            }
        }
    }

    return dataGrouped;
}

ChataUtils.groupBy = function(list, keyGetter, indexData) {
    var obj = {};
    list.forEach((item) => {
        const key = keyGetter(item);
        if (!obj.hasOwnProperty(key)) {
            obj[key] = item[indexData];
        }else{
            obj[key] += item[indexData];
        }
    });

    return obj;
}

ChataUtils.sort = function(data, operator, colIndex, colType){
    var lines = data;
    var values = []
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            row.push(data[x]);
        }
        values.push(row);
    }
    if(operator == 'asc'){
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) > parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
            }
        }
    }else{
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) < parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
            }
        }
    }
    var sortedArray = values.sort(comparator);

    return sortedArray;
}

ChataUtils.refreshPivotTable = function(table, pivotArray){
    var rows = table.childNodes;
    var cols = ChataUtils.responses[table.dataset.componentid]['columns'];
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'table-row';
    }

    for (var i = 0; i < pivotArray.length; i++) {
        var tdList = rows[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = pivotArray[i][x];
        }
    }

    for (var i = pivotArray.length; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
}

ChataUtils.refreshTableData = function(table, newData, options){
    var rows = newData;//table.childNodes;
    var nodes = table.childNodes;
    var cols = ChataUtils.responses[table.dataset.componentid]['data']['columns'];
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = 'table-row';
    }
    for (var i = 0; i < newData.length; i++) {
        var tdList = nodes[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = formatData(newData[i][x], cols[x], options);
        }
    }
    for (var i = newData.length; i < nodes.length; i++) {
        nodes[i].style.display = 'none';
    }
}

ChataUtils.onClickColumn = function(evt, tableElement, options){
    let sortBy;
    let newClassArrow;
    let parent = evt.target;
    evt.preventDefault();

    if(parent.tagName === 'INPUT'){
        return;
    }

    if(parent.tagName === 'TH'){
        parent = parent.childNodes[0];
    }
    if(tableElement.sort === 'asc'){
        sortBy = 'desc';
        newClassArrow = 'down';
    }else{
        sortBy = 'asc';
        newClassArrow = 'up';
    }

    tableElement.sort = sortBy;
    parent.nextSibling.classList.remove('up');
    parent.nextSibling.classList.remove('down');
    parent.nextSibling.classList.add(newClassArrow);

    var data = applyFilter(tableElement.dataset.componentid);
    var sortData = ChataUtils.sort(
        data, sortBy, parent.dataset.index, parent.dataset.type
    );

    ChataUtils.refreshTableData(
        tableElement, sortData, options
    );
}

ChataUtils.onClickPivotColumn = function(evt, tableElement, options){
    var pivotArray = [];
    var json = cloneObject(ChataUtils.responses[
        tableElement.dataset.componentid
    ]);
    var columns = json['data']['columns'];
    let sortBy;
    let newClassArrow;
    let parent = evt.target;
    evt.preventDefault();

    if(parent.tagName === 'INPUT'){
        return;
    }

    if(parent.tagName === 'TH'){
        parent = parent.childNodes[0];
    }

    if(columns[0].type === 'DATE' &&
        columns[0].name.includes('month')){
        pivotArray = getDatePivotArray(
            json, options, cloneObject(json['data']['rows'])
        );
    }else{
        pivotArray = getPivotColumnArray(
            json, options, cloneObject(json['data']['rows'])
        );
    }

    if(tableElement.sort === 'asc'){
        sortBy = 'desc';
        newClassArrow = 'down';
    }else{
        sortBy = 'asc';
        newClassArrow = 'up';
    }

    tableElement.sort = sortBy;
    parent.nextSibling.classList.remove('up');
    parent.nextSibling.classList.remove('down');
    parent.nextSibling.classList.add(newClassArrow);

    var rows = applyFilter(tableElement.dataset.componentid, pivotArray);
    rows.unshift([]); //Simulate header
    var sortData = sortPivot(rows, parent.dataset.index, sortBy);
    // sortData.unshift([]); //Simulate header
    ChataUtils.refreshPivotTable(tableElement, sortData);

}


ChataUtils.createCsvData = function(json, separator=','){
    var output = '';
    var lines = json['data']['rows'];
    var cols = json['data']['columns'];
    for(var i = 0; i<cols.length; i++){
        if(!cols[i]['is_visible'])continue;
        var colStr = cols[i]['display_name'] || cols[i]['name'];
        var colName = formatColumnName(colStr);
        output += colName + separator;
    }
    output += '\n';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        for (var x = 0; x < data.length; x++) {
            if(!cols[x]['is_visible'])continue;
            output += data[x] + separator;
        }
        output += '\n';
    }
    return output
}

ChataUtils.safetynetCall = function(url, callback, options, extraHeaders=[]){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = undefined;
            if(xhr.status == 200){
                jsonResponse = JSON.parse(xhr.responseText);
            }
            callback(jsonResponse, xhr.status);
        }
    };
    xhr.open('GET', url);
    for (var obj of extraHeaders) {
        var key = Object.entries(obj)[0];
        xhr.setRequestHeader(key[0], key[1]);
    }
    // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    xhr.send();
}

ChataUtils.ajaxCall = function(val, callback, options, source){
    const url = options.authentication.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query`
    : `${options.authentication.domain}/autoql/api/v1/query?key=${options.authentication.apiKey}`

    const data = {
        text: val,
        source: source,
        // username: options.authentication.demo ? 'widget-demo' : options.authentication.userId || 'widget-user',
        // customer_id: options.authentication.customerId || "",
        // user_id: options.authentication.userId || "",
        debug: options.autoQLConfig.debug,
        test: options.autoQLConfig.test
    }
    if(options.authentication.demo){
        data['user_id'] = 'demo';
        data['customer_id'] = 'demo';
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse, xhr.status);
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xhr.send(JSON.stringify(data));
}

ChataUtils.putCall = function(url, data, callback, options){

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    }

    xhr.open('PUT', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        xhr.setRequestHeader(
            "Authorization", `Bearer ${options.authentication.token}`
        );
    }
    xhr.send(JSON.stringify(data));

}

ChataUtils.deleteCall = function(url, callback, options, extraHeaders=[]){

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    }

    xhr.open('DELETE', url);
    for (var obj of extraHeaders) {
        var key = Object.entries(obj)[0];
        xhr.setRequestHeader(key[0], key[1]);
    }


    if(!options.authentication.demo){
        xhr.setRequestHeader(
            "authorization", `Bearer ${options.authentication.token}`
        );
    }

    xhr.send();

}

ChataUtils.ajaxCallPost = function(url, callback, data, options){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        xmlhttp.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4){
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            callback(jsonResponse, xmlhttp.status);
        }
    };
    xmlhttp.send(JSON.stringify(data));
}

ChataUtils.ajaxCallAutoComplete = function(url, callback, options){

    options.xhr.onreadystatechange = function() {
        if (options.xhr.readyState === 4){
            console.log(options.xhr.responseText);
            var jsonResponse = {
                data: {
                    matches: []
                }
            }
            if(options.xhr.responseText){
                jsonResponse = JSON.parse(options.xhr.responseText);
            }
            callback(jsonResponse);
        }
    };
    // ChataUtils.xhr.open('GET', url);
    // ChataUtils.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    // ChataUtils.xhr.setRequestHeader("Authorization", options.authentication.token ? `Bearer ${options.authentication.token}` : undefined);
    // ChataUtils.xhr.send();
    options.xhr.open('GET', url);
    options.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    options.xhr.setRequestHeader("Authorization", options.authentication.token ? `Bearer ${options.authentication.token}` : undefined);
    options.xhr.send();
}

ChataUtils.autocomplete = function(suggestion, suggestionList, liClass='suggestion', options){
    const URL = options.authentication.demo
      ? `https://backend.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
        suggestion
      )}&projectid=1`
      : `${options.authentication.domain}/autoql/api/v1/query/autocomplete?text=${encodeURIComponent(
        suggestion
      )}&key=${options.authentication.apiKey}`

    ChataUtils.ajaxCallAutoComplete(URL, function(jsonResponse){
        suggestionList.innerHTML = '';
        var matches = jsonResponse['matches'] || jsonResponse['data']['matches'];
        if(matches.length > 0){
            for(var [key, value] of Object.entries(options.autocompleteStyles)){
                suggestionList.style.setProperty(key, value, '');
            }
            for (var i = matches.length-1; i >= 0; i--) {
                var li = document.createElement('li');
                li.classList.add(liClass);
                li.textContent = matches[i];
                suggestionList.appendChild(li);
            }
            suggestionList.style.display = 'block';
        }else{
            suggestionList.style.display = 'none';
        }
    }, options);
}

ChataUtils.getSupportedDisplayTypesArray = function(){
    return getSupportedDisplayTypesArray();
}

ChataUtils.createSuggestions = function(responseContentContainer, data, classButton='autoql-vanilla-chata-suggestion-btn'){
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement('div');
        var button = document.createElement('button');
        button.classList.add(classButton);
        button.textContent = data[i];
        div.appendChild(button);
        responseContentContainer.appendChild(div);
    }
}

ChataUtils.registerWindowClicks = (evt) => {
    console.log('WINDOW CLICKS!!!');
    console.log(window);
    const excludeElementsForChartSelector = [
        'autoql-vanilla-x-axis-label-border',
        'autoql-vanilla-y-axis-label-border',
        'autoql-vanilla-axis-selector-container',
        'number-selector-header',
        'chata-chart-selector-checkbox',
        'autoql-vanilla-chata-col-selector-name',
        'autoql-vanilla-button-wrapper-selector',
        'autoql-vanilla-chata-list-item',
    ]

    const excludeElementsForToolbars = [
        'autoql-vanilla-chata-toolbar-btn',
        'autoql-vanilla-more-options',
        'chata-more-options-menu',
        'report_problem'
    ]

    const excludeElementsForSafetynet = [
        'autoql-vanilla-safetynet-selector',
        'autoql-vanilla-chata-safetynet-select',
    ]

    document.body.addEventListener('click', (evt) => {
        console.log('FOOOO');
        var closePop = true;
        var closeChartPopovers = true;
        var closeToolbars = true;
        var closeSafetynetSelectors = true;

        for (var i = 0; i < excludeElementsForSafetynet.length; i++) {
            var c = excludeElementsForSafetynet[i];
            if(evt.target.classList.contains(c)){
                closeSafetynetSelectors = false;
            }
        }


        for (var i = 0; i < excludeElementsForChartSelector.length; i++) {
            var c = excludeElementsForChartSelector[i]
            if(evt.target.classList.contains(c)){
                closeChartPopovers = false;
                break;
            }
        }


        for (var i = 0; i < excludeElementsForToolbars.length; i++) {
            var c = excludeElementsForToolbars[i]
            if(evt.target.classList.contains(c)){
                closeToolbars = false;
                break;
            }
        }


        if(closeChartPopovers){
            closeAllChartPopovers();
        }

        if(closeToolbars){
            closeAllToolbars();
        }

        if(closeSafetynetSelectors){
            closeAllSafetynetSelectors();
        }
    })
}

(function(){
    var initEvents = () => {
        setTimeout(() => {
            ChataUtils.registerWindowClicks();
        }, 3000)
    }
    document.addEventListener("DOMContentLoaded", function(event) {
        try {
            window.addEventListener("load", initEvents, false);
        } catch(e) {
            window.onload = initEvents;
        }
    });
})()
