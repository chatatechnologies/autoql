function Tile(dashboard, options={}){
    var chataDashboardItem = document.createElement('div');
    var itemContent = document.createElement('div');
    var tileInputContainer = document.createElement('div');
    var tileTitleContainer = document.createElement('div');
    var tileTitle = document.createElement('span');
    var tileResponseWrapper = document.createElement('div');
    var tileResponseContainer = document.createElement('div');
    var resizeHandler = document.createElement('span');
    var deleteButton = document.createElement('span');
    var inputQuery = document.createElement('input');
    var inputTitle = document.createElement('input');
    var tilePlayBuytton = document.createElement('div');
    var placeHolderDrag = document.createElement('div');
    var drilldownOriginal = document.createElement('div');
    var chartDrilldownContainer = document.createElement('div');
    var drilldownTable = document.createElement('div');
    const uuid = uuidv4();
    var modal = new Modal();
    modal.chataBody.classList.add('chata-modal-full-height')
    chataDashboardItem.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2,
        isSafetynet: false
    }

    for (var [key, value] of Object.entries(options)) {
        chataDashboardItem.options[key] = value;
    }
    const placeHolderText = `
        <div class="dashboard-tile-placeholder-text">
            <em>${dashboard.options.notExecutedText}</em>
        </div>
    `;

    const divider = `
        <div class="dashboard-tile-title-divider">
        </div>
    `;

    placeHolderDrag.innerHTML = `
        <div class="placeholder-top"></div>
        <div class="placeholder-content"></div>
    `
    var pixels = chataDashboardItem.options.h * 70;
    chataDashboardItem.style.height = pixels + 'px';
    tileResponseWrapper.style.height = 'calc(100% - 45px)';
    tileResponseContainer.style.height = 'calc(100%)';

    drilldownOriginal.classList.add('chata-dashboard-drilldown-original');
    drilldownTable.classList.add('chata-dashboard-drilldown-table');
    chataDashboardItem.classList.add('chata-dashboard-item');
    chataDashboardItem.classList.add(`chata-col-${chataDashboardItem.options.w}`);
    itemContent.classList.add('item-content');
    tileInputContainer.classList.add('dashboard-tile-input-container');
    tileTitleContainer.classList.add('dashboard-tile-title-container');
    tileTitle.classList.add('dashboard-tile-title-container');

    tileResponseWrapper.classList.add('dashboard-tile-response-wrapper');
    tileResponseContainer.classList.add('dashboard-tile-response-container');
    tileTitle.classList.add('dashboard-tile-title');
    resizeHandler.classList.add('resize-handler');
    inputQuery.classList.add('dashboard-tile-input');
    inputTitle.classList.add('dashboard-tile-input');
    tilePlayBuytton.classList.add('dashboard-tile-play-button');
    deleteButton.classList.add('dashboard-tile-delete-button');
    placeHolderDrag.classList.add('item-content');
    inputQuery.classList.add('query');
    inputTitle.classList.add('title');

    inputQuery.setAttribute('placeholder', 'Query');
    inputTitle.setAttribute('placeholder', 'Title (optional)');

    tilePlayBuytton.innerHTML = TILE_RUN_QUERY;
    deleteButton.innerHTML = DASHBOARD_DELETE_ICON;

    tileResponseContainer.innerHTML = placeHolderText;

    drilldownOriginal.appendChild(chartDrilldownContainer);
    tileInputContainer.appendChild(inputQuery);
    tileInputContainer.appendChild(inputTitle);
    tileInputContainer.appendChild(tilePlayBuytton);
    tileInputContainer.appendChild(deleteButton);

    tileTitleContainer.appendChild(tileTitle);
    tileTitleContainer.appendChild(htmlToElement(divider));

    tileResponseWrapper.appendChild(tileResponseContainer);

    itemContent.appendChild(tileInputContainer);
    itemContent.appendChild(tileTitleContainer);
    itemContent.appendChild(tileResponseWrapper);
    itemContent.appendChild(resizeHandler);
    chataDashboardItem.appendChild(itemContent);
    chataDashboardItem.appendChild(placeHolderDrag);

    resizeHandler.addEventListener('mousedown', initResize, false);
    var startX, startY, startWidth, startHeight;

    function initResize(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(
            document.defaultView.getComputedStyle(
                chataDashboardItem
            ).width,10);
        startHeight = parseInt(
            document.defaultView.getComputedStyle(
                chataDashboardItem
            ).height, 10);
        window.addEventListener('mousemove', resizeItem, false);
        window.addEventListener('mouseup', stopResize, false);
        dashboard.showPlaceHolders();
    }

    function resizeItem(e) {
        var newWidth = (startWidth + e.clientX - startX);
        var newHeight = (startHeight + e.clientY - startY);
        if(newWidth < 320){
            newWidth = 320;
        }else if(newWidth >= chataDashboardItem.parentElement.clientWidth - 20){
            newWidth = chataDashboardItem.parentElement.clientWidth - 20;
        }
        if(newHeight < 140){
            newHeight = 140;
        }
        chataDashboardItem.style.width = newWidth + 'px';
        chataDashboardItem.style.height = newHeight + 'px';
        dashboard.grid.refreshItems(chataDashboardItem).layout();
    }

    function stopResize(e) {
        dashboard.hidePlaceHolders();
        window.removeEventListener('mousemove', resizeItem, false);
        window.removeEventListener('mouseup', stopResize, false);
    }

    chataDashboardItem.itemContent = itemContent;
    chataDashboardItem.inputQuery = inputQuery;
    chataDashboardItem.inputTitle = inputTitle;
    chataDashboardItem.tileTitle = tileTitle;
    chataDashboardItem.resizeHandler = resizeHandler;
    chataDashboardItem.tileInputContainer = tileInputContainer;
    chataDashboardItem.tileTitleContainer = tileTitleContainer;
    chataDashboardItem.placeHolderDrag = placeHolderDrag;
    chataDashboardItem.tileInputContainer.style.display = 'none';
    chataDashboardItem.placeHolderDrag.style.display = 'none';
    chataDashboardItem.tileTitle.textContent = options.title;
    chataDashboardItem.inputQuery.value = chataDashboardItem.options.query;
    chataDashboardItem.inputTitle.value = chataDashboardItem.options.title;

    const setState = (event, reference) => {
        state = {
            inputValue: event.target.value,
            element: reference,
        }

        return state;
    }

    chataDashboardItem.inputQuery.onfocus = function(event){
        dashboard.oldState = setState(event, this);
    };

    chataDashboardItem.inputQuery.onblur = function(event){
        dashboard.lastState = setState(event, this);
    };

    chataDashboardItem.inputTitle.onfocus = function(event){
        dashboard.oldState = setState(event, this);
    };

    chataDashboardItem.inputTitle.onblur = function(event){
        dashboard.lastState = setState(event, this);
    };

    chataDashboardItem.startEditing = function(){
        chataDashboardItem.tileInputContainer.style.display = 'flex';
        chataDashboardItem.tileTitleContainer.style.display = 'none';
        chataDashboardItem.tileTitleContainer.style.display = 'none';
        chataDashboardItem.classList.add('editing');
    }

    chataDashboardItem.stopEditing = function(){
        chataDashboardItem.tileInputContainer.style.display = 'none';
        chataDashboardItem.tileTitleContainer.style.display = 'block';
        chataDashboardItem.classList.remove('editing');
        var newTitle = chataDashboardItem.inputTitle.value || 'untitled';
        chataDashboardItem.tileTitle.textContent = newTitle;
    }

    chataDashboardItem.showPlaceHolder = function(){
        chataDashboardItem.itemContent.style.display = 'none';
        chataDashboardItem.placeHolderDrag.style.display = 'block';
    }

    chataDashboardItem.HidePlaceHolder = function(){
        chataDashboardItem.itemContent.style.display = 'block';
        chataDashboardItem.placeHolderDrag.style.display = 'none';
    }

    chataDashboardItem.focusItem = function(){
        chataDashboardItem.inputQuery.focus();
    }

    chataDashboardItem.runQuery = function(){
        var val = '';
        if(chataDashboardItem.options.isSafetynet){
            val = chataDashboardItem.getSafetynetValues().join(' ');
            console.log(val);
        }else{
            val = chataDashboardItem.inputQuery.value;
        }
        if(val != ''){
            var loadingContainer = chataDashboardItem.showLoadingDots();
            ChatDrawer.safetynetCall(chataDashboardItem.safetynet(val),
                function(json){
                var suggestions = json['full_suggestion'] ||
                json['data']['replacements'];
                if(suggestions.length > 0){
                    chataDashboardItem.options.isSafetynet = true;
                    tileResponseContainer.removeChild(loadingContainer);
                    var suggestionArray = createSuggestionArray(json);
                    var responseContentContainer = document.createElement('div');
                    responseContentContainer.classList.add(
                        'chata-response-content-container'
                    );
                    createSafetynetBody(
                        responseContentContainer,
                        suggestionArray
                    );
                    tileResponseContainer.appendChild(
                        responseContentContainer
                    );
                }else{
                    chataDashboardItem.options.isSafetynet = false;
                    ChatDrawer.ajaxCall(val, function(json){
                        tileResponseContainer.removeChild(loadingContainer);

                        ChatDrawer.responses[uuid] = json;
                        var displayType = chataDashboardItem.options.displayType
                        || 'table';
                        chataDashboardItem.refreshItem(
                            displayType,
                            uuid,
                            tileResponseContainer
                        );
                    }, dashboard.options);
                }
            }, dashboard.options)

        }
    }

    chataDashboardItem.getSafetynetValues = function(){
        return getSafetynetValues(tileResponseContainer);
    }

    chataDashboardItem.safetynet = function(textValue){
        const URL_SAFETYNET = dashboard.options.demo
          ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
            textValue
          )}&projectId=1`
          : `${dashboard.options.domain}/api/v1/chata/safetynet?text=${encodeURIComponent(
            textValue
          )}&key=${dashboard.options.apiKey}&customer_id=${dashboard.options.customerId}&user_id=${dashboard.options.userId}`;
        return URL_SAFETYNET;
    }

    chataDashboardItem.showLoadingDots = function(){
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('tile-response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        tileResponseContainer.innerHTML = '';
        tileResponseContainer.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    }

    deleteButton.onclick = function(){
        dashboard.grid.remove(chataDashboardItem, {layout:true})
        chataDashboardItem.parentElement.removeChild(chataDashboardItem);
    }

    tilePlayBuytton.onclick = function(event){
        chataDashboardItem.runQuery();
    }

    chataDashboardItem.createVizToolbar = function(json, uuid, ignoreDisplayType){
        var displayTypes = chataDashboardItem.getDisplayTypes(json);
        [].forEach.call(itemContent.querySelectorAll('.tile-toolbar'),
        function(e, index){
            e.parentNode.removeChild(e);
        });
        if(displayTypes.length > 1){
            var vizToolbar = document.createElement('div');
            vizToolbar.classList.add('tile-toolbar');
            for (var i = 0; i < displayTypes.length; i++) {
                if(displayTypes[i] == ignoreDisplayType)continue;
                var button = document.createElement('button');
                button.classList.add('chata-toolbar-btn');
                button.setAttribute('data-displaytype', displayTypes[i]);
                if(displayTypes[i] == 'table'){
                    button.innerHTML = TABLE_ICON;
                }
                if(displayTypes[i] == 'column'){
                    button.innerHTML = COLUMN_CHART_ICON;
                }
                if(displayTypes[i] == 'bar'){
                    button.innerHTML = BAR_CHART_ICON;
                }
                if(displayTypes[i] == 'pie'){
                    button.innerHTML = PIE_CHART_ICON;
                }
                if(displayTypes[i] == 'line'){
                    button.innerHTML = LINE_CHART_ICON;
                }
                if(displayTypes[i] == 'date_pivot' || displayTypes[i] == 'pivot_column'){
                    button.innerHTML = PIVOT_ICON;
                }
                if(displayTypes[i] == 'heatmap'){
                    button.innerHTML = HEATMAP_ICON;
                }
                if(displayTypes[i] == 'bubble'){
                    button.innerHTML = BUBBLE_CHART_ICON;
                }
                if(displayTypes[i] == 'stacked_column'){
                    button.innerHTML = STACKED_COLUMN_CHART_ICON;
                }
                if(displayTypes[i] == 'stacked_bar'){
                    button.innerHTML = STACKED_BAR_CHART_ICON;
                }
                if(button.innerHTML != ''){
                    vizToolbar.appendChild(button);
                    button.onclick = function(event){
                        chataDashboardItem.options.displayType = this.dataset.displaytype;
                        chataDashboardItem.refreshItem(
                            this.dataset.displaytype,
                            uuid,
                            tileResponseContainer
                        )
                    }
                }
            }
            itemContent.appendChild(vizToolbar);
        }
    }

    chataDashboardItem.getDisplayTypes = function(json){
        return getSupportedDisplayTypes(json);
    }

    chataDashboardItem.refreshItem = function(displayType, _uuid, view){
        var json = ChatDrawer.responses[_uuid];
        container = view;
        container.innerHTML = '';
        this.createVizToolbar(json, uuid, displayType);
        switch (displayType) {
            case 'table':
                var div = createTableContainer();
                container.appendChild(div);
                if(json['data']['columns'].length == 1){
                    var data = formatData(
                        json['data']['rows'][0][0],
                        json['data']['columns'][0]['type'],
                        dashboard.options
                    );
                    container.innerHTML =
                    `<div>
                        <a class="single-value-response">${data}<a/>
                    </div>`;
                }else{
                    var table = createTable(
                        json, div, dashboard.options,
                        'append', uuid, 'table-response-renderer'
                    );
                    table.classList.add('renderer-table');
                }
                break;
            case 'bar':
            if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChatDrawer.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(data[i][0], json['data']['columns'][0], ChatDrawer.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][0], ChatDrawer.options)
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChatDrawer.formatCompareData(json['data']['columns'], data, groups);
                createGroupedBarChart(
                    container,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                var values = formatDataToBarChart(json, dashboard.options);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var cols = json['data']['columns'];
                createBarChart(
                    container, grouped, cols,
                    hasNegativeValues, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'column':
            if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChatDrawer.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(data[i][0], json['data']['columns'][0], ChatDrawer.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][0], ChatDrawer.options)
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChatDrawer.formatCompareData(json['data']['columns'], data, groups);
                createGroupedColumnChart(
                    container,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                var values = formatDataToBarChart(json, dashboard.options);
                var grouped = values[0];
                var cols = json['data']['columns'];
                var hasNegativeValues = values[1];
                createColumnChart(
                    container, grouped, cols,
                    hasNegativeValues, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'line':
            if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChatDrawer.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(data[i][0], json['data']['columns'][0], ChatDrawer.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][0], ChatDrawer.options)
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChatDrawer.formatCompareData(json['data']['columns'], data, groups);
                createGroupedLineChart(
                    container,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                var values = formatDataToBarChart(json, dashboard.options);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var cols = json['data']['columns'];
                createLineChart(
                    container, grouped, cols,
                    hasNegativeValues, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'heatmap':
                var values = formatDataToHeatmap(json, dashboard.options);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, json['data']['columns'][0], dashboard.options);
                labelsX = formatLabels(labelsX, json['data']['columns'][1], dashboard.options);

                var cols = json['data']['columns'];

                createHeatmap(container,
                    labelsX, labelsY, values, cols,
                    dashboard.options, false,
                    'data-tilechart', true);
                break;
            case 'bubble':
                var values = formatDataToHeatmap(json, dashboard.options);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, json['data']['columns'][0], dashboard.options);
                labelsX = formatLabels(labelsX, json['data']['columns'][1], dashboard.options);

                var cols = json['data']['columns'];
                createBubbleChart(
                    container, labelsX, labelsY,
                    values, cols, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
                break;
            case 'stacked_bar':
                var data = cloneObject(json['data']['rows']);
                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                groups = groups.sort().reverse();
                for (var i = 0; i < data.length; i++) {
                    data[i][1] = formatData(data[i][1], json['data']['columns'][1], dashboard.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][1], dashboard.options)
                }
                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                var cols = json['data']['columns'];
                var dataGrouped = ChatDrawer.format3dData(json['data']['columns'], data, groups);
                createStackedBarChart(
                    container, dataGrouped, groups,
                    subgroups, cols,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                break;
            case 'stacked_column':
                var data = cloneObject(json['data']['rows']);
                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                groups = groups.sort().reverse();
                for (var i = 0; i < data.length; i++) {
                    data[i][1] = formatData(data[i][1], json['data']['columns'][1], dashboard.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][1], dashboard.options)
                }
                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                var cols = json['data']['columns'];
                var dataGrouped = ChatDrawer.format3dData(json['data']['columns'], data, groups);
                createStackedColumnChart(
                    container, dataGrouped, groups,
                    subgroups, cols,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                break;
            case 'pie':
                var data = ChatDrawer.groupBy(json['data']['rows'], row => row[0]);
                var cols = json['data']['columns'];
                createPieChart(container, data,
                    dashboard.options, cols, false
                );
                break;
            case 'pivot_column':
                var div = createTableContainer();
                container.appendChild(div);
                var pivotArray = [];
                var columns = json['data']['columns'];
                if(columns[0].type === 'DATE' &&
                columns[0].name.includes('month')){
                    pivotArray = getDatePivotArray(json, dashboard.options, json['data']['rows']);
                }else{
                    pivotArray = getPivotColumnArray(json, dashboard.options, json['data']['rows']);
                }
                createPivotTable(pivotArray, div, 'append', uuid, 'table-response-renderer');
                break;
            default:
            container.innerHTML = "Oops! We didn't understand that query.";
        }
    }

    modal.addEvent('click', function(e){
        if(e.target.dataset.tilechart){
            chataDashboardItem.updateSelectedBars(e.target)
            var json = cloneObject(
                ChatDrawer.responses[uuid]
            );
            var drilldownUUID = uuidv4();
            json['data']['rows'][0][0] = e.target.dataset.colvalue1;
            var drilldownData = chataDashboardItem.getDrilldownData(
                json, 0, dashboard.options);
            drilldownTable.innerHTML = '';
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    chataDashboardItem.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable
                    )
                    chataDashboardItem.createVizToolbar(
                        json, uuid, chataDashboardItem.options.displayType
                    )
                }
            )
        }

    });

    chataDashboardItem.updateSelectedBars = function(elem){
        var selectedBars = chataDashboardItem.itemContent.getElementsByClassName('active');
        for (var i = 0; i < selectedBars.length; i++) {
            selectedBars[i].classList.remove('active');
        }
        elem.classList.add('active');
    }

    chataDashboardItem.itemContent.addEventListener('click', function(e){
        if(e.target.dataset.tilechart){
            chataDashboardItem.updateSelectedBars(e.target)
            var query = chataDashboardItem.inputQuery.value;
            modal.clearViews();
            drilldownTable.innerHTML = '';
            modal.addView(drilldownOriginal);
            modal.addView(drilldownTable);
            modal.setTitle(query);
            var json = cloneObject(
                ChatDrawer.responses[uuid]
            );
            var drilldownUUID = uuidv4();
            json['data']['rows'][0][0] = e.target.dataset.colvalue1;
            chataDashboardItem.refreshItem(
                chataDashboardItem.options.displayType,
                uuid,
                chartDrilldownContainer
            )

            var drilldownData = chataDashboardItem.getDrilldownData(
                json, 0, dashboard.options);
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    chataDashboardItem.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable
                    )
                    chataDashboardItem.createVizToolbar(
                        json, uuid, chataDashboardItem.options.displayType
                    )
                }
            )
            modal.show();
        }else if (e.target.parentElement.dataset.indexrowrenderer ||
        e.target.classList.contains('single-value-response')){
            var query = chataDashboardItem.inputQuery.value;
            modal.clearViews();
            drilldownTable.innerHTML = '';
            modal.addView(drilldownTable);
            modal.setTitle(query);
            var drilldownValue = '';
            var indexData = 0;
            var json = cloneObject(
                ChatDrawer.responses[uuid]
            );
            if(e.target.classList.contains('single-value-response')){
                json['data']['rows'][0][0] = e.target.textContent;
                indexData = -1;
            }else{
                var row = e.target.parentElement;
                json['data']['rows'][0][0] = row.childNodes[0].textContent;
            }
            var drilldownUUID = uuidv4();
            var drilldownData = chataDashboardItem.getDrilldownData(
                json, indexData, dashboard.options);
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    chataDashboardItem.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable
                    )
                    chataDashboardItem.createVizToolbar(
                        ChatDrawer.responses[uuid],
                        uuid, chataDashboardItem.options.displayType
                    )
                }
            )
            modal.show();
        }
    });
    chataDashboardItem.getDrilldownData = function(json, indexData, options){
        const URL = options.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${options.domain}/api/v1/chata/query/drilldown?key=${options.api_key}`;

        var obj = {};
        if(indexData != -1){
            var value = json['data']['rows'][parseInt(indexData)][0]
            var colData = json['data']['columns'][0]['name'];
            obj[colData] = value.toString();
        }

        const data = {
            query_id: json['data']['query_id'],
            group_bys: obj,
            customer_id: options.customerId,
            user_id: options.userId,
            debug: options.demo
        }
        return data;
    }

    chataDashboardItem.sendDrilldownMessage = function(data, options, _uuid, callback){
        const URL = options.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${options.domain}/api/v1/chata/query/drilldown?key=${options.api_key}`;
        ChatDrawer.ajaxCallPost(URL, function(response){
            ChatDrawer.responses[_uuid] = response;
            console.log(response);
            callback();
        }, data, options);
    }

    return chataDashboardItem;
}
