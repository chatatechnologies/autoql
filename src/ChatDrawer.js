var ChatDrawer = {
    options: {
        projectId: 1,
        token: undefined,
        apiKey: '',
        customerId: '',
        userId: '',
        domain: '',
        isVisible: false,
        placement: 'right',
        width: 500,
        height: 500,
        theme: 'light',
        accentColor: '#28a8e0',
        title: 'Chat with your data',
        showHandle: true,
        handleStyles: {},
        onVisibleChange: function() {},
        onHandleClick: function(){},
        showMask: true,
        onMaskClick: function(){},
        maskClosable: true,
        customerName: 'there',
        maxMessages: -1,
        clearOnClose: false,
        enableVoiceRecord: true,
        enableAutocomplete: true,
        autocompleteStyles: {},
        enableSafetyNet: true,
        enableDrilldowns: true,
        demo: false,
        debug: true,
        currencyCode: 'USD',
        languageCode: 'en-US',
        fontFamily: 'sans-serif',
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
        isRecordVoiceActive: false
    },
    responses: [],
    xhr: new XMLHttpRequest(),
    speechToText: getSpeech(),
    finalTranscript: ''
};

ChatDrawer.init = function(elem, options){
    var rootElem = document.getElementById(elem);
    for (var [key, value] of Object.entries(options)) {
        ChatDrawer.options[key] = value;
    }
    if(!('introMessage' in options)){
        ChatDrawer.options.introMessage = "Hi " + ChatDrawer.options.customerName+ " I'm  here to help you access, search and analyze your data.";
    }
    if(!('onMaskClick' in options)){
        ChatDrawer.options.onMaskClick = ChatDrawer.options.onHandleClick;
    }
    ChatDrawer.rootElem = rootElem;
    rootElem.classList.add('chata-drawer');
    this.createHeader();
    this.createDrawerContent();
    this.createBar();
    this.createWrapper();
    this.createDrawerButton();
    this.registerEvents();
    var isVisible = ChatDrawer.options.isVisible;
    ChatDrawer.openDrawer();
    ChatDrawer.closeDrawer();

    if(isVisible){
        ChatDrawer.openDrawer();
    }else{
        ChatDrawer.closeDrawer();
    }
    const themeStyles = ChatDrawer.options.theme === 'light' ? LIGHT_THEME : DARK_THEME
    if ('accentColor' in options){
        themeStyles['--chata-drawer-accent-color'] = options.accentColor;
    }
    for (let property in themeStyles) {
        document.documentElement.style.setProperty(
            property,
            themeStyles[property],
        );
    }
    ChatDrawer.rootElem.style.setProperty(
        '--chata-drawer-font-family',
        ChatDrawer.options['fontFamily']
    );

    ChatDrawer.speechToText.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
            let transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                ChatDrawer.finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        console.log(ChatDrawer.finalTranscript);
        if(ChatDrawer.finalTranscript !== ''){
            var button = document.getElementById('chata-voice-record-button');
            var chataInput = document.getElementById('chata-input');
            ChatDrawer.sendMessage(chataInput, ChatDrawer.finalTranscript);
            ChatDrawer.speechToText.stop();
            button.style.background = themeStyles['--chata-drawer-accent-color'];
            ChatDrawer.options.isRecordVoiceActive = false;
        }
    }

    return this;
}

ChatDrawer.getChatBar = function(options={}){
    return getChatBar(options);
}

ChatDrawer.createResponseRenderer = function(options){
    return createResponseRenderer(options);
}

ChatDrawer.createBar = function(){
    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('chata-bar-container');
    chataBarContainer.classList.add('chat-drawer-chat-bar');
    chataBarContainer.classList.add('autosuggest-top');
    var htmlBar = `
    <div class="watermark">
        ${WATERMARK}
        We run on Chata
    </div>
    <div class="auto-complete-suggestions">
        <ul id="auto-complete-list">
        </ul>
    </div>
    <div class="text-bar">
        <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input" placeholder="Ask me anything" value="" id="chata-input">
        <button id="chata-voice-record-button" class="chat-voice-record-button chata-voice" data-tippy-content="Hold to Use Voice" data-for="chata-speech-to-text-tooltip" data-tippy-content-disable="false" currentitem="false">
        <img class="chat-voice-record-icon chata-voice" src="data:image/svg+xml;base64,${VOICE_RECORD_ICON}" alt="speech to text button" height="22px" width="22px" draggable="false">
        </button>
    </div>
    `;
    chataBarContainer.innerHTML = htmlBar;
    ChatDrawer.rootElem.appendChild(chataBarContainer);
}

ChatDrawer.createDrawerContent = function(){
    var drawerContent = document.createElement('div');
    var firstMessage = document.createElement('div');
    var chatMessageBubble = document.createElement('div');
    chatMessageBubble.textContent = ChatDrawer.options.introMessage;
    drawerContent.classList.add('drawer-content');
    firstMessage.classList.add('chat-single-message-container');
    firstMessage.classList.add('response');
    chatMessageBubble.classList.add('chat-message-bubble');

    firstMessage.appendChild(chatMessageBubble);
    drawerContent.appendChild(firstMessage);
    ChatDrawer.rootElem.appendChild(drawerContent);
    ChatDrawer.drawerContent = drawerContent;
}

ChatDrawer.createHeader = function(){
    var chatHeaderContainer = document.createElement('div');
    var htmlHeader = `
        <div class="chata-header-left">
            <button class="chata-button close close-action" currentitem="false"><svg class="close-action" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="close-action" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>
        </div>
        <div class="chata-header-center-container">
            ${ChatDrawer.options.title}
        </div>
        <div class="chata-header-right-container">
            <button class="chata-button clear-all">
                ${CLEAR_ALL}
            </button>
        </div>`;
        // <svg class="clear-all" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="clear-all" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path></svg>
    chatHeaderContainer.classList.add('chat-header-container');
    chatHeaderContainer.innerHTML = htmlHeader;

    ChatDrawer.rootElem.appendChild(chatHeaderContainer);
}

