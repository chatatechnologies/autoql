var ChatDrawer = {
    config: {
        projectId: 1,
        token: undefined
    },
    responses: []
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    // NOTE: this case only occurs in tests
    if(Number.isNaN(monthIndex)){
        year = '1969';
        day = '31';
        monthIndex = 11;
    }
    return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}
(function(document, window, ChatDrawer, undefined) {
    ChatDrawer.init = function(elem, options){
        var rootElem = document.getElementById(elem);
        ChatDrawer.rootElem = rootElem;
        ChatDrawer.options = options;
        rootElem.classList.add('chata-drawer');
        this.createHeader();
        this.createDrawerContent();
        this.createBar();
        this.createWrapper();
        this.createDrawerButton();
        this.registerEvents();
        if(ChatDrawer.options.isVisible){
            ChatDrawer.openDrawer();
        }else{
            ChatDrawer.closeDrawer();
        }
        return this;
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
        var customer = ChatDrawer.options.customerName || 'there!';
        chatMessageBubble.textContent = "Hi " + customer+ " I'm  here to help you access, search and analyze your data.";
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
                Chat with your data
            </div>
            <div class="chata-header-right-container">
                <button class="chata-button clear-all" data-tip="Clear Messages" data-for="chata-header-tooltip" currentitem="false"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path></svg></button>
            </div>`;
        chatHeaderContainer.classList.add('chat-header-container');
        chatHeaderContainer.innerHTML = htmlHeader;

        ChatDrawer.rootElem.appendChild(chatHeaderContainer);
    }

    ChatDrawer.registerEvents = function(){
        var chataInput = document.getElementById('chata-input');
        var suggestionList = document.getElementById('auto-complete-list');
        document.addEventListener('click',function(e){
            if(e.target){
                if(e.target.classList.contains('close-action')){
                    ChatDrawer.closeDrawer();
                }
                if(e.target.classList.contains('open-action')){
                    ChatDrawer.openDrawer();
                }
                if(e.target.classList.contains('suggestion')){
                    console.log(e.target.textContent);
                    suggestionList.style.display = 'none';
                    ChatDrawer.sendMessage(chataInput, e.target.textContent);
                }
                if(e.target.classList.contains('chata-suggestion-btn')){
                    ChatDrawer.sendMessage(chataInput, e.target.textContent);
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
            }
        });
        chataInput.onkeyup = function(){
            suggestionList.style.display = 'none';
            if(this.value){
                ChatDrawer.autocomplete(this.value, suggestionList);
            }
        }
        chataInput.onkeypress = function(event){
            if(event.keyCode == 13 && this.value){
                suggestionList.style.display = 'none';
                ChatDrawer.sendMessage(chataInput, this.value);
            }
        }
    }

    ChatDrawer.sort = function(table, operator, colIndex, colType){
        var json = ChatDrawer.responses[table.dataset.tableid];
        var lines = json['data'].split('\n');
        var values = []
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
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

    ChatDrawer.formatData = function(val, type){
        value = '';
        switch (type) {
            case 'DOLLAR_AMT':
                if(parseFloat(val) != 0){
                    value = '$' + val;
                }else{
                    value = val;
                }
            break;
            case 'DATE':
                value = formatDate(new Date( parseInt(val) * 1000 ) );
            break;
            default:
                value = val;
        }
        return value;
    }

    ChatDrawer.refreshTableData = function(table, newData){
        var rows = table.childNodes;
        var cols = ChatDrawer.responses[table.dataset.tableid]['columns'];
        for (var i = 1; i < rows.length; i++) {
            var tdList = rows[i].childNodes;
            for (var x = 0; x < tdList.length; x++) {
                tdList[x].textContent = ChatDrawer.formatData(newData[i-1][x], cols[x]['type']);
            }
            console.log(rows[i].nodeName);
        }
    }

    ChatDrawer.createCsvData = function(json, separator=','){
        var output = '';
        var lines = json['data'].split('\n');
        for(var i = 0; i<json['columns'].length; i++){
            var colName = json['columns'][i]['name'].replace(/__/g, ' ').replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
            output += colName + separator;
        }
        output += '\n';
        for (var i = 0; i < lines.length; i++) {
            var data = lines[i].split(',');
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
            ChatDrawer.rootElem.right = '0';
            ChatDrawer.rootElem.top = 0;
            ChatDrawer.drawerButton.style.display = 'flex';
        }
    }

    ChatDrawer.openDrawer = function(){
        ChatDrawer.wrapper.style.opacity = .3;
        ChatDrawer.wrapper.style.height = '100%';
        ChatDrawer.rootElem.style.width = ChatDrawer.options.width + 'px';
        ChatDrawer.rootElem.style.transform = 'translateX(0px)';
        ChatDrawer.drawerButton.style.display = 'none';
    }

    ChatDrawer.createWrapper = function(rootElem){
        var wrapper = document.createElement('div');
        var body = document.getElementsByTagName('body')[0];
        body.insertBefore(wrapper, rootElem);
        wrapper.setAttribute('id', 'drawer-wrapper');
        ChatDrawer.wrapper = wrapper;
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
        drawerButton.appendChild(drawerIcon);
        var body = document.getElementsByTagName('body')[0];
        body.insertBefore(drawerButton, rootElem);
        ChatDrawer.drawerButton = drawerButton;
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
        xhr.setRequestHeader("Authorization", ChatDrawer.config.token ? `Bearer ${ChatDrawer.config.token}` : undefined);
        xhr.send();
    }

    ChatDrawer.autocomplete = function(suggestion, suggestionList){
        const URL = `https://backend-staging.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
            suggestion)}&projectid=${ChatDrawer.config.projectId}`;

        ChatDrawer.ajaxCall(URL, function(jsonResponse){
            suggestionList.innerHTML = '';
            if(jsonResponse['matches'].length > 0){

                for (var i = jsonResponse['matches'].length-1; i >= 0; i--) {
                    var li = document.createElement('li');
                    li.classList.add('suggestion');
                    li.textContent = jsonResponse['matches'][i];
                    suggestionList.appendChild(li);
                }
                suggestionList.style.display = 'block';
            }else{
                suggestionList.style.display = 'none';
            }
        });
    }

    ChatDrawer.sendMessage = function(chataInput, textValue){
        chataInput.disabled = true;
        var responseLoadingContainer = ChatDrawer.putMessage(textValue);
        const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
          textValue
        )}&projectId=${ChatDrawer.config.projectId}&unified_query_id=${uuidv4()}`;
        const URL = `https://backend-staging.chata.ai/api/v1/query?q=${textValue}&project=1&unified_query_id=${uuidv4()}`;

        ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
            if(jsonResponse['full_suggestion'].length > 0){
                chataInput.removeAttribute("disabled");
                ChatDrawer.drawerContent.removeChild(responseLoadingContainer);
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
                    }
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
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.textContent = jsonResponse['data'];
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
    }

    ChatDrawer.getSupportedDisplayTypes = function(idRequest){
        var json = ChatDrawer.responses[idRequest];
        var buttons = '';
        for (var i = 0; i < json['supported_display_types'].length; i++) {
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
            if(json['supported_display_types'][i] == 'line'){
                buttons += ChatDrawer.getLineChartButton(idRequest);
            }
            if(json['supported_display_types'][i] == 'date_pivot'){
                buttons += ChatDrawer.getPivotTableButton(idRequest);
            }
        }
        return buttons;
    }

    ChatDrawer.getTableButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn" data-tip="Table" data-id="${idRequest}">
            <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                <path class="chart-icon-svg-0" d="M8,0.8c2.3,0,4.6,0,6.9,0c0.8,0,1.1,0.3,1.1,1.1c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.8,5.7,0.8,8,0.8L8,0.8z M5,11.1H1v2.7h4V11.1L5,11.1z M10,13.8v-2.7H6v2.7
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
        <button class="chata-toolbar-btn" data-tip="Pivot Table" data-id="${idRequest}">
            <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                <path class="chart-icon-svg-0" d="M8,0.7c2.3,0,4.6,0,6.9,0C15.7,0.7,16,1,16,1.8c0,4,0,7.9,0,11.9c0,0.8-0.3,1.1-1.1,1.1c-4.6,0-9.3,0-13.9,0 c-0.7,0-1-0.3-1-1c0-4,0-8,0-12c0-0.7,0.3-1,1-1C3.4,0.7,5.7,0.7,8,0.7L8,0.7z M5.1,6.4h4.4V3.8H5.1V6.4L5.1,6.4z M14.9,6.4V3.8 h-4.4v2.7L14.9,6.4L14.9,6.4z M5.1,10.1h4.4V7.4H5.1V10.1L5.1,10.1z M14.9,10.1V7.4h-4.4v2.7H14.9L14.9,10.1z M5.1,13.7h4.4V11H5.1 V13.7L5.1,13.7z M14.9,13.7V11h-4.4v2.7L14.9,13.7L14.9,13.7z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getColumnChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn" data-tip="Column Chart" data-id="${idRequest}">
            <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                <path class="chart-icon-svg-0" d="M12.6,0h-2.4C9.4,0,8.8,0.6,8.8,1.4v2.7c0,0,0,0,0,0H6.3c-0.8,0-1.4,0.6-1.4,1.4v3.2c0,0-0.1,0-0.1,0H2.4 C1.6,8.7,1,9.4,1,10.1v4.5C1,15.4,1.6,16,2.4,16h2.4c0,0,0.1,0,0.1,0h1.3c0,0,0.1,0,0.1,0h2.4c0,0,0.1,0,0.1,0H10c0,0,0.1,0,0.1,0 h2.4c0.8,0,1.4-0.6,1.4-1.4V1.4C14,0.6,13.3,0,12.6,0z M6.3,5.5h2.4v9.1H6.3V5.5z M2.4,10.1h2.4v4.5H2.4V10.1z M12.6,14.6h-2.4V1.4 h2.4V14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getBarChartButton = function(idRequest){
        return `
        <button class="chata-toolbar-btn" data-tip="Bar Chart" data-id="${idRequest}">
            <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                <path class="chart-icon-svg-0" d="M14.6,1.6H1.4C0.6,1.6,0,2.2,0,3v2.4v0.1v1.2v0.1v2.4v0.1v1.3v0.1v2.4c0,0.8,0.6,1.4,1.4,1.4h4.5 c0.7,0,1.4-0.6,1.4-1.4v-2.4v-0.1h3.2c0.8,0,1.4-0.6,1.4-1.4V6.7l0,0h2.7c0.8,0,1.4-0.6,1.4-1.4V2.9C16,2.2,15.4,1.5,14.6,1.6z M1.4,9.2V6.8h9.1v2.4H1.4z M1.4,13.1v-2.4h4.5v2.4H1.4z M14.6,2.9v2.4H1.4V2.9H14.6z">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.getLineChartButton = function(idRequest) {
        return `
        <button class="chata-toolbar-btn" data-tip="Line Chart" data-id="${idRequest}">
            <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
                <path class="chart-icon-svg-0" d="M1,12.2c-0.2,0-0.3-0.1-0.5-0.2c-0.3-0.3-0.3-0.7,0-1l3.8-3.9C4.5,7,4.7,7,4.9,7s0.4,0.1,0.5,0.3l2.3,3l6.8-7.1 c0.3-0.3,0.7-0.3,1,0c0.3,0.3,0.3,0.7,0,1l-7.3,7.7C8,11.9,7.8,12,7.6,12s-0.4-0.1-0.5-0.3l-2.3-3L1.5,12C1.4,12.2,1.2,12.2,1,12.2z ">
                </path>
            </svg>
        </button>
        `;
    }

    ChatDrawer.putTableResponse = function(jsonResponse){
        var data = jsonResponse['data'].split('\n');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var table = document.createElement('table');
        var header = document.createElement('tr');
        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('response');
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.classList.add('full-width');
        var idRequest = uuidv4();
        ChatDrawer.responses[idRequest] = jsonResponse;
        var supportedDisplayTypes = ChatDrawer.getSupportedDisplayTypes(idRequest);
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

        messageBubble.innerHTML = toolbar;
        tableContainer.classList.add('chata-table-container');
        responseContentContainer.classList.add('chata-response-content-container');
        table.classList.add('table-response');
        table.setAttribute('data-tableid', idRequest);
        var dataLines = jsonResponse['data'].split('\n');

        for (var i = 0; i < jsonResponse['columns'].length; i++) {
            var colName = jsonResponse['columns'][i]['name'].replace(/__/g, ' ').replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
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
            var data = dataLines[i].split(',');
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                value = ChatDrawer.formatData(data[x], jsonResponse['columns'][x]['type']);
                var td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
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

    ChatDrawer.putSuggestionResponse = function(jsonResponse, query){
        var data = jsonResponse['data'].split('\n');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        containerMessage.classList.add('chat-single-message-container');
        containerMessage.classList.add('response');
        messageBubble.classList.add('chat-message-bubble');
        messageBubble.classList.add('full-width');
        responseContentContainer.classList.add('chata-response-content-container');
        responseContentContainer.innerHTML = `<div>I'm not sure what you mean by <strong>"${query}"</strong>. Did you mean:</div>`;
        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add('chata-suggestion-btn');
            button.textContent = data[i];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
        }
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
        ChatDrawer.drawerContent.scrollTop = ChatDrawer.drawerContent.scrollHeight;
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
        return responseLoadingContainer;
    }

})(document, window, ChatDrawer)
