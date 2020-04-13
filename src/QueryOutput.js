function getQueryOutput(options={}){
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
    responseRenderer.classList.add('chata-response-content-container');
    responseRenderer.classList.add('renderer-container');
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
                var json = DataMessenger.responses[component.dataset.componentid];
                var indexData = e.target.dataset.chartrenderer;
                var topBar = component.chataBarContainer.getElementsByClassName(
                    'chat-bar-text'
                )[0]
                var loading = putLoadingContainer(topBar);
                let opts = mergeOptions([
                    component.chataBarContainer.options,
                    component.options
                ]);

                DataMessenger.sendDrilldownMessage(
                    json, indexData,
                    opts,
                    'ChatBar', component, loading);
            }
        }
        if(e.target.parentElement.hasAttribute('data-indexrowrenderer')){
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
            if(component.chataBarContainer.options.autoQLConfig.enableDrilldowns){
                var json = DataMessenger.responses[component.dataset.componentid];
                var indexData = e.target.parentElement.dataset.indexrowrenderer;
                var topBar = responseRenderer.chataBarContainer.getElementsByClassName(
                    'chat-bar-text'
                )[0]
                var loading = putLoadingContainer(topBar);
                let opts = mergeOptions([
                    component.chataBarContainer.options,
                    component.options
                ]);

                DataMessenger.sendDrilldownMessage(
                    json, indexData,
                    opts,
                    'ChatBar', responseRenderer, loading);
            }
        }

        if (e.target.hasAttribute('data-stackedchartindex')) {
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
            var json = cloneObject(DataMessenger.responses[component.dataset.componentid]);
            json['data']['rows'][0][0] = e.target.dataset.unformatvalue1;
            json['data']['rows'][0][1] = e.target.dataset.unformatvalue2;
            json['data']['rows'][0][2] = e.target.dataset.unformatvalue3;
            var topBar = component.chataBarContainer.getElementsByClassName(
                'chat-bar-text'
            )[0]
            var loading = putLoadingContainer(topBar);
            let opts = mergeOptions([
                component.chataBarContainer.options,
                component.options
            ]);
            DataMessenger.sendDrilldownMessage(
                json,
                0,
                opts,
                'ChatBar', component, loading
            );
        }

        if(e.target.classList.contains('chata-suggestion-btn-renderer')){
            var parent = e.target.parentElement.parentElement.parentElement;
            parent.options.onSuggestionClick();
            parent.chataBarContainer.sendMessageToResponseRenderer(
                e.target.textContent
            );
        }

        if(e.target.classList.contains('column')){
            var container = e.target.parentElement.parentElement.parentElement;
            var tableElement = container.querySelector('[data-componentid]');

            var localuuid = tableElement.dataset.componentid;
            if(e.target.nextSibling.classList.contains('up')){
                e.target.nextSibling.classList.remove('up');
                e.target.nextSibling.classList.add('down');
                var data = cloneObject(DataMessenger.responses[localuuid]);
                var sortData = DataMessenger.sort(
                    data['data']['rows'],
                    'desc',
                    e.target.dataset.index,
                    e.target.dataset.type
                );
                DataMessenger.refreshTableData(
                    tableElement,
                    sortData,
                    DataMessenger.options
                );
            }else{
                e.target.nextSibling.classList.remove('down');
                e.target.nextSibling.classList.add('up');
                var data = cloneObject(
                    DataMessenger.responses[localuuid]
                );
                var sortData = DataMessenger.sort(
                    data['data']['rows'],
                    'asc',
                    parseInt(e.target.dataset.index),
                    e.target.dataset.type
                );
                DataMessenger.refreshTableData(
                    tableElement,
                    sortData,
                    DataMessenger.options
                );
            }
        }

        if(e.target.classList.contains('column-pivot')){
            var container = e.target.parentElement.parentElement.parentElement;
            var tableElement = container.querySelector('[data-componentid]');
            var pivotArray = [];
            var json = cloneObject(
                DataMessenger.responses[tableElement.dataset.componentid]
            );
            var columns = json['data']['columns'];
            if(columns[0].type === 'DATE' &&
                columns[0].name.includes('month')){
                pivotArray = getDatePivotArray(
                    json,
                    DataMessenger.options,
                    cloneObject(json['data']['rows'])
                );
            }else{
                pivotArray = getPivotColumnArray(
                    json,
                    DataMessenger.options,
                    cloneObject(json['data']['rows'])
                );
            }
            if(e.target.nextSibling.classList.contains('up')){
                e.target.nextSibling.classList.remove('up');
                e.target.nextSibling.classList.add('down');
                var sortData = sortPivot(
                    pivotArray,
                    e.target.dataset.index,
                    'desc'
                );
                //sortData.unshift([]); //Simulate header
                DataMessenger.refreshPivotTable(tableElement, sortData);
            }else{
                e.target.nextSibling.classList.remove('down');
                e.target.nextSibling.classList.add('up');
                var sortData = sortPivot(
                    pivotArray,
                    e.target.dataset.index,
                    'asc'
                );
                //sortData.unshift([]); //Simulate header
                DataMessenger.refreshPivotTable(tableElement, sortData);
            }
        }
    });

    return responseRenderer;
}
