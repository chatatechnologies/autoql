var ChatDrawer = {
    config: {
        projectId: 1,
        token: undefined
    },
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
            }
        });
        chataInput.onkeyup = function(){
            suggestionList.style.display = 'none';
            if(this.value){
                ChatDrawer.autocomplete(this.value, suggestionList);
            }
        }
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
        tableContainer.classList.add('chata-table-container');
        responseContentContainer.classList.add('chata-response-content-container');
        table.classList.add('table-response');
        var dataLines = jsonResponse['data'].split('\n');

        for (var i = 0; i < jsonResponse['columns'].length; i++) {
            var colName = jsonResponse['columns'][i]['name'].replace(/__/g, ' ').replace(/_/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
            var th = document.createElement('th');
            th.textContent = colName;
            table.appendChild(th);
        }

        for (var i = 0; i < dataLines.length; i++) {
            var data = dataLines[i].split(',');
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                var td = document.createElement('td');
                td.textContent = data[x];
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        tableContainer.appendChild(table);
        responseContentContainer.appendChild(tableContainer);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        ChatDrawer.drawerContent.appendChild(containerMessage);
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
        return responseLoadingContainer;
    }

})(document, window, ChatDrawer)