ChatDrawer.sendDrilldownMessage = function(json, indexData, options, context='ChatDrawer', responseRenderer=null){
    var value = json['data']['rows'][parseInt(indexData)][0]
    var colData = json['data']['columns'][0]['name'];
    var col = formatColumnName(colData);

    const URL = options.demo
      ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
      : `${options.domain}/api/v1/chata/query/drilldown?key=${options.api_key}`

    // const URL = `https://backend-staging.chata.ai/api/v1/query${
    //     ChatDrawer.options.projectId === 1 ? '/demo' : ''
    // }/drilldown?&project=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;

    var obj = {};
    obj[colData] = value;

    const data = {
        query_id: json['data']['query_id'],
        group_bys: obj,
        customer_id: options.customerId,
        user_id: options.userId,
        debug: options.debug
    }

    var msg = `Drill down on ${col} "${value}"`;
    if(context == 'ChatDrawer'){
        var responseLoadingContainer = ChatDrawer.putMessage(msg);
        ChatDrawer.ajaxCallPost(URL, function(response){
            ChatDrawer.putTableResponse(response);
            ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
        }, data, options);
    }else{
        ChatDrawer.ajaxCallPost(URL, function(response){
            responseRenderer.innerHTML = '';
            var uuid = uuidv4();
            ChatDrawer.responses[uuid] = response;
            var div = document.createElement('div');
            div.classList.add('chata-table-container');
            div.classList.add('chata-table-container-renderer');
            responseRenderer.appendChild(div);
            if(response['data']['columns'].length == 1){
                var data = response['data'];
                responseRenderer.innerHTML = `<div>${data}</div>`;
            }else{
                createTable(response, div, 'append', uuid, 'table-response-renderer');
            }
            console.log(msg);
        }, data, options);
    }
}

