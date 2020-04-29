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


    var vizToolbarSplit = htmlToElement(`
        <div class="autoql-vanilla-tile-toolbar autoql-vanilla-split-view-btn">
            <button class="autoql-vanilla-chata-toolbar-btn">
                <span class="autoql-vanilla-chata-icon" style="color: inherit;">
                    ${SPLIT_VIEW}
                </span>
            </button>
        </div>
    `);
    const uuid = uuidv4();
    chataDashboardItem.globalUUID = uuid;

    chataDashboardItem.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2,
        isSafetynet: false,
        isSplitView: false,
    }

    for (var [key, value] of Object.entries(options)) {
        chataDashboardItem.options[key] = value;
    }

    chataDashboardItem.views = [
        new TileView(
            dashboard,
            chataDashboardItem,
            tileResponseContainer
        )
    ];

    if(dashboard.options.splitView){
        chataDashboardItem.views.push(
            new TileView(
                dashboard,
                chataDashboardItem,
                tileResponseContainer,
                true
            )
        )
    }

    const notExecutedText = options.notExecutedText
    || dashboard.options.notExecutedText;
    const placeHolderText = `
        <div class="autoql-vanilla-dashboard-tile-placeholder-text">
            <em>${notExecutedText}</em>
        </div>
    `;

    const divider = `
        <div class="autoql-vanilla-dashboard-tile-title-divider">
        </div>
    `;

    placeHolderDrag.innerHTML = `
        <div class="autoql-vanilla-placeholder-top"></div>
        <div class="autoql-vanilla-placeholder-content"></div>
    `
    var pixels = chataDashboardItem.options.h * 70;
    chataDashboardItem.style.height = pixels + 'px';
    tileResponseWrapper.style.height = 'calc(100% - 45px)';
    tileResponseContainer.style.height = 'calc(100%)';
    chataDashboardItem.view = tileResponseContainer;

    chataDashboardItem.classList.add('autoql-vanilla-chata-dashboard-item');
    chataDashboardItem.classList.add(`autoql-vanilla-chata-col-${chataDashboardItem.options.w}`);
    itemContent.classList.add('autoql-vanilla-item-content');
    tileInputContainer.classList.add('autoql-vanilla-dashboard-tile-input-container');
    tileTitleContainer.classList.add('autoql-vanilla-dashboard-tile-title-container');
    tileTitle.classList.add('autoql-vanilla-dashboard-tile-title-container');

    tileResponseWrapper.classList.add('autoql-vanilla-dashboard-tile-response-wrapper');
    tileResponseContainer.classList.add('autoql-vanilla-dashboard-tile-response-container');
    tileResponseContainer.classList.add('chata-flex');
    tileTitle.classList.add('autoql-vanilla-dashboard-tile-title');
    resizeHandler.classList.add('autoql-vanilla-resize-handler');
    inputQuery.classList.add('autoql-vanilla-dashboard-tile-input');
    inputTitle.classList.add('autoql-vanilla-dashboard-tile-input');
    tilePlayBuytton.classList.add('autoql-vanilla-dashboard-tile-play-button');
    deleteButton.classList.add('autoql-vanilla-dashboard-tile-delete-button');
    placeHolderDrag.classList.add('autoql-vanilla-item-content');
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
        }else if(newWidth >= chataDashboardItem.parentElement.offsetWidth - 22){
            newWidth = chataDashboardItem.parentElement.offsetWidth - 22;
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
        dashboard.lastEvent.type = 'resize';
        dashboard.lastEvent.value = {
            item: chataDashboardItem,
            startWidth: startWidth,
            startHeight: startHeight
        };
        if(chataDashboardItem.options.isSplitView){
            chataDashboardItem.views.map(view => {
                view.refreshView(false);
            })
        }else{
            chataDashboardItem.views[0].refreshView(false);
        }
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
        if(event.target.value != dashboard.lastState.inputValue){
            dashboard.oldState = setState(event, this);
        }
    };

    chataDashboardItem.inputQuery.onblur = function(event){
        if(event.target.value != dashboard.lastState.inputValue){
            dashboard.lastState = setState(event, this);
        }
    };

    chataDashboardItem.inputTitle.onfocus = function(event){
        if(event.target.value != dashboard.lastState.inputValue){
            dashboard.oldState = setState(event, this);
        }
    };

    chataDashboardItem.inputTitle.onblur = function(event){
        if(event.target.value != dashboard.lastState.inputValue){
            dashboard.lastState = setState(event, this);
        }
    };

    chataDashboardItem.inputQuery.onkeypress = function(evt){
        if(evt.keyCode == 13 && this.value){
            chataDashboardItem.runQuery('dashboards.user');
        }
    }
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

    chataDashboardItem.runQuery = async () => {
        tileResponseContainer.innerHTML = '';
        if(!chataDashboardItem.options.isSplitView){
            chataDashboardItem.views[0].runQuery('dashboards.user');
        }else{
            if(!chataDashboardItem.views[0].isSafetynet){
                tileResponseContainer.classList.add('chata-flex');
                loadingContainer = chataDashboardItem.showLoadingDots();
                var elements = []
                for (var i = 0; i < chataDashboardItem.views.length; i++) {
                    await chataDashboardItem.views[i].runQuery('dashboards.user', false, false);
                }
                tileResponseContainer.removeChild(loadingContainer);
                tileResponseContainer.classList.remove('chata-flex');
                chataDashboardItem.views.map(view => {
                    view.refreshView();
                    elements.push(view.tileWrapper);
                });

                Split(elements, {
                    direction: 'vertical',
                    sizes: [50, 50],
                    minSize: [0, 0],
                    gutterSize: 7,
                    cursor: 'row-resize',
                    onDragEnd: () => {
                        chataDashboardItem.views.map(
                            view => view.refreshView(false)
                        );
                    }
                })
            }else{
                chataDashboardItem.views[0].runQuery('dashboards.user');
            }
        }
        if(dashboard.options.splitView){
            itemContent.appendChild(vizToolbarSplit);
            vizToolbarSplit.onclick = function(evt){
                tileResponseContainer.innerHTML = '';
                if(!chataDashboardItem.options.isSplitView){
                    tileResponseContainer.classList.remove('chata-flex');
                    chataDashboardItem.options.isSplitView = true;
                    var splitContainer = document.createElement('div');
                    var ids = [];

                    chataDashboardItem.views.map(view => {
                        if(view.isSecond){
                            var viewUUID = view.uuid;
                            var firstUUID = chataDashboardItem.views[0].uuid;
                            if(!ChataUtils.responses[viewUUID]){
                                ChataUtils.responses[viewUUID] = cloneObject(
                                    ChataUtils.responses[firstUUID]
                                );
                            }
                            view.internalDisplayType = 'table';
                        }
                        ids.push(view.tileWrapper);
                        view.tileWrapper.classList.add('overflow');
                        view.refreshView();
                    });

                    Split(ids, {
                        direction: 'vertical',
                        sizes: [50, 50],
                        minSize: [0, 0],
                        gutterSize: 7,
                        cursor: 'row-resize',
                        onDragEnd: () => {
                            chataDashboardItem.views.map(
                                view => view.refreshView(false)
                            );
                        }
                    })

                    chataDashboardItem.views.map(
                        view => view.refreshView(false)
                    );
                }else{
                    chataDashboardItem.views[0].tileWrapper.classList.remove(
                        'overflow'
                    );
                    chataDashboardItem.views[0].tileWrapper
                        .style.height = '100%';
                    chataDashboardItem.options.isSplitView = false;
                    chataDashboardItem.views[0].refreshView();
                    tileResponseContainer.classList.add('chata-flex');
                }
            }
        }
    }

    chataDashboardItem.getSafetynetValues = function(tileWrapper){
        return getSafetynetValues(tileWrapper);
    }

    chataDashboardItem.safetynet = function(textValue){
        const URL_SAFETYNET = dashboard.options.authentication.demo
          ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
            textValue
          )}&projectId=1`
          : `${dashboard.options.authentication.domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            textValue
          )}&key=${dashboard.options.authentication.apiKey}&customer_id=${dashboard.options.authentication.customerId}&user_id=${dashboard.options.authentication.userId}`;
        return URL_SAFETYNET;
    }

    chataDashboardItem.showLoadingDots = function(){
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-tile-response-loading-container');
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
        chataDashboardItem.runQuery('dashboards.user');
    }

    chataDashboardItem.getDisplayTypes = function(json){
        return getSupportedDisplayTypes(json);
    }

    itemContent.onclick = function(evt){
    };

    chataDashboardItem.updateSelectedBars = function(elem){
        var selectedBars = chataDashboardItem.itemContent.getElementsByClassName('active');
        for (var i = 0; i < selectedBars.length; i++) {
            selectedBars[i].classList.remove('active');
        }
        elem.classList.add('active');
    }

    chataDashboardItem.getDrilldownData = function(json, indexData, options){
        var queryId = json['data']['query_id'];
        var params = {};
        var groupables = getGroupableFields(json);
        if(indexData != -1){
            for (var i = 0; i < groupables.length; i++) {
                var index = groupables[i].indexCol;
                var value = json['data']['rows'][parseInt(indexData)][index];
                var colData = json['data']['columns'][index]['name'];
                params[colData] = value.toString();
            }
        }
        let data;

        if(options.authentication.demo){
            data = {
                query_id: queryId,
                group_bys: params,
                username: 'demo',
                customer_id: options.authentication.customerId || "",
                user_id: options.authentication.userId || "",
                debug: options.autoQLConfig.debug
            }
        }else{
            var cols = [];
            for(var [key, value] of Object.entries(params)){
                cols.push({
                    name: key,
                    value: value
                })
            }
            data = {
                debug: options.autoQLConfig.debug,
                columns: cols
            }
        }
        return data;
    }

    chataDashboardItem.sendDrilldownMessage = function(queryId, data, options, _uuid, callback){
        const URL = options.authentication.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`;
        ChataUtils.ajaxCallPost(URL, function(response){
            ChataUtils.responses[_uuid] = response;
            callback();
        }, data, options);
    }

    return chataDashboardItem;
}


