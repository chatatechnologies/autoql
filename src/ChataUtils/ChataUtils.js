import 'regenerator-runtime/runtime.js';
import tippy from 'tippy.js';
import MobileDetect from 'mobile-detect';
import {
    htmlToElement,
    closeAllToolbars,
    closeAllSafetynetSelectors,
    closeAutocompleteObjects,
    formatColumnName,
    allColHiddenMessage,
    getNotGroupableField,
    copyTextToClipboard,
    uuidv4,
} from '../Utils';
import { apiCallPut } from '../Api';
import { format } from 'sql-formatter';
import { ChataRadio } from '../ChataComponents';
import { DOWNLOAD_CSV_ICON, CLIPBOARD_ICON, EXPORT_PNG_ICON, TICK, CHECK, COPY_SQL, NOTIFICATION_BUTTON } from '../Svg';
import { refreshTooltips } from '../Tooltips';
import { Modal } from '../Modal';
import { AntdMessage } from '../Antd';
import { strings } from '../Strings';
import { setColumnVisibility, svgToPng, exportCSV } from 'autoql-fe-utils';
import { CSS_PREFIX } from '../Constants';
import { DataAlertCreationModal } from '../Notifications/DataAlerts/Components/DataAlertCreationModal';

import '../../css/PopoverMenu.css';

export var ChataUtils = {
    xhr: new XMLHttpRequest(),
    responses: [],
};

// ChataUtils.sendReport = async (idRequest, options, menu, toolbar) => {
//     var json = ChataUtils.responses[idRequest];
//     var queryId = json['data']['query_id'];
//     const URL = options.authentication.demo
//     ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
//     : `${options.authentication.domain}/autoql/api/v1/query/${queryId}?key=${options.authentication.apiKey}`;
//
//     await apiCallPut(URL, {is_correct: false}, options)
//     if(menu)menu.classList.remove('autoql-vanilla-chat-message-toolbar-show');
//     if(toolbar)toolbar.classList.remove('autoql-vanilla-chat-message-toolbar-show');
//     new AntdMessage(strings.feedback, 3000);
//
//     return Promise.resolve()
// }
var md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile() === null ? false : true;

ChataUtils.sendReportMessage = async (idRequest, options, toolbar, msg) => {
    var json = ChataUtils.responses[idRequest];
    var queryId = json['data']['query_id'];
    const URL = options.authentication.demo
        ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
        : `${options.authentication.domain}/autoql/api/v1/query/${queryId}?key=${options.authentication.apiKey}`;

    await apiCallPut(URL, { is_correct: false, message: msg }, options);
    // if (menu) menu.classList.remove('autoql-vanilla-chat-message-toolbar-show');
    if (toolbar) toolbar.classList.remove('autoql-vanilla-chat-message-toolbar-show');
    new AntdMessage(strings.feedback, 3000);

    return Promise.resolve();
};

ChataUtils.getRecommendationPath = (options, text) => {
    return `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${text}&scope=narrow`;
};

ChataUtils.makeReportProblemMenu = (toolbar, idRequest, type, options) => {
    var ul = document.createElement('ul');
    ul.classList.add('chata-menu-list');

    ul.appendChild(
        ChataUtils.getActionOption('', strings.dataIncorrect, ChataUtils.sendReportMessage, [
            idRequest,
            options,
            undefined,
            toolbar,
            'The data is incorrect',
        ]),
    );
    ul.appendChild(
        ChataUtils.getActionOption('', strings.dataIncomplete, ChataUtils.sendReportMessage, [
            idRequest,
            options,
            undefined,
            toolbar,
            'The data is incomplete',
        ]),
    );
    ul.appendChild(
        ChataUtils.getActionOption('', strings.other, ChataUtils.openModalReport, [
            idRequest,
            options,
            undefined,
            toolbar,
        ]),
    );

    return ul;
};