ChatDrawer.registerEvents = function(){
    var chataInput = document.getElementById('chata-input');
    var suggestionList = document.getElementById('auto-complete-list');
    document.addEventListener('dblclick', function(e){
        if(ChatDrawer.options.enableDrilldowns){
            if(e.target.parentElement.hasAttribute('data-indexrow')){
                var table = e.target.parentElement.parentElement;
                var json = ChatDrawer.responses[table.dataset.componentid];
                var indexData = e.target.parentElement.dataset.indexrow;
                ChatDrawer.sendDrilldownMessage(json, indexData, ChatDrawer.options);
            }
            if(e.target.hasAttribute('data-chartindex')){
                var component = e.target.parentElement.parentElement.parentElement;
                if(component.tagName == 'svg'){
                    component = component.parentElement;
                }
                var json = ChatDrawer.responses[component.dataset.componentid];
                var indexData = e.target.dataset.chartindex;
                ChatDrawer.sendDrilldownMessage(json, indexData, ChatDrawer.options);
            }
        }

        if(e.target.hasAttribute('data-chartrenderer')){
            var component = e.target.parentElement.parentElement.parentElement;
            if(component.tagName == 'svg'){
                component = component.parentElement;
            }
            if(component.chataBarContainer.options.enableDrilldowns){
                var json = ChatDrawer.responses[component.dataset.componentid];
                var indexData = e.target.dataset.chartrenderer;
                ChatDrawer.sendDrilldownMessage(
                    json, indexData,
                    responseRenderer.chataBarContainer.options,
                    'ChatBar', component);
            }
        }
        if(e.target.parentElement.hasAttribute('data-indexrowrenderer')){
            var component = e.target.parentElement.parentElement;
            var responseRenderer = component.parentElement.parentElement;
            if(responseRenderer.chataBarContainer.options.enableDrilldowns){
                var json = ChatDrawer.responses[component.dataset.componentid];
                var indexData = e.target.parentElement.dataset.indexrowrenderer;
                ChatDrawer.sendDrilldownMessage(
                    json, indexData,
                    responseRenderer.chataBarContainer.options,
                    'ChatBar', responseRenderer);
            }

        }
    });
    document.addEventListener('click', function(e){
        if(e.target){
            if(e.target.classList.contains('bar') || e.target.classList.contains('line-dot')
            || e.target.classList.contains('square') || e.target.classList.contains('circle')){
                var selectedBars = e.target.parentElement.getElementsByClassName('active');
                for (var i = 0; i < selectedBars.length; i++) {
                    selectedBars[i].classList.remove('active');
                }
                e.target.classList.add('active');
            }

            if(e.target.id == 'drawer-wrapper'){
                console.log('foo');
                if(ChatDrawer.options.showMask && ChatDrawer.options.maskClosable){
                    ChatDrawer.options.onMaskClick();
                }
            }

            if(e.target.classList.contains('close-action')){
                ChatDrawer.closeDrawer();
            }

            if(e.target.classList.contains('chata-voice')){
                var button = document.getElementById('chata-voice-record-button');


                if(ChatDrawer.options.isRecordVoiceActive){
                    const themeStyles = ChatDrawer.options.theme === 'light' ? LIGHT_THEME : DARK_THEME;
                    ChatDrawer.options.isRecordVoiceActive = false;
                    ChatDrawer.speechToText.stop();
                    button.style.background = themeStyles['--chata-drawer-accent-color'];
                }else{
                    ChatDrawer.finalTranscript = '';
                    button.style.background = 'red';
                    ChatDrawer.options.isRecordVoiceActive = true;
                    ChatDrawer.speechToText.start();
                }
            }

            if(e.target.classList.contains('filter-table')){
                if(e.target.tagName == 'svg'){
                    parent = e.target.parentElement.parentElement.parentElement;
                }else if(e.target.tagName == 'path'){
                    parent = e.target.parentElement.parentElement.parentElement.parentElement;
                }else{
                    parent = e.target.parentElement.parentElement;
                }
                var table = parent.getElementsByTagName('table')[0];
                var inputs = table.getElementsByClassName('tabulator-header-filter');

                for (var i = 0; i < inputs.length; i++) {
                    if(inputs[i].style.display == '' || inputs[i].style.display == 'none'){
                        inputs[i].style.display = 'block';
                    }else{
                        inputs[i].style.display = 'none';
                    }
                }
            }

            if(e.target.classList.contains('suggestion')){
                console.log(e.target.textContent);
                suggestionList.style.display = 'none';
                ChatDrawer.sendMessage(chataInput, e.target.textContent);
            }
            if(e.target.classList.contains('suggestion-renderer')){
                var parent = e.target.parentElement.parentElement.parentElement.parentElement;
                var chatBarSuggestionList = parent.getElementsByClassName('chat-bar-autocomplete')[0];
                chatBarSuggestionList.style.display = 'none';
                parent.sendMessageToResponseRenderer(e.target.textContent);
            }
            if(e.target.classList.contains('chata-suggestion-btn')){
                ChatDrawer.sendMessage(chataInput, e.target.textContent);
            }
            if(e.target.classList.contains('chata-suggestion-btn-renderer')){
                var parent = e.target.parentElement.parentElement;
                parent.options.onSuggestionClick();
                parent.chataBarContainer.sendMessageToResponseRenderer(e.target.textContent);
            }
            if(e.target.classList.contains('clipboard')){
                if(e.target.tagName == 'svg'){
                    var json = ChatDrawer.responses[e.target.parentElement.dataset.id];
                }else if(e.target.tagName == 'path'){
                    var json = ChatDrawer.responses[e.target.parentElement.parentElement.dataset.id];
                }else{
                    var json = ChatDrawer.responses[e.target.dataset.id];
                }
                copyTextToClipboard(ChatDrawer.createCsvData(json, '\t'));
            }
            if(e.target.classList.contains('csv')){
                if(e.target.tagName == 'svg'){
                    var json = ChatDrawer.responses[e.target.parentElement.dataset.id];
                }else if(e.target.tagName == 'path'){
                    var json = ChatDrawer.responses[e.target.parentElement.parentElement.dataset.id];
                }else{
                    var json = ChatDrawer.responses[e.target.dataset.id];
                }
                var csvData = ChatDrawer.createCsvData(json);
                var link = document.createElement("a");
                link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
                link.setAttribute('download', 'test.csv');
                link.click();
            }
            if(e.target.classList.contains('column')){
                var tableElement = e.target.parentElement.parentElement.parentElement;
                if(e.target.nextSibling.classList.contains('up')){
                    e.target.nextSibling.classList.remove('up');
                    e.target.nextSibling.classList.add('down');
                    var data = applyFilter(tableElement.dataset.componentid);
                    var sortData = ChatDrawer.sort(data, 'desc', e.target.dataset.index, e.target.dataset.type);
                    ChatDrawer.refreshTableData(tableElement, sortData, ChatDrawer.options);
                }else{
                    e.target.nextSibling.classList.remove('down');
                    e.target.nextSibling.classList.add('up');
                    var data = applyFilter(tableElement.dataset.componentid);
                    var sortData = ChatDrawer.sort(data, 'asc', parseInt(e.target.dataset.index), e.target.dataset.type);
                    ChatDrawer.refreshTableData(tableElement, sortData, ChatDrawer.options);
                }
            }
            if(e.target.classList.contains('column-pivot')){
                var tableElement = e.target.parentElement.parentElement.parentElement;
                var pivotArray = [];
                var json = ChatDrawer.responses[tableElement.dataset.componentid];
                var rows = applyFilter(tableElement.dataset.componentid);
                if(json['display_type'] == 'date_pivot'){
                    pivotArray = getDatePivotArray(json, ChatDrawer.options, rows);
                }else{
                    pivotArray = getPivotColumnArray(json, ChatDrawer.options, rows);
                }
                if(e.target.nextSibling.classList.contains('up')){
                    e.target.nextSibling.classList.remove('up');
                    e.target.nextSibling.classList.add('down');
                    var sortData = sortPivot(pivotArray, e.target.dataset.index, 'desc');
                    sortData.unshift([]); //Simulate header
                    ChatDrawer.refreshPivotTable(tableElement, sortData);
                }else{
                    e.target.nextSibling.classList.remove('down');
                    e.target.nextSibling.classList.add('up');
                    var sortData = sortPivot(pivotArray, e.target.dataset.index, 'asc');
                    sortData.unshift([]); //Simulate header
                    ChatDrawer.refreshPivotTable(tableElement, sortData);
                }
            }
            if(e.target.classList.contains('pivot_table')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                ChatDrawer.refreshToolbarButtons(component, 'pivot_column');
                if(json['display_type'] == 'date_pivot'){
                    var pivotArray = getDatePivotArray(json, ChatDrawer.options, json['data']['rows']);
                    createPivotTable(pivotArray, component);
                }else{
                    var pivotArray = getPivotColumnArray(json, ChatDrawer.options, json['data']['rows']);
                    createPivotTable(pivotArray, component);
                }
            }
            if(e.target.classList.contains('column_chart')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                ChatDrawer.refreshToolbarButtons(component, 'column');
                if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length == 3){
                    var data = cloneObject(json['data']['rows']);

                    var groups = ChatDrawer.getUniqueValues(data, row => row[0]);
                    groups = groups.sort();
                    for (var i = 0; i < data.length; i++) {
                        data[i][0] = formatData(data[i][0], json['data']['columns'][0]['type']);
                    }
                    for (var i = 0; i < groups.length; i++) {
                        groups[i] = formatData(groups[i], json['data']['columns'][0]['type'])
                    }
                    // var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    // var col3 = formatColumnName(json['data']['columns'][2]['name']);
                    var dataGrouped = ChatDrawer.formatCompareData(json['data']['columns'], data, groups);
                    createColumnChart(component, groups, dataGrouped, col1, col2, ChatDrawer.options);
                    console.log(dataGrouped);
                }else{
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var col1 = formatColumnName(json['data']['columns'][0]['name']);
                    var col2 = formatColumnName(json['data']['columns'][1]['name']);
                    var hasNegativeValues = values[1];
                    createColumnChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                }
            }
            if(e.target.classList.contains('stacked_column_chart')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                ChatDrawer.refreshToolbarButtons(component, 'stacked_column');
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
                createStackedColumnChart(component, dataGrouped, groups, subgroups, col1, col2, col3, ChatDrawer.options);
            }
            if(e.target.classList.contains('stacked_bar_chart')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                ChatDrawer.refreshToolbarButtons(component, 'stacked_bar');
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
                createStackedBarChart(component, dataGrouped, groups, subgroups, col1, col2, col3, ChatDrawer.options);
            }
            if(e.target.classList.contains('table')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                ChatDrawer.refreshToolbarButtons(component, 'table');
                createTable(json, component, ChatDrawer.options);
            }

            if(e.target.classList.contains('bar_chart')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                var values = formatDataToBarChart(json);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var col1 = formatColumnName(json['data']['columns'][0]['name']);
                var col2 = formatColumnName(json['data']['columns'][1]['name']);

                createBarChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'bar');

            }

            if(e.target.classList.contains('line_chart')){
                if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                var values = formatDataToBarChart(json);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var col1 = formatColumnName(json['data']['columns'][0]['name']);
                var col2 = formatColumnName(json['data']['columns'][1]['name']);

                createLineChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'line');
            }

            if(e.target.classList.contains('heatmap')){
                console.log(e.target.tagName);
                if(e.target.tagName == 'BUTTON'){
                    var idRequest = e.target.dataset.id;
                }
                else if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                var values = formatDataToHeatmap(json);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, json['data']['columns'][0]['type']);
                labelsX = formatLabels(labelsX, json['data']['columns'][1]['type']);

                var col1 = formatColumnName(json['data']['columns'][0]['name']);
                var col2 = formatColumnName(json['data']['columns'][1]['name']);
                var col3 = formatColumnName(json['data']['columns'][2]['name']);

                createHeatmap(component, labelsX, labelsY, values, col1, col2, col3, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'heatmap');
            }

            if(e.target.classList.contains('bubble_chart')){
                if(e.target.tagName == 'BUTTON'){
                    var idRequest = e.target.dataset.id;
                }
                else if(e.target.tagName == 'svg'){
                    var idRequest = e.target.parentElement.dataset.id;
                }else{
                    var idRequest = e.target.parentElement.parentElement.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                var values = formatDataToHeatmap(json);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, json['data']['columns'][0]['type']);
                labelsX = formatLabels(labelsX, json['data']['columns'][1]['type']);

                var col1 = formatColumnName(json['data']['columns'][0]['name']);
                var col2 = formatColumnName(json['data']['columns'][1]['name']);
                var col3 = formatColumnName(json['data']['columns'][2]['name']);


                createBubbleChart(component, labelsX, labelsY, values, col1, col2, col3, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'bubble');
            }
            if(e.target.classList.contains('export_png')){
                if(e.target.tagName == 'svg'){
                    idRequest = e.target.parentElement.dataset.id;
                }else if(e.target.tagName == 'path'){
                    idRequest = e.target.parentElement.parentElement.dataset.id;
                }else{
                    idRequest = e.target.dataset.id;
                }
                var json = ChatDrawer.responses[idRequest];
                var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
                var svg = component.getElementsByTagName('svg')[0];
                var svgString = getSVGString(svg);
                // svgToPng(svg);
                svgString2Image( svgString, 2*component.clientWidth, 2*component.clientHeight);
            }
            if(e.target.classList.contains('clear-all')){
                ChatDrawer.clearMessages();
            }
        }
    });

    chataInput.onkeyup = function(){
        if(ChatDrawer.options.enableAutocomplete){
            suggestionList.style.display = 'none';
            if(this.value){
                ChatDrawer.autocomplete(this.value, suggestionList, 'suggestion', ChatDrawer.options.autocompleteStyles);
            }
        }
    }

    chataInput.onkeypress = function(event){
        if(event.keyCode == 13 && this.value){
            try {
                ChatDrawer.xhr.onreadystatechange = null;
                ChatDrawer.xhr.abort();
            } catch (e) {}
            suggestionList.style.display = 'none';
            ChatDrawer.sendMessage(chataInput, this.value);
        }
    }
}

