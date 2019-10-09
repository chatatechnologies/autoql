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
        currencyCode: 'USD',
        languageCode: 'en-US',
        fontFamily: 'sans-serif',
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195']
    }
    for (var [key, value] of Object.entries(options)) {
        responseRenderer.options[key] = value;
    }
    responseRenderer.classList.add('chata-response-content-container');
    responseRenderer.classList.add('renderer-container');
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
    return responseRenderer;
}