ChataUtils.getReportProblemMenu = (toolbar, idRequest, type, options) => {
    var menu = ChataUtils.getPopover();
    if (type === 'simple') {
        menu.classList.add('chata-popover-single-message');
    }
    menu.ul.appendChild(
        ChataUtils.getActionOption('', strings.dataIncorrect, ChataUtils.sendReportMessage, [
            idRequest,
            options,
            menu,
            toolbar,
            'The data is incorrect',
        ]),
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption('', strings.dataIncomplete, ChataUtils.sendReportMessage, [
            idRequest,
            options,
            menu,
            toolbar,
            'The data is incomplete',
        ]),
    );
    menu.ul.appendChild(
        ChataUtils.getActionOption('', strings.other, ChataUtils.openModalReport, [idRequest, options, menu, toolbar]),
    );

    return menu;
};

ChataUtils.reportProblemHandler = (evt, idRequest, reportProblem, toolbar) => {
    reportProblem.classList.toggle('autoql-vanilla-chat-message-toolbar-show');
    toolbar.classList.toggle('autoql-vanilla-chat-message-toolbar-show');
};

ChataUtils.onCSVDownloadStart = (caller) => {
    caller.sendResponse(
        `
			<div id="autoql-vanilla-CSV-downloading-message">
			${strings.fetchingCSV}
			<div class="autoql-vanilla-spinner-loader" id='csv-downloading-spinner'></div>
		  </div>
				`,
    );
};

ChataUtils.onCSVDownloadProgress = ({ id, progress }) => {
    const csvDownloadingMessage = document.getElementById(`autoql-vanilla-CSV-downloading-message-${id}`);
    csvDownloadingMessage.textContent = `${strings.downloadingCSV} ... ${progress}%`;
};

ChataUtils.onCSVDownloadFinish = ({ caller, error, exportLimit, limitReached, queryText } = {}) => {
    if (error) {
        return caller?.sendResponse(error, true);
    }

    if (caller) {
        caller.sendResponse?.(
            `    <div>
             ${strings.downloadedCSVSuccessully}${' '}
              <b><i>${queryText}</i></b>.
              ${
                  limitReached
                      ? `<div>
                  <p>
                    <br />
                    ${strings.downloadedCSVWarning} ${exportLimit}
                    MB. ${strings.partialCSVDataWarning}
                  </p>
                <div/>`
                      : ''
              }
            <div/>`,
            true,
        );
    } else {
        new AntdMessage(strings.downloadedCSVSuccessully, 3000);
    }
};