function InputToolbar(text, tileWrapper) {
    var tileToolbar = htmlToElement(`
        <div class="autoql-vanilla-tile-toolbar autoql-vanilla-input-toolbar">
        </div>
    `)

    var input = htmlToElement(`
        <input class="autoql-vanilla-dashboard-tile-input query second"
        placeholder="Query" value="${text}"
        style="width: 0px;">
    `)

    var btn = htmlToElement(`
        <button class="autoql-vanilla-chata-toolbar-btn autoql-vanilla-input-toolbar-btn">
            <span class="autoql-vanilla-chata-icon autoql-vanilla-chata-toolbar-icon">
                ${INPUT_BUBBLES}
            </span>
        </button>
    `)

    var arrowIcon = htmlToElement(`
        <span class="autoql-vanilla-chata-icon"
        style="position: absolute; top: 5px; left: 31px; font-size: 10px;">
            ${LEFT_ARROW}
        </span>
    `)


    btn.onclick = (evt) => {
        if(input.classList.contains('open')){
            input.classList.remove('open');
            input.style.width = 0;
        }else{
            input.classList.add('open');
            input.style.width = (tileWrapper.offsetWidth - 56) + 'px';
        }
    }

    btn.appendChild(arrowIcon);
    tileToolbar.appendChild(btn);
    tileToolbar.appendChild(input);

    this.btn = btn;
    this.tileToolbar = tileToolbar;
    this.arrowIcon = arrowIcon;
    this.input = input;

    return this;
}



