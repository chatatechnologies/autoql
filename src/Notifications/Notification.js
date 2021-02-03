import { NotificationGroup } from './NotificationGroup'
import { ChataUtils } from '../ChataUtils'
import {
    ChataTable,
    ChataPivotTable
} from '../ChataTable'
import { Modal } from '../Modal'
import { NotificationSettingsModal } from './NotificationSettingsModal'
import { ChataConfirmDialog } from '../ChataComponents'
import {
    htmlToElement,
    uuidv4,
    putLoadingContainer,
    createTableContainer,
    getSupportedDisplayTypes,
    apiCallGet,
    apiCallPut,
    apiCallDelete
} from '../Utils'
import {
    DISMISS,
    CALENDAR,
    TURN_ON_NOTIFICATION,
    EDIT_NOTIFICATION,
    SVG_X,
    TABLE_ICON,
    COLUMN_CHART_ICON,
    BAR_CHART_ICON,
    PIE_CHART_ICON,
    LINE_CHART_ICON,
    PIVOT_ICON,
    HEATMAP_ICON,
    BUBBLE_CHART_ICON,
    STACKED_COLUMN_CHART_ICON,
    STACKED_BAR_CHART_ICON,
    STACKED_AREA_CHART_ICON
} from '../Svg'
import {
    createAreaChart,
    createBarChart,
    createBubbleChart,
    createColumnChart,
    createHeatmap,
    createLineChart,
    createPieChart,
    createStackedBarChart,
    createStackedColumnChart
} from '../Charts'
import { convert } from '../RuleParser'
import moment from 'moment'
import { refreshTooltips } from '../Tooltips'


