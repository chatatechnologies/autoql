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
        demo: true,
        fontFamily: 'sans-serif'
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

    chataBarContainer.style.setProperty(
        '--chata-drawer-font-family',
        chataBarContainer.options.fontFamily
    )

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
                ChatDrawer.autocomplete(event.target.value, suggestionList, 'suggestion-renderer', chataBarContainer.options);
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

        ChatDrawer.ajaxCall(value, function(jsonResponse){
            // jsonResponse['full_suggestion'].length
            if(1 == 2 && chataBarContainer.options.enableSafetyNet){
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
                ChatDrawer.ajaxCall(value, function(jsonResponse){
                    ChatDrawer.responses[responseRenderer.dataset.componentid] = jsonResponse;
                    responseRenderer.innerHTML = '';
                    chataBarContainer.chatbar.removeAttribute("disabled");
                    if(chataBarContainer.options.showLoadingDots){
                        parent.removeChild(responseLoadingContainer);
                    }
                    var sup = getSupportedDisplayTypes(jsonResponse);
                    if(sup.includes(responseRenderer.options.displayType)){
                        displayType = responseRenderer.options.displayType;
                    }else{
                        displayType = 'table';
                    }
                    if(jsonResponse['data']['display_type'] == 'suggestion' &&
                        responseRenderer.options.supportsSuggestions){
                        var data = jsonResponse['data']['rows'];
                        responseRenderer.innerHTML = `<div>I'm not sure what you mean by <strong>"${value}"</strong>. Did you mean:</div>`;
                        ChatDrawer.createSuggestions(responseRenderer, data, 'chata-suggestion-btn-renderer');
                    }else{
                        switch(displayType){
                            case 'table':
                                var uuid = uuidv4();
                                ChatDrawer.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                if(jsonResponse['data']['columns'].length == 1){
                                    var data = formatData(
                                        jsonResponse['data'],
                                        jsonResponse['data']['columns'][0],
                                        responseRenderer.options
                                    );
                                    responseRenderer.innerHTML = `<div>${data}</div>`;
                                }else{
                                    var table = createTable(jsonResponse, div, responseRenderer.options, 'append', uuid, 'table-response-renderer');
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
                                var pivotArray = getDatePivotArray(jsonResponse, responseRenderer.options);
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
                                var pivotArray = getPivotColumnArray(jsonResponse, responseRenderer.options);
                                var table = createPivotTable(pivotArray, div, 'append', '', 'table-response-renderer');
                                table.classList.add('renderer-table');
                            break;
                            case 'line':
                                var values = formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var hasNegativeValues = values[1];
                                var cols = jsonResponse['data']['columns'];
                                createLineChart(
                                    responseRenderer, grouped, cols,
                                    hasNegativeValues, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'bar':
                                var values = formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var hasNegativeValues = values[1];
                                var cols = jsonResponse['data']['columns'];
                                createBarChart(
                                    responseRenderer, grouped, cols,
                                    hasNegativeValues, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'column':
                                var values = formatDataToBarChart(jsonResponse);
                                var grouped = values[0];
                                var cols = jsonResponse['data']['columns'];
                                var hasNegativeValues = values[1];
                                createColumnChart(
                                    responseRenderer, grouped,cols,
                                    hasNegativeValues, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'heatmap':
                                var values = formatDataToHeatmap(
                                    jsonResponse, responseRenderer.options
                                );
                                var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                                var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                                var cols = jsonResponse['data']['columns'];

                                createHeatmap(
                                    responseRenderer, labelsX, labelsY,
                                    values, cols, responseRenderer.options,
                                    false, 'data-chartrenderer', responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'bubble':
                                var values = formatDataToHeatmap(
                                    jsonResponse, responseRenderer.options
                                );
                                var labelsX = ChatDrawer.getUniqueValues(values, row => row.labelX);
                                var labelsY = ChatDrawer.getUniqueValues(values, row => row.labelY);
                                var cols = jsonResponse['data']['columns'];
                                createBubbleChart(
                                    responseRenderer, labelsX, labelsY,
                                    values, cols, responseRenderer.options,
                                    false, 'data-chartrenderer', responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'help':
                                responseRenderer.innerHTML = ChatDrawer.createHelpContent(jsonResponse['data']);
                            break;
                            case 'stacked_bar':
                                var data = jsonResponse['data']['rows'];
                                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                                groups = groups.sort().reverse();
                                for (var i = 0; i < data.length; i++) {
                                    data[i][1] = formatData(
                                        data[i][1],
                                        jsonResponse['data']['columns'][1],
                                        responseRenderer.options
                                    );
                                }
                                for (var i = 0; i < groups.length; i++) {
                                    groups[i] = formatData(
                                        groups[i],
                                        jsonResponse['data']['columns'][1],
                                        responseRenderer.options
                                    )
                                }
                                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                                var cols = jsonResponse['data']['columns'];
                                var dataGrouped = ChatDrawer.format3dData(jsonResponse['data']['columns'], data, groups);
                                createStackedBarChart(
                                    responseRenderer, dataGrouped, groups,
                                    subgroups, cols,
                                    responseRenderer.options, false,
                                    'data-chartindex', responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'stacked_column':
                                var data = jsonResponse['data']['rows'];
                                var groups = ChatDrawer.getUniqueValues(data, row => row[1]);
                                groups = groups.sort().reverse();
                                for (var i = 0; i < data.length; i++) {
                                    data[i][1] = formatData(
                                        data[i][1],
                                        jsonResponse['data']['columns'][1],
                                        responseRenderer.options
                                    );
                                }
                                for (var i = 0; i < groups.length; i++) {
                                    groups[i] = formatData(
                                        groups[i],
                                        jsonResponse['data']['columns'][1],
                                        responseRenderer.options
                                    )
                                }
                                var subgroups = ChatDrawer.getUniqueValues(data, row => row[0]);
                                var cols = jsonResponse['data']['columns'];

                                var dataGrouped = ChatDrawer.format3dData(jsonResponse['data']['columns'], data, groups);
                                createStackedColumnChart(
                                    responseRenderer, dataGrouped, groups,
                                    subgroups, cols,
                                    responseRenderer.options, false,
                                    'data-chartindex', responseRenderer.options.renderTooltips
                                );
                            break;
                            default:
                                responseRenderer.innerHTML = `<div>Error: There was no data supplied for this table</div>`;
                        }
                    }
                    chataBarContainer.options.onResponseCallback();
                }, chataBarContainer.options);
            }
        }, chataBarContainer.options);
    }

    return chataBarContainer;
}
