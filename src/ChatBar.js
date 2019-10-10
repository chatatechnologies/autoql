function getChatBar(options){

    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('chata-bar-container');
    chataBarContainer.classList.add('chat-drawer-chat-bar');
    chataBarContainer.classList.add('autosuggest-top');
    chataBarContainer.options = {
        token: '',
        apiKey: '',
        customerId: '',
        userId: '',
        domain: '',
        isDisabled: false,
        onSubmit: function(){},
        onResponseCallback: function(){},
        autoCompletePlacement: 'top',
        showLoadingDots: true,
        showChataIcon: true,
        enableVoiceRecord: true,
        enableAutocomplete: true,
        autocompleteStyles: {},
        enableSafetyNet: true,
        enableDrilldowns: true,
        demo: false
    }

    for (var [key, value] of Object.entries(options)) {
        chataBarContainer.options[key] = value;
    }
    const CHATA_ICON = chataBarContainer.options.showChataIcon ? `
    <div class="chat-bar-input-icon">${CHATA_BUBBLES_ICON}</div>
    ` : '';

    var disabled = chataBarContainer.options.isDisabled ? 'disabled' : '';

    chataBarContainer.innerHTML = `
    <div class="chat-bar-text">
        <div class="chat-bar-auto-complete-suggestions ${chataBarContainer.options.autoCompletePlacement}">
            <ul class="chat-bar-autocomplete">
            </ul>
        </div>
        ${CHATA_ICON}
        <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input-renderer chat-bar left-padding" placeholder="Ask me anything" value="" id="" ${disabled}>
    </div>
    `;

    chataBarContainer.chatbar = chataBarContainer.getElementsByClassName('chata-input-renderer')[0];
    chataBarContainer.bind = function(responseRenderer){
        this.responseRenderer = responseRenderer;
        responseRenderer.chataBarContainer = chataBarContainer;
    }

    chataBarContainer.onkeyup = function(){
        if(chataBarContainer.options.enableAutocomplete){
            var suggestionList = this.getElementsByClassName('chat-bar-autocomplete')[0];
            suggestionList.style.display = 'none';
            if(event.target.value){
                ChatDrawer.autocomplete(event.target.value, suggestionList, 'suggestion-renderer', chataBarContainer.options.autocompleteStyles);
            }
        }
    }

    chataBarContainer.onkeypress = function(event){
        var suggestionList = event.target.parentElement.getElementsByClassName('chat-bar-autocomplete')[0];
        suggestionList.style.display = 'none';
        if(event.keyCode == 13 && event.target.value){
            try {
                ChatDrawer.xhr.onreadystatechange = null;
                ChatDrawer.xhr.abort();
            } catch (e) {}
            this.sendMessageToResponseRenderer(chataBarContainer.chatbar.value);
        }
    }

    chataBarContainer.sendMessageToResponseRenderer = function(value){
        chataBarContainer.options.onSubmit();
        var responseRenderer = this.responseRenderer;
        var parent = this.getElementsByClassName('chat-bar-text')[0];
        this.chatbar.disabled = true;
        this.chatbar.value = '';
        if(this.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }
        const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
          value
        )}&projectId=${ChatDrawer.options.projectId}&unified_query_id=${uuidv4()}`;
        const URL = `https://backend-staging.chata.ai/api/v1/query?q=${value}&project=1&unified_query_id=${uuidv4()}`;

        ChatDrawer.ajaxCall(URL_SAFETYNET, function(jsonResponse){
            if(jsonResponse['full_suggestion'].length && chataBarContainer.options.enableSafetyNet){
                responseRenderer.innerHTML = '';
                chataBarContainer.chatbar.removeAttribute("disabled");
                if(chataBarContainer.options.showLoadingDots){
                    parent.removeChild(responseLoadingContainer);
                }
                var suggestionArray = createSuggestionArray(jsonResponse);
                var node = createSafetynetContent(suggestionArray, 'ChatBar');
                responseRenderer.appendChild(node);
                chataBarContainer.options.onResponseCallback();
                ChatDrawer.responses[responseRenderer.dataset.componentid] = jsonResponse;
            }else{
                ChatDrawer.ajaxCall(URL, function(jsonResponse){
                    ChatDrawer.responses[responseRenderer.dataset.componentid] = jsonResponse;
                    responseRenderer.innerHTML = '';
                    chataBarContainer.chatbar.removeAttribute("disabled");
                    if(chataBarContainer.options.showLoadingDots){
                        parent.removeChild(responseLoadingContainer);
                    }
                    switch(jsonResponse['display_type']){
                        case 'suggestion':
                            if(responseRenderer.options.supportsSuggestions){
                                var data = csvTo2dArray(jsonResponse['data']);
                                responseRenderer.innerHTML = `<div>I'm not sure what you mean by <strong>"${value}"</strong>. Did you mean:</div>`;
                                ChatDrawer.createSuggestions(responseRenderer, data, 'chata-suggestion-btn-renderer');
                            }else{
                                responseRenderer.innerHTML = `<div>Error: There was no data supplied for this table</div>`;
                            }
                        break;
                        case 'table':
                            var uuid = uuidv4();
                            ChatDrawer.responses[uuid] = jsonResponse;
                            var div = document.createElement('div');
                            div.classList.add('chata-table-container');
                            div.classList.add('chata-table-container-renderer');
                            responseRenderer.appendChild(div);
                            if(jsonResponse['columns'].length == 1){
                                var data = jsonResponse['data'];
                                responseRenderer.innerHTML = `<div>${data}</div>`;
                            }else{
                                var table = createTable(jsonResponse, div, 'append', uuid, 'table-response-renderer');
                                table.classList.add('renderer-table');
                            }
                        break;
                        case 'date_pivot':
                            var uuid = uuidv4();
                            ChatDrawer.responses[uuid] = jsonResponse;
                            var div = document.createElement('div');
                            div.classList.add('chata-table-container');
                            div.classList.add('chata-table-container-renderer');
                            responseRenderer.appendChild(div);
                            var pivotArray = getDatePivotArray(jsonResponse);
                            var table = createPivotTable(pivotArray, div, 'append', uuid, 'table-response-renderer');
                            table.classList.add('renderer-table');
                        break;
                        case 'pivot_column':
                            var uuid = uuidv4();
                            ChatDrawer.responses[uuid] = jsonResponse;
                            var div = document.createElement('div');
                            div.classList.add('chata-table-container');
                            div.classList.add('chata-table-container-renderer');
                            responseRenderer.appendChild(div);
                            var pivotArray = getPivotColumnArray(jsonResponse);
                            var table = createPivotTable(pivotArray, div, 'append', '', 'table-response-renderer');
                            table.classList.add('renderer-table');
                        break;
                        case 'line':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var hasNegativeValues = values[1];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            createLineChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer', responseRenderer.options.renderTooltips);
                        break;
                        case 'bar':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var hasNegativeValues = values[1];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            createBarChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer', responseRenderer.options.renderTooltips);
                        break;
                        case 'column':
                            var values = formatDataToBarChart(jsonResponse);
                            var grouped = values[0];
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var hasNegativeValues = values[1];
                            createColumnChart(responseRenderer, grouped, col1, col2, hasNegativeValues, false, 'data-chartrenderer', responseRenderer.options.renderTooltips);
                        break;
                        case 'heatmap':
                            var values = formatDataToHeatmap(jsonResponse);
                            var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                            var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var col3 = formatColumnName(jsonResponse['columns'][2]['name']);
                            createHeatmap(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false, 'data-chartrenderer', responseRenderer.options.renderTooltips);
                        break;
                        case 'bubble':
                            var values = formatDataToHeatmap(jsonResponse);
                            var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                            var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                            var col1 = formatColumnName(jsonResponse['columns'][0]['name']);
                            var col2 = formatColumnName(jsonResponse['columns'][1]['name']);
                            var col3 = formatColumnName(jsonResponse['columns'][2]['name']);
                            createBubbleChart(responseRenderer, labelsX, labelsY, values, col1, col2, col3, false, 'data-chartrenderer', responseRenderer.options.renderTooltips);
                        break;
                        case 'help':
                            responseRenderer.innerHTML = ChatDrawer.createHelpContent(jsonResponse['data']);
                        break;
                        default:
                            responseRenderer.innerHTML = `<div>Error: There was no data supplied for this table</div>`;
                    }
                    chataBarContainer.options.onResponseCallback();
                });
            }
        });
    }

    return chataBarContainer;
}
