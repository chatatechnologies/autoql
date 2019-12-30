function createResponseRenderer(options={}){
    var responseRenderer = document.createElement('div');
    responseRenderer.options = {
        supportsSuggestions: true,
        onSuggestionClick: function() {},
        tableBorderColor: undefined,
        tableHoverColor: undefined,
        displayType: undefined,
        isFilteringTable: false,
        renderTooltips: true,
        languageCode: 'en-US',
        currencyCode: 'USD',
        currencyDecimals: 2,
        quantityDecimals: 1,
        monthYearFormat: 'MMM YYYY',
        dayMonthYearFormat: 'MMM DD, YYYY',
        fontFamily: 'sans-serif',
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195']
    }
    for (var [key, value] of Object.entries(options)) {
        responseRenderer.options[key] = value;
    }
    responseRenderer.classList.add('chata-response-content-container');
    responseRenderer.classList.add('renderer-container');
    responseRenderer.style.setProperty(
        '--chata-drawer-font-family',
        responseRenderer.options.fontFamily
    )
    responseRenderer.setAttribute('data-componentid', uuidv4());
    var applyTableStyles = function(){
        css = '';
        var style = document.createElement('style');
        if(responseRenderer.options.tableBorderColor !== undefined){
            css += `.renderer-table tr{ border-color: ${responseRenderer.options.tableBorderColor}; }`;
        }
        if(responseRenderer.options.tableHoverColor !== undefined){
            css += `.renderer-table tr:hover{ background-color: ${responseRenderer.options.tableHoverColor}; }`;
        }
        style.appendChild(document.createTextNode(css));
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    applyTableStyles();

    responseRenderer.addEventListener('click', function(e){
        if(e.target.hasAttribute('data-chartrenderer')){
            var component = e.target.parentElement.parentElement.parentElement;
            if(component.tagName == 'svg'){
                component = component.parentElement;
            }
            if(!component.chataBarContainer.options.disableDrilldowns){
                var json = ChatDrawer.responses[component.dataset.componentid];
                var indexData = e.target.dataset.chartrenderer;
                let mergeOptions = {
                    ...component.chataBarContainer.options,
                    ...component.options
                }
                ChatDrawer.sendDrilldownMessage(
                    json, indexData,
                    mergeOptions,
                    'ChatBar', component);
            }
        }
        if(e.target.parentElement.hasAttribute('data-indexrowrenderer')){
            var component = e.target.parentElement.parentElement;
            var responseRenderer = component.parentElement.parentElement;
            if(!responseRenderer.chataBarContainer.options.disableDrilldowns){
                var json = ChatDrawer.responses[component.dataset.componentid];
                var indexData = e.target.parentElement.dataset.indexrowrenderer;
                let mergeOptions = {
                    ...responseRenderer.chataBarContainer.options,
                    ...responseRenderer.options
                }
                ChatDrawer.sendDrilldownMessage(
                    json, indexData,
                    mergeOptions,
                    'ChatBar', responseRenderer);
            }
        }

        if (e.target.hasAttribute('data-stackedchartindex')) {
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
            var json = cloneObject(ChatDrawer.responses[component.dataset.componentid]);
            json['data']['rows'][0][0] = e.target.dataset.colvalue1;
            let mergeOptions = {
                ...component.chataBarContainer.options,
                ...component.options
            }
            ChatDrawer.sendDrilldownMessage(
                json,
                0,
                mergeOptions,
                'ChatBar', component
            );
        }

        if(e.target.classList.contains('chata-suggestion-btn-renderer')){
            var parent = e.target.parentElement.parentElement;
            parent.options.onSuggestionClick();
            parent.chataBarContainer.sendMessageToResponseRenderer(
                e.target.textContent
            );
        }
    });

    return responseRenderer;
}
