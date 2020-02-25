function Dashboard(selector, options={}){
    var items = [];
    var obj = this;
    obj.oldState = {
        inputValue: '',
        element: '',
    };
    obj.lastState = {
        inputValue: '',
        element: '',
    };

    obj.options = {
        authentication: {
            token: undefined,
            apiKey: undefined,
            customerId: undefined,
            userId: undefined,
            username: undefined,
            domain: undefined,
            demo: false
        },
        dataFormatting:{
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 1,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'MMM D, YYYY'
        },
        autoQLConfig: {
            debug: false,
            test: false,
            enableAutocomplete: true,
            enableQueryValidation: true,
            enableQuerySuggestions: true,
            enableColumnEditor: true,
            enableDrilldowns: true
        },
        themeConfig: {
            theme: 'light',
            chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
            accentColor: undefined,
            fontFamily: 'sans-serif',
            titleColor: '#356f90'
        },
        tiles: [],
        onChangeCallback: function(){},
        isEditing: false,
        executeOnMount:	true,
        executeOnStopEditing: true,
        notExecutedText: 'Hit "Execute" to run this dashboard',
    }

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value;
        }
    }

    if('dataFormatting' in options){
        for (var [key, value] of Object.entries(options['dataFormatting'])) {
            obj.options.dataFormatting[key] = value;
        }
    }

    if('autoQLConfig' in options){
        for (var [key, value] of Object.entries(options['autoQLConfig'])) {
            obj.options.autoQLConfig[key] = value;
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            obj.options.themeConfig[key] = value;
        }
    }

    for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            obj.options[key] = value;
        }
    }

    for (let property in DASHBOARD_LIGHT_THEME) {
        document.documentElement.style.setProperty(
            property,
            DASHBOARD_LIGHT_THEME[property],
        );
    }
    obj.onChangeCallback = obj.options.onChangeCallback;
    var grid = new Muuri(selector, {
        layoutDuration: 400,
        showDuration: 0,
        dragSortHeuristics: {
            sortInterval: 10,
            minDragDistance: 10,
            minBounceBackAngle: 10
        },
        layoutEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        dragEnabled: true,
        dragSort: function () {
            return [grid];
        },
        dragSortInterval: 10,
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease',
        dragStartPredicate: function (item, event) {
            if(event.target.tagName == 'SPAN'){
                return false;
            }
            if(event.target.classList.contains('item-content')){
                if (obj.grid._settings.dragEnabled) {
                    if(event.type == 'start'){
                        obj.showPlaceHolders();
                    }else{
                        obj.hidePlaceHolders();
                    }
                    return Muuri.ItemDrag.defaultStartPredicate(item, event);
                } else {
                    return false;
                }
            }
        },
        dragCssProps: {
            touchAction: 'auto'
        }
    });

    grid._element.classList.add('chata-dashboard');

    obj.grid = grid;
    obj.tiles = items;
    for (var i = 0; i < options.tiles.length; i++) {
        var opts = {
            w: options.tiles[i].w,
            h: options.tiles[i].h,
            query: options.tiles[i].query,
            title: options.tiles[i].title,
            displayType: options.tiles[i].displayType
        }
        items.push(new Tile(obj, opts));
    }
    obj.grid.add(obj.tiles);
    obj.grid._settings.dragEnabled = false;

    obj.startEditing = function(){
        obj.tiles.forEach(function(tile){
            tile.startEditing();
        })
        obj.grid._settings.dragEnabled = true;
    }

    obj.stopEditing = function(){
        obj.tiles.forEach(function(tile){
            tile.stopEditing();
        })
        if(obj.options.executeOnStopEditing){
            obj.run();
        }
        obj.grid._settings.dragEnabled = false;
    }

    obj.showPlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.showPlaceHolder();
        })
    }

    obj.hidePlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.HidePlaceHolder();
        })
    }

    obj.addTile = function(options){
        var tile = new Tile(obj, options);
        obj.tiles.push(tile);
        obj.grid.add(tile);
        tile.startEditing();
        tile.focusItem();
    }

    obj.run = function(){
        obj.tiles.forEach(function(tile){
            tile.runQuery();
        });
        obj.onChangeCallback();
    }

    if(obj.options.executeOnMount){
        obj.run();
    }

    if(obj.options.isEditing){
        this.startEditing();
    }

    obj.applyCSS = function(){
        obj.grid._element.style.setProperty(
            '--chata-dashboard-font-family',
            obj.options.themeConfig['fontFamily']
        );

        obj.grid._element.style.setProperty(
            '--chata-dashboard-accent-color',
            obj.options.themeConfig['titleColor']
        )
    }

    obj.undo = function(){
        var oldValue = obj.oldState.inputValue;
        var newValue = obj.lastState.inputValue;
        obj.lastState.element.value = oldValue;
        obj.lastState.inputValue = oldValue;
        obj.oldState.inputValue = newValue;
    }

    obj.applyCSS();

    return obj;
}