ChataUtils.downloadCsvHandler = async (idRequest, extraParams) => {
    try {
        var uuid = uuidv4();
        var options = extraParams?.caller?.options ?? {};
        var caller = extraParams?.caller;
        ChataUtils.onCSVDownloadStart(caller);
        var json = ChataUtils.responses[idRequest];
        var queryId = json['data']['query_id'];
        const queryText = json['data']['text'];
        const csvDownloadingMessage = document.getElementById('autoql-vanilla-CSV-downloading-message');
        csvDownloadingMessage.setAttribute('id', `autoql-vanilla-CSV-downloading-message-${uuid}`);
        var response = await exportCSV({
            queryId,
            domain: options.authentication.domain,
            apiKey: options.authentication.apiKey,
            token: options.authentication.token,
            csvProgressCallback: (percentCompleted) =>
                ChataUtils.onCSVDownloadProgress({
                    id: uuid,
                    progress: percentCompleted,
                }),
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export.csv');
        document.body.appendChild(link);
        link.click();
        const exportLimit = parseInt(response?.headers?.export_limit);
        const limitReached = response?.headers?.limit_reached?.toLowerCase() == 'true' ? true : false;
        ChataUtils.onCSVDownloadFinish({ caller, queryText, exportLimit, limitReached });
    } catch (error) {
        ChataUtils.onCSVDownloadFinish({ caller, error });
        console.error(error);
        return;
    }

    var component = document.querySelector(`[data-componentid='${idRequest}']`);
};

ChataUtils.copySqlHandler = (idRequest) => {
    var json = ChataUtils.responses[idRequest];
    var sql = json['data']['sql'][0];
    var copyButton = document.createElement('button');
    var okBtn = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary">Ok
		</div>`,
    );
    var modalContent = document.createElement('div');
    var text = document.createElement('textarea');
    text.classList.add('copy-sql-formatted-text');
    text.setAttribute('disabled', 'true');
    text.value = format(sql);
    modalContent.classList.add('copy-sql-modal-content');
    copyButton.classList.add('autoql-vanilla-chata-btn');
    copyButton.classList.add('copy-sql-btn');
    copyButton.classList.add('default');
    copyButton.classList.add('large');
    if (!isMobile) {
        copyButton.setAttribute('data-tippy-content', strings.copySqlToClipboard);
    }
    copyButton.appendChild(
        htmlToElement(`
        <span class="chata-icon">
            ${CLIPBOARD_ICON}
        </span>
    `),
    );

    modalContent.appendChild(text);
    modalContent.appendChild(copyButton);
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true,
    });
    modal.setTitle(strings.generatedSql);
    modal.addView(modalContent);
    modal.addFooterElement(okBtn);
    modal.show(okBtn);
    refreshTooltips();
    okBtn.onclick = () => {
        modal.close();
    };

    copyButton.onclick = () => {
        if (!copyButton.classList.contains('sql-copied')) {
            copyButton.classList.add('sql-copied');
            copyButton.appendChild(
                htmlToElement(`
                <span class="chata-icon">
                    ${CHECK}
                </span>
            `),
            );
        }

        copyTextToClipboard(sql);
        new AntdMessage(strings.copySqlMessage, 3000);
    };
};

ChataUtils.copyHandler = (idRequest) => {
    var json = ChataUtils.responses[idRequest];
    copyTextToClipboard(ChataUtils.createCsvData(json, '\t'));
    new AntdMessage(strings.copyTextToClipboard, 3000);
};

ChataUtils.exportPNGHandler = async (idRequest) => {
    try {
        var component = document.querySelector(`[data-componentid='${idRequest}']`);

        if (!component) {
            console.error('Could not find component containing the chart.');
            return;
        }

        var svg = component.querySelector('svg.autoql-vanilla-chart-svg');

        if (!svg) {
            console.warn('Unable to download SVG - no svg was found');
        }

        const base64Data = await svgToPng(svg, 2, CSS_PREFIX);

        const a = document.createElement('a');
        a.download = 'Chart.png';
        a.href = base64Data;
        a.click();
    } catch (error) {
        console.error(error);
        return;
    }
};

ChataUtils.filterTableHandler = (evt, idRequest) => {
    var table = document.querySelector(`[data-componentid="${idRequest}"]`);
    var tabulator = table.tabulator;
    tabulator.toggleFilters();
};

ChataUtils.createNotificationHandler = (idRequest, extraParams) => {
    const queryResponse = ChataUtils.responses[idRequest];
    const { options } = extraParams.caller;

    const modal = new DataAlertCreationModal({ queryResponse, authentication: options.authentication, options });
    modal.show();
};

ChataUtils.makeMoreOptionsMenu = (idRequest, chataPopover, options, extraParams = {}) => {
    var ul = document.createElement('ul');
    ul.classList.add('chata-menu-list');
    for (var i = 0; i < options.length; i++) {
        let opt = options[i];
        let action;
        switch (opt) {
            case 'csv':
                action = ChataUtils.getActionOption(
                    DOWNLOAD_CSV_ICON,
                    strings.downloadCSV,
                    ChataUtils.downloadCsvHandler,
                    [idRequest],
                );
                action.setAttribute('data-name-option', 'csv-handler');
                ul.appendChild(action);
                break;
            case 'copy':
                action = ChataUtils.getActionOption(CLIPBOARD_ICON, strings.copyTable, ChataUtils.copyHandler, [
                    idRequest,
                ]);
                action.setAttribute('data-name-option', 'copy-csv-handler');
                ul.appendChild(action);
                break;
            case 'copy_sql':
                action = ChataUtils.getActionOption(COPY_SQL, strings.viewSQL, ChataUtils.copySqlHandler, [idRequest]);
                ul.appendChild(action);
                break;
            case 'png':
                action = ChataUtils.getActionOption(EXPORT_PNG_ICON, strings.downloadPNG, ChataUtils.exportPNGHandler, [
                    idRequest,
                ]);
                ul.appendChild(action);
                break;
            case 'notification':
                action = ChataUtils.getActionOption(
                    NOTIFICATION_BUTTON,
                    strings.createAlert,
                    ChataUtils.createNotificationHandler,
                    [idRequest, extraParams],
                );
                ul.appendChild(action);
                break;
            default:
        }
    }
    return ul;
};

ChataUtils.getMoreOptionsMenu = (options, idRequest, type, extraParams = {}) => {
    var menu = ChataUtils.getPopover();
    if (type === 'simple') {
        menu.classList.add('chata-popover-single-message');
    }

    for (var i = 0; i < options.length; i++) {
        let opt = options[i];
        let action;
        switch (opt) {
            case 'csv':
                action = ChataUtils.getActionOption(
                    DOWNLOAD_CSV_ICON,
                    strings.downloadCSV,
                    ChataUtils.downloadCsvHandler,
                    [idRequest, extraParams],
                );
                action.setAttribute('data-name-option', 'csv-handler');
                menu.ul.appendChild(action);
                break;
            case 'copy':
                action = ChataUtils.getActionOption(CLIPBOARD_ICON, strings.copyTable, ChataUtils.copyHandler, [
                    idRequest,
                ]);
                action.setAttribute('data-name-option', 'copy-csv-handler');
                menu.ul.appendChild(action);
                break;
            case 'copy_sql':
                action = ChataUtils.getActionOption(COPY_SQL, strings.viewSQL, ChataUtils.copySqlHandler, [idRequest]);
                menu.ul.appendChild(action);
                break;
            case 'png':
                action = ChataUtils.getActionOption(EXPORT_PNG_ICON, strings.downloadPNG, ChataUtils.exportPNGHandler, [
                    idRequest,
                ]);
                menu.ul.appendChild(action);
                break;
            case 'notification':
                action = ChataUtils.getActionOption(
                    NOTIFICATION_BUTTON,
                    strings.createAlert,
                    ChataUtils.createNotificationHandler,
                    [idRequest, extraParams],
                );
                action.classList.add('autoql-vanilla-notification-option');
                menu.ul.appendChild(action);
                if (!extraParams?.caller?.options?.enableNotificationsTab) {
                    action.style.display = 'none';
                }
                break;
            default:
        }
    }

    return menu;
};

ChataUtils.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
    var button = htmlToElement(`
        <button
            class="autoql-vanilla-chata-toolbar-btn"
            data-id="${idRequest}">
            ${svg}
        </button>
    `);
    const buttonTooltip = tippy(button);
    if (!isMobile) {
        buttonTooltip.setContent(tooltip);
        buttonTooltip.setProps({
            theme: 'chata-theme',
            delay: [500],
        });
    } else {
        buttonTooltip.disable();
    }
    button.onclick = (evt) => {
        onClick?.apply?.(null, [evt, idRequest, ...evtParams]);
    };

    return button;
};

ChataUtils.getActionOption = (svg, text, onClick, params) => {
    var element = htmlToElement(`
        <li>
            <span class="chata-icon more-options-icon">
                ${svg}
            </span>
            ${text}
        </li>
    `);
    element.onclick = () => {
        onClick.apply(null, params);
    };
    return element;
};

ChataUtils.getPopover = () => {
    var optionsMenu = htmlToElement(`
        <div class="chata-more-options-menu">
        </div>
    `);
    var menu = htmlToElement(`
        <div class="chata-popover-wrapper">
        </div>`);
    var ul = htmlToElement(`
        <ul class="chata-menu-list">
        </ul>
    `);
    menu.ul = ul;
    optionsMenu.appendChild(ul);
    menu.appendChild(optionsMenu);
    return menu;
};

ChataUtils.openModalReport = (idRequest, options, menu, toolbar) => {
    var reportOptions = [
        {
            label: strings.dataIncorrect,
            value: strings.dataIncorrect,
            checked: false,
        },
        {
            label: strings.dataIncomplete,
            value: strings.dataIncomplete,
            checked: false,
        },
        {
            label: 'Other',
            value: 'other',
            checked: false,
        },
    ];
    var selectedOption = '';
    var reportRadio = new ChataRadio(reportOptions, (evt) => {
        selectedOption = evt.target.value;
        enableButton(evt, selectedOption);
    });
    var enableButton = (evt, selectedOption) => {
        if (selectedOption === 'The data is incomplete' || selectedOption === 'The data is incorrect') {
            reportButton.style.opacity = '';
            reportButton.style.pointerEvents = '';
        } else if (selectedOption === 'other') {
            if (textArea.value !== '') {
                reportButton.style.opacity = '';
                reportButton.style.pointerEvents = '';
            } else {
                reportButton.style.opacity = '0.5';
                reportButton.style.pointerEvents = 'none';
            }
        }
    };
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true,
    });
    modal.chataModal.style.width = '600px';
    modal.setTitle(strings.reportProblemTitle);
    var container = document.createElement('div');
    var textArea = document.createElement('textarea');
    var reportProblemQuestion = document.createElement('h3');
    var reportProblemMessage = document.createElement('span');
    reportProblemMessage.textContent = strings.reportProblemMessage;
    reportProblemQuestion.textContent = strings.reportProblemQuestion;
    reportProblemQuestion.style.marginTop = '0';
    reportProblemQuestion.style.marginBottom = '5px';
    textArea.classList.add('autoql-vanilla-report-problem-text-area');
    textArea.addEventListener('input', (evt) => enableButton(evt, selectedOption));
    container.classList.add('autoql-vanilla-report-problem-modal-body');
    var cancelButton = htmlToElement(`<div class="autoql-vanilla-chata-btn default">${strings.cancel}</div>`);

    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `);

    var reportButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary">
        </div>`,
    );

    reportButton.appendChild(spinner);
    reportButton.appendChild(document.createTextNode(strings.reportProblem));
    container.appendChild(reportProblemQuestion);
    container.appendChild(reportRadio);
    container.appendChild(reportProblemMessage);
    container.appendChild(textArea);
    modal.addView(container);

    modal.addFooterElement(cancelButton);
    modal.addFooterElement(reportButton);

    cancelButton.onclick = () => {
        modal.close();
    };

    reportButton.style.opacity = '0.5'; // Adjust opacity to your preference
    reportButton.style.pointerEvents = 'none';
    reportButton.onclick = async () => {
        var message = textArea.value;
        if (textArea.value === '') {
            message = selectedOption;
        } else if (textArea.value !== '' && selectedOption !== 'other') {
            message = selectedOption + ' - ' + textArea.value;
        }
        spinner.classList.remove('hidden');
        await ChataUtils.sendReportMessage(idRequest, options, toolbar, message);
        modal.close();
    };

    modal.show();
};

ChataUtils.showColumnEditor = (id, options, onHideCols = () => {}, queryOutput) => {
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true,
    });
    var json = ChataUtils.responses[id];
    var columns = json['data']['columns'];
    var container = document.createElement('div');
    var headerEditor = document.createElement('div');

    var createCheckbox = (name, checked, colIndex, isLine = false) => {
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
        checkboxInput.classList.add('force-margin');
        if (name) {
            checkboxInput.setAttribute('data-col-name', name);
        }
        if (isLine) {
            checkboxInput.setAttribute('data-line', 'true');
        }
        checkboxInput.setAttribute('data-col-index', colIndex);
        checkboxContainer.style.width = '36px';
        checkboxContainer.style.height = '36px';
        checkboxWrapper.style.width = '36px';
        checkboxWrapper.style.height = '36px';
        checkboxWrapper.style.position = 'relative';

        if (checked) {
            checkboxInput.setAttribute('checked', 'true');
        }

        checkboxWrapper.appendChild(checkboxInput);
        checkboxWrapper.appendChild(tick);

        checkboxContainer.appendChild(checkboxWrapper);
        checkboxContainer.input = checkboxInput;
        return checkboxContainer;
    };

    container.style.padding = '0px 15px';
    headerEditor.classList.add('col-visibility-header');
    headerEditor.appendChild(
        htmlToElement(`
        <div>${strings.columnName}</div>
    `),
    );
    var divVisibility = htmlToElement(`
        <div>${strings.visibility}</div>
    `);
    divVisibility.style.display = 'flex';
    container.appendChild(headerEditor);
    modal.chataModal.classList.add('chata-modal-column-editor');
    modal.setTitle(strings.showHideCols);
    var headerCheckbox = createCheckbox(null, true, -1);
    headerEditor.appendChild(divVisibility);
    headerCheckbox.style.marginLeft = '12px';
    headerCheckbox.style.marginTop = '1px';
    divVisibility.appendChild(headerCheckbox);
    for (var i = 0; i < columns.length; i++) {
        var lineItem = document.createElement('div');
        var isVisible = columns[i]['is_visible'] || false;
        var colStr = columns[i]['display_name'] || columns[i]['name'];
        var colName = formatColumnName(colStr);

        lineItem.classList.add('col-visibility-line-item');
        lineItem.appendChild(
            htmlToElement(`
            <div>${colName}</div>
        `),
        );
        var checkboxContainer = createCheckbox(columns[i]['name'], isVisible, i, true);

        checkboxContainer.input.onchange = () => {
            var headerChecked = true;
            var inputs = container.querySelectorAll('[data-line]');

            for (var x = 0; x < inputs.length; x++) {
                if (!inputs[x].checked) {
                    headerChecked = false;
                    break;
                }
            }
            headerCheckbox.input.checked = headerChecked;
        };

        if (!isVisible) {
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
    };

    var cancelButton = htmlToElement(`<div class="autoql-vanilla-chata-btn default">${strings.cancel}</div>`);

    var spinner = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `);

    var saveButton = htmlToElement(
        `<div class="autoql-vanilla-chata-btn primary"> 
		</div>`,
    );

    saveButton.appendChild(spinner);
    saveButton.appendChild(document.createTextNode(strings.apply));

    cancelButton.onclick = function () {
        modal.close();
    };

    saveButton.onclick = async function (e) {
        this.classList.add('disabled');
        spinner.classList.remove('hidden');
        var opts = options;
        var inputs = container.querySelectorAll('[data-line]');
        var table = document.querySelector(`[data-componentid='${id}']`);

        if (queryOutput) {
            table = { tabulator: queryOutput.table };
        }

        var tableColumns = table.tabulator.getColumns();

        const data = tableColumns.map((col, i) => {
            json['data']['columns'][i]['is_visible'] = !!inputs[i].checked;
            return {
                name: inputs[i].dataset.colName,
                is_visible: !!inputs[i].checked,
            };
        });

        const newColumnDefinitions = table.tabulator.getColumnDefinitions()?.map((col, i) => ({
            ...col,
            visible: !!inputs[i].checked,
        }));

        table.tabulator.setColumns(newColumnDefinitions);

        await setColumnVisibility({ ...opts.authentication, columns: data });

        modal.close();

        allColHiddenMessage(table);
        onHideCols(newColumnDefinitions);

        table.tabulator.restoreRedraw();
    };

    modal.addView(container);
    modal.addFooterElement(cancelButton);
    modal.addFooterElement(saveButton);
    modal.show();
};

