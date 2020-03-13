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

    obj.lastEvent = {
        type: '',
        value: {}
    }

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
            chartColors: [
                '#26A7E9', '#A5CD39',
                '#DD6A6A', '#FFA700',
                '#00C1B2'
            ],
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
        splitView: true,
        secondDisplayType: 'table',
        secondDisplayPercentage: 25
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
        sortData: {
            undoSort: function(item, element){
                const values = element.style.transform
                .replace('translateX', '')
                .replace('translateY', '')
                .replace(/[()]/g, '')
                .replace(/px/g, '').split(' ');
                var sum = 0;
                console.log(item);
                for (var i = 0; i < values.length; i++) {
                    sum += parseFloat(values[i]) * parseInt(item._id);
                }
                return item._id;
            }
        },
        dragSortInterval: 10,
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease',
        dragSortPredicate: function(item, e) {
            return Muuri.ItemDrag.defaultSortPredicate(item, {
                action: 'swap',
                threshold: 50
            });
        },
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
        obj.lastEvent.type = 'tile_added';
        obj.lastEvent.value = {
            tile: tile,
            index: -1
        }
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
        switch (obj.lastEvent.type) {
            case 'drag':
                var item = obj.lastEvent.value.item;
                var toIndex = obj.lastEvent.value.toIndex;
                var fromIndex = obj.lastEvent.value.fromIndex;
                grid.move(toIndex, fromIndex, {action: 'swap'});
                grid.synchronize();
                break;
            case 'remove':
                var removedItem  = obj.lastEvent.value.item;
                var insertIndex  = obj.lastEvent.value.index;
                var tile = new Tile(obj, removedItem.options);
                obj.tiles.push(tile);
                obj.grid.add(tile, {index: insertIndex});
                tile.startEditing();
                obj.lastEvent.type = 'tile_added';
                obj.lastEvent.value = {
                    tile: tile,
                    insertIndex: insertIndex
                }
            break;
            case 'resize':
                const width = obj.lastEvent.value.startWidth;
                const height = obj.lastEvent.value.startHeight;
                var item = obj.lastEvent.value.item;
                item.style.width = width + 'px';
                item.style.height = height + 'px';
                obj.grid.refreshItems(item).layout();
            break;
            case 'display_type':
                const currentTile = obj.lastEvent.value.tile
                const displayType = obj.lastEvent.value.displayType
                currentTile.refreshItem(
                    displayType,
                    currentTile.globalUUID,
                    currentTile.view
                );
                dashboard.lastEvent.type = 'display_type';
                dashboard.lastEvent.value = {
                    tile: currentTile,
                    displayType: currentTile.options.displayType
                };
                currentTile.options.displayType = displayType;
            break;
            case 'tile_added':
                const addedTile = obj.lastEvent.value.tile
                const lastInsertIndex = obj.lastEvent.value.index
                console.log(addedTile);
                obj.grid.remove(addedTile, {layout:true})
                addedTile.parentElement.removeChild(addedTile);
                obj.lastEvent.type = 'remove'
                obj.lastEvent.value = {
                    index: lastInsertIndex,
                    item: addedTile
                }
            break;
            default:
        }
    }

    obj.grid.on('dragInit', function(item, event){
        obj.lastEvent.type = 'drag';
        obj.lastEvent.value = {
            item: item,
            transform: item._element.style.transform
        };
    })

    grid.on('move', function(data){
        obj.lastEvent.type = 'drag';
        obj.lastEvent.value = {
            item: data._element,
            fromIndex: data.fromIndex,
            toIndex: data.toIndex
        }
    })

    grid.on('remove', function (items, indices) {
        console.log(items[0], indices[0]);
        obj.lastEvent.type = 'remove';
        obj.lastEvent.value = {
            item: items[0]._element,
            index: indices[0]
        }
    });

    obj.applyCSS();
    obj.grid.refreshItems();

    return obj;
}
