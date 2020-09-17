export function QueryOutput(options={}){
    var responseRenderer = document.createElement('div');
    responseRenderer.options = {
        supportsSuggestions: true,
        onSuggestionClick: function() {},
        onDataClick: (groupByObject, queryID) => {},
        tableBorderColor: undefined,
        tableHoverColor: undefined,
        displayType: undefined,
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
        enableDynamicCharting: true
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
            if(component.tagName == 'svg'){
                component = component.parentElement.parentElement;
            }
            if(component.tagName == 'DIV' && !component.dataset.componentid){
                component = component.parentElement;
            }
            if(component.chataBarContainer.options.autoQLConfig.enableDrilldowns){
                var json = ChataUtils.responses[component.dataset.componentid];
                var queryId = json['data']['query_id'];
                var indexData = e.target.dataset.chartrenderer;
                var colValue = e.target.dataset.colvalue1;
                var indexValue = e.target.dataset.filterindex;
                var clickedData = getClickedData(
                    json, ...json['data']['rows'][indexData]
                );
                var topBar = component.chataBarContainer.getElementsByClassName(
                    'autoql-vanilla-chat-bar-text'
                )[0]

                var groupableCount = getNumberOfGroupables(
                    json['data']['columns']
                );
                if(groupableCount == 1 || groupableCount == 2){
                    component.chataBarContainer.sendDrilldownMessage(
                        json, indexData
                    );
                }else{
                    component.chataBarContainer.sendDrilldownClientSide(
                        json, indexValue, colValue
                    );
                }

            }
            responseRenderer.options.onDataClick(clickedData, queryId);
        }

        if (e.target.hasAttribute('data-stackedchartindex')) {
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            var json = cloneObject(ChataUtils.responses[component.dataset.componentid]);
            var groupables = getGroupables(json);
            var queryId = json['data']['query_id'];

            var val1 = e.target.dataset.unformatvalue1;
            var val2 = e.target.dataset.unformatvalue2;
            var val3 = e.target.dataset.unformatvalue3;

            var clickedData = getClickedData(json, val1, val2, val3);
            json['data']['rows'][0][0] = val1;
            json['data']['rows'][0][1] = val2;
            json['data']['rows'][0][2] = val3;

            var topBar = component.chataBarContainer.getElementsByClassName(
                'autoql-vanilla-chat-bar-text'
            )[0]
            component.chataBarContainer.sendDrilldownMessage(
                json, indexData
            );
            responseRenderer.options.onDataClick(clickedData, queryId);
        }

        if(e.target.classList.contains('autoql-vanilla-chata-suggestion-btn-renderer')){
            var parent = e.target.parentElement.parentElement.parentElement;
            parent.chataBarContainer.sendMessageToResponseRenderer(
                e.target.textContent
            );
        }

    });

    return responseRenderer;
}