ChataUtils.getUniqueValues = function (data, getter, ignoreNull = false) {
    let unique = {};
    data.forEach(function (i) {
        if (ignoreNull) {
            if (getter(i) != null) {
                if (!unique[getter(i)]) {
                    unique[getter(i)] = true;
                }
            }
        } else {
            if (!unique[getter(i)]) {
                unique[getter(i)] = true;
            }
        }
    });
    return Object.keys(unique);
};

ChataUtils.formatCompareData = function (col, data, groups) {
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({ group: group });
        for (var x = 0; x < data.length; x++) {
            if (data[x][0] == group) {
                dataGrouped[i]['value1'] = parseFloat(data[x][1]);
                dataGrouped[i]['value2'] = parseFloat(data[x][2]);
            }
        }
    }
    return dataGrouped;
};

ChataUtils.format3dData = function (json, groups, metadata) {
    var dataGrouped = [];
    var data = json['data']['rows'];
    var notGroupableField = getNotGroupableField(json);

    var groupableIndex1 = metadata.groupBy.groupable1;
    var groupableIndex2 = metadata.groupBy.groupable2;
    var notGroupableIndex = notGroupableField.indexCol;

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({ group: group });
        for (var x = 0; x < data.length; x++) {
            if (data[x][groupableIndex2] == group) {
                if (typeof data[x][groupableIndex1] === 'string' || typeof data[x][groupableIndex1] === 'number') {
                    dataGrouped[i][data[x][groupableIndex1]] = parseFloat(data[x][notGroupableIndex]);
                }
            }
        }
    }

    return dataGrouped;
};