ChatDrawer.clearMessages = function(){
    [].forEach.call(ChatDrawer.drawerContent.querySelectorAll('.chat-single-message-container'), function(e, index){
        if(index == 0) return;
        e.parentNode.removeChild(e);
    });
}

ChatDrawer.makeBarChartDomain = function(data, hasNegativeValues){
    if(hasNegativeValues){
        return d3.extent(data, function(d) { return d.value; });
    }else{
        return [0, d3.max(data, function(d) {
            return d.value;
        })];
    }
}

ChatDrawer.getUniqueValues = function(data, getter){
    let unique = {};
    data.forEach(function(i) {
        if(!unique[getter(i)]) {
            unique[getter(i)] = true;
        }
    });
    return Object.keys(unique);
}

ChatDrawer.formatCompareData = function(col, data, groups){
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

ChatDrawer.format3dData = function(cols, data, groups){
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][1] == group){
                dataGrouped[i][data[x][0]] = parseFloat(data[x][2]);
            }
        }
    }

    console.log(dataGrouped);

    return dataGrouped;
}

ChatDrawer.groupBy = function(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, item[1]);
        } else {
            var oldValue = map.get(key);
            map.set(item[1] + oldValue);
        }
    });
    return map;
}

ChatDrawer.refreshToolbarButtons = function(oldComponent, activeDisplayType){
    var messageBubble = oldComponent.parentElement.parentElement.parentElement;
    var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
    var toolbarRight = messageBubble.getElementsByClassName('right')[0];
    var actionType = ['table', 'pivot_column', 'date_pivot'].includes(activeDisplayType) ? 'csvCopy' : '';
    toolbarLeft.innerHTML = ChatDrawer.getSupportedDisplayTypes(oldComponent.dataset.componentid, activeDisplayType);
    toolbarRight.innerHTML = ChatDrawer.getActionButtons(oldComponent.dataset.componentid, actionType);
    refreshTooltips();
}

ChatDrawer.sort = function(data, operator, colIndex, colType){
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

ChatDrawer.refreshPivotTable = function(table, pivotArray){
    var rows = table.childNodes;
    var cols = ChatDrawer.responses[table.dataset.componentid]['columns'];
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.visibility = 'visible';
    }

    for (var i = 1; i < pivotArray.length; i++) {
        var tdList = rows[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = pivotArray[i][x];
        }
    }

    for (var i = pivotArray.length; i < rows.length; i++) {
        rows[i].style.visibility = 'hidden';
    }
}

ChatDrawer.refreshTableData = function(table, newData, options){
    var rows = newData;//table.childNodes;
    var nodes = table.childNodes;
    var cols = ChatDrawer.responses[table.dataset.componentid]['data']['columns'];
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.visibility = 'visible';
    }
    for (var i = 0; i < newData.length; i++) {
        var tdList = nodes[i+1].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = formatData(newData[i][x], cols[x]['type'], options.languageCode, options.currencyCode);
        }
    }
    for (var i = newData.length+1; i < nodes.length; i++) {
        nodes[i].style.visibility = 'hidden';
    }
}

