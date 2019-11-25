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
        token: '',
        apiKey: '',
        customerId: '',
        userId: '',
        domain: '',
        tiles: [],
        onChangeCallback: function(){},
        isEditing: false,
        currencyCode: 'USD',
        languageCode: 'en-US',
        // comparisonDisplay: 'ratio' || 'percent'
        fontFamily:	'sans-serif',
        chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
        executeOnMount:	true,
        executeOnStopEditing: true,
        notExecutedText: 'Hit "Execute" to run this dashboard',
        demo: false,
        debug: false
    }

    for (var [key, value] of Object.entries(options)) {
        obj.options[key] = value;
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
        var tile = new Tile(grid, options);
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
    obj.grid._element.style.setProperty(
        '--chata-drawer-font-family',
        obj.options['fontFamily']
    );

    obj.undo = function(){
        var oldValue = obj.oldState.inputValue;
        var newValue = obj.lastState.inputValue;
        obj.lastState.element.value = oldValue;
        obj.lastState.inputValue = oldValue;
        obj.oldState.inputValue = newValue;
    }

    return obj;
}