ChataUtils.groupBy = function (list, keyGetter, indexData) {
    var obj = {};
    list.forEach((item) => {
        const key = keyGetter(item);
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = item[indexData];
        } else {
            obj[key] += item[indexData];
        }
    });

    return obj;
};

ChataUtils.createCsvData = function (json, separator = ',') {
    var output = '';
    var lines = json['data']['rows'];
    var cols = json['data']['columns'];
    for (let i = 0; i < cols.length; i++) {
        if (!cols[i]['is_visible']) continue;
        var colStr = cols[i]['display_name'] || cols[i]['name'];
        var colName = formatColumnName(colStr);
        output += colName + separator;
    }
    output += '\n';
    for (let i = 0; i < lines.length; i++) {
        var data = lines[i];
        for (var x = 0; x < data.length; x++) {
            if (!cols[x]['is_visible']) continue;
            output += data[x] + separator;
        }
        output += '\n';
    }
    return output;
};

ChataUtils.safetynetCall = function (url, callback, options, extraHeaders = []) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var jsonResponse = undefined;
            if (xhr.status == 200) {
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
    xhr.setRequestHeader('Authorization', `Bearer ${options.authentication.token}`);
    xhr.send();
};

ChataUtils.ajaxCall = function (val, callback, options, source) {
    const url = options.authentication.demo
        ? `https://backend-staging.chata.ai/api/v1/chata/query`
        : `${options.authentication.domain}/autoql/api/v1/query?key=${options.authentication.apiKey}`;

    const data = {
        text: val,
        source: source,
        debug: options.autoQLConfig.debug,
        test: options.autoQLConfig.test,
    };
    if (options.authentication.demo) {
        data['user_id'] = 'demo';
        data['customer_id'] = 'demo';
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            try {
                var jsonResponse = JSON.parse(xhr.responseText);
                callback(jsonResponse, xhr.status);
            } catch (error) {
                console.error(error);
            }
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (!options.authentication.demo) {
        xhr.setRequestHeader('Authorization', `Bearer ${options.authentication.token}`);
    }
    xhr.send(JSON.stringify(data));
};

ChataUtils.putCall = function (url, data, callback, options) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            try {
                var jsonResponse = JSON.parse(xhr.responseText);
                callback(jsonResponse);
            } catch (error) {
                console.error(error);
            }
        }
    };

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (!options.authentication.demo) {
        xhr.setRequestHeader('Authorization', `Bearer ${options.authentication.token}`);
    }
    xhr.send(JSON.stringify(data));
};