export function Notification(options, parentOptions){
    var item = document.createElement('div')
    item.options = options;
    item.parentOptions = parentOptions;
    item.displayType = '';
    item.jsonData = {}
    item.isExecuted = false
    var header = document.createElement('div');
    var displayNameContainer = document.createElement('div');
    var displayName = document.createElement('div');
    var description = document.createElement('div');
    var timestamp = document.createElement('div');
    var dataTitle = document.createElement('div');
    var expandedContent = document.createElement('div');
    var dataContainer = document.createElement('div');
    var chartContainer = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var notificationDetails = document.createElement('div');
    var notificationDetailsTitle = document.createElement('div');
    var notificationDetailsTitle2 = document.createElement('div');
    var notificationRulesContainer = document.createElement('div');
    var notificationQueryTitle = document.createElement('div');
    var alertStrip = document.createElement('div');
    var detailsContainer = document.createElement('div');
    var dismissIcon = htmlToElement(DISMISS);
    var dismissBtn = document.createElement('div');
    var extraContent = document.createElement('div');
    var btnTurnNotification = document.createElement('button');
    var editNotification = document.createElement('button');
    // chata-notification-delete-icon close
    var dismissIconContainer = htmlToElement(`
        <span
            class="chata-icon chata-notification-dismiss-icon notification-off"
            data-tippy-content="Dismiss">
        </span>
    `);
    var turnNotificationIcon = htmlToElement(`
        <span>
            ${TURN_ON_NOTIFICATION}
        </span>
    `);
    var uuid = uuidv4();

    var turnNotificationText = document.createTextNode(
        'Turn off these notifications'
    );
    var editNotificationText = document.createTextNode('Edit Data Alert');

    item.classList.add('chata-notification-list-item');
    item.classList.add('triggered');

    displayNameContainer.classList.add(
        'chata-notification-display-name-container'
    );
    header.classList.add('chata-notification-list-item-header');
    displayName.classList.add('chata-notification-display-name');
    dismissIcon.classList.add('chata-notification-dismiss-icon');
    dismissBtn.classList.add('chata-notification-dismiss-btn');
    dataTitle.classList.add('chata-notification-data-title');
    expandedContent.classList.add('chata-notification-expanded-content');
    alertStrip.classList.add('chata-notification-alert-strip');
    description.classList.add('chata-notification-description');
    timestamp.classList.add('chata-notification-timestamp');
    detailsContainer.classList.add('chata-notification-details-container');
    dataContainer.classList.add('chata-notification-data-container');
    chartContainer.classList.add('chata-notification-chart-container');
    notificationQueryTitle.classList.add('chata-notification-query-title');
    responseContentContainer.classList.add('chata-response-content-container');
    responseContentContainer.classList.add('table');
    notificationDetails.classList.add('chata-notification-details');
    notificationDetailsTitle.classList.add('chata-notification-details-title');
    notificationDetailsTitle2.classList.add('chata-notification-details-title');
    notificationRulesContainer.classList.add('notification-rules-container');
    notificationRulesContainer.classList.add('read-only');
    extraContent.classList.add('chata-notification-extra-content');
    btnTurnNotification.classList.add('autoql-vanilla-chata-btn');
    btnTurnNotification.classList.add('default');
    btnTurnNotification.classList.add('large');
    editNotification.classList.add('autoql-vanilla-chata-btn');
    editNotification.classList.add('default');
    editNotification.classList.add('large');
    notificationQueryTitle.innerHTML = options.title;
    responseContentContainer.setAttribute('data-container-id', uuid);
    // btnTurnNotification.innerHTML = TURN_ON_NOTIFICATION;
    btnTurnNotification.appendChild(turnNotificationIcon);
    editNotification.innerHTML = EDIT_NOTIFICATION;

    btnTurnNotification.appendChild(turnNotificationText);
    btnTurnNotification.setAttribute('data-notification-state', 'active');
    editNotification.appendChild(editNotificationText);

    extraContent.appendChild(btnTurnNotification);
    extraContent.appendChild(editNotification);

    displayName.appendChild(document.createTextNode(options.title));

    description.innerHTML = options.message
    notificationDetailsTitle.innerHTML = 'Conditions: ';
    notificationDetailsTitle2.innerHTML = 'Description: ';
    timestamp.appendChild(htmlToElement(`
        <span class="chata-icon calendar">${CALENDAR}<span>
    `));

    var parsedRules = convert(options.expression);
    for (var i = 0; i < parsedRules.length; i++) {
        var notificationReadOnlyGroup = document.createElement('div');
        notificationReadOnlyGroup.classList.add('notification-read-only-group')
        notificationRulesContainer.appendChild(notificationReadOnlyGroup);
        var rule = parsedRules[i];
        for (var x = 0; x < rule.length; x++) {
            if(rule[x].length === 1){
                notificationRulesContainer.appendChild(
                    htmlToElement(`
                        <div style="text-align: center; margin: 2px;">
                            <span
                                class="read-only-rule-term"
                                style="width: 100%;">
                                ${rule[x][0]}
                            </span>
                        </div>
                    `)
                )
                break;
            }else{
                notificationReadOnlyGroup.appendChild(
                    new NotificationGroup(rule[x])
                )
            }
        }
    }

    chartContainer.appendChild(notificationQueryTitle);
    chartContainer.appendChild(responseContentContainer);
    dataContainer.appendChild(chartContainer);

    notificationDetails.appendChild(notificationDetailsTitle);
    notificationDetails.appendChild(notificationRulesContainer);
    notificationDetails.appendChild(notificationDetailsTitle2);

    detailsContainer.appendChild(dataContainer);
    detailsContainer.appendChild(notificationDetails);

    displayNameContainer.appendChild(displayName);
    displayNameContainer.appendChild(description);
    displayNameContainer.appendChild(timestamp);
    dismissIconContainer.appendChild(dismissIcon);
    dismissBtn.appendChild(dismissIconContainer);
    header.appendChild(displayNameContainer);
    header.appendChild(dismissBtn);


    item.appendChild(header);
    item.appendChild(expandedContent);
    item.appendChild(alertStrip);

    expandedContent.appendChild(detailsContainer);
    expandedContent.appendChild(extraContent);

    displayNameContainer.onclick = function(){
        if(!parentOptions.showNotificationDetails){
            return
        }
        var expanded = document.getElementsByClassName(
            'chata-notification-expanded-content'
        );
        for (var i = 0; i < expanded.length; i++) {
            if(expanded[i] === expandedContent)continue;
            expanded[i].classList.remove('visible');
        }
        expandedContent.classList.toggle('visible');
        if(expandedContent.classList.contains('visible')){
            item.execute();
        }else{
            parentOptions.onCollapseCallback(item.jsonData);
        }
        refreshTooltips()
    }

    editNotification.onclick = function(){
        var cancelButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
        )
        var saveButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn primary "
                style="padding: 5px 16px; margin: 2px 5px;"></div>`
        )
        var spinner = htmlToElement(`
            <div class="autoql-vanilla-spinner-loader hidden"></div>
        `)

        var modalView = new NotificationSettingsModal(
            item.parentOptions,
            'edit', item.ruleOptions
        );

        saveButton.appendChild(spinner);
        saveButton.appendChild(document.createTextNode('Save'));


        var configModal = new Modal({
            withFooter: true,
            destroyOnClose: true
        }, () => {
            modalView.step1.expand();
        })
        configModal.chataModal.style.width = '95vw';

        modalView.checkSteps = () => {
            if(modalView.isValid()){
                saveButton.classList.remove('disabled')
            }else{
                saveButton.classList.add('disabled')
            }
        }

        configModal.addView(modalView);
        configModal.setTitle('Edit Data Alert');
        configModal.addFooterElement(cancelButton);
        configModal.addFooterElement(saveButton);
        configModal.show();
        refreshTooltips();
        cancelButton.onclick = () => {
            new ChataConfirmDialog(
                'Are you sure you want to leave this page?',
                'All unsaved changes will be lost.',
                () => {
                    configModal.close()
                }
            )
        }
        saveButton.onclick = async() => {
            spinner.classList.remove('hidden')
            var o = item.parentOptions
            const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts/${item.ruleOptions.id}?key=${o.authentication.apiKey}`;
            var values = modalView.getValues();
            values.id = item.options.id
            saveButton.setAttribute('disabled', 'true')
            var response = await apiCallPut(URL, values, o)
            var jsonResponse = response.data
            if(jsonResponse.message == 'ok'){
                for(var[key, value] of Object.entries(jsonResponse.data)){
                    item.ruleOptions[key] = value
                }
                parentOptions.onSuccessCallback(jsonResponse.message);
            }
            configModal.close();
        }
    }

    dismissIcon.onclick = async () => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/data-alerts/notifications/${item.options.id}?key=${pOpts.apiKey}`;
        var payload = {
            state: 'DISMISSED'
        }
        item.options.state = 'DISMISSED';
        await apiCallPut(URL, payload, item.parentOptions)
        item.toggleDismissIcon();

    }

    item.refreshContent = (jsonResponse) => {
        responseContentContainer.innerHTML = '';
        var cols = jsonResponse.query_result['data']['columns'];
        var rows = jsonResponse.query_result['data']['rows'];
        var displayType = jsonResponse.query_result['data']['display_type'];
        jsonResponse['data'] = {};
        jsonResponse.data['columns'] = cols;
        jsonResponse.data['rows'] = rows;
        jsonResponse.data['display_type'] = displayType;

        var vizToolbar = dataContainer.querySelector(
            '.autoql-vanilla-chata-notification-viz-switcher'
        )

        if(vizToolbar)dataContainer.removeChild(vizToolbar);
        let chartWrapper

        switch (item.displayType) {
            case 'data':
                if(cols.length == 1 && rows[0].length === 1){
                    var value = rows[0][0];
                    responseContentContainer.innerHTML = `
                        <a class="single-value-response ">${value}</a>
                    `;
                }else{
                    var div = createTableContainer();
                    div.setAttribute('data-componentid', uuid)
                    var scrollbox = document.createElement('div');
                    scrollbox.classList.add(
                        'autoql-vanilla-chata-table-scrollbox'
                    );
                    // scrollbox.classList.add('no-full-width');
                    scrollbox.appendChild(div);
                    responseContentContainer.appendChild(scrollbox);
                    var table = new ChataTable(
                        uuid,
                        item.parentOptions,
                        () => {},
                    );
                    div.tabulator = table;
                }
                break;
            case 'bar':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createBarChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                break;
            case 'column':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createColumnChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                break;
            case 'line':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createLineChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                break;
            case 'heatmap':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);

                createHeatmap(
                    chartWrapper,
                    jsonResponse,
                    item.parentOptions, false,
                    'data-tilechart', true
                );
                break;
            case 'bubble':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createBubbleChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    false, 'data-tilechart',
                    true
                );
                break;
            case 'stacked_bar':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createStackedBarChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                break;
            case 'stacked_column':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createStackedColumnChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                break;
            case 'stacked_line':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createAreaChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                break;
            case 'pie':
                chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createPieChart(chartWrapper, jsonResponse,
                    item.parentOptions, false,
                    'data-tilechart', true
                );
                break;
            case 'pivot_table':
                var tableContainer = createTableContainer();
                tableContainer.setAttribute('data-componentid', uuid)
                responseContentContainer.appendChild(tableContainer);
                var _scrollbox = document.createElement('div');
                _scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                );
                _scrollbox.classList.add('no-full-width');
                _scrollbox.appendChild(tableContainer);
                responseContentContainer.appendChild(_scrollbox);
                var _table = new ChataPivotTable(
                    uuid, item.parentOptions, () => {}
                )
                tableContainer.tabulator = _table;
                break;
            default:

        }

        item.createVizToolbar(jsonResponse);
        refreshTooltips()
    }

    item.createVizToolbar = (json) => {
        var displayTypes = getSupportedDisplayTypes(json);
        if(displayTypes.length > 1){
            var vizToolbar = document.createElement('div');
            vizToolbar.classList.add(
                'autoql-vanilla-chata-notification-viz-switcher'
            );
            for (var i = 0; i < displayTypes.length; i++) {
                if(displayTypes[i] == item.displayType ||
                    (displayTypes[i] === 'table' && item.displayType === 'data'))continue;
                var button = document.createElement('button');
                button.classList.add('autoql-vanilla-chata-toolbar-btn');
                button.setAttribute('data-displaytype', displayTypes[i]);
                if(displayTypes[i] == 'table'){
                    button.setAttribute('data-displaytype', 'data');
                    button.innerHTML = TABLE_ICON;
                    button.setAttribute('data-tippy-content', 'Table');
                }
                if(displayTypes[i] == 'column'){
                    button.innerHTML = COLUMN_CHART_ICON;
                    button.setAttribute('data-tippy-content', 'Column Chart');
                }
                if(displayTypes[i] == 'bar'){
                    button.innerHTML = BAR_CHART_ICON;
                    button.setAttribute('data-tippy-content', 'Bar Chart');
                }
                if(displayTypes[i] == 'pie'){
                    button.innerHTML = PIE_CHART_ICON;
                    button.setAttribute('data-tippy-content', 'Pie Chart');
                }
                if(displayTypes[i] == 'line'){
                    button.innerHTML = LINE_CHART_ICON;
                    button.setAttribute('data-tippy-content', 'Line Chart');
                }
                if(displayTypes[i] == 'pivot_table'){
                    button.innerHTML = PIVOT_ICON;
                    button.setAttribute('data-tippy-content', 'Pivot Table');
                }
                if(displayTypes[i] == 'heatmap'){
                    button.innerHTML = HEATMAP_ICON;
                    button.setAttribute('data-tippy-content', 'Heatmap');
                }
                if(displayTypes[i] == 'bubble'){
                    button.innerHTML = BUBBLE_CHART_ICON;
                    button.setAttribute('data-tippy-content', 'Bubble Chart');
                }
                if(displayTypes[i] == 'stacked_column'){
                    button.innerHTML = STACKED_COLUMN_CHART_ICON;
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Column Chart'
                    );
                }
                if(displayTypes[i] == 'stacked_bar'){
                    button.innerHTML = STACKED_BAR_CHART_ICON;
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Area Chart'
                    );
                }
                if(displayTypes[i] == 'stacked_line'){
                    button.innerHTML = STACKED_AREA_CHART_ICON;
                    button.setAttribute(
                        'data-tippy-content',
                        'Stacked Bar Chart'
                    );
                }
                if(button.innerHTML != ''){
                    vizToolbar.appendChild(button);
                    button.onclick = function(){
                        item.displayType = this.dataset.displaytype;
                        item.refreshContent(json);
                    }
                }
            }
            dataContainer.appendChild(vizToolbar);
        }
    }

    btnTurnNotification.onclick = () => {
        item.toggleStatus();
    }

    item.formatTimestamp = () => {
        var createdAt = parseInt(item.options.created_at)*1000;
        let date = '';
        const time = moment(createdAt).format('h:mma')
        const day = moment(createdAt).format('MM-DD-YY')
        const today = moment().format('MM-DD-YY')
        const yesterday = moment()
        .subtract(1, 'd')
        .format('MM-DD-YY')

        if (day === today) {
            date = `Today at ${time}`
        } else if (day === yesterday) {
            date = `Yesterday at ${time}`
        } else if (moment().isSame(createdAt, 'year')) {
            date = `${moment(createdAt).format('MMMM Do')} at ${time}`
        }else{
            date = `${moment(createdAt).format('MMMM Do, YYYY')} at ${time}`
        }
        timestamp.appendChild(
            document.createTextNode(date)
        );
    }

    item.formatTimestamp();

    item.toggleTurnOffNotificationText = () => {
        if(item.ruleOptions.status == 'INACTIVE'){
            turnNotificationIcon.innerHTML = TURN_ON_NOTIFICATION;
            turnNotificationText.textContent = 'Turn Data Alert On';
        }else{
            turnNotificationIcon.innerHTML = DISMISS;
            turnNotificationText.textContent = 'Turn Data Alert Off';
        }
    }

    item.toggleStatus = async () => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/data-alerts/${item.options.data_alert_id}?key=${pOpts.apiKey}`;

        var payload = {
            status: 'ACTIVE'
        }
        if(['ACTIVE', 'WAITING'].includes(item.ruleOptions.status)){
            payload.status = 'INACTIVE';
        }
        var response = await apiCallPut(URL, payload, item.parentOptions)
        var jsonResponse = response.data
        item.ruleOptions = jsonResponse.data;
        if(jsonResponse.message == 'ok'){
            parentOptions.onSuccessCallback(jsonResponse.message);
        }
        item.toggleTurnOffNotificationText();
    }

    item.toggleDismissIcon = () => {
        if(item.options.state === 'DISMISSED'){
            var pOpts = item.parentOptions.authentication;
            dismissIconContainer.classList.add('chata-notification-delete-icon');
            dismissIconContainer.classList.remove('notification-off');
            dismissIconContainer.classList.remove('chata-notification-dismiss-icon');
            dismissIconContainer.innerHTML = SVG_X;
            dismissIconContainer.onclick = async() => {
                const URL = `${pOpts.domain}/autoql/api/v1/data-alerts/notifications/${item.options.id}?key=${pOpts.apiKey}`;
                await apiCallDelete(URL, item.parentOptions)
                item.parentElement.removeChild(item);
            }
            item.classList.remove('triggered');
        }
    };

    item.getRuleStatus = async () => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/data-alerts/${item.options.data_alert_id}?key=${pOpts.apiKey}`;
        var response = await apiCallGet(URL, item.parentOptions)
        var jsonResponse = response.data
        item.ruleOptions = jsonResponse.data;
        item.toggleTurnOffNotificationText();
        item.toggleDismissIcon();
    }

    item.execute = async () => {
        responseContentContainer.innerHTML = '';
        var pOpts = item.parentOptions.authentication;
        var opts = item.options;
        const DOMAIN = 'https://backend-staging.chata.io'
        const URL = `${DOMAIN}/api/v1/rule-notifications/${opts.id}?key=${pOpts.apiKey}`;
        var dots = putLoadingContainer(responseContentContainer);
        dots.style.top = 'unset';
        dots.style.right = 'unset';

        item.getRuleStatus();
        var response = await apiCallGet(
            URL,
            item.parentOptions,
            {'Integrator-Domain': pOpts.domain}
        )
        var jsonResponse = response.data
        var status = response.status
        ChataUtils.responses[uuid] = jsonResponse;
        responseContentContainer.removeChild(dots);

        if(!jsonResponse.query_result || !jsonResponse.query_result.data){
            responseContentContainer.innerHTML = `
                <span>
                    Internal Service Error: Our system is
                    experiencing an unexpected error.
                    We're aware of this issue and are working
                    to fix it as soon as possible.
                </span>
            `;
            return;
        }

        if(status === 200){
            item.displayType =
            jsonResponse.query_result['data']['display_type'];
            item.refreshContent(jsonResponse);
            parentOptions.onExpandCallback(
                jsonResponse.query_result['data']
            )
            parentOptions.activeNotificationData =
            jsonResponse.query_result['data'];
            item.jsonData = jsonResponse.query_result['data'];
        }else{
            responseContentContainer.innerHTML = `
            <span>Oops! It looks like our system is experiencing an issue.
            Try querying again. If the problem persists, please
            <a target="_blank" href="mailto:support@chata.ai">
            contact our team directly
            </a>.
            We'll look into this issue right away and
            be in touch with you shortly.</span>
            `;
            if(jsonResponse){
                parentOptions.onErrorCallback(
                    jsonResponse.message
                )
            }
        }
    }

    if(!parentOptions.showDescription){
        notificationDetails.style.display = 'none';
    }

    item.toggleDismissIcon();
    return item;
}