function TileView(dashboard, chataDashboardItem,
    tileResponseContainer, isSecond=false){
    var obj = this
    var chartDrilldownContainer = document.createElement('div');
    var tileWrapper = document.createElement('div');
    var drilldownTable = document.createElement('div');
    var drilldownOriginal = document.createElement('div');
    var responseUUID = uuidv4();
    var modal = new Modal();

    modal.chataBody.classList.add('chata-modal-full-height');
    drilldownTable.classList.add('autoql-vanilla-chata-dashboard-drilldown-table');
    drilldownOriginal.classList.add('autoql-vanilla-chata-dashboard-drilldown-original');
    tileWrapper.classList.add('autoql-vanilla-chata-tile-wrapper');
    tileWrapper.setAttribute('id', responseUUID);

    obj.uuid = responseUUID;
    obj.tileWrapper = tileWrapper;
    obj.internalDisplayType = chataDashboardItem.options.displayType;
    obj.isSecond = isSecond;

    drilldownOriginal.appendChild(chartDrilldownContainer);

    obj.getSafetynetBody = (json) => {
        const message = `
        Before I can try to find your answer,
        I need your help understanding a term you used that
        I don't see in your data.
        Click the dropdown to view suggestions so
        I can ensure you get the right data
        `
        var suggestionArray = createSuggestionArray(json);
        var responseContentContainer = document.createElement(
            'div'
        );
        responseContentContainer.innerHTML = `
            <div>${message}</div>
        `;
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-center'
        );
        createSafetynetBody(
            responseContentContainer,
            suggestionArray
        );

        return responseContentContainer;
    }

    obj.runQuery = (source, showLoadingDots=true, refreshItem=true) => {
        return new Promise(resolve => {
            var val = '';
            if(obj.isSafetynet && !obj.isSecond){
                val = chataDashboardItem.getSafetynetValues(
                    tileWrapper
                ).join(' ');
            }else{
                if(obj.isSecond){
                    val = obj.inputToolbar.input.value;
                    obj.internalQuery = val;
                }else{
                    val = chataDashboardItem.inputQuery.value;
                }
            }
            if(val != ''){
                let loadingContainer;
                if(showLoadingDots){
                    loadingContainer = chataDashboardItem.showLoadingDots();
                }
                ChataUtils.safetynetCall(chataDashboardItem.safetynet(val),
                    function(json, statusCode){
                    var suggestions = json['full_suggestion'] ||
                    json['data']['replacements'];
                    if(suggestions.length > 0){

                        obj.isSafetynet = true;

                        if(loadingContainer){
                            tileResponseContainer.removeChild(loadingContainer);
                        }
                        tileWrapper.innerHTML = '';
                        var responseContentContainer = obj.getSafetynetBody(
                            json
                        );
                        tileWrapper.appendChild(
                            responseContentContainer
                        );
                        updateSelectWidth(responseContentContainer);
                        tileResponseContainer.appendChild(tileWrapper);

                        resolve();
                    }else{
                        obj.isSafetynet = false;
                        ChataUtils.ajaxCall(val, function(json){
                            if(loadingContainer){
                                tileResponseContainer.removeChild(
                                    loadingContainer
                                );
                            }

                            ChataUtils.responses[responseUUID] = json;
                            var displayType =
                            obj.internalDisplayType
                            || 'table';
                            if(refreshItem){
                                obj.refreshItem(
                                    displayType,
                                    responseUUID,
                                    tileWrapper
                                );
                            }
                            resolve();
                        }, dashboard.options, source);
                    }
                }, dashboard.options)
            }
        })
    }

    obj.refreshView = (append=true) => {
        var displayType = this.internalDisplayType;
        var uuid = this.uuid;
        this.refreshItem(displayType, uuid, tileWrapper, append);
    }

    obj.refreshDrilldownView =(view) =>{
        var displayType = this.internalDisplayType;
        var uuid = this.uuid;
        this.refreshItem(displayType, uuid, view, false);
    }

    obj.refreshItem = (displayType, _uuid, view, append=true) => {
        var json = ChataUtils.responses[_uuid];
        var supportedDisplayTypes = getSupportedDisplayTypes(json);
        if(append){
            tileResponseContainer.appendChild(view);
        }
        container = view;
        container.innerHTML = '';
        if(!supportedDisplayTypes.includes(displayType)){
            displayType = 'table';
        }
        if(supportedDisplayTypes.includes('suggestion')){
            displayType = 'suggestion';
        }
        if(json['data']['rows'].length == 0){
            console.log(displayType + '!==' + 'safetynet');
            container.innerHTML = 'No data found.';
            return 0;
        }
        switch (displayType) {
            case 'safetynet':
                var responseContentContainer = obj.getSafetynetBody(
                    json
                );
                view.appendChild(
                    responseContentContainer
                );
                updateSelectWidth(responseContentContainer);
            break;
            case 'table':
                var div = createTableContainer();
                var scrollbox = document.createElement('div');
                var tableWrapper = document.createElement('div');
                scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
                tableWrapper.classList.add('wrapper');
                tableWrapper.classList.add('flex');
                tableWrapper.appendChild(div);
                scrollbox.appendChild(tableWrapper);
                container.appendChild(scrollbox);
                if(json['data']['columns'].length == 1){
                    var data = formatData(
                        json['data']['rows'][0][0],
                        json['data']['columns'][0],
                        dashboard.options
                    );
                    container.innerHTML =
                    `<div>
                        <a class="autoql-vanilla-single-value-response">
                            ${data}
                        <a/>
                    </div>`;
                }else{
                    var table = createTable(
                        json, div, dashboard.options,
                        'append', _uuid, 'autoql-vanilla-table-response-renderer',
                        '[data-indexrowrenderer]'
                    );
                    table.classList.add('autoql-vanilla-renderer-table');
                    tableWrapper.insertBefore(table.headerElement, div);
                }
                break;
            case 'bar':
            var chartWrapper = document.createElement('div');
            container.appendChild(chartWrapper);
            if(json['data']['display_type'] == 'compare_table'
                || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChataUtils.getUniqueValues(
                    data, row => row[0]
                );
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(
                        data[i][0],
                        json['data']['columns'][0],
                        ChataUtils.options
                    );
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(
                        groups[i],
                        json['data']['columns'][0],
                        ChataUtils.options
                    )
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChataUtils.formatCompareData(
                    json['data']['columns'], data, groups
                );
                createGroupedBarChart(
                    chartWrapper,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                createBarChart(
                    chartWrapper, json, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'column':
            var chartWrapper = document.createElement('div');
            container.appendChild(chartWrapper);
            if(json['data']['display_type'] == 'compare_table'
                || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChataUtils.getUniqueValues(
                    data, row => row[0]
                );
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(
                        data[i][0],
                        json['data']['columns'][0],
                        ChataUtils.options
                    );
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i],
                        json['data']['columns'][0],
                        ChataUtils.options
                    )
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChataUtils.formatCompareData(
                    json['data']['columns'],
                    data,
                    groups
                );
                createGroupedColumnChart(
                    chartWrapper,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                createColumnChart(
                    chartWrapper,json, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'line':
            var chartWrapper = document.createElement('div');
            container.appendChild(chartWrapper);
            if(json['data']['display_type'] == 'compare_table'
                || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = ChataUtils.getUniqueValues(
                    data, row => row[0]
                );

                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(
                        data[i][0],
                        json['data']['columns'][0],
                        ChataUtils.options
                    );
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(
                        groups[i],
                        json['data']['columns'][0],
                        ChataUtils.options
                    );
                }
                var cols = json['data']['columns'];
                var dataGrouped = ChataUtils.formatCompareData(
                    json['data']['columns'], data, groups
                );
                createGroupedLineChart(
                    chartWrapper,
                    groups,
                    dataGrouped,
                    cols,
                    dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }else{
                createLineChart(
                    chartWrapper, json, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
            }

                break;
            case 'heatmap':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);

                createHeatmap(chartWrapper,
                    json,
                    dashboard.options, false,
                    'data-tilechart', true);
                break;
            case 'bubble':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createBubbleChart(
                    chartWrapper, json, dashboard.options,
                    false, 'data-tilechart',
                    true
                );
                break;
            case 'stacked_bar':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createStackedBarChart(
                    chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                break;
            case 'stacked_column':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createStackedColumnChart(
                    chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                break;
            case 'pie':
                var chartWrapper = document.createElement('div');
                container.appendChild(chartWrapper);
                createPieChart(chartWrapper, json,
                    dashboard.options, false,
                    'data-tilechart', true
                );
                break;
            case 'pivot_column':
                var div = createTableContainer();
                // var tableWrapper = document.createElement('div');
                var scrollbox = document.createElement('div');
                scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
                // tableWrapper.classList.add('wrapper');
                // tableWrapper.classList.add('flex');
                // tableWrapper.appendChild(div);
                scrollbox.appendChild(div);
                container.appendChild(scrollbox);
                var pivotArray = [];
                var columns = json['data']['columns'];
                if(columns[0].type === 'DATE' &&
                columns[0].name.includes('month')){
                    pivotArray = getDatePivotArray(
                        json, dashboard.options, json['data']['rows']
                    );
                }else{
                    pivotArray = getPivotColumnArray(
                        json, dashboard.options, json['data']['rows']
                    );
                }
                var table = createPivotTable(
                    pivotArray, div, dashboard.options,
                    'append', _uuid, 'autoql-vanilla-table-response-renderer'
                );
                scrollbox.insertBefore(table.headerElement, div);
                break;
            case 'suggestion':
                var responseContentContainer = document.createElement('div');
                responseContentContainer.classList.add(
                    'autoql-vanilla-chata-response-content-container'
                );
                responseContentContainer.classList.add(
                    'autoql-vanilla-chata-response-content-center'
                );
                var val = ''
                if(obj.isSecond){
                    val = obj.internalQuery;
                }else{
                    val = chataDashboardItem.inputQuery.value;
                }
                responseContentContainer.innerHTML = `
                    <div>I'm not sure what you mean by
                        <strong>"${val}"</strong>. Did you mean:
                    </div>`;
                container.appendChild(responseContentContainer);
                var rows = json['data']['rows'];
                ChataUtils.createSuggestions(
                    responseContentContainer,
                    rows,
                    'autoql-vanilla-chata-suggestion-btn-renderer'
                );
                break;
            default:
            container.innerHTML = "Oops! We didn't understand that query.";
        }
        obj.createVizToolbar(json, _uuid, displayType);
    }

    obj.createVizToolbar = (json, uuid, ignoreDisplayType) => {
        var displayTypes = chataDashboardItem.getDisplayTypes(json);
        [].forEach.call(tileWrapper.querySelectorAll(
            '.autoql-vanilla-tile-toolbar'
        ),
        function(e, index){
            e.parentNode.removeChild(e);
        });

        if(obj.isSecond){
            if(!obj.internalQuery){
                obj.internalQuery = chataDashboardItem.inputQuery.value;
            }
            var inputToolbar = new InputToolbar(obj.internalQuery, tileWrapper);
            obj.inputToolbar = inputToolbar;
            tileWrapper.appendChild(inputToolbar.tileToolbar);
            obj.inputToolbar.input.onkeypress = (evt) => {
                if(evt.keyCode == 13 && evt.target.value){
                    chataDashboardItem.runQuery('dashboards.user');
                }
            }
        }

        if(displayTypes.length > 1){
            var vizToolbar = document.createElement('div');
            vizToolbar.classList.add('autoql-vanilla-tile-toolbar');
            for (var i = 0; i < displayTypes.length; i++) {
                if(displayTypes[i] == ignoreDisplayType)continue;
                var button = document.createElement('button');
                button.classList.add('autoql-vanilla-chata-toolbar-btn');
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
                if(displayTypes[i] == 'date_pivot'
                    || displayTypes[i] == 'pivot_column'){
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
                        dashboard.lastEvent.type = 'display_type';
                        dashboard.lastEvent.value = {
                            tile: chataDashboardItem,
                            displayType: obj.internalDisplayType
                        };

                        obj.internalDisplayType =
                        this.dataset.displaytype;
                        obj.refreshItem(
                            this.dataset.displaytype,
                            uuid,
                            tileWrapper,
                            false
                        )
                    }
                }
            }
            tileWrapper.appendChild(vizToolbar);
        }
    }

    obj.tileWrapper.addEventListener('click', function(e){
        if(e.target.dataset.tilechart){
            chataDashboardItem.updateSelectedBars(e.target);
            var query = chataDashboardItem.inputQuery.value;
            var indexData = parseInt(e.target.dataset.tilechart);
            modal.clearViews();
            drilldownTable.innerHTML = '';
            modal.addView(drilldownOriginal);
            modal.addView(drilldownTable);
            modal.setTitle(query);
            var json = cloneObject(
                ChataUtils.responses[obj.uuid]
            );
            var drilldownUUID = uuidv4();
            if(chataDashboardItem.options.displayType == 'stacked_bar' ||
               chataDashboardItem.options.displayType == 'stacked_column'){
                   json['data']['rows'][0][0] = e.target.dataset.colvalue1;
                   indexData = 0;
            }
            obj.refreshItem(
                chataDashboardItem.options.displayType,
                obj.uuid,
                chartDrilldownContainer,
                false
            )

            var drilldownData = chataDashboardItem.getDrilldownData(
                json, indexData, dashboard.options);
            var queryId = json['data']['query_id'];
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('autoql-vanilla-tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                queryId,
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    obj.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable,
                        false
                    )
                    obj.createVizToolbar(
                        json, obj.uuid, obj.internalDisplayType
                    )
                }
            )
            modal.show();
            obj.refreshDrilldownView(chartDrilldownContainer);
        }else if (e.target.parentElement.dataset.indexrowrenderer ||
        e.target.classList.contains('autoql-vanilla-single-value-response')){
            let query;
            if(obj.isSecond){
                query = obj.internalQuery;
            }else{
                query = chataDashboardItem.inputQuery.value;
            }
            modal.clearViews();
            drilldownTable.innerHTML = '';
            modal.addView(drilldownTable);
            modal.setTitle(query);
            var drilldownValue = '';
            var indexData = e.target.parentElement.dataset.indexrowrenderer;
            var json = cloneObject(
                ChataUtils.responses[obj.uuid]
            );
            if(e.target.classList.contains('autoql-vanilla-single-value-response')){
                json['data']['rows'][0][0] = e.target.textContent;
                indexData = -1;
            }
            var drilldownUUID = uuidv4();
            var drilldownData = chataDashboardItem.getDrilldownData(
                json, indexData, dashboard.options);
            var queryId = json['data']['query_id'];
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('autoql-vanilla-tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                queryId,
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    obj.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable,
                        false
                    )
                    obj.createVizToolbar(
                        json, obj.uuid, obj.internalDisplayType
                    )
                }
            )
            modal.show();
        }
    });

    modal.addEvent('click', function(e){
        if(e.target.dataset.tilechart){
            chataDashboardItem.updateSelectedBars(e.target)
            var json = cloneObject(
                ChataUtils.responses[obj.uuid]
            );
            var drilldownUUID = uuidv4();
            var indexData = parseInt(e.target.dataset.tilechart);

            drilldownTable.innerHTML = '';
            if(chataDashboardItem.options.displayType == 'stacked_bar' ||
               chataDashboardItem.options.displayType == 'stacked_column'){
                   json['data']['rows'][0][0] = e.target.dataset.unformatvalue1;
                   json['data']['rows'][0][1] = e.target.dataset.unformatvalue2;
                   json['data']['rows'][0][2] = e.target.dataset.unformatvalue3;

                   indexData = 0;
            }
            var drilldownData = chataDashboardItem.getDrilldownData(
                json, indexData , dashboard.options);
            var queryId = json['data']['query_id'];
            var dots = putLoadingContainer(drilldownTable);
            dots.classList.remove('chat-bar-loading');
            dots.classList.add('autoql-vanilla-tile-response-loading-container');
            chataDashboardItem.sendDrilldownMessage(
                queryId,
                drilldownData,
                dashboard.options,
                drilldownUUID,
                function(){
                    obj.refreshItem(
                        'table',
                        drilldownUUID,
                        drilldownTable,
                        false
                    )
                    obj.createVizToolbar(
                        json, obj.uuid, chataDashboardItem.options.displayType
                    )
                }
            )
        }

    });

    tileWrapper.onclick = (evt) => {
        if(evt.target.classList.contains('autoql-vanilla-chata-suggestion-btn-renderer')){
            if(obj.isSecond){
                obj.internalQuery = evt.target.textContent;
                obj.inputToolbar.input.value = evt.target.textContent;
            }else{
                chataDashboardItem.inputQuery.value = evt.target.textContent;
            }
            chataDashboardItem.runQuery('dashboards.suggestion');
        }
    }

    return obj;
}
