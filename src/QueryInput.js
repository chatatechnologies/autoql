function getQueryInput(options){

    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('chata-bar-container');
    chataBarContainer.classList.add('chat-drawer-chat-bar');
    chataBarContainer.classList.add('autosuggest-top');
    chataBarContainer.options = {
        authentication: {
            token: undefined,
            apiKey: undefined,
            customerId: undefined,
            userId: undefined,
            username: undefined,
            domain: undefined,
            demo: false
        },
        autoQLConfig: {
            debug: false,
            test: false,
            enableAutocomplete: true,
            enableQueryValidation: true,
            enableQuerySuggestions: true,
            enableDrilldowns: true
        },
        isDisabled: false,
        onSubmit: function(){},
        onResponseCallback: function(){},
        autoCompletePlacement: 'top',
        showLoadingDots: true,
        showChataIcon: true,
        enableVoiceRecord: true,
        autocompleteStyles: {},
        fontFamily: 'sans-serif',
        placeholder: 'Type your queries here'
    }
    chataBarContainer.autoCompleteTimer = undefined;

    chataBarContainer.addEventListener('click', function(e){
        if(e.target.classList.contains('suggestion-renderer')){
            var parent = e.target.parentElement.parentElement.parentElement.parentElement;
            var chatBarSuggestionList = parent.getElementsByClassName(
                'chat-bar-autocomplete'
            )[0];
            chatBarSuggestionList.style.display = 'none';
            parent.sendMessageToResponseRenderer(e.target.textContent, 'user');
        }
    });

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
        <input
            type="text"
            autocomplete="off"
            aria-autocomplete="list"
            class="chata-input-renderer chat-bar left-padding"
            placeholder="${chataBarContainer.options.placeholder}"
            value="" id="" ${disabled}>
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

    chataBarContainer.onkeyup = function(event){
        if(chataBarContainer.options.autoQLConfig.enableAutocomplete){
            var suggestionList = this.getElementsByClassName('chat-bar-autocomplete')[0];
            suggestionList.style.display = 'none';
            clearTimeout(chataBarContainer.autoCompleteTimer);
            if(event.target.value){
                chataBarContainer.autoCompleteTimer = setTimeout(() => {
                    console.log(chataBarContainer.options.authentication);
                    DataMessenger.autocomplete(
                        event.target.value,
                        suggestionList,
                        'suggestion-renderer',
                        chataBarContainer.options
                    );
                }, 400);
            }
        }
    }

    chataBarContainer.onkeypress = function(event){
        var suggestionList = event.target.parentElement.getElementsByClassName('chat-bar-autocomplete')[0];
        if(event.keyCode == 13 && event.target.value){
            clearTimeout(chataBarContainer.autoCompleteTimer);
            suggestionList.style.display = 'none';
            this.sendMessageToResponseRenderer(chataBarContainer.chatbar.value, 'user');
        }
    }

    chataBarContainer.sendMessageToResponseRenderer = function(value, source){
        chataBarContainer.options.onSubmit();
        var responseRenderer = this.responseRenderer;
        var parent = this.getElementsByClassName('chat-bar-text')[0];
        this.chatbar.disabled = true;
        this.chatbar.value = '';
        if(this.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }
        // const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
        //   value
        // )}&projectId=${chataBarContainer.options.projectId}&unified_query_id=${uuidv4()}`;
        // const URL = `https://backend-staging.chata.ai/api/v1/query?q=${value}&project=1&unified_query_id=${uuidv4()}`;

        const URL_SAFETYNET = chataBarContainer.options.authentication.demo
          ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
            value
          )}&projectId=1`
          : `${chataBarContainer.options.authentication.domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            value
          )}&key=${chataBarContainer.options.authentication.apiKey}&customer_id=${chataBarContainer.options.authentication.customerId}&user_id=${chataBarContainer.options.authentication.userId}`

        DataMessenger.safetynetCall(URL_SAFETYNET, function(jsonResponse, statusCode){
            // jsonResponse['full_suggestion'].length
            if(jsonResponse != undefined){
                var suggestions = jsonResponse['full_suggestion'] || jsonResponse['data']['replacements'];
            }
            if(suggestions.length > 0 && chataBarContainer.options.autoQLConfig.enableQueryValidation){
                responseRenderer.innerHTML = '';
                chataBarContainer.chatbar.removeAttribute("disabled");
                if(chataBarContainer.options.showLoadingDots){
                    parent.removeChild(responseLoadingContainer);
                }
                var suggestionArray = createSuggestionArray(jsonResponse);
                var node = createSafetynetContent(suggestionArray, 'ChatBar');
                responseRenderer.appendChild(node);
                chataBarContainer.options.onResponseCallback();
                DataMessenger.responses[responseRenderer.dataset.componentid] = jsonResponse;
            }else{
                DataMessenger.ajaxCall(value, function(jsonResponse){
                    DataMessenger.responses[responseRenderer.dataset.componentid] = jsonResponse;
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
                    if(displayType == 'table'){
                        var cols = jsonResponse['data']['columns'];
                        var rows = jsonResponse['data']['rows'];

                        if(cols[0]['name'] == 'query_suggestion' &&
                        responseRenderer.options.supportsSuggestions){
                            var wrapper = document.createElement('div');
                            responseRenderer.innerHTML = '';
                            wrapper.innerHTML = `
                                <div>
                                    I'm not sure what you mean by <strong>"
                                    ${value}"</strong>. Did you mean:</div>`;
                            DataMessenger.createSuggestions(
                                wrapper,
                                rows,
                                'chata-suggestion-btn-renderer'
                            );
                            responseRenderer.appendChild(wrapper)
                        }else if(cols.length == 1 && rows.length == 1){
                            if(cols[0]['name'] == 'Help Link'){
                                responseRenderer.innerHTML = DataMessenger.createHelpContent(
                                    jsonResponse['data']['rows'][0]
                                );
                            }else{
                                var data = formatData(
                                    rows[0][0],
                                    cols[0],
                                    responseRenderer.options
                                );
                                responseRenderer.innerHTML = `<div>${data}</div>`;
                            }
                        }else{
                            // table
                            var uuid = uuidv4();
                            DataMessenger.responses[uuid] = jsonResponse;
                            var div = document.createElement('div');
                            div.classList.add('chata-table-container');
                            div.classList.add('chata-table-container-renderer');
                            var scrollbox = document.createElement('div');
                            scrollbox.classList.add('chata-table-scrollbox');
                            scrollbox.appendChild(div);
                            responseRenderer.appendChild(scrollbox);
                            let opts = mergeOptions([
                                chataBarContainer.options,
                                responseRenderer.options
                            ]);
                            var table = createTable(
                                jsonResponse,
                                div,
                                opts,
                                'append',
                                uuid,
                                'table-response-renderer',
                                '[data-indexrowrenderer]'
                            );
                            table.classList.add('renderer-table');
                            scrollbox.insertBefore(table.headerElement, div);
                        }


                    }else{
                        switch(displayType){
                            case 'table':
                                var uuid = uuidv4();
                                DataMessenger.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                var scrollbox = document.createElement('div');
                                scrollbox.classList.add('chata-table-scrollbox');
                                scrollbox.appendChild(div);
                                responseRenderer.appendChild(scrollbox);
                                if(jsonResponse['data']['columns'].length == 1){
                                    var data = formatData(
                                        jsonResponse['data'],
                                        jsonResponse['data']['columns'][0],
                                        responseRenderer.options
                                    );
                                    responseRenderer.innerHTML = `<div>${data}</div>`;
                                }else{
                                    var opts = mergeOptions([
                                        chataBarContainer.options,
                                        responseRenderer.options
                                    ]);
                                    var table = createTable(
                                        jsonResponse,
                                        div,
                                        opts,
                                        'append',
                                        uuid,
                                        'table-response-renderer',
                                        '[data-indexrowrenderer]'
                                    );
                                    table.classList.add('renderer-table');
                                    scrollbox.insertBefore(table.headerElement, div);

                                }
                            break;
                            case 'date_pivot':
                                var uuid = uuidv4();
                                DataMessenger.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                var pivotArray = getDatePivotArray(jsonResponse, responseRenderer.options);
                                var opts = mergeOptions([
                                    chataBarContainer.options,
                                    responseRenderer.options
                                ]);
                                var table = createPivotTable(pivotArray, div, opts, 'append', uuid, 'table-response-renderer');
                                table.classList.add('renderer-table');
                            break;
                            case 'pivot_column':
                                var uuid = uuidv4();
                                DataMessenger.responses[uuid] = jsonResponse;
                                var div = document.createElement('div');
                                div.classList.add('chata-table-container');
                                div.classList.add('chata-table-container-renderer');
                                responseRenderer.appendChild(div);
                                var pivotArray = getPivotColumnArray(jsonResponse, responseRenderer.options);
                                var opts = mergeOptions([
                                    chataBarContainer.options,
                                    responseRenderer.options
                                ]);
                                var table = createPivotTable(pivotArray, div, opts, 'append', '', 'table-response-renderer');
                                table.classList.add('renderer-table');
                            break;
                            case 'line':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createLineChart(
                                    chartWrapper,
                                    jsonResponse, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'bar':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createBarChart(
                                    chartWrapper,
                                    jsonResponse, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'column':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createColumnChart(
                                    chartWrapper,
                                    jsonResponse, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'heatmap':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createHeatmap(
                                    chartWrapper,
                                    jsonResponse, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'bubble':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createBubbleChart(
                                    chartWrapper,
                                    jsonResponse, responseRenderer.options,
                                    false, 'data-chartrenderer',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'help':
                                responseRenderer.innerHTML = DataMessenger.createHelpContent(
                                    jsonResponse['data']['rows'][0]
                                );
                            break;
                            case 'stacked_bar':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createStackedBarChart(
                                    chartWrapper, jsonResponse,
                                    responseRenderer.options, false,
                                    'data-stackedchartindex',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'stacked_column':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createStackedColumnChart(
                                    chartWrapper, jsonResponse,
                                    responseRenderer.options, false,
                                    'data-stackedchartindex',
                                    responseRenderer.options.renderTooltips
                                );
                            break;
                            case 'pie':
                                var chartWrapper = document.createElement(
                                    'div'
                                );
                                responseRenderer.appendChild(chartWrapper);
                                createPieChart(
                                    chartWrapper, jsonResponse,
                                    responseRenderer.options, false,
                                    'data-chartrenderer', true
                                );
                                break;
                            default:
                                responseRenderer.innerHTML = `<div>Error: There was no data supplied for this table</div>`;
                        }
                    }
                    chataBarContainer.options.onResponseCallback();
                }, chataBarContainer.options, source);
            }
        }, chataBarContainer.options);
    }

    return chataBarContainer;
}
