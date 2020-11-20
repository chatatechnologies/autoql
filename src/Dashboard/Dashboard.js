import { GridStack } from 'gridstack'
import { Tile } from './Tile'
import {
    uuidv4
} from '../Utils'

import './Dashboard.css'
import 'gridstack/dist/gridstack.css'

export function Dashboard(selector, options={}){
    var obj = this
    var parent = document.querySelector(selector)
    parent.classList.add('autoql-vanilla-dashboard-container')
    var gridContainer = document.createElement('div')
    gridContainer.classList.add('grid-stack')
    parent.appendChild(gridContainer)

    obj.undoData = {
        eventType: undefined,
        changedItem: undefined,
        undoCallback: () => {},
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

    obj.options.tiles = options.tiles

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value
        }
    }

    if('dataFormatting' in options){
        for (var [key, value] of Object.entries(options['dataFormatting'])) {
            obj.options.dataFormatting[key] = value
        }
    }

    if('autoQLConfig' in options){
        for (var [key, value] of Object.entries(options['autoQLConfig'])) {
            obj.options.autoQLConfig[key] = value
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            obj.options.themeConfig[key] = value
        }
    }

    for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            obj.options[key] = value
        }
    }

    var grid = GridStack.init({
        handle: '.autoql-vanilla-dashboard-tile-drag-handle',
        placeholderClass : 'autoql-vanilla-tile-placeholder',
        cellHeight: '80px'
    }, gridContainer)

    obj.grid = grid
    obj.tiles = []

    for (var i = 0; i < obj.options.tiles.length; i++) {
        var tile = obj.options.tiles[i]
        var e = new Tile(obj, {
            ...tile
        })
        obj.tiles.push(e)
        grid.addWidget(e, {
            width: tile.w,
            height: tile.h,
            x: tile.x,
            y: tile.y,
            minHeight: 1,
            minWidth: 3
        })
    }

    obj.undoResize = (el, newWidth, newHeight) => {
        obj.grid.update(el, null, null, newWidth, newHeight)
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
    }

    obj.grid.on('dragstart', (event, el) => {
        obj.showPlaceHolders()
    })

    obj.grid.on('dragstop', (event, el) => {
        obj.hidePlaceHolders()
    })

    obj.grid.on('resizestart', (event, el) => {
        obj.showPlaceHolders()
        const {
            height,
            width
        } = el.gridstackNode
        const undoCallback = () => {
            obj.undoResize(el, width, height)
        }
        obj.setUndoData('resize', undoCallback, el)
    })

    obj.grid.on('resizestop', (event, el) => {
        obj.hidePlaceHolders()
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
    })

    obj.showPlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.showPlaceHolder();
        })
    }

    obj.hidePlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.hidePlaceHolder();
        })
    }

    obj.startEditing = () => {
        obj.tiles.forEach((item, i) => {
            item.startEditing()
        });

    }

    obj.stopEditing = () => {
        obj.tiles.forEach((item, i) => {
            item.stopEditing()
        });
        if(obj.options.executeOnStopEditing)obj.run()
    }

    obj.run = () => {
        obj.tiles.forEach((item, i) => {
            item.runTile()
        });

    }

    obj.addTile = (options) => {
        var e = new Tile(obj, {
            ...options
        })
        obj.tiles.push(e)
        grid.addWidget(e, {
            width: options.w,
            height: options.h,
            minHeight: 1,
            minWidth: 3
        })

        e.startEditing()
        setTimeout(() => {
            e.focusItem()
        }, 150)
    }

    obj.undo = () => {
        const {
            eventType,
            undoCallback,
            changedItem
        } = obj.undoData

        if(!eventType)return

        switch (eventType) {
            case 'resize':
                const {
                    height,
                    width
                } = changedItem.gridstackNode
                const callback = () => {
                    obj.undoResize(changedItem, width, height)
                }
                undoCallback()
                obj.setUndoData('resize', callback, changedItem)
                break;
            default:
        }
    }

    obj.setUndoData = (eventType, undoCallback, changedItem) => {
        obj.undoData.eventType = eventType
        obj.undoData.undoCallback = undoCallback
        obj.undoData.changedItem = changedItem
    }

    if(obj.options.executeOnMount){
        obj.run()
    }


    return obj
}