ChataUtils.deleteCall = function (url, callback, options, extraHeaders = []) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            try {
                var jsonResponse = JSON.parse(xhr.responseText);
                callback(jsonResponse);
            } catch (error) {
                console.error(error);
            }
        }
    };

    xhr.open('DELETE', url);
    for (var obj of extraHeaders) {
        var key = Object.entries(obj)[0];
        xhr.setRequestHeader(key[0], key[1]);
    }

    if (!options.authentication.demo) {
        xhr.setRequestHeader('authorization', `Bearer ${options.authentication.token}`);
    }

    xhr.send();
};

ChataUtils.ajaxCallPost = function (url, callback, data, options) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', url);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    if (!options.authentication.demo) {
        xmlhttp.setRequestHeader('Authorization', `Bearer ${options.authentication.token}`);
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            try {
                var jsonResponse = JSON.parse(xmlhttp.responseText);
                callback(jsonResponse, xmlhttp.status);
            } catch (error) {
                console.error(error);
            }
        }
    };
    xmlhttp.send(JSON.stringify(data));
};

ChataUtils.ajaxCallAutoComplete = function (url, callback, options) {
    options.xhr.onreadystatechange = function () {
        if (options.xhr.readyState === 4) {
            var jsonResponse = {
                data: {
                    matches: [],
                },
            };
            try {
                if (options.xhr.responseText) {
                    jsonResponse = JSON.parse(options.xhr.responseText);
                }
                callback(jsonResponse);
            } catch (error) {
                console.error(error);
            }
        }
    };
    options.xhr.open('GET', url);
    options.xhr.setRequestHeader(
        'authorization',
        options.authentication.token ? `Bearer ${options.authentication.token}` : undefined,
    );
    try {
        options.xhr.send();
    } catch (e) {
        return;
    }
};

