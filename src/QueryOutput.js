function QueryOutput(options={}){
    var responseRenderer = document.createElement('div');
    responseRenderer.options = {
        supportsSuggestions: true,
        onSuggestionClick: function() {},
        tableBorderColor: undefined,
        tableHoverColor: undefined,
        displayType: undefined,
        isFilteringTable: false,
        renderTooltips: true,
        dataFormatting:{
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 1,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'MMM D, YYYY'
        },
        themeConfig: {
            theme: 'light',
            chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
            accentColor: undefined,
            fontFamily: 'sans-serif',
        },
    }
    for (var [key, value] of Object.entries(options)) {
        responseRenderer.options[key] = value;
    }
    responseRenderer.classList.add('autoql-vanilla-chata-response-content-container');
    responseRenderer.classList.add('autoql-vanilla-renderer-container');
    responseRenderer.style.setProperty(
        '--chata-drawer-font-family',
        responseRenderer.options.themeConfig.fontFamily
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
            var component = e.target.parentElement.parentElement.parentElement.parentElement;
            console.log(component);
            if(component.tagName == 'svg'){
                component = component.parentElement;
            }
            if(component.chataBarContainer.options.autoQLConfig.enableDrilldowns){
                var json = ChataUtils.responses[component.dataset.componentid];
                var indexData = e.target.dataset.chartrenderer;
                var topBar = component.chataBarContainer.getElementsByClassName(
                    'autoql-vanilla-chat-bar-text'
                )[0]
                var loading = putLoadingContainer(topBar);
                let opts = mergeOptions([
                    component.chataBarContainer.options,
                    component.options
                ]);

                ChataUtils.sendDrilldownMessage(
                    json, indexData,
                    opts,
                    'ChatBar', component, loading);
            }
        }

        if (e.target.hasAttribute('data-stackedchartindex')) {
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            var json = cloneObject(ChataUtils.responses[component.dataset.componentid]);
            json['data']['rows'][0][0] = e.target.dataset.unformatvalue1;
            json['data']['rows'][0][1] = e.target.dataset.unformatvalue2;
            json['data']['rows'][0][2] = e.target.dataset.unformatvalue3;
            var topBar = component.chataBarContainer.getElementsByClassName(
                'autoql-vanilla-chat-bar-text'
            )[0]
            var loading = putLoadingContainer(topBar);
            let opts = mergeOptions([
                component.chataBarContainer.options,
                component.options
            ]);
            ChataUtils.sendDrilldownMessage(
                json,
                0,
                opts,
                'ChatBar', component, loading
            );
        }

        if(e.target.classList.contains('autoql-vanilla-chata-suggestion-btn-renderer')){
            var parent = e.target.parentElement.parentElement.parentElement;
            parent.options.onSuggestionClick();
            parent.chataBarContainer.sendMessageToResponseRenderer(
                e.target.textContent
            );
        }

    });

    return responseRenderer;
}
