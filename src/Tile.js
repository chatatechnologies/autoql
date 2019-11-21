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
    chataDashboardItem.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2
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
        var val = chataDashboardItem.inputQuery.value;
        var loadingContainer = chataDashboardItem.showLoadingDots();
        ChatDrawer.ajaxCall(val, function(json){
            tileResponseContainer.removeChild(loadingContainer);
            var uuid = uuidv4();
            ChatDrawer.responses[uuid] = json;
            var displayType = chataDashboardItem.options.displayType || 'table';
            chataDashboardItem.refreshItem(displayType, uuid);
        }, dashboard.options);
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
                        chataDashboardItem.refreshItem(this.dataset.displaytype, uuid)
                    }
                }
            }

            itemContent.appendChild(vizToolbar);
        }
    }

    chataDashboardItem.getDisplayTypes = function(json){
        var displayTypes = [];
        if(
            (json['data']['columns'].length == 2 ||
            DISPLAY_TYPES_2D.includes(json['data']['display_type'])
            && typeof groupField !== 'number')
        ){
            displayTypes = DISPLAY_TYPES_2D;
        }
        else if(json['data']['columns'].length == 3){
            displayTypes = DISPLAY_TYPES_3D;
        }else{
            displayTypes = ['table'];
        }
        if(json['data']['rows'].length <= 1){
            displayTypes = ['table'];
        }
        return displayTypes;
    }

    chataDashboardItem.refreshItem = function(displayType, uuid){
        var json = ChatDrawer.responses[uuid];
        // itemContent.innerHTML = '';
        tileResponseContainer.innerHTML = '';
        // tileResponseContainer.setAttribute('data-componentid', uuid);
        this.createVizToolbar(json, uuid, displayType);
        if(json['data']['display_type'] != 'suggestion'){
            switch (displayType) {
                case 'table':
                    var div = createTableContainer();
                    tileResponseContainer.appendChild(div);
                    if(json['data']['columns'].length == 1){
                        var data = formatData(
                            json['data']['rows'][0][0],
                            json['data']['columns'][0]['type'],
                            dashboard.options.languageCode,
                            dashboard.options.currencyCode,
                        );
                        tileResponseContainer.innerHTML =
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
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var hasNegativeValues = values[1];
                    var col1 = formatColumnName(
                        json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(
                        json['data']['columns'][1]['name']);
                    createBarChart(
                        tileResponseContainer, grouped, col1,
                        col2, hasNegativeValues, dashboard.options,
                        false, 'data-tilechart',
                        dashboard.options.renderTooltips
                    );
                    break;
                case 'column':
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var col1 = formatColumnName(
                        json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(
                        json['data']['columns'][1]['name']);
                    var hasNegativeValues = values[1];
                    createColumnChart(
                        tileResponseContainer, grouped, col1,
                        col2, hasNegativeValues, dashboard.options,
                        false, 'data-tilechart',
                        dashboard.options.renderTooltips
                    );
                    break;
                case 'line':
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var hasNegativeValues = values[1];
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    createLineChart(
                        tileResponseContainer, grouped, col1,
                        col2, hasNegativeValues, dashboard.options,
                        false, 'data-chartrenderer',
                        dashboard.options.renderTooltips
                    );
                    break;
                case 'heatmap':
                    var values = formatDataToHeatmap(json);
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                    labelsY = formatLabels(labelsY, json['data']['columns'][0]['type']);
                    labelsX = formatLabels(labelsX, json['data']['columns'][1]['type']);

                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var col3 = formatColumnName(json['data']['columns'][2]['name']);
                    createHeatmap(tileResponseContainer,
                        labelsX, labelsY, values, col1,
                        col2, col3, dashboard.options, false,
                        'data-chartrenderer', dashboard.options.renderTooltips);
                    break;
                case 'bubble':
                    var values = formatDataToHeatmap(json);
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                    labelsY = formatLabels(labelsY, json['data']['columns'][0]['type']);
                    labelsX = formatLabels(labelsX, json['data']['columns'][1]['type']);

                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var col3 = formatColumnName(json['data']['columns'][2]['name']);
                    createBubbleChart(
                        tileResponseContainer, labelsX, labelsY,
                        values, col1, col2, col3, dashboard.options,
                        false, 'data-chartrenderer',
                        dashboard.options.renderTooltips
                    );
                    break;
                case 'stacked_bar':
                    var data = cloneObject(json['data']['rows']);
                    var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                    groups = groups.sort().reverse();
                    for (var i = 0; i < data.length; i++) {
                        data[i][1] = formatData(data[i][1], json['data']['columns'][1]['type']);
                    }
                    for (var i = 0; i < groups.length; i++) {
                        groups[i] = formatData(groups[i], json['data']['columns'][1]['type'])
                    }
                    var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var col3 = formatColumnName(json['data']['columns'][2]['name']);
                    var dataGrouped = ChatDrawer.format3dData(json['data']['columns'], data, groups);
                    createStackedBarChart(
                        tileResponseContainer, dataGrouped, groups,
                        subgroups, col1, col2, col3,
                        dashboard.options, false,
                        'data-chartindex', dashboard.options.renderTooltips
                    );
                    break;
                case 'stacked_column':
                    var data = cloneObject(json['data']['rows']);
                    var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                    groups = groups.sort().reverse();
                    for (var i = 0; i < data.length; i++) {
                        data[i][1] = formatData(data[i][1], json['data']['columns'][1]['type']);
                    }
                    for (var i = 0; i < groups.length; i++) {
                        groups[i] = formatData(groups[i], json['data']['columns'][1]['type'])
                    }
                    var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var col3 = formatColumnName(json['data']['columns'][2]['name']);
                    var dataGrouped = ChatDrawer.format3dData(json['data']['columns'], data, groups);
                    createStackedColumnChart(
                        tileResponseContainer, dataGrouped, groups,
                        subgroups, col1, col2, col3,
                        dashboard.options, false,
                        'data-chartindex', dashboard.options.renderTooltips
                    );
                    break;
                case 'pie':
                    var data = ChatDrawer.groupBy(json['data']['rows'], row => row[0]);
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var colType1 = json['data']['columns'][0]['type'];
                    createPieChart(tileResponseContainer, data,
                        dashboard.options, col1, col2, colType1, false
                    );
                    break;
                case 'pivot_column':
                    var div = createTableContainer();
                    tileResponseContainer.appendChild(div);
                    var pivotArray = [];
                    if(json['display_type'] == 'date_pivot'){
                        pivotArray = getDatePivotArray(json, dashboard.options, json['data']['rows']);
                    }else{
                        pivotArray = getPivotColumnArray(json, dashboard.options, json['data']['rows']);
                    }
                    createPivotTable(pivotArray, div, 'append', uuid, 'table-response-renderer');
                    break;
                default:

            }
        }else{
            tileResponseContainer.innerHTML = "Oops! We didn't understand that query.";
        }

    }
    return chataDashboardItem;
}