ChataUtils.autocomplete = function (suggestion, suggestionList, liClass = 'suggestion', options) {
    const URL = options.authentication.demo
        ? `https://backend.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(suggestion)}&projectid=1`
        : `${options.authentication.domain}/autoql/api/v1/query/autocomplete?text=${encodeURIComponent(
              suggestion,
          )}&key=${options.authentication.apiKey}`;

    ChataUtils.ajaxCallAutoComplete(
        URL,
        function (jsonResponse) {
            suggestionList.innerHTML = '';
            var matches = jsonResponse['matches'] || jsonResponse['data']['matches'];
            if (!matches) {
                suggestionList.style.display = 'none';
                return;
            }
            if (matches.length > 0) {
                for (var [key, value] of Object.entries(options.autocompleteStyles)) {
                    suggestionList.style.setProperty(key, value, '');
                }
                for (var i = matches.length - 1; i >= 0; i--) {
                    var li = document.createElement('li');
                    li.classList.add(liClass);
                    li.textContent = matches[i];
                    suggestionList.appendChild(li);
                }
                suggestionList.style.display = 'block';
            } else {
                suggestionList.style.display = 'none';
            }
        },
        options,
    );
};

ChataUtils.createSuggestions = function (
    responseContentContainer,
    data,
    classButton = 'autoql-vanilla-chata-suggestion-btn',
) {
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement('div');
        var button = document.createElement('button');
        button.classList.add(classButton);
        button.textContent = data[i];
        div.appendChild(button);
        responseContentContainer.appendChild(div);
    }
};