ChatDrawer.createCsvData = function(json, separator=','){
    var output = '';
    var lines = json['data']['rows'];
    for(var i = 0; i<json['data']['columns'].length; i++){
        var colName = formatColumnName(json['data']['columns'][i]['name']);
        output += colName + separator;
    }
    output += '\n';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        for (var x = 0; x < data.length; x++) {
            output += data[x] + separator;
        }
        output += '\n';
    }
    return output
}

ChatDrawer.closeDrawer = function(){
    ChatDrawer.options.isVisible = false;
    ChatDrawer.wrapper.style.opacity = 0;
    ChatDrawer.wrapper.style.height = 0;

    if(ChatDrawer.options.placement == 'right'){
        ChatDrawer.rootElem.style.right = 0;
        ChatDrawer.rootElem.style.top = 0;
        ChatDrawer.rootElem.style.transform = 'translateX('+ ChatDrawer.options.width +'px)';
        if(ChatDrawer.options.showHandle){
            ChatDrawer.drawerButton.style.display = 'flex';
        }
    }else if(ChatDrawer.options.placement == 'left'){
        ChatDrawer.rootElem.style.left = 0;
        ChatDrawer.rootElem.style.top = 0;
        ChatDrawer.rootElem.style.transform = 'translateX(-'+ ChatDrawer.options.width +'px)';
        if(ChatDrawer.options.showHandle){
            ChatDrawer.drawerButton.style.display = 'flex';
        }
    }else if(ChatDrawer.options.placement == 'bottom'){
        ChatDrawer.rootElem.style.bottom = '0';
        ChatDrawer.rootElem.style.transform = 'translateY('+ ChatDrawer.options.height +'px)';

        if(ChatDrawer.options.showHandle){
            ChatDrawer.drawerButton.style.display = 'flex';
        }
    }else if(ChatDrawer.options.placement == 'top'){
        ChatDrawer.rootElem.style.top = '0';
        ChatDrawer.rootElem.style.transform = 'translateY(-'+ ChatDrawer.options.height +'px)';

        if(ChatDrawer.options.showHandle){
            ChatDrawer.drawerButton.style.display = 'flex';
        }
    }
    if(ChatDrawer.options.clearOnClose){
        ChatDrawer.clearMessages();
    }
    ChatDrawer.options.onVisibleChange();
}

ChatDrawer.openDrawer = function(){
    ChatDrawer.options.isVisible = true;
    if(ChatDrawer.options.showMask){
        ChatDrawer.wrapper.style.opacity = .3;
        ChatDrawer.wrapper.style.height = '100%';
    }
    if(ChatDrawer.options.placement == 'right'){
        ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
        ChatDrawer.drawerButton.style.display = 'none';
        ChatDrawer.rootElem.style.right = 0;
        ChatDrawer.rootElem.style.top = 0;
        ChatDrawer.rootElem.style.transform = 'translateX(0px)';
    }else if(ChatDrawer.options.placement == 'left'){
        ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
        ChatDrawer.rootElem.style.left = 0;
        ChatDrawer.rootElem.style.top = 0;
        ChatDrawer.drawerButton.style.display = 'none';
        ChatDrawer.rootElem.style.transform = 'translateX(0px)';
    }else if(ChatDrawer.options.placement == 'bottom'){
        ChatDrawer.rootElem.style.width = '100%';
        ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
        ChatDrawer.rootElem.style.bottom = 0;
        ChatDrawer.drawerButton.style.display = 'none';
        ChatDrawer.rootElem.style.transform = 'translateY(0)';
    }else if(ChatDrawer.options.placement == 'top'){
        ChatDrawer.rootElem.style.width = '100%';
        ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
        ChatDrawer.rootElem.style.top = 0;
        ChatDrawer.drawerButton.style.display = 'none';
        ChatDrawer.rootElem.style.transform = 'translateY(0)';
    }
    ChatDrawer.options.onVisibleChange();
}

ChatDrawer.createWrapper = function(rootElem){
    var wrapper = document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(wrapper, rootElem);
    wrapper.setAttribute('id', 'drawer-wrapper');
    ChatDrawer.wrapper = wrapper;
    if(!ChatDrawer.options.showMask){
        ChatDrawer.wrapper.style.opacity = 0;
        ChatDrawer.wrapper.style.height = 0;
    }
}

ChatDrawer.createDrawerButton = function(rootElem){
    var drawerButton = document.createElement("div");
    var drawerIcon = document.createElement("div");
    drawerIcon.setAttribute("height", "22px");
    drawerIcon.setAttribute("width", "22px");
    drawerIcon.classList.add('chata-bubbles-icon');
    drawerIcon.classList.add('open-action');
    drawerIcon.innerHTML = CHATA_BUBBLES_ICON;
    drawerButton.classList.add('drawer-handle');
    drawerButton.classList.add('open-action');
    drawerButton.classList.add(ChatDrawer.options.placement + '-btn');
    drawerButton.appendChild(drawerIcon);
    drawerButton.addEventListener('click', function(e){
        ChatDrawer.options.onHandleClick();
        ChatDrawer.openDrawer();
    })
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(drawerButton, rootElem);
    ChatDrawer.drawerButton = drawerButton;
    if(!ChatDrawer.options.showHandle){
        ChatDrawer.drawerButton.style.display = 'none';
    }
    for (var [key, value] of Object.entries(ChatDrawer.options.handleStyles)){
        ChatDrawer.drawerButton.style.setProperty(key, value, '');
    }
}

ChatDrawer.safetynetCall = function(url, callback, options){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            console.log(response);
            callback(jsonResponse);
        }
    };
    xhr.open('GET', url);
    // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    xhr.setRequestHeader("Authorization", `Bearer ${options.token}`);
    xhr.send();
}

