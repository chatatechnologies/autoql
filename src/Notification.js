function Notification(options, parentOptions){
    var item = document.createElement('div')
    item.options = options;
    item.parentOptions = parentOptions;
    item.displayType = '';
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
    var calendarIcon = htmlToElement(CALENDAR);
    var extraContent = document.createElement('div');
    var btnTurnNotification = document.createElement('button');
    var editNotification = document.createElement('button');
    var notificationReadOnlyGroup = document.createElement('div');
    // chata-notification-delete-icon close
    var dismissIconContainer = htmlToElement(`
        <span
            class="chata-icon chata-notification-dismiss-icon notification-off"
            data-tippy-content="Delete">
        </span>
    `);
    var turnNotificationIcon = htmlToElement(`
        <span>
            ${TURN_ON_NOTIFICATION}
        </span>
    `);
    var uuid = uuidv4();
    notificationReadOnlyGroup.classList.add('notification-read-only-group')
    var turnNotificationText = document.createTextNode(
        'Turn off these notifications'
    );
    var editNotificationText = document.createTextNode('Edit Notification');

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
    notificationQueryTitle.innerHTML = options.rule_title;
    responseContentContainer.setAttribute('data-container-id', uuid);
    // btnTurnNotification.innerHTML = TURN_ON_NOTIFICATION;
    btnTurnNotification.appendChild(turnNotificationIcon);
    editNotification.innerHTML = EDIT_NOTIFICATION;

    btnTurnNotification.appendChild(turnNotificationText);
    btnTurnNotification.setAttribute('data-notification-state', 'active');
    editNotification.appendChild(editNotificationText);

    extraContent.appendChild(btnTurnNotification);
    extraContent.appendChild(editNotification);

    displayName.appendChild(document.createTextNode(options.rule_title));

    description.innerHTML = options.rule_message
    notificationDetailsTitle.innerHTML = 'Conditions: ';
    notificationDetailsTitle2.innerHTML = 'Description: ';
    timestamp.appendChild(htmlToElement(`
        <span class="chata-icon calendar">${CALENDAR}<span>
    `));

    responseContentContainer.innerHTML = '<a class="single-value-response ">$1,361,422.33</a>'

    var parsedRules = RuleParser.convert(options.rule_expression);
    notificationRulesContainer.appendChild(notificationReadOnlyGroup);
    for (var i = 0; i < parsedRules.length; i++) {
        var rule = parsedRules[i];
        for (var x = 0; x < rule.length; x++) {
            notificationReadOnlyGroup.appendChild(
                new NotificationGroup(rule[x])
            )
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

    displayNameContainer.onclick = function(evt){
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
        }
    }

    editNotification.onclick = function(evt){
        var cancelButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
        )
        var saveButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn primary "
                style="padding: 5px 16px; margin: 2px 5px;">Save</div>`
        )

        var configModal = new Modal({
            withFooter: true,
            destroyOnClose: true
        })
        var modalView = new NotificationSettingsModal();
        configModal.chataModal.style.width = '95vw';

        configModal.addView(modalView);
        configModal.setTitle('Custom Notification');
        configModal.addFooterElement(cancelButton);
        configModal.addFooterElement(saveButton);
        configModal.show();
        refreshTooltips();
        cancelButton.onclick = (e) => {
            configModal.close();
        }
        saveButton.onclick = (e) => {
            configModal.close();
        }
    }

    dismissIcon.onclick = (evt) => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/rules/notifications/${item.options.id}?key=${pOpts.apiKey}`;
        var payload = {
            state: 'DISMISSED'
        }
        item.options.state = 'DISMISSED';
        ChataUtils.putCall(URL, payload, (jsonResponse) => {
            console.log(jsonResponse);
            item.toggleDismissIcon();
        }, item.parentOptions)
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
                        (e, row, json) => {},
                    );
                    div.tabulator = table;
                }
                break;
            case 'bar':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createBarChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'column':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createColumnChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'line':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createLineChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    () => {}, false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'heatmap':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);

                createHeatmap(
                    chartWrapper,
                    jsonResponse,
                    item.parentOptions, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'bubble':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createBubbleChart(
                    chartWrapper, jsonResponse, item.parentOptions,
                    false, 'data-tilechart',
                    true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_bar':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createStackedBarChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_column':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createStackedColumnChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'stacked_line':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createAreaChart(
                    chartWrapper, jsonResponse,
                    item.parentOptions, () => {}, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'pie':
                var chartWrapper = document.createElement('div');
                chartWrapper.style.paddingTop = '15px';
                responseContentContainer.appendChild(chartWrapper);
                createPieChart(chartWrapper, jsonResponse,
                    item.parentOptions, false,
                    'data-tilechart', true
                );
                toolbarType = 'chart-view';
                break;
            case 'pivot_table':
                var div = createTableContainer();
                div.setAttribute('data-componentid', _uuid)
                responseContentContainer.appendChild(div);
                var scrollbox = document.createElement('div');
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                );
                scrollbox.classList.add('no-full-width');
                scrollbox.appendChild(div);
                responseContentContainer.appendChild(scrollbox);
                var table = new ChataPivotTable(
                    _uuid, item.parentOptions, () => {}
                )
                div.tabulator = table;
                break;
            default:

        }

        item.createVizToolbar(jsonResponse);
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
                    button.onclick = function(event){
                        item.displayType = this.dataset.displaytype;
                        item.refreshContent(json);
                    }
                }
            }
            dataContainer.appendChild(vizToolbar);
        }
    }

    btnTurnNotification.onclick = (evt) => {
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
            date = `${moment(timestamp).format('MMMM Do')} at ${time}`
        }else{
            date = `${moment(timestamp).format('MMMM Do, YYYY')} at ${time}`
        }
        timestamp.appendChild(
            document.createTextNode(date)
        );
    }

    item.formatTimestamp();

    item.toggleTurnOffNotificationText = () => {
        if(item.ruleOptions.status == 'INACTIVE'){
            turnNotificationIcon.innerHTML = TURN_ON_NOTIFICATION;
            turnNotificationText.textContent = 'Turn these notifications back on';
        }else{
            turnNotificationIcon.innerHTML = DISMISS;
            turnNotificationText.textContent = 'Turn off these notifications';
        }
    }

    item.toggleStatus = () => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/rules/${item.options.rule_id}?key=${pOpts.apiKey}`;

        var state = btnTurnNotification.dataset.notificationState;
        var payload = {
            status: 'ACTIVE'
        }
        if(['ACTIVE', 'WAITING'].includes(item.ruleOptions.status)){
            payload.status = 'INACTIVE';
        }

        ChataUtils.putCall(URL, payload, (jsonResponse) => {
            item.ruleOptions = jsonResponse.data;
            item.toggleTurnOffNotificationText();
        }, item.parentOptions)
    }

    item.toggleDismissIcon = () => {
        if(item.options.state === 'DISMISSED'){
            dismissIconContainer.classList.add('chata-notification-delete-icon');
            dismissIconContainer.classList.remove('notification-off');
            dismissIconContainer.classList.remove('chata-notification-dismiss-icon');
            dismissIconContainer.innerHTML = SVG_X;
            item.classList.remove('triggered');
        }
    };

    item.getRuleStatus = () => {
        var pOpts = item.parentOptions.authentication;
        const URL = `${pOpts.domain}/autoql/api/v1/rules/${item.options.rule_id}?key=${pOpts.apiKey}`;

        return new Promise((resolve, reject) => {
            ChataUtils.safetynetCall(URL, (jsonResponse, status) => {
                item.ruleOptions = jsonResponse.data;
                item.toggleTurnOffNotificationText();
                item.toggleDismissIcon();
                resolve();
            }, item.parentOptions)
        });
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

        await item.getRuleStatus();
        ChataUtils.safetynetCall(URL, (jsonResponse, status) => {
            ChataUtils.responses[uuid] = jsonResponse;
            item.displayType = jsonResponse.query_result['data']['display_type'];
            responseContentContainer.removeChild(dots);
            item.refreshContent(jsonResponse);
        }, item.parentOptions, [{'Integrator-Domain': pOpts.domain}])
    }

    item.toggleDismissIcon();
    return item;
}
