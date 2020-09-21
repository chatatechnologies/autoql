import { ChataUtils } from '../ChataUtils'
import {
    CHATA_BUBBLES_ICON,
    VOICE_RECORD_IMAGE
} from '../Svg'
import {
    getSpeech,
    htmlToElement,
    putLoadingContainer,
    getSupportedDisplayTypes,
    uuidv4,
    mergeOptions,
    createTableContainer
} from '../Utils'
import {
    createAreaChart,
    createBarChart,
    createBubbleChart,
    createColumnChart,
    createHeatmap,
    createLineChart,
    createPieChart,
    createStackedBarChart,
    createStackedColumnChart
} from '../Charts'


export function QueryInput(selector, options){
    const PARENT = document.querySelector(selector);
    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('autoql-vanilla-chata-bar-container');
    chataBarContainer.classList.add('query-input');
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
        placeholder: 'Type your queries here',
        xhr: new XMLHttpRequest()
    }
    chataBarContainer.autoCompleteTimer = undefined;

    chataBarContainer.addEventListener('click', function(e){
        if(e.target.classList.contains('suggestion-renderer')){
            var chatBarSuggestionList = chataBarContainer.getElementsByClassName(
                'autoql-vanilla-chat-bar-autocomplete'
            )[0];
            chatBarSuggestionList.style.display = 'none';
            chataBarContainer.sendMessageToResponseRenderer(
                e.target.textContent, 'user'
            );
        }
    });

    for (var [key, value] of Object.entries(options)) {
        chataBarContainer.options[key] = value;
    }
    const CHATA_ICON = chataBarContainer.options.showChataIcon ? `
    <div class="autoql-vanilla-chat-bar-input-icon">${CHATA_BUBBLES_ICON}</div>
    ` : '';

    chataBarContainer.speechToText = getSpeech();
    chataBarContainer.finalTranscript = '';
    chataBarContainer.isRecordVoiceActive = false

    var voiceRecordButton = document.createElement('button');
    var display = chataBarContainer.options.enableVoiceRecord ? 'block' : 'none';
    voiceRecordButton.classList.add(
        'autoql-vanilla-chat-voice-record-button'
    );
    voiceRecordButton.classList.add(
        'chata-voice'
    );
    voiceRecordButton.setAttribute(
        'data-tippy-content',
        'Hold for voice-to-text'
    );
    voiceRecordButton.innerHTML = VOICE_RECORD_IMAGE;
    chataBarContainer.voiceRecordButton = voiceRecordButton;
    var disabled = chataBarContainer.options.isDisabled ? 'disabled' : '';
    var wrapperInput = document.createElement('div');
    wrapperInput.classList.add('autoql-vanilla-wrapper-input');
    var suggestionContainer = htmlToElement(`
        <div class="autoql-vanilla-chat-bar-text">
            <div class="autoql-vanilla-chat-bar-auto-complete-suggestions
                ${chataBarContainer.options.autoCompletePlacement}">
                <ul class="autoql-vanilla-chat-bar-autocomplete">
                </ul>
            </div>
        </div>
    `);
    var input = htmlToElement(`
        <input
            type="text"
            autocomplete="off"
            aria-autocomplete="list"
            class="autoql-vanilla-chata-input-renderer chat-bar left-padding"
            placeholder="${chataBarContainer.options.placeholder}"
            value="" id="" ${disabled}>
    `)
    wrapperInput.appendChild(suggestionContainer);
    wrapperInput.appendChild(htmlToElement(CHATA_ICON));
    wrapperInput.appendChild(input);

    chataBarContainer.input = input;
    chataBarContainer.suggestionContainer = suggestionContainer;
    // chataBarContainer.innerHTML = `
    // <div class="autoql-vanilla-chat-bar-text">
    // </div>
    // `;

    chataBarContainer.appendChild(wrapperInput);
    chataBarContainer.appendChild(voiceRecordButton);

    voiceRecordButton.onmouseup = (evt) => {
        chataBarContainer.speechToText.stop();
        voiceRecordButton.style.backgroundColor = '#26a7df';
        chataBarContainer.input.value = chataBarContainer.finalTranscript;
        chataBarContainer.isRecordVoiceActive = false;
    }

    voiceRecordButton.onmousedown = (evt) => {
        chataBarContainer.speechToText.start();
        voiceRecordButton.style.backgroundColor = '#FF471A';
        chataBarContainer.isRecordVoiceActive = true;
    }

    chataBarContainer.style.setProperty(
        '--chata-drawer-font-family',
        chataBarContainer.options.fontFamily
    )

    chataBarContainer.chatbar = chataBarContainer.getElementsByClassName(
        'autoql-vanilla-chata-input-renderer'
    )[0];
    chataBarContainer.bind = function(responseRenderer){
        this.responseRenderer = responseRenderer;
        responseRenderer.chataBarContainer = chataBarContainer;
    }

    chataBarContainer.onkeyup = function(event){
        if(chataBarContainer.options.autoQLConfig.enableAutocomplete){
            var suggestionList = this.suggestionContainer.getElementsByClassName(
                'autoql-vanilla-chat-bar-autocomplete'
            )[0];
            suggestionList.style.display = 'none';
            clearTimeout(chataBarContainer.autoCompleteTimer);
            if(event.target.value){
                chataBarContainer.autoCompleteTimer = setTimeout(() => {
                    console.log(chataBarContainer.options.authentication);
                    ChataUtils.autocomplete(
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
        var suggestionList =chataBarContainer.getElementsByClassName('autoql-vanilla-chat-bar-autocomplete')[0];
        if(event.keyCode == 13 && event.target.value){
            clearTimeout(chataBarContainer.autoCompleteTimer);
            suggestionList.style.display = 'none';
            this.sendMessageToResponseRenderer(chataBarContainer.chatbar.value, 'user');
        }
    }

    chataBarContainer.sendDrilldownClientSide = (json, indexValue, filterBy) => {
        var newJson = cloneObject(json);
        var newData = [];
        var oldData = newJson['data']['rows'];

        for (var i = 0; i < oldData.length; i++) {
            if(oldData[i][indexValue] === filterBy)newData.push(oldData[i]);
        }
        var parent = chataBarContainer.getElementsByClassName(
            'autoql-vanilla-chat-bar-text'
        )[0];
        if(chataBarContainer.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }

        if(newData.length > 0){
            newJson.data.rows = newData;

            setTimeout(() => {
                chataBarContainer.refreshView(newJson);
                if(chataBarContainer.options.showLoadingDots){
                    parent.removeChild(responseLoadingContainer);
                }
            }, 400)
        }else{
            setTimeout(() => {
                responseRenderer.innerHTML = 'No data found.';
                parent.removeChild(loading);
            }, 400)
        }
    }

    chataBarContainer.sendDrilldownMessage = (json, indexData) => {
        let opts = mergeOptions([
            chataBarContainer.options,
            responseRenderer.options
        ]);

        var parent = chataBarContainer.getElementsByClassName(
            'autoql-vanilla-chat-bar-text'
        )[0];
        if(chataBarContainer.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }

        var queryId = json['data']['query_id'];
        var params = {};
        var groupables = getGroupableFields(json);
        const URL = opts.authentication.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${opts.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${opts.authentication.apiKey}`;
        let data;

        if(opts.authentication.demo){
            data = {
                query_id: queryId,
                group_bys: params,
                username: 'demo',
                debug: opts.autoQLConfig.debug
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
                debug: opts.autoQLConfig.debug,
                columns: cols
            }
        }

        ChataUtils.ajaxCallPost(URL, function(response, status){
            if(chataBarContainer.options.showLoadingDots){
                parent.removeChild(responseLoadingContainer);
            }
            chataBarContainer.refreshView(response);
            refreshTooltips();
        }, data, options);
    }

    chataBarContainer.onRowClick = (e, row, json) => {
        var index = 0;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);

        if(groupableCount > 0){
            for(var[key, value] of Object.entries(row._row.data)){
                json['data']['rows'][0][index++] = value;
            }
            var clickedData = getClickedData(json, ...json['data']['rows'][0])
            responseRenderer.options.onDataClick(
                clickedData, json['data']['query_id']
            );
            chataBarContainer.sendDrilldownMessage(json, 0);
        }
    }

    chataBarContainer.onCellClick = (e, cell, json) => {
        const columns = json['data']['columns'];
        const selectedColumn = cell._cell.column;
        const row = cell._cell.row;
        if(selectedColumn.definition.index != 0){
            var entries = Object.entries(row.data)[0];
            json['data']['rows'][0][0] = entries[1];
            json['data']['rows'][0][1] = selectedColumn.definition.field;
            json['data']['rows'][0][2] = cell.getValue();
            var clickedData = getClickedData(json, ...json['data']['rows'][0])
            responseRenderer.options.onDataClick(
                clickedData, json['data']['query_id']
            );
            chataBarContainer.sendDrilldownMessage(json, 0);
        }
    }

    chataBarContainer.sendMessageToResponseRenderer = function(value, source){
        chataBarContainer.options.onSubmit();
        var responseRenderer = this.responseRenderer;
        var parent = this.getElementsByClassName('autoql-vanilla-chat-bar-text')[0];
        this.chatbar.disabled = true;
        this.chatbar.value = '';
        if(this.options.showLoadingDots){
            var responseLoadingContainer = putLoadingContainer(parent);
        }

        const URL_SAFETYNET = chataBarContainer.options.authentication.demo
          ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
            value
          )}&projectId=1`
          : `${chataBarContainer.options.authentication.domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            value
          )}&key=${chataBarContainer.options.authentication.apiKey}&customer_id=${chataBarContainer.options.authentication.customerId}&user_id=${chataBarContainer.options.authentication.userId}`

        ChataUtils.safetynetCall(URL_SAFETYNET, function(jsonResponse, statusCode){
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
                var node = createSafetynetContent(suggestionArray, chataBarContainer);
                responseRenderer.appendChild(node);
                chataBarContainer.options.onResponseCallback();
                ChataUtils.responses[responseRenderer.dataset.componentid] = jsonResponse;
            }else{
                ChataUtils.ajaxCall(value, function(jsonResponse){
                    chataBarContainer.refreshView(jsonResponse, value)
                    parent.removeChild(responseLoadingContainer);
                    chataBarContainer.chatbar.removeAttribute("disabled");
                }, chataBarContainer.options, source);
            }
        }, chataBarContainer.options);
    }

    chataBarContainer.refreshView = (
        jsonResponse, text='') => {
        var responseRenderer = chataBarContainer.responseRenderer;
        ChataUtils.responses[responseRenderer.dataset.componentid] = jsonResponse;
        responseRenderer.innerHTML = '';

        if(jsonResponse['reference_id'] === '1.1.430'){
            responseRenderer.innerHTML = jsonResponse['message'];
            const path = ChataUtils.getRecommendationPath(
                chataBarContainer.options,
                text.split(' ').join(',')
            );
            ChataUtils.safetynetCall(path, function(response, s){
                var wrapper = document.createElement('div');
                var rows = response['data']['items'];
                console.log(rows);
                ChataUtils.createSuggestions(
                    wrapper,
                    rows,
                    'autoql-vanilla-chata-suggestion-btn-renderer'
                );
                responseRenderer.appendChild(wrapper)
            }, chataBarContainer.options);
            chataBarContainer.options.onResponseCallback();
            return;
        }

        let displayType;
        var sup = getSupportedDisplayTypes(jsonResponse);
        console.log(sup);
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
                ChataUtils.createSuggestions(
                    wrapper,
                    rows,
                    'autoql-vanilla-chata-suggestion-btn-renderer'
                );
                responseRenderer.appendChild(wrapper)
            }else if(cols.length == 1 && rows.length == 1){
                if(cols[0]['name'] == 'Help Link'){
                    responseRenderer.innerHTML =
                    ChataUtils.createHelpContent(
                        jsonResponse['data']['rows'][0]
                    );
                }else{
                    var data = formatData(
                        rows[0][0],
                        cols[0],
                        responseRenderer.options
                    );
                    responseRenderer.innerHTML = `
                        <div>${data}</div>
                    `;
                }
            }else{
                // table
                var uuid = uuidv4();
                ChataUtils.responses[uuid] = jsonResponse;
                let opts = mergeOptions([
                    chataBarContainer.options,
                    responseRenderer.options
                ]);
                var div = createTableContainer();
                div.setAttribute('data-componentid', uuid)
                responseRenderer.appendChild(div);
                var scrollbox = document.createElement('div');
                scrollbox.classList.add(
                    'autoql-vanilla-chata-table-scrollbox'
                );
                scrollbox.appendChild(div);
                responseRenderer.appendChild(scrollbox);
                var table = new ChataTable(
                    uuid, opts, chataBarContainer.onRowClick
                )
                div.tabulator = table;
            }
        }else{
            switch(displayType){
                case 'table':
                    var uuid = uuidv4();
                    ChataUtils.responses[uuid] = jsonResponse;
                    var div = createTableContainer();
                    div.setAttribute('data-componentid', uuid)
                    responseRenderer.appendChild(div);
                    var scrollbox = document.createElement('div');
                    scrollbox.classList.add(
                        'autoql-vanilla-chata-table-scrollbox'
                    );
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
                        var table = new ChataTable(
                            uuid, opts, chataBarContainer.onRowClick
                        )
                        div.tabulator = table;
                    }
                break;
                case 'pivot_table':
                    let opts = mergeOptions([
                        chataBarContainer.options,
                        responseRenderer.options
                    ]);
                    var uuid = uuidv4();
                    ChataUtils.responses[uuid] = jsonResponse;
                    var div = createTableContainer();
                    div.setAttribute('data-componentid', uuid)
                    responseRenderer.appendChild(div);
                    var scrollbox = document.createElement('div');
                    scrollbox.classList.add(
                        'autoql-vanilla-chata-table-scrollbox'
                    );
                    scrollbox.appendChild(div);
                    responseRenderer.appendChild(scrollbox);
                    var table = new ChataPivotTable(
                        uuid, opts, chataBarContainer.onCellClick
                    )
                    div.tabulator = table;
                break;
                case 'line':
                    var chartWrapper = document.createElement(
                        'div'
                    );
                    responseRenderer.appendChild(chartWrapper);
                    createLineChart(
                        chartWrapper,
                        jsonResponse, responseRenderer.options,
                        () => {},
                        false, 'data-chartrenderer',
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
                        () => {},
                        false, 'data-chartrenderer',
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
                        () => {},
                        false, 'data-chartrenderer',
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
                    );
                break;
                case 'help':
                    responseRenderer.innerHTML = ChataUtils.createHelpContent(
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
                        responseRenderer.options,
                        () => {}, false,
                        'data-stackedchartindex',
                    );
                break;
                case 'stacked_column':
                    var chartWrapper = document.createElement(
                        'div'
                    );
                    responseRenderer.appendChild(chartWrapper);
                    createStackedColumnChart(
                        chartWrapper, jsonResponse,
                        responseRenderer.options, () => {},
                        false,
                        'data-stackedchartindex',
                    );
                break;
                case 'stacked_line':
                    var chartWrapper = document.createElement(
                        'div'
                    );
                    responseRenderer.appendChild(chartWrapper);
                    createAreaChart(
                        chartWrapper, jsonResponse,
                        responseRenderer.options, () => {},
                        false,
                        'data-stackedchartindex',
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
                    responseRenderer.innerHTML = `
                        <div>
                            Error: There was no data supplied for this table
                        </div>
                    `;
            }
        }
        chataBarContainer.options.onResponseCallback();
    }

    PARENT.appendChild(chataBarContainer);

    return chataBarContainer;
}