ChatDrawer.ajaxCall = function(val, callback, options){
    const url = options.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query`
    : `${options.domain}/api/v1/chata/query?key=${options.apiKey}`

    const data = {
        text: val,
        customer_id: options.customerId,
        user_id: options.demo ? 'widget-demo' : options.userId || 'widget-user',
        debug: options.debug
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.demo){
        // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", `Bearer ${options.token}`);
    }
    xhr.send(JSON.stringify(data));
}

ChatDrawer.ajaxCallPost = function(url, callback, data, options){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Origin","*");
    if(!options.demo){
        xmlhttp.setRequestHeader("Authorization", `Bearer ${options.token}`);
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4){
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            callback(jsonResponse);
        }
    };
    xmlhttp.send(JSON.stringify(data));
}

ChatDrawer.ajaxCallAutoComplete = function(url, callback){

    ChatDrawer.xhr.onreadystatechange = function() {
        if (ChatDrawer.xhr.readyState === 4){
            var jsonResponse = JSON.parse(ChatDrawer.xhr.responseText);
            callback(jsonResponse);
        }
    };
    ChatDrawer.xhr.open('GET', url);
    ChatDrawer.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    // ChatDrawer.xhr.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
    ChatDrawer.xhr.send();
}

ChatDrawer.autocomplete = function(suggestion, suggestionList, liClass='suggestion', styles){
    const URL = `https://backend-staging.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
        suggestion)}&projectid=${ChatDrawer.options.projectId}`;

    ChatDrawer.ajaxCallAutoComplete(URL, function(jsonResponse){
        suggestionList.innerHTML = '';
        if(jsonResponse['matches'].length > 0){
            for(var [key, value] of Object.entries(styles)){
                suggestionList.style.setProperty(key, value, '');
            }
            for (var i = jsonResponse['matches'].length-1; i >= 0; i--) {
                var li = document.createElement('li');
                li.classList.add(liClass);
                li.textContent = jsonResponse['matches'][i];
                suggestionList.appendChild(li);
            }
            suggestionList.style.display = 'block';
        }else{
            suggestionList.style.display = 'none';
        }
    });
}

ChatDrawer.htmlToElement = function(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

ChatDrawer.createHelpContent = function(link){
    return `
    Great news, I can help with that:
    <br/>
    <button onclick="window.open('${link}', '_blank')" class="chata-help-link-btn">
    ${HELP_ICON}
    Bar chart 2</button>
    `;
}

ChatDrawer.putHelpMessage = function(jsonResponse){
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');

    messageBubble.innerHTML = ChatDrawer.createHelpContent(jsonResponse['data']['rows'][0]);
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
}

ChatDrawer.putSafetynetMessage = function(suggestionArray){
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');

    messageBubble.append(createSafetynetContent(suggestionArray));
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
}

ChatDrawer.sendMessage = function(chataInput, textValue){
    chataInput.disabled = true;
    var responseLoadingContainer = ChatDrawer.putMessage(textValue);
    // const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
    //   textValue
    // )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;

    const URL_SAFETYNET = ChatDrawer.options.demo
      ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
        textValue
      )}&projectId=1`
      : `${ChatDrawer.options.domain}/api/v1/chata/safetynet?query=${encodeURIComponent(
        textValue
      )}&key=${ChatDrawer.options.apiKey}&customer_id=${ChatDrawer.options.customerId}&user_id=${ChatDrawer.options.userId}`


    // ChatDrawer.safetynetCall(URL_SAFETYNET, function(jsonResponse){
    //     if(jsonResponse['full_suggestion'].length > 0 && ChatDrawer.options.enableSafetyNet){
    //         chataInput.removeAttribute("disabled");
    //         ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
    //
    //         var suggestionArray = createSuggestionArray(jsonResponse);
    //         ChatDrawer.putSafetynetMessage(suggestionArray);
    //     }else{
    //
    //     }
    // }, ChatDrawer.options);


    ChatDrawer.ajaxCall(textValue, function(jsonResponse){
        chataInput.removeAttribute("disabled");
        ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
        console.log(jsonResponse['data']['display_type']);
        switch(jsonResponse['data']['display_type']){
            case 'suggestion':
                ChatDrawer.putSuggestionResponse(jsonResponse, textValue);
            break;
            case 'table':
                if(jsonResponse['data']['columns'].length == 1){
                    ChatDrawer.putSimpleResponse(jsonResponse);
                }else{
                    ChatDrawer.putTableResponse(jsonResponse);
                }
            break;
            case 'compare_table':
                ChatDrawer.putTableResponse(jsonResponse);
            break;
            case 'date_pivot':
                ChatDrawer.putTableResponse(jsonResponse);
            break;
            case 'pivot_column':
                ChatDrawer.putTableResponse(jsonResponse);
            break;
            case 'line':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                var values = formatDataToBarChart(jsonResponse);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);

                createLineChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'line');
            break;
            case 'bar':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                var values = formatDataToBarChart(jsonResponse);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);

                createBarChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'bar');
            break;
            case 'word_cloud':
                ChatDrawer.putTableResponse(jsonResponse);
            break;
            case 'stacked_column':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                ChatDrawer.refreshToolbarButtons(component, 'stacked_column');
                var data = cloneObject(jsonResponse['data']['rows']);

                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                groups = groups.sort().reverse();
                for (var i = 0; i < data.length; i++) {
                    data[i][1] = formatData(data[i][1], jsonResponse['data']['columns'][1]['type']);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], jsonResponse['data']['columns'][1]['type'])
                }
                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);
                var col3 = formatColumnName(jsonResponse['data']['columns'][2]['name']);
                var dataGrouped = ChatDrawer.format3dData(jsonResponse['data']['columns'], data, groups);
                createStackedColumnChart(component, dataGrouped, groups, subgroups, col1, col2, col3, ChatDrawer.options);
            break;
            case 'stacked_bar':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                ChatDrawer.refreshToolbarButtons(component, 'stacked_bar');
                var data = cloneObject(jsonResponse['data']['rows']);

                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                groups = groups.sort().reverse();
                for (var i = 0; i < data.length; i++) {
                    data[i][1] = formatData(data[i][1], jsonResponse['data']['columns'][1]['type']);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], jsonResponse['data']['columns'][1]['type'])
                }
                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);
                var col3 = formatColumnName(jsonResponse['data']['columns'][2]['name']);
                var dataGrouped = ChatDrawer.format3dData(jsonResponse['data']['columns'], data, groups);
                createStackedBarChart(component, dataGrouped, groups, subgroups, col1, col2, col3, ChatDrawer.options);
            break;
            case 'bubble':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                var values = formatDataToHeatmap(jsonResponse);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, jsonResponse['data']['columns'][0]['type']);
                labelsX = formatLabels(labelsX, jsonResponse['data']['columns'][1]['type']);

                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);
                var col3 = formatColumnName(jsonResponse['data']['columns'][2]['name']);
                createHeatmap(component, labelsX, labelsY, values, col1, col2, col3, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'bubble');
            break;
            case 'heatmap':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                var values = formatDataToHeatmap(jsonResponse);
                var labelsX = ChatDrawer.getUniqueValues(values, row => row.unformatX);
                var labelsY = ChatDrawer.getUniqueValues(values, row => row.unformatY);
                labelsY = formatLabels(labelsY, jsonResponse['data']['columns'][0]['type']);
                labelsX = formatLabels(labelsX, jsonResponse['data']['columns'][1]['type']);

                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);
                var col3 = formatColumnName(jsonResponse['data']['columns'][2]['name']);
                createHeatmap(component, labelsX, labelsY, values, col1, col2, col3, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'heatmap');
            break;
            case 'pie':
                ChatDrawer.putTableResponse(jsonResponse);
            break;
            case 'column':
                var component = ChatDrawer.putTableResponse(jsonResponse);
                var values = formatDataToBarChart(jsonResponse);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var col1 = formatColumnName(jsonResponse['data']['columns'][0]['name']);
                var col2 = formatColumnName(jsonResponse['data']['columns'][1]['name']);

                createColumnChart(component, grouped, col1, col2, hasNegativeValues, ChatDrawer.options);
                ChatDrawer.refreshToolbarButtons(component, 'column');
            break;
            case 'help':
                ChatDrawer.putHelpMessage(jsonResponse);
            break;
            default:
                // temporary
                jsonResponse['data'] = 'Error: There was no data supplied for this table';
                ChatDrawer.putSimpleResponse(jsonResponse);
        }
        ChatDrawer.checkMaxMessages();
        refreshTooltips();
    }, ChatDrawer.options);

    chataInput.value = '';
}

