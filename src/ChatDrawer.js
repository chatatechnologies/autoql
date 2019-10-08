var ChatDrawer = {
    options: {
        projectId: 1,
        token: undefined,
        apiKey: '',
        customerId: '',
        userId: '',
        isVisible: false,
        placement: 'right',
        width: 500,
        height: 350,
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
        demo: false
    },
    responses: [],
    xhr: new XMLHttpRequest()
};

(function(document, window, ChatDrawer, undefined) {

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
        ChatDrawer.openDrawer();
        ChatDrawer.closeDrawer();

        if(ChatDrawer.options.isVisible){
            ChatDrawer.openDrawer();
        }else{
            ChatDrawer.closeDrawer();
        }
        const themeStyles = ChatDrawer.options.theme === 'light' ? LIGHT_THEME : DARK_THEME
        if ('accentColor' in options){
            themeStyles['--chata-drawer-accent-color'] = options.accentColor;
        }
        for (let property in themeStyles) {
            console.log(themeStyles[property]);

            document.documentElement.style.setProperty(
                property,
                themeStyles[property],
            );
        }
        return this;
    }

    ChatDrawer.getChatBar = function(options={}){
        return getChatBar(options);
    }

    ChatDrawer.createResponseRenderer = function(){
        var responseContentContainer = document.createElement('div')
        responseContentContainer.classList.add('chata-response-content-container');
        responseContentContainer.classList.add('renderer-container');
        responseContentContainer.setAttribute('data-componentid', uuidv4());
        return responseContentContainer;
    }

    ChatDrawer.createBar = function(){
        var chataBarContainer = document.createElement('div');
        chataBarContainer.classList.add('chata-bar-container');
        chataBarContainer.classList.add('chat-drawer-chat-bar');
        chataBarContainer.classList.add('autosuggest-top');
        var htmlBar = `
        <div class="watermark">
            <svg x="0px" y="0px" width="14px" height="13px" viewBox="0 0 16 14"><path class="chata-icon-svg-0" d="M15.1,13.5c0,0-0.5-0.3-0.5-1.7V9.6c0-1.9-1.1-3.7-2.9-4.4C11.5,5.1,11.3,5,11,5c-0.1-0.3-0.2-0.5-0.3-0.7l0,0
                C9.9,2.5,8.2,1.4,6.3,1.4c0,0,0,0-0.1,0C5,1.4,3.8,1.9,2.8,2.8C1.9,3.6,1.4,4.8,1.4,6.1c0,0.1,0,0.1,0,0.2v2.2
                c0,1.3-0.4,1.7-0.4,1.7h0l-1,0.7l1.2,0.1c0.8,0,1.7-0.2,2.3-0.7c0.2,0.2,0.5,0.3,0.8,0.4c0.2,0.1,0.5,0.2,0.8,0.2
                c0.1,0.2,0.1,0.5,0.2,0.7c0.8,1.7,2.5,2.8,4.4,2.8c0,0,0.1,0,0.1,0c1,0,2-0.3,2.7-0.7c0.7,0.5,1.6,0.8,2.4,0.7l1.1-0.1L15.1,13.5z
                M10.4,6.2c0,0.9-0.3,1.8-0.9,2.5C9.2,9,8.9,9.3,8.6,9.5C8.3,9.6,8.1,9.7,7.9,9.8C7.6,9.9,7.3,10,7.1,10c-0.3,0.1-0.6,0.1-0.8,0.1
                c-0.1,0-0.3,0-0.4,0c0,0-0.1,0-0.1,0c0,0,0-0.1,0-0.1c0-0.1,0-0.2,0-0.4c0-0.8,0.2-1.6,0.7-2.2C6.5,7.2,6.7,7,6.9,6.8
                C7,6.7,7.1,6.6,7.2,6.5c0.2-0.2,0.4-0.3,0.7-0.4C8.1,6,8.3,5.9,8.6,5.8C9,5.7,9.4,5.6,9.8,5.6c0.1,0,0.3,0,0.4,0c0,0,0.1,0,0.1,0
                C10.4,5.8,10.4,6,10.4,6.2z M3.8,9.3L3.5,9.1L3.2,9.3C2.9,9.7,2.4,9.9,2,10c0.1-0.4,0.2-0.8,0.2-1.5l0-2.2c0,0,0-0.1,0-0.1
                c0-1.1,0.5-2,1.2-2.8c0.7-0.7,1.7-1.1,2.7-1.1c0,0,0.1,0,0.1,0c1.6,0,3.1,0.9,3.8,2.3c0,0.1,0.1,0.2,0.1,0.3c-0.1,0-0.2,0-0.3,0
                c-0.5,0-1,0.1-1.5,0.2C8.1,5.1,7.8,5.2,7.5,5.4C7.2,5.5,6.9,5.7,6.7,5.9C6.6,6,6.4,6.1,6.3,6.2C6.1,6.4,5.9,6.7,5.7,6.9
                C5.2,7.7,4.9,8.6,4.9,9.6c0,0.1,0,0.2,0,0.3c-0.1,0-0.2-0.1-0.3-0.1C4.3,9.7,4,9.5,3.8,9.3z M12.8,12.7l-0.3-0.3l-0.3,0.3
                c-0.5,0.5-1.4,0.8-2.4,0.8c-1.6,0.1-3.1-0.9-3.8-2.3c0-0.1-0.1-0.2-0.1-0.3c0.1,0,0.2,0,0.3,0c0.3,0,0.7,0,1-0.1
                c0.3-0.1,0.6-0.1,0.9-0.3c0.3-0.1,0.6-0.3,0.8-0.4C9.4,9.9,9.7,9.6,10,9.2c0.7-0.8,1.1-1.9,1.1-3c0-0.1,0-0.3,0-0.4
                c0.1,0,0.2,0.1,0.3,0.1c1.5,0.6,2.4,2.1,2.4,3.7v2.2c0,0.7,0.1,1.2,0.3,1.6C13.6,13.3,13.2,13.1,12.8,12.7z"></path>
            </svg>
            We run on Chata
        </div>
        <div class="auto-complete-suggestions">
            <ul id="auto-complete-list">
            </ul>
        </div>
        <div class="text-bar">
            <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input" placeholder="Ask me anything" value="" id="chata-input">
            <button id="chata-voice-record-button" class="chat-voice-record-button" data-tip="Hold to Use Voice" data-for="chata-speech-to-text-tooltip" data-tip-disable="false" currentitem="false"><img class="chat-voice-record-icon" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgd2lkdGg9IjU0NC4ycHgiIGhlaWdodD0iNTQ0LjJweCIgdmlld0JveD0iMCAwIDU0NC4yIDU0NC4yIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1NDQuMiA1NDQuMiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTQzOS41LDIwOS4zYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0MC4zLTE0LjMsNzQuOC00MywxMDMuNQoJYy0yOC43LDI4LjctNjMuMiw0My0xMDMuNSw0M2MtNDAuMywwLTc0LjgtMTQuMy0xMDMuNS00M2MtMjguNy0yOC43LTQzLTYzLjItNDMtMTAzLjV2LTQxLjljMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4yYy01LjcsMC0xMC42LDIuMS0xNC43LDYuMmMtNC4xLDQuMS02LjIsOS4xLTYuMiwxNC43djQxLjljMCw0OC4yLDE2LjEsOTAuMSw0OC4yLDEyNS43CgljMzIuMiwzNS43LDcxLjksNTYuMSwxMTkuMiw2MS4zdjQzLjJoLTgzLjdjLTUuNywwLTEwLjYsMi4xLTE0LjcsNi4yYy00LjEsNC4xLTYuMiw5LTYuMiwxNC43YzAsNS43LDIuMSwxMC42LDYuMiwxNC43CgljNC4xLDQuMSw5LDYuMiwxNC43LDYuMmgyMDkuM2M1LjcsMCwxMC42LTIuMSwxNC43LTYuMmM0LjEtNC4xLDYuMi05LjEsNi4yLTE0LjdjMC01LjctMi4xLTEwLjYtNi4yLTE0LjcKCWMtNC4xLTQuMS05LjEtNi4yLTE0LjctNi4ySDI5M3YtNDMuMmM0Ny4zLTUuMiw4Ny0yNS43LDExOS4yLTYxLjNjMzIuMi0zNS42LDQ4LjItNzcuNiw0OC4yLTEyNS43di00MS45YzAtNS43LTIuMS0xMC42LTYuMi0xNC43CglDNDUwLjEsMjExLjQsNDQ1LjIsMjA5LjMsNDM5LjUsMjA5LjN6Ii8+CjxwYXRoIGNsYXNzPSJtaWMtaWNvbiIgZmlsbD0iI0ZGRkZGRiIgZD0iTTIyMi44LDIwMy43aC01NS4zdjM4LjRoNTUuM2M4LjUsMCwxNS4zLDYuOCwxNS4zLDE1LjNzLTYuOCwxNS4zLTE1LjMsMTUuM2gtNTUuMwoJYzAuMiwyOC41LDEwLjQsNTIuOSwzMC43LDczLjNjMjAuNSwyMC41LDQ1LjEsMzAuNyw3My45LDMwLjdjMjguOCwwLDUzLjQtMTAuMiw3My45LTMwLjdjMjAuMy0yMC4zLDMwLjYtNDQuOCwzMC43LTczLjNoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My40di0zOC40aC01My40Yy04LjUsMC0xNS4zLTYuOC0xNS4zLTE1LjNzNi44LTE1LjMsMTUuMy0xNS4zaDUzLjR2LTQwLjhoLTUzLjQKCWMtOC41LDAtMTUuMy02LjgtMTUuMy0xNS4zczYuOC0xNS4zLDE1LjMtMTUuM2g1My4zYy0wLjctMjcuNS0xMC44LTUxLjItMzAuNi03MUMzMjUuNSwxMC4yLDMwMC45LDAsMjcyLjEsMAoJYy0yOC44LDAtNTMuNCwxMC4yLTczLjksMzAuN2MtMTkuOCwxOS44LTI5LjksNDMuNS0zMC42LDcxaDU1LjJjOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zcy02LjgsMTUuMy0xNS4zLDE1LjNoLTU1LjN2NDAuOGg1NS4zCgljOC41LDAsMTUuMyw2LjgsMTUuMywxNS4zUzIzMS4yLDIwMy43LDIyMi44LDIwMy43eiIvPgo8L3N2Zz4=" alt="speech to text button" height="22px" width="22px" draggable="false">
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
                <button class="chata-button close close-action" data-tip="Close Drawer" data-for="chata-header-tooltip" currentitem="false"><svg class="close-action" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="close-action" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>
            </div>
            <div class="chata-header-center-container">
                ${ChatDrawer.options.title}
            </div>
            <div class="chata-header-right-container">
                <button class="chata-button clear-all" data-tip="Clear Messages" data-for="chata-header-tooltip" currentitem="false"><svg class="clear-all" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="clear-all" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path></svg></button>
            </div>`;
        chatHeaderContainer.classList.add('chat-header-container');
        chatHeaderContainer.innerHTML = htmlHeader;

        ChatDrawer.rootElem.appendChild(chatHeaderContainer);
    }

    ChatDrawer.sendDrilldownMessage = function(json, indexData, context='ChatDrawer', responseRenderer=null){
        var value = csvTo2dArray(json['data'])[parseInt(indexData)][0]
        var colData = json['columns'][0]['name'];
        var col = formatColumnName(colData);
        const URL = `https://backend-staging.chata.ai/api/v1/query${
            ChatDrawer.options.projectId === 1 ? '/demo' : ''
        }/drilldown?&project=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
        var data = {
            id: json['query_id'],
        }
        var obj = {};
        obj[colData] = value;
        data['group_bys'] = obj;
        var msg = `Drill down on ${col} "${value}"`;
        if(context == 'ChatDrawer'){
            var responseLoadingContainer = ChatDrawer.putMessage(msg);
            ChatDrawer.ajaxCallPost(URL, function(response){
                ChatDrawer.putTableResponse(response);
                ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
            }, data);
        }else{
            ChatDrawer.ajaxCallPost(URL, function(response){
                responseRenderer.innerHTML = '';
                var uuid = uuidv4();
                ChatDrawer.responses[uuid] = response;
                var div = document.createElement('div');
                div.classList.add('chata-table-container');
                div.classList.add('chata-table-container-renderer');
                responseRenderer.appendChild(div);
                if(response['columns'].length == 1){
                    var data = response['data'];
                    responseRenderer.innerHTML = `<div>${data}</div>`;
                }else{
                    createTable(response, div, 'append', uuid, 'table-response-renderer');
                }
                console.log(msg);
            }, data);
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
                    ChatDrawer.sendDrilldownMessage(json, indexData);
                }
                if(e.target.hasAttribute('data-chartindex')){
                    var component = e.target.parentElement.parentElement.parentElement;
                    if(component.tagName == 'svg'){
                        component = component.parentElement;
                    }
                    var json = ChatDrawer.responses[component.dataset.componentid];
                    var indexData = e.target.dataset.chartindex;
                    ChatDrawer.sendDrilldownMessage(json, indexData);
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
                    ChatDrawer.sendDrilldownMessage(json, indexData, 'ChatBar', component);
                }
            }
            if(e.target.parentElement.hasAttribute('data-indexrowrenderer')){
                var component = e.target.parentElement.parentElement;
                var responseRenderer = component.parentElement.parentElement;
                if(responseRenderer.chataBarContainer.options.enableDrilldowns){
                    var json = ChatDrawer.responses[component.dataset.componentid];
                    var indexData = e.target.parentElement.dataset.indexrowrenderer;
                    ChatDrawer.sendDrilldownMessage(json, indexData, 'ChatBar', responseRenderer);
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
                    if(ChatDrawer.options.showMask && ChatDrawer.options.maskClosable){
                        ChatDrawer.options.onMaskClick();
                    }
                }

                if(e.target.classList.contains('close-action')){
                    ChatDrawer.closeDrawer();
                }
                if(e.target.classList.contains('open-action')){
                    ChatDrawer.openDrawer();
                    ChatDrawer.options.onHandleClick();
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
                        var sortData = ChatDrawer.sort(tableElement, 'desc', e.target.dataset.index, e.target.dataset.type);
                        ChatDrawer.refreshTableData(tableElement, sortData);
                    }else{
                        e.target.nextSibling.classList.remove('down');
                        e.target.nextSibling.classList.add('up');
                        var sortData = ChatDrawer.sort(tableElement, 'asc', parseInt(e.target.dataset.index), e.target.dataset.type);
                        ChatDrawer.refreshTableData(tableElement, sortData);
                    }
                }
                if(e.target.classList.contains('column-pivot')){
                    var tableElement = e.target.parentElement.parentElement.parentElement;
                    var pivotArray = [];
                    var json = ChatDrawer.responses[tableElement.dataset.componentid];
                    if(json['display_type'] == 'date_pivot'){
                        pivotArray = getDatePivotArray(json);
                    }else{
                        pivotArray = getPivotColumnArray(json);
                    }
                    if(e.target.nextSibling.classList.contains('up')){
                        e.target.nextSibling.classList.remove('up');
                        e.target.nextSibling.classList.add('down');
                        var sortData = sortPivot(pivotArray, e.target.dataset.index, 'desc');
                        ChatDrawer.refreshPivotTable(tableElement, sortData);
                    }else{
                        e.target.nextSibling.classList.remove('down');
                        e.target.nextSibling.classList.add('up');
                        var sortData = sortPivot(pivotArray, e.target.dataset.index, 'asc');
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
                    ChatDrawer.refreshToolbarButtons(component, 'date_pivot');
                    if(json['display_type'] == 'date_pivot'){
                        var pivotArray = getDatePivotArray(json);
                        createPivotTable(pivotArray, component);
                    }else{
                        var pivotArray = getPivotColumnArray(json);
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
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var col1 = formatColumnName(json['columns'][0]['name']);
                    var col2 = formatColumnName(json['columns'][1]['name']);
                    var hasNegativeValues = values[1];
                    createColumnChart(component, grouped, col1, col2, hasNegativeValues);
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
                    createTable(json, component);
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
                    var groupableField = getGroupableField(json);
                    var values = formatDataToBarChart(json);
                    var grouped = values[0];
                    var hasNegativeValues = values[1];
                    var col1 = formatColumnName(json['columns'][0]['name']);
                    var col2 = formatColumnName(json['columns'][1]['name']);

                    createBarChart(component, grouped, col1, col2, hasNegativeValues);
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
                    var col1 = formatColumnName(json['columns'][0]['name']);
                    var col2 = formatColumnName(json['columns'][1]['name']);

                    createLineChart(component, grouped, col1, col2, hasNegativeValues);
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
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);

                    var col1 = formatColumnName(json['columns'][0]['name']);
                    var col2 = formatColumnName(json['columns'][1]['name']);
                    var col3 = formatColumnName(json['columns'][2]['name']);


                    createHeatmap(component, labelsX, labelsY, values, col1, col2, col3);
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
                    var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                    var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);

                    var col1 = formatColumnName(json['columns'][0]['name']);
                    var col2 = formatColumnName(json['columns'][1]['name']);
                    var col3 = formatColumnName(json['columns'][2]['name']);


                    createBubbleChart(component, labelsX, labelsY, values, col1, col2, col3);
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
                    var svgString = ChatDrawer.getSVGString(svg);
                    ChatDrawer.svgString2Image( svgString, 2*component.clientWidth, 2*component.clientHeight);
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

    formatDataToHeatmap = function(json){
        var lines = csvTo2dArray(json['data']);
        var values = [];
        var colType1 = json['columns'][0]['type'];
        var colType2 = json['columns'][1]['type'];
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i];
            var row = {};
            row['labelY'] = formatData(data[0], colType1);
            row['labelX'] = formatData(data[1], colType2);
            var value = parseFloat(data[2]);
            row['value'] = value;
            values.push(row);
        }
        return values;
    }

    formatDataToBarChart = function(json){
        var lines = csvTo2dArray(json['data']);
        var values = [];
        var colType1 = json['columns'][0]['type'];
        var hasNegativeValues = false;
        // var colType2 = json['columns'][1]['type'];
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i];
            var row = {};
            row['label'] = formatData(data[0], colType1);
            var value = parseFloat(data[1]);
            if(value < 0 && !hasNegativeValues){
                hasNegativeValues = true;
            }
            row['value'] = value;


            values.push(row);
        }
        return [values, hasNegativeValues];
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
    }

    ChatDrawer.sort = function(component, operator, colIndex, colType){
        var json = ChatDrawer.responses[component.dataset.componentid];
        var lines = csvTo2dArray(json['data']);
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
        for (var i = 1; i < rows.length; i++) {
            var tdList = rows[i].childNodes;
            for (var x = 0; x < tdList.length; x++) {
                tdList[x].textContent = pivotArray[i-1][x];
            }
        }
    }

    ChatDrawer.refreshTableData = function(table, newData){
        var rows = table.childNodes;
        var cols = ChatDrawer.responses[table.dataset.componentid]['columns'];
        for (var i = 1; i < rows.length; i++) {
            var tdList = rows[i].childNodes;
            for (var x = 0; x < tdList.length; x++) {
                tdList[x].textContent = formatData(newData[i-1][x], cols[x]['type']);
            }
        }
    }

    ChatDrawer.createCsvData = function(json, separator=','){
        var output = '';
        var lines = csvTo2dArray(json['data']);
        for(var i = 0; i<json['columns'].length; i++){
            var colName = formatColumnName(json['columns'][i]['name']);
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
        ChatDrawer.wrapper.style.opacity = 0;
        ChatDrawer.wrapper.style.height = 0;

        if(ChatDrawer.options.placement == 'right'){
            ChatDrawer.rootElem.style.transform = 'translateX('+ ChatDrawer.options.width +'px)';
            ChatDrawer.rootElem.right = 0;
            ChatDrawer.rootElem.top = 0;
            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'left'){
            ChatDrawer.rootElem.style.transform = 'translateX(-'+ ChatDrawer.options.width +'px)';
            ChatDrawer.rootElem.left = 0;
            ChatDrawer.rootElem.top = 0;
            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'bottom'){
            ChatDrawer.rootElem.style.transform = 'translateY('+ ChatDrawer.options.height +'px)';
            ChatDrawer.rootElem.style.bottom = '0';

            if(ChatDrawer.options.showHandle){
                ChatDrawer.drawerButton.style.display = 'flex';
            }
        }else if(ChatDrawer.options.placement == 'top'){
            ChatDrawer.rootElem.style.transform = 'translateY(-'+ ChatDrawer.options.height +'px)';
            ChatDrawer.rootElem.style.top = '0';

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
        if(ChatDrawer.options.showMask){
            ChatDrawer.wrapper.style.opacity = .3;
            ChatDrawer.wrapper.style.height = '100%';
        }
        if(ChatDrawer.options.placement == 'right'){
            ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
            ChatDrawer.rootElem.style.transform = 'translateX(0px)';
            ChatDrawer.drawerButton.style.display = 'none';
            ChatDrawer.rootElem.style.right = 0;
            ChatDrawer.rootElem.style.top = 0;
        }else if(ChatDrawer.options.placement == 'left'){
            ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
            ChatDrawer.rootElem.style.left = 0;
            ChatDrawer.rootElem.style.top = 0;
            ChatDrawer.rootElem.style.transform = 'translateX(0px)';
            ChatDrawer.drawerButton.style.display = 'none';
        }else if(ChatDrawer.options.placement == 'bottom'){
            ChatDrawer.rootElem.style.width = '100%';
            ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
            ChatDrawer.rootElem.style.bottom = 0;
            ChatDrawer.rootElem.style.transform = 'translateY(0)';
            ChatDrawer.drawerButton.style.display = 'none';
        }else if(ChatDrawer.options.placement == 'top'){
            ChatDrawer.rootElem.style.width = '100%';
            ChatDrawer.rootElem.style.height = ChatDrawer.options.height + 'px';
            ChatDrawer.rootElem.style.top = 0;
            ChatDrawer.rootElem.style.transform = 'translateY(0)';
            ChatDrawer.drawerButton.style.display = 'none';
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
        var drawerIcon = document.createElement("img");
        drawerIcon.setAttribute("src", "chata-bubles.svg");
        drawerIcon.setAttribute("alt", "chata.ai");
        drawerIcon.setAttribute("height", "22px");
        drawerIcon.setAttribute("width", "22px");
        drawerIcon.classList.add('chata-bubbles-icon');
        drawerIcon.classList.add('open-action');
        drawerButton.classList.add('drawer-handle');
        drawerButton.classList.add('open-action');
        drawerButton.classList.add(ChatDrawer.options.placement + '-btn');
        drawerButton.appendChild(drawerIcon);
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

    ChatDrawer.ajaxCall = function(url, callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4){
                var jsonResponse = JSON.parse(xhr.responseText);
                callback(jsonResponse);
            }
        };
        xhr.open('GET', url);
        xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
        xhr.send();
    }

    ChatDrawer.ajaxCallPost = function(url, callback, data){
        var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.setRequestHeader("Access-Control-Allow-Origin","*");
        xmlhttp.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
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
        ChatDrawer.xhr.setRequestHeader("Authorization", ChatDrawer.options.token ? `Bearer ${ChatDrawer.options.token}` : undefined);
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
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    ChatDrawer.createSafetynetContent = function(suggestionArray, context='ChatDrawer'){
        const message = `
        Before I can try to find your answer,
        I need your help understanding a term you used that I don't see in your data.
        Click the dropdown to view suggestions so I can ensure you get the right data!`;
        const safetyDeleteButtonHtml = `
        <svg onclick="deleteSuggestion(event)" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="chata-safety-net-delete-button" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M331.3 308.7L278.6 256l52.7-52.7c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-52.7-52.7c-6.2-6.2-15.6-7.1-22.6 0-7.1 7.1-6 16.6 0 22.6l52.7 52.7-52.7 52.7c-6.7 6.7-6.4 16.3 0 22.6 6.4 6.4 16.4 6.2 22.6 0l52.7-52.7 52.7 52.7c6.2 6.2 16.4 6.2 22.6 0 6.3-6.2 6.3-16.4 0-22.6z"></path><path d="M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"></path></svg>
        `;
        const runQueryButtonHtml = `
        <button class="chata-safety-net-execute-btn" onclick="runQuery(event, '${context}')"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="chata-execute-query-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>Run Query</button>
        `
        const runQueryButton = ChatDrawer.htmlToElement(runQueryButtonHtml);
        var responseContentContainer = document.createElement('div');
        responseContentContainer.classList.add('chata-response-content-container');
        responseContentContainer.innerHTML = `<span>${message}</span><br/><br/>`;
        for (var i = 0; i < suggestionArray.length; i++) {
            var suggestion = suggestionArray[i];
            console.log(suggestion);
            if(suggestion['type'] == 'word'){
                var span = document.createElement('span');
                span.textContent = ' ' + suggestion['word'] + ' ';
                span.classList.add('safetynet-value');
                responseContentContainer.append(span);
            }else{
                var div = document.createElement('div');
                var select = document.createElement('select');
                select.classList.add('chata-safetynet-select');
                select.style.width = '47px';
                div.classList.add('chata-safety-net-selector-container');

                var suggestionList = suggestion['suggestionList'];
                for (var x = 0; x < suggestionList.length; x++) {
                    var option = document.createElement('option');
                    option.setAttribute('value', suggestionList[x]['text']);
                    option.textContent = suggestionList[x]['text'];
                    select.appendChild(option);
                }
                var safetyDeleteButton = ChatDrawer.htmlToElement(safetyDeleteButtonHtml);
                var o = document.createElement('option');
                o.setAttribute('value', suggestion['word']);
                o.textContent = suggestion['word'];
                select.appendChild(o);
                select.classList.add('safetynet-value');
                div.appendChild(select);
                div.appendChild(safetyDeleteButton);
                responseContentContainer.appendChild(div);
            }
        }
        responseContentContainer.appendChild(runQueryButton);
        return responseContentContainer;
    }

    ChatDrawer.createHelpContent = function(link){
        return `
        Great news, I can help with that:
        <br/>
        <button onclick="window.open('${link}', '_blank')" class="chata-help-link-btn"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="chata-help-link-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 48h-.7c-55.4.2-107.4 21.9-146.6 61.1C69.6 148.4 48 200.5 48 256s21.6 107.6 60.8 146.9c39.1 39.2 91.2 60.9 146.6 61.1h.7c114.7 0 208-93.3 208-208S370.7 48 256 48zm180.2 194h-77.6c-.9-26.7-4.2-52.2-9.8-76.2 17.1-5.5 33.7-12.5 49.7-21 22 28.2 35 61.6 37.7 97.2zM242 242h-61.8c.8-24.5 3.8-47.7 8.8-69.1 17.4 3.9 35.1 6.3 53 7.1v62zm0 28v61.9c-17.8.8-35.6 3.2-53 7.1-5-21.4-8-44.6-8.8-69H242zm28 0h61.3c-.8 24.4-3.8 47.6-8.8 68.9-17.2-3.9-34.8-6.2-52.5-7V270zm0-28v-62c17.8-.8 35.4-3.2 52.5-7 5 21.4 8 44.5 8.8 69H270zm109.4-117.9c-12.3 6.1-25 11.3-38 15.5-7.1-21.4-16.1-39.9-26.5-54.5 24 8.3 45.9 21.6 64.5 39zM315 146.8c-14.7 3.2-29.8 5.2-45 6V79.4c17 9.2 33.6 33.9 45 67.4zM242 79v73.7c-15.4-.8-30.6-2.8-45.5-6.1 11.6-33.8 28.4-58.5 45.5-67.6zm-45.6 6.4c-10.3 14.5-19.2 32.9-26.3 54.1-12.8-4.2-25.4-9.4-37.5-15.4 18.4-17.3 40.1-30.5 63.8-38.7zm-82.9 59.5c15.8 8.4 32.3 15.4 49.2 20.8-5.7 23.9-9 49.5-9.8 76.2h-77c2.6-35.4 15.6-68.8 37.6-97zM75.8 270h77c.9 26.7 4.2 52.3 9.8 76.2-16.9 5.5-33.4 12.5-49.2 20.8-21.9-28.1-34.9-61.5-37.6-97zm56.7 117.9c12.1-6 24.7-11.2 37.6-15.4 7.1 21.3 16 39.6 26.3 54.2-23.7-8.4-45.4-21.5-63.9-38.8zm64-22.6c14.9-3.3 30.2-5.3 45.5-6.1V433c-17.2-9.1-33.9-33.9-45.5-67.7zm73.5 67.3v-73.5c15.2.8 30.3 2.8 45 6-11.4 33.6-28 58.3-45 67.5zm45-5.7c10.4-14.6 19.4-33.1 26.5-54.5 13 4.2 25.8 9.5 38 15.6-18.6 17.3-40.6 30.6-64.5 38.9zm83.5-59.8c-16-8.5-32.6-15.5-49.7-21 5.6-23.9 8.9-49.4 9.8-76.1h77.6c-2.7 35.5-15.6 68.9-37.7 97.1z"></path></svg>Bar chart 2</button>
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

        messageBubble.innerHTML = ChatDrawer.createHelpContent(jsonResponse['data']);
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

        messageBubble.append(ChatDrawer.createSafetynetContent(suggestionArray));
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.createSuggestionArray = function(jsonResponse){
        var fullSuggestion = jsonResponse['full_suggestion'];
        var query = jsonResponse['query'];
        var words = query.split(' ');
        var suggestionArray = [];
        for (var i = 0; i < words.length; i++) {
            var w = words[i];
            var hasSuggestion = false;
            for (var x = 0; x < fullSuggestion.length; x++) {
                var start = fullSuggestion[x]['start'];
                var end = fullSuggestion[x]['end'];
                var word = query.slice(start, end);
                if(word == w){
                    suggestionArray.push({
                        word: word,
                        type: 'suggestion',
                        suggestionList: fullSuggestion[x]['suggestion_list']
                    })
                    hasSuggestion = true;
                    break;
                }
            }
            if(!hasSuggestion){
                suggestionArray.push({
                    'word': w,
                    'type': 'word',
                    suggestionList: []
                });
            }
        }
        return suggestionArray;
    }

    ChatDrawer.sendMessage = function(chataInput, textValue){
        chataInput.disabled = true;
        var responseLoadingContainer = ChatDrawer.putMessage(textValue);
        const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
          textValue
        )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
        const URL = `https://backend-staging.chata.ai/api/v1/query?q=${textValue}&project=1&unified_query_id=${uuidv4()}`;

        ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
            if(jsonResponse['full_suggestion'].length > 0 && ChatDrawer.options.enableSafetyNet){
                chataInput.removeAttribute("disabled");
                ChatDrawer.drawerContent.removeChild(responseLoadingContainer);

                var suggestionArray = ChatDrawer.createSuggestionArray(jsonResponse);
                ChatDrawer.putSafetynetMessage(suggestionArray);
            }else{
                ChatDrawer.ajaxCall(URL, function(jsonResponse){
                    console.log(jsonResponse['display_type']);
                    chataInput.removeAttribute("disabled");
                    ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
                    switch(jsonResponse['display_type']){
                        case 'suggestion':
                            ChatDrawer.putSuggestionResponse(jsonResponse, textValue);
                        break;
                        case 'table':
                            if(jsonResponse['columns'].length == 1){
                                ChatDrawer.putSimpleResponse(jsonResponse);
                            }else{
                                ChatDrawer.putTableResponse(jsonResponse);
                            }
                        break;
                        case 'date_pivot':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'pivot_column':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'line':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'bar':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'word_cloud':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'stacked_column':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'bubble':
                            ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'heatmap':
                        ChatDrawer.putTableResponse(jsonResponse);
                        break;
                        case 'help':
                            console.log(jsonResponse);
                            ChatDrawer.putHelpMessage(jsonResponse);
                        break;
                        default:
                            // temporary
                            jsonResponse['data'] = 'Error: There was no data supplied for this table';
                            ChatDrawer.putSimpleResponse(jsonResponse);
                    }
                    ChatDrawer.checkMaxMessages();
                });

            }
        });
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
        messageBubble.innerHTML = `
        <div class="chat-message-toolbar right">
            <button class="chata-toolbar-btn clipboard" data-id="${idRequest}">
                <svg stroke="currentColor" class="clipboard" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path class="clipboard" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
                    </path>
                </svg>
            </button>
            <button class="chata-toolbar-btn csv" data-id="${idRequest}">
                <svg stroke="currentColor" class="csv" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="csv"></path>
                </svg>
            </button>
        </div>`;

        messageBubble.appendChild(document.createTextNode(jsonResponse['data']));
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.getSVGString = function( svgNode ) {
        svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');

        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
        svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');

        return svgString;
    }


    ChatDrawer.svgString2Image = function(svgString, width, height) {
        var imgsrc = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svgString)));

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;


        var image = new Image();
        image.onload = function() {
            context.clearRect ( 0, 0, width, height );
            context.drawImage(image, 0, 0, width, height);
            var imgPixels = context.getImageData(0, 0, canvas.width, canvas.height);
            for(var y = 0; y < imgPixels.height; y++){
                for(var x = 0; x < imgPixels.width; x++){
                    var i = (y * 4) * imgPixels.width + x * 4;
                    imgPixels.data[i] = 0;
                    imgPixels.data[i + 1] = 0;
                    imgPixels.data[i + 2] = 0;
                }
            }
            context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);

            var link = document.createElement("a");
            link.setAttribute('href', canvas.toDataURL("image/png;base64"));
            link.setAttribute('download', 'Chart.png');
            link.click();
        };


        image.src = imgsrc;
    }

    ChatDrawer.getActionButtons = function(idRequest, type){
        if (type == 'csvCopy'){
            return `
            <button class="chata-toolbar-btn clipboard" data-id="${idRequest}">
                <svg stroke="currentColor" class="clipboard" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path class="clipboard" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
                    </path>
                </svg>
            </button>
            <button class="chata-toolbar-btn csv" data-id="${idRequest}">
                <svg stroke="currentColor" class="csv" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="csv"></path>
                </svg>
            </button>
            `;
        }else{
            return `
            <button class="chata-toolbar-btn export_png" data-id="${idRequest}">
                <svg stroke="currentColor" class="export_png" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" class="export_png"></path>
                </svg>
            </button>
            `;
        }
    }

    ChatDrawer.getSupportedDisplayTypes = function(idRequest, ignore){
        var json = ChatDrawer.responses[idRequest];
        var buttons = '';
        for (var i = 0; i < json['supported_display_types'].length; i++) {
            if(json['supported_display_types'][i] == ignore)continue;
            if(json['supported_display_types'][i] == 'table'){
                buttons += ChatDrawer.getTableButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'column'){
                buttons += ChatDrawer.getColumnChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'bar'){
                buttons += ChatDrawer.getBarChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'pie'){

            }
            if(json['supported_display_types'][i] == 'line' && json['display_type'] != 'pivot_column'){
                buttons += ChatDrawer.getLineChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'date_pivot' || json['supported_display_types'][i] == 'pivot_column'){
                buttons += ChatDrawer.getPivotTableButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'heatmap'){
                buttons += ChatDrawer.getHeatmapChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'bubble'){
                buttons += ChatDrawer.getBubbleChartButton(idRequest);
            }
        }
        return buttons;
    }

    ChatDrawer.getTableButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn table" data-tip="Table" data-id="${idRequest}">
            <svg class="table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 table" d="M8,0.8c2.3,0,4.6,0,6.9,0c0.8,0,1.1,0.3,1.1,1.1c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.8,5.7,0.8,8,0.8L8,0.8z M5,11.1H1v2.7h4V11.1L5,11.1z M10,13.8v-2.7H6v2.7
                    L10,13.8L10,13.8z M11,13.8h4v-2.7h-4V13.8L11,13.8z M1.1,7.5v2.7h4V7.5H1.1L1.1,7.5z M11,10.2c1.3,0,2.5,0,3.8,0
                    c0.1,0,0.2-0.1,0.2-0.2c0-0.8,0-1.7,0-2.5h-4C11,8.4,11,9.3,11,10.2L11,10.2z M6,10.1h4V7.5H6V10.1L6,10.1z M5,6.6V3.9H1
                    c0,0.8,0,1.6,0,2.4c0,0.1,0.2,0.2,0.3,0.2C2.5,6.6,3.7,6.6,5,6.6L5,6.6z M6,6.5h4V3.9H6V6.5L6,6.5z M14.9,6.5V3.9h-4v2.7L14.9,6.5
                    L14.9,6.5z">
                </path>
            </svg>
        </button>`;
    }

    ChatDrawer.getPivotTableButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn pivot_table" data-tip="Pivot Table" data-id="${idRequest}">
            <svg class="pivot_table" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="pivot_table chart-icon-svg-0" d="M8,0.7c2.3,0,4.6,0,6.9,0C15.7,0.7,16,1,16,1.8c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0 c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.7,5.7,0.7,8,0.7L8,0.7z M5.1,6.4h4.4V3.8H5.1V6.4L5.1,6.4z M14.9,6.4V3.8 h-4.4v2.7L14.9,6.4L14.9,6.4z M5.1,10.1h4.4V7.4H5.1V10.1L5.1,10.1z M14.9,10.1V7.4h-4.4v2.7H14.9L14.9,10.1z M5.1,13.7h4.4V11H5.1 V13.7L5.1,13.7z M14.9,13.7V11h-4.4v2.7L14.9,13.7L14.9,13.7z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getColumnChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn column_chart" data-tip="Column Chart" data-id="${idRequest}">
            <svg class="column_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 column_chart" d="M12.6,0h-2.4C9.4,0,8.8,0.6,8.8,1.4v2.7c0,0,0,0,0,0H6.3c-0.8,0-1.4,0.6-1.4,1.4v3.2c0,0-0.1,0-0.1,0H2.4 C1.6,8.7,1,9.4,1,10.1v4.5C1,15.4,1.6,16,2.4,16h2.4c0,0,0.1,0,0.1,0h1.3c0,0,0.1,0,0.1,0h2.4c0,0,0.1,0,0.1,0H10c0,0,0.1,0,0.1,0 h2.4c0.8,0,1.4-0.6,1.4-1.4V1.4C14,0.6,13.3,0,12.6,0z M6.3,5.5h2.4v9.1H6.3V5.5z M2.4,10.1h2.4v4.5H2.4V10.1z M12.6,14.6h-2.4V1.4 h2.4V14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getBarChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn bar_chart" data-tip="Bar Chart" data-id="${idRequest}">
            <svg class="bar_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 bar_chart" d="M14.6,1.6H1.4C0.6,1.6,0,2.2,0,3v2.4v0.1v1.2v0.1v2.4v0.1v1.3v0.1v2.4c0,0.8,0.6,1.4,1.4,1.4h4.5 c0.7,0,1.4-0.6,1.4-1.4v-2.4v-0.1h3.2c0.8,0,1.4-0.6,1.4-1.4V6.7l0,0h2.7c0.8,0,1.4-0.6,1.4-1.4V2.9C16,2.2,15.4,1.5,14.6,1.6z M1.4,9.2V6.8h9.1v2.4H1.4z M1.4,13.1v-2.4h4.5v2.4H1.4z M14.6,2.9v2.4H1.4V2.9H14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getLineChartButton = function(idRequest) {
        return `
        <button class="chata-toolbar-btn line_chart" data-tip="Line Chart" data-id="${idRequest}">
            <svg class="line_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                <path class="chart-icon-svg-0 line_chart" d="M1,12.2c-0.2,0-0.3-0.1-0.5-0.2c-0.3-0.3-0.3-0.7,0-1l3.8-3.9C4.5,7,4.7,7,4.9,7s0.4,0.1,0.5,0.3l2.3,3l6.8-7.1 c0.3-0.3,0.7-0.3,1,0c0.3,0.3,0.3,0.7,0,1l-7.3,7.7C8,11.9,7.8,12,7.6,12s-0.4-0.1-0.5-0.3l-2.3-3L1.5,12C1.4,12.2,1.2,12.2,1,12.2z ">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getHeatmapChartButton = function(idRequest){
        return `
            <button class="chata-toolbar-btn heatmap" data-tip="Heatmap" data-id="${idRequest}">
                <svg class="heatmap" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                    <path class="hm0 heatmap" d="M12,16h2.5c0.8,0,1.5-0.7,1.5-1.5v-2.4l-4,0V16z">
                    </path>
                    <polygon class="hm1 heatmap" points="8,4.1 8,0 4,0 4,4.1 "></polygon>
                    <path class="hm2 heatmap" d="M4,4.1V0L1.5,0C0.7,0,0,0.7,0,1.5l0,2.6h0l0,0L4,4.1z"></path>
                    <polygon class="hm3 heatmap" points="8,4.1 8,4.1 8,4.1 4,4.1 4,8.1 8,8.2 "></polygon>
                    <polygon class="hm2 heatmap" points="0,4.1 0,8.1 4,8.1 4,4.1 "></polygon>
                    <polygon class="hm1 heatmap" points="4,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm1 heatmap" points="4,16 8,16 8,12.1 4,12.1 "></polygon>
                    <path class="hm0 heatmap" d="M0,12.1v2.5C0,15.3,0.7,16,1.5,16H4v-3.9L0,12.1z"></path>
                    <polygon class="hm0 heatmap" points="0,12.1 4,12.1 4,8.2 0,8.2 "></polygon>
                    <polygon class="hm4 heatmap" points="8,12.1 8,8.2 4,8.2 4,12.1 "></polygon>
                    <polygon class="hm2 heatmap" points="16,4.1 16,4.1 16,4.1 12,4.1 12,8.2 16,8.2 "></polygon>
                    <path class="hm0 heatmap" d="M16,4.1l0-2.6C16,0.7,15.3,0,14.5,0L12,0v4.1L16,4.1z"></path>
                    <polygon class="hm4 heatmap" points="12,4.1 12,0 8,0 8,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm5 heatmap" points="12,4.1 8,4.1 8,4.1 "></polygon>
                    <polygon class="hm6 heatmap" points="12,4.1 16,4.1 16,4.1 "></polygon>
                    <polygon class="hm2 heatmap" points="12,12.1 16,12.1 16,8.2 12,8.2 "></polygon>
                    <polygon class="hm1 heatmap" points="12,8.2 8,8.2 8,12.1 12,12.1 "></polygon>
                    <polygon class="hm1 heatmap" points="8,12.1 8,16 12,16 12,12.1 "></polygon>
                </svg>
            </button>
        `;
    }

    ChatDrawer.getBubbleChartButton = function(idRequest){
        return `
            <button class="chata-toolbar-btn bubble_chart" data-tip="Bubble Chart" data-id="${idRequest}">
                <svg class="bubble_chart" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16" stroke="currentColor" fill="currentColor" stroke-width="0" height="1em" width="1em">
                    <circle class="chart-icon-svg-0 bubble_chart" cx="7.7" cy="11.1" r="1.2"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="2.6" cy="8.8" r="2.6"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="11.7" cy="4.3" r="4.3"></circle>
                    <circle class="chart-icon-svg-0 bubble_chart" cx="1.8" cy="14.8" r="1.2"></circle>
                </svg>
            </button>
        `;
    }

    ChatDrawer.putTableResponse = function(jsonResponse){
        var data = csvTo2dArray(jsonResponse['data']);
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
        var dataLines = csvTo2dArray(jsonResponse['data']);
        // var dataLines = csvTo2dArray(jsonResponse['data']);

        for (var i = 0; i < jsonResponse['columns'].length; i++) {
            var colName = formatColumnName(jsonResponse['columns'][i]['name']);
            var th = document.createElement('th');
            var arrow = document.createElement('div');
            var col = document .createElement('div');
            col.textContent = colName;
            arrow.classList.add('tabulator-arrow');
            arrow.classList.add('up');
            col.classList.add('column');
            col.setAttribute('data-type', jsonResponse['columns'][i]['type']);
            col.setAttribute('data-index', i);

            th.appendChild(col);
            th.appendChild(arrow);
            header.appendChild(th);
        }
        table.appendChild(header);

        for (var i = 0; i < dataLines.length; i++) {
            var data = dataLines[i];
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                value = formatData(data[x], jsonResponse['columns'][x]['type']);
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
    }

    ChatDrawer.createSuggestions = function(responseContentContainer, data, classButton='chata-suggestion-btn'){
        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add(classButton);
            button.textContent = data[i];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
        }
    }

    ChatDrawer.putSuggestionResponse = function(jsonResponse, query){
        var data = csvTo2dArray(jsonResponse['data']);
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
        // <div class="chat-single-message-container request">
        //     <div class="chat-message-bubble">Janitorial expense</div>
        // </div>
        // <div class="chat-single-message-container full-width response">
        //     <div data-test="query-response-wrapper" class="chata-response-content-container chat-message-bubble">books are not closed</div>
        // </div>
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

})(document, window, ChatDrawer)