ChataUtils.registerWindowClicks = () => {
    const excludeElementsForToolbars = [
        'autoql-vanilla-chata-toolbar-btn',
        'autoql-vanilla-more-options',
        'chata-more-options-menu',
        'report_problem',
    ];

    const excludeElementsForSelectors = [
        'autoql-vanilla-select-popup',
        'autoql-vanilla-select',
        'autoql-vanilla-select-arrow',
        'autoql-vanilla-select-menu-item',
        'autoql-vanilla-select-text',
        'autoql-vanilla-menu-item-value-title',
    ];

    const excludeElementsForSafetynet = ['autoql-vanilla-safetynet-selector', 'autoql-vanilla-chata-safetynet-select'];

    const excludeElementsForSubjectAutocomplete = ['autoql-vanilla-subject', 'autoql-vanilla-explore-queries-input'];

    document.body.addEventListener('click', (evt) => {
        var closeToolbars = true;
        var closeSafetynetSelectors = true;
        var closeAutocomplete = true;
        var closePopups = true;

        for (let i = 0; i < excludeElementsForSafetynet.length; i++) {
            let c = excludeElementsForSafetynet[i];
            if (evt.target.classList.contains(c)) {
                closeSafetynetSelectors = false;
            }
        }

        for (let i = 0; i < excludeElementsForToolbars.length; i++) {
            let c = excludeElementsForToolbars[i];
            if (evt.target.classList.contains(c)) {
                closeToolbars = false;
                break;
            }
        }

        for (let i = 0; i < excludeElementsForSubjectAutocomplete.length; i++) {
            let c = excludeElementsForSubjectAutocomplete[i];
            if (evt.target.classList.contains(c)) {
                closeAutocomplete = false;
                break;
            }
        }

        for (let i = 0; i < excludeElementsForSelectors.length; i++) {
            let c = excludeElementsForSelectors[i];
            if (evt.target.classList.contains(c)) {
                closePopups = false;
                break;
            }
        }

        if (closeToolbars) {
            closeAllToolbars();
        }

        if (closeSafetynetSelectors) {
            closeAllSafetynetSelectors();
        }

        if (closeAutocomplete) {
            closeAutocompleteObjects();
        }
    });
};

(function () {
    var initEvents = () => {
        setTimeout(() => {
            ChataUtils.registerWindowClicks();
        }, 3000);
    };
    document.addEventListener('DOMContentLoaded', function () {
        try {
            window.addEventListener('load', initEvents, false);
        } catch (e) {
            window.onload = initEvents;
        }
    });
})();