ChatDrawer.putSimpleResponse = function(jsonResponse){
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    var idRequest = uuidv4();
    ChatDrawer.responses[idRequest] = jsonResponse;
    containerMessage.setAttribute('data-containerid', idRequest);
    messageBubble.classList.add('chat-message-bubble');
    toolbarButtons = ChatDrawer.getActionButtons(idRequest, 'simple');
    messageBubble.innerHTML = `
    <div class="chat-message-toolbar right">
        ${toolbarButtons}
    </div>`;
    var value = formatData(
        jsonResponse['data']['rows'][0][0],
        jsonResponse['data']['columns'][0]['type'],
        ChatDrawer.options.languageCode,
        ChatDrawer.options.currencyCode
    );
    messageBubble.appendChild(document.createTextNode(value));
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
}

ChatDrawer.getActionButtons = function(idRequest, type){
    var tooltipContent = ChatDrawer.responses[idRequest]['data']['interpretation'];

    if(type == 'simple'){
        return `
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>`;
    }else if (type == 'csvCopy'){
        return `
        <button class="chata-toolbar-btn filter-table" data-tippy-content="Filter Table" data-id="${idRequest}">
            ${FILTER_TABLE}
        </button>
        <button class="chata-toolbar-btn clipboard" data-tippy-content="Copy to Clipboard" data-id="${idRequest}">
            ${CLIPBOARD_ICON}
        </button>
        <button class="chata-toolbar-btn csv" data-tippy-content="Download as CSV" data-id="${idRequest}">
            ${DOWNLOAD_CSV_ICON}
        </button>
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>
        `;
    }else{
        return `
        <button class="chata-toolbar-btn export_png" data-tippy-content="Download as PNG" data-id="${idRequest}">
            ${EXPORT_PNG_ICON}
        </button>
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>
        `;
    }
}

ChatDrawer.getSupportedDisplayTypesArray = function(){
    return getSupportedDisplayTypesArray();
}

ChatDrawer.getSupportedDisplayTypes = function(idRequest, ignore){
    var json = ChatDrawer.responses[idRequest];
    var buttons = '';
    var displayTypes;
    if(json['data']['columns'].length == 2 || DISPLAY_TYPES_2D.includes(json['data']['display_type'])){
        // buttons += ChatDrawer.getTableButton(idRequest);
        // buttons += ChatDrawer.getColumnChartButton(idRequest);
        // buttons += ChatDrawer.getBarChartButton(idRequest);
        // buttons += ChatDrawer.getLineChartButton(idRequest);
        displayTypes = DISPLAY_TYPES_2D;
    }
    else if(json['data']['columns'].length == 3){
        // buttons += ChatDrawer.getTableButton(idRequest);
        // buttons += ChatDrawer.getPivotTableButton(idRequest);
        // buttons += ChatDrawer.getHeatmapChartButton(idRequest);
        // buttons += ChatDrawer.getBubbleChartButton(idRequest);
        // buttons += ChatDrawer.getStackedColumnChartButton(idRequest);
        // buttons += ChatDrawer.getStackedBarChartButton(idRequest);
        displayTypes = DISPLAY_TYPES_3D;
    }else{
        displayTypes = ['table'];
    }
    for (var i = 0; i < displayTypes.length; i++) {
        if(displayTypes[i] == ignore)continue;
        if(displayTypes[i] == 'table'){
            buttons += ChatDrawer.getTableButton(idRequest);
        }
        if(displayTypes[i] == 'column'){
            buttons += ChatDrawer.getColumnChartButton(idRequest);
        }
        if(displayTypes[i] == 'bar'){
            buttons += ChatDrawer.getBarChartButton(idRequest);
        }
        if(displayTypes[i] == 'pie'){

        }
        if(displayTypes[i] == 'line'){
            buttons += ChatDrawer.getLineChartButton(idRequest);
        }
        if(displayTypes[i] == 'date_pivot' || displayTypes[i] == 'pivot_column'){
            buttons += ChatDrawer.getPivotTableButton(idRequest);
        }
        if(displayTypes[i] == 'heatmap'){
            buttons += ChatDrawer.getHeatmapChartButton(idRequest);
        }
        if(displayTypes[i] == 'bubble'){
            buttons += ChatDrawer.getBubbleChartButton(idRequest);
        }
        if(displayTypes[i] == 'stacked_column'){
            buttons += ChatDrawer.getStackedColumnChartButton(idRequest);
        }
        if(displayTypes[i] == 'stacked_bar'){
            buttons += ChatDrawer.getStackedBarChartButton(idRequest);
        }
    }
    return buttons;
}

