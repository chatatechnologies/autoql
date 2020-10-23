import {
    LIGHT_THEME,
    DARK_THEME
} from '../Constants'
import { Tile } from './Tile'
import Muuri from 'muuri'
import { htmlToElement } from '../Utils'
import './Dashboard.css'

export function Dashboard(selector, options={}){
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
        dataFormatting: {
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
            enableColumnVisibilityManager: true,
            enableDrilldowns: true
        },
        themeConfig: {
            theme: 'light',
            chartColors: [
                '#26A7E9', '#A5CD39',
                '#DD6A6A', '#FFA700',
                '#00C1B2'
            ],
            accentColor: '#26a7df',
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
        secondDisplayPercentage: 25,
        enableDynamicCharting: true,
        dashboardId: -1
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

    obj.onChangeCallback = obj.options.onChangeCallback;
    const emptyDashboardMessage = htmlToElement(`
        <div class="empty-dashboard-message-container">
        </div>
    `)
    const newTileMessage = htmlToElement(`
        <span class="empty-dashboard-new-tile-btn">
            New Tile
        </span>
    `)
    emptyDashboardMessage.appendChild(newTileMessage)
    emptyDashboardMessage.appendChild(
        document.createTextNode('Add a  to get started')
    );
    var parent = document.querySelector(selector);

    var grid = new Muuri(parent, {
        layoutDuration: 400,
        showDuration: 0,
        dragSortHeuristics: {
            sortInterval: 10,
            minDragDistance: 10,
            minBounceBackAngle: 10
        },
        layoutEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        layoutOnInit: true,
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
            if(event.target.classList.contains('autoql-vanilla-item-content')){
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

    grid._element.classList.add('autoql-vanilla-chata-dashboard');

    obj.grid = grid;
    obj.tiles = items;
    for (var i = 0; i < options.tiles.length; i++) {
        var opts = {
            ...options.tiles[i]
        }
        items.push(new Tile(obj, opts));
    }
    obj.options.tiles = options.tiles || [];

    items.sort((a, b) => {
        if (a.options.y == b.options.y) return a.options.x - b.options.x;
        return a.options.y - b.options.y;
    })

    obj.grid.add(obj.tiles);
    obj.grid._settings.dragEnabled = false;

    obj.startEditing = function(){
        obj.tiles.forEach(function(tile){
            tile.startEditing();
        })
        obj.grid._settings.dragEnabled = true;
    }

    obj.stopEditing = function(){
        obj.tiles.forEach(function(tile, index){
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
        obj.checkIsEmpty()
    }

    obj.run = async function(isOnMount=false){
        obj.tiles.forEach(async function(tile, index){
            await tile.runQuery();
            if(isOnMount){
                if(options.tiles[index].splitView){
                    tile.switchToSplit();
                }
            }
        });
        obj.onChangeCallback();
    }

    if(obj.options.executeOnMount){
        obj.run(true);
    }

    if(obj.options.isEditing){
        this.startEditing();
    }

    obj.applyCSS = function(){
        const themeStyles = obj.options.themeConfig.theme === 'light'
        ? LIGHT_THEME : DARK_THEME

        for (let property in themeStyles) {
            document.documentElement.style.setProperty(
                '--autoql-vanilla-' + property,
                themeStyles[property],
            );
        }

        obj.grid._element.style.setProperty(
            '--autoql-vanilla-font-family',
            obj.options.themeConfig['fontFamily']
        );

        obj.grid._element.style.setProperty(
            '--autoql-vanilla-accent-color',
            obj.options.themeConfig['accentColor']
        )
    }

    obj.undo = function(){
        var oldValue = obj.oldState.inputValue;
        var newValue = obj.lastState.inputValue;
        if(typeof obj.lastState.element !== 'string'){
            obj.lastState.element.value = oldValue;
        }
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
        obj.lastEvent.type = 'remove';
        obj.lastEvent.value = {
            item: items[0]._element,
            index: indices[0]
        }
    });

    obj.isEmpty = () => {
        return obj.grid._element.querySelectorAll(
            '.autoql-vanilla-chata-dashboard-item'
        ).length === 0
    }

    obj.checkIsEmpty = () => {
        if(obj.isEmpty()){
            emptyDashboardMessage.style.display = 'block';
        }else{
            emptyDashboardMessage.style.display = 'none';
        }
    }

    newTileMessage.onclick = (evt) => {
        obj.addTile({
            title: '',
            query: '',
            w: 6,
            h: 5,
            notExecutedText: `To get started, enter a query and click
            <svg stroke="currentColor" fill="currentColor"
            stroke-width="0" viewBox="0 0 24 24"
            height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2
            12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
            18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
            </path>
            </svg>`
        })
    }

    parent.appendChild(emptyDashboardMessage);
    obj.applyCSS();
    obj.grid.refreshItems().layout();
    obj.checkIsEmpty()
    return obj;
}