ChatDrawer.getTableButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn table" data-tippy-content="Table" data-id="${idRequest}">
        ${TABLE_ICON}
    </button>`;
}

ChatDrawer.getPivotTableButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn pivot_table" data-tippy-content="Pivot Table" data-id="${idRequest}">
        ${PIVOT_ICON}
    </button>
    `;
}

ChatDrawer.getColumnChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn column_chart" data-tippy-content="Column Chart" data-id="${idRequest}">
        ${COLUMN_CHART_ICON}
    </button>
    `;
}

ChatDrawer.getBarChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn bar_chart" data-tippy-content="Bar Chart" data-id="${idRequest}">
        ${BAR_CHART_ICON}
    </button>
    `;
}

ChatDrawer.getLineChartButton = function(idRequest) {
    return `
    <button class="chata-toolbar-btn line_chart" data-tippy-content="Line Chart" data-id="${idRequest}">
        ${LINE_CHART_ICON}
    </button>
    `;
}

ChatDrawer.getHeatmapChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn heatmap" data-tippy-content="Heatmap" data-id="${idRequest}">
        ${HEATMAP_ICON}
    </button>
    `;
}

ChatDrawer.getBubbleChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn bubble_chart" data-tippy-content="Bubble Chart" data-id="${idRequest}">
        ${BUBBLE_CHART_ICON}
    </button>
    `;
}

ChatDrawer.getStackedColumnChartButton = function(idRequest){
    return `<button class="chata-toolbar-btn stacked_column_chart" data-tippy-content="Stacked Column Chart" data-id="${idRequest}">
        ${STACKED_COLUMN_CHART_ICON}
    </button>`;
}

ChatDrawer.getStackedBarChartButton = function(idRequest){
    return `<button class="chata-toolbar-btn stacked_bar_chart" data-tippy-content="Stacked Bar Chart" data-id="${idRequest}">
        ${STACKED_BAR_CHART_ICON}
    </button>`;
}

ChatDrawer.putTableResponse = function(jsonResponse){
    var data = jsonResponse['data']['rows'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var tableContainer = document.createElement('div');
    var table = document.createElement('table');
    var header = document.createElement('tr');
    var groupField = getGroupableField(jsonResponse);
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');
    var idRequest = uuidv4();
    ChatDrawer.responses[idRequest] = jsonResponse;
    var supportedDisplayTypes = ChatDrawer.getSupportedDisplayTypes(idRequest, 'table');
    var actions = ChatDrawer.getActionButtons(idRequest, 'csvCopy');
    var toolbar = '';
    if(supportedDisplayTypes != ''){
        toolbar += `
        <div class="chat-message-toolbar left">
            ${supportedDisplayTypes}
        </div>
        `
    }
    toolbar += `
        <div class="chat-message-toolbar right">
            ${actions}
        </div>`;

    messageBubble.innerHTML = toolbar;
    tableContainer.classList.add('chata-table-container');
    responseContentContainer.classList.add('chata-response-content-container');
    table.classList.add('table-response');
    table.setAttribute('data-componentid', idRequest);
    var dataLines = jsonResponse['data']['rows'];

    for (var i = 0; i < jsonResponse['data']['columns'].length; i++) {
        var colName = formatColumnName(jsonResponse['data']['columns'][i]['name']);
        var th = document.createElement('th');
        var arrow = document.createElement('div');
        var col = document .createElement('div');
        col.textContent = colName;
        arrow.classList.add('tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column');
        col.setAttribute('data-type', jsonResponse['data']['columns'][i]['type']);
        col.setAttribute('data-index', i);
        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        filter.classList.add('filter-input');
        filter.setAttribute('data-dataid', idRequest);
        filter.setAttribute('data-inputindex', i);
        filter.onkeyup = function(event){
            var _table = document.querySelector(`[data-componentid='${idRequest}']`);
            var rows = applyFilter(idRequest);
            ChatDrawer.refreshTableData(_table, cloneObject(rows), ChatDrawer.options, false);
        }
        col.appendChild(divFilter);
        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
    }
    table.appendChild(header);

    for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i];
        var tr = document.createElement('tr');
        for (var x = 0; x < data.length; x++) {
            value = formatData(
                data[x], jsonResponse['data']['columns'][x]['type'],
                ChatDrawer.options.languageCode,
                ChatDrawer.options.currencyCode
            );
            var td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        }
        if(typeof groupField !== 'number'){
            tr.setAttribute('data-indexrow', i);
        }
        table.appendChild(tr);
    }
    tableContainer.appendChild(table);
    responseContentContainer.appendChild(tableContainer);
    messageBubble.appendChild(responseContentContainer);
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    return table;
}

ChatDrawer.createSuggestions = function(responseContentContainer, data, classButton='chata-suggestion-btn'){
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement('div');
        var button = document.createElement('button');
        button.classList.add(classButton);
        button.textContent = data[i][0];
        div.appendChild(button);
        responseContentContainer.appendChild(div);
    }
}

ChatDrawer.putSuggestionResponse = function(jsonResponse, query){
    var data = jsonResponse['data']['rows'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');
    responseContentContainer.classList.add('chata-response-content-container');
    responseContentContainer.innerHTML = `<div>I'm not sure what you mean by <strong>"${query}"</strong>. Did you mean:</div>`;
    ChatDrawer.createSuggestions(responseContentContainer, data);
    messageBubble.appendChild(responseContentContainer);
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
}

ChatDrawer.checkMaxMessages = function(){
    if(ChatDrawer.options.maxMessages > 2){
        var messages = ChatDrawer.drawerContent.querySelectorAll('.chat-single-message-container');
        if(messages.length > ChatDrawer.options.maxMessages){
            messages[1].parentNode.removeChild(messages[1]);
        }
    }
}

ChatDrawer.putMessage = function(value){
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseLoadingContainer = document.createElement('div');
    var responseLoading = document.createElement('div');

    responseLoadingContainer.classList.add('response-loading-container');
    responseLoading.classList.add('response-loading');
    for (var i = 0; i <= 3; i++) {
        responseLoading.appendChild(document.createElement('div'));
    }

    responseLoadingContainer.appendChild(responseLoading);

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('request');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.textContent = value;
    containerMessage.appendChild(messageBubble);
    ChatDrawer.drawerContent.appendChild(containerMessage);
    ChatDrawer.drawerContent.appendChild(responseLoadingContainer);
    ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    ChatDrawer.checkMaxMessages();
    return responseLoadingContainer;
}
