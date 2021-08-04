import { GridStack } from 'gridstack'
import { Tile } from './Tile'
import './Dashboard.css'
import {
    htmlToElement
} from '../Utils'
import 'gridstack/dist/gridstack.css'
import 'gridstack/dist/h5/gridstack-dd-native';
import { strings } from '../Strings'
import { refreshTooltips } from '../Tooltips'

export function Dashboard(selector, options={}){
    var obj = this
    var parent = document.querySelector(selector)
    var messageContainer = htmlToElement(`
        <div class="empty-dashboard-message-container">
        </div>
    `)
    parent.classList.add('autoql-vanilla-dashboard-container')
    var gridContainer = document.createElement('div')
    gridContainer.classList.add('grid-stack')
    parent.appendChild(gridContainer)
    parent.appendChild(messageContainer)
    obj.messageContainer = messageContainer
    obj.messageContainer.style.display = 'none'

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
        notExecutedText: strings.executeDashboard,
        splitView: true,
        secondDisplayType: 'table',
        secondDisplayPercentage: 25,
        enableDynamicCharting: true,
        dashboardId: -1,
        autoChartAggregations: true,
        name: undefined
    }

    obj.options.tiles = options.tiles

    if('authentication' in options){
        for (let [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value
        }
    }

    if('dataFormatting' in options){
        for (let [key, value] of Object.entries(options['dataFormatting'])) {
            obj.options.dataFormatting[key] = value
        }
    }

    if('autoQLConfig' in options){
        for (let [key, value] of Object.entries(options['autoQLConfig'])) {
            obj.options.autoQLConfig[key] = value
        }
    }

    if('themeConfig' in options){
        for (let [key, value] of Object.entries(options['themeConfig'])) {
            obj.options.themeConfig[key] = value
        }
    }

    for (let [key, value] of Object.entries(options)) {
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
            w: tile.w,
            h: tile.h,
            x: tile.x,
            y: tile.y,
            minH: 1,
            minW: 3
        })
    }

    obj.undoResize = (el, newWidth, newHeight) => {
        obj.grid.update(el, null, null, newWidth, newHeight)
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('chata-resize', {}))
        }, 200)
    }

    obj.undoDrag = (el, x, y) => {
        obj.grid.update(el, x, y, null, null)
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('chata-resize', {}))
        }, 200)
    }

    obj.undoAdd = (el) => {
        var tiles = []
        obj.tiles.map((tile) => {
            if(tile.options.key != el.options.key)tiles.push(tile)
        })
        obj.tiles = tiles
        obj.grid.removeWidget(el)
        return el
    }

    obj.undoDelete = (el, options) => {
        obj.grid.addWidget(el, options)
        obj.tiles.push(el)
        return el
    }

    obj.grid.on('dragstart', (event, el) => {
        obj.showPlaceHolders()
        const {
            x,
        } = el.gridstackNode
        const undoCallback = () => {
            obj.undoDrag(el, x, x)
        }
        obj.setUndoData('drag', undoCallback, el)
    })

    obj.grid.on('dragstop', () => {
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

    obj.grid.on('resizestop', () => {
        obj.hidePlaceHolders()
        window.dispatchEvent(new CustomEvent('chata-resize', {}))
    })

    obj.showPlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.showPlaceHolder()
        })
    }

    obj.hidePlaceHolders = function(){
        obj.tiles.forEach(function(tile){
            tile.hidePlaceHolder()
        })
    }

    obj.startEditing = () => {
        obj.options.isEditing = true
        parent.classList.add('editing')
        obj.tiles.forEach((item) => {
            item.startEditing()
        })
        if(obj.isEmpty()){
            obj.newTileMessage()
        }
    }

    obj.stopEditing = () => {
        obj.options.isEditing = false
        parent.classList.remove('editing')
        obj.tiles.forEach((item) => {
            item.stopEditing()
        })
        if(obj.options.executeOnStopEditing)obj.run()
        if(obj.isEmpty()){
            if(obj.options.isEditing){
                obj.newTileMessage()
            }else{
                obj.startBuildingMessage()
            }
        }
    }

    obj.run = () => {
        obj.tiles.forEach((item) => {
            item.runTile()
        })

    }

    obj.addTile = (options) => {
        var e = new Tile(obj, {
            ...options
        })
        obj.tiles.push(e)
        grid.addWidget(e, {
            w: options.w,
            h: options.h,
            minH: 1,
            minW: 3
        })

        obj.setUndoData('addTile', () => {
            return obj.undoAdd(e)
        }, e)

        e.startEditing()
        setTimeout(() => {
            e.focusItem()
            refreshTooltips()
        }, 150)
        obj.hideMessage()
    }

    obj.undo = () => {
        const {
            eventType,
            undoCallback,
            changedItem
        } = obj.undoData
        const {
            height,
            width,
            x,
            y
        } = changedItem.gridstackNode

        if(!eventType)return

        switch (eventType) {
            case 'resize':

                undoCallback()

                obj.setUndoData('resize', () => {
                    obj.undoResize(changedItem, width, height)
                }, changedItem)

                break
            case 'drag':
                undoCallback()
                obj.setUndoData('drag', () => {
                    obj.undoDrag(changedItem, x, y)
                }, changedItem)
                break
            case 'addTile':
                var removedItem = undoCallback()
                obj.setUndoData('removeTile', () => {
                    return obj.undoDelete(
                        removedItem, changedItem.gridstackNode
                    )
                }, removedItem)
                break
            case 'removeTile':
                var itemAdded = undoCallback()
                obj.setUndoData('addTile', () => {
                    return obj.undoAdd(itemAdded)
                }, itemAdded)
                break
            case 'query-change':
                var oldValue = undoCallback()
                obj.setUndoData('query-change', () => {
                    var curValue = changedItem.inputQuery.value
                    changedItem.inputQuery.value = oldValue

                    return curValue
                }, changedItem)
                break
            case 'title-change':
                var oldInput = undoCallback()
                obj.setUndoData('title-change', () => {
                    var curValue = changedItem.inputTitle.value
                    changedItem.inputTitle.value = oldInput
                    return curValue
                }, changedItem)
                break
            case 'display-type-change':
                var oldDisplay = undoCallback()
                obj.setUndoData('display-type-change', () => {
                    var curValue = changedItem.internalDisplayType
                    changedItem.internalDisplayType = oldDisplay
                    changedItem.displayData()
                    return curValue
                }, changedItem)
                break
            case 'reset-tile':
                var jsonValues = undoCallback()
                obj.setUndoData('restore-tile', () => {
                    for (var i = 0; i < jsonValues.length; i++) {
                        var json = jsonValues[i]
                        if(json){
                            var view = changedItem.views[i]
                            view.setJSON(json)
                            view.displayData()
                        }
                    }
                }, changedItem)
                break
            case 'restore-tile':
                undoCallback()
                obj.setUndoData('reset-tile', () => {
                    return changedItem.views.map(view => view.reset())
                }, changedItem)
                break
            case 'split-view':
                undoCallback()
                obj.setUndoData('split-view', () => {
                    changedItem.toggleSplit()
                }, changedItem)
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

    obj.isEmpty = () => {
        return obj.tiles.length === 0
    }

    obj.newTileMessage = () => {
        obj.messageContainer.style.display = 'block'
        obj.messageContainer.innerHTML = ''
        var btn = htmlToElement(`
            ${strings.addedNewTile2}
        `)

        obj.messageContainer.appendChild(
            document.createTextNode(strings.addedNewTile1)
        )

        obj.messageContainer.appendChild(btn)

        obj.messageContainer.appendChild(
            document.createTextNode(strings.addedNewTile3)
        )

        btn.onclick = () => {
            obj.addTile({
                title: '',
                query: '',
                w: 6,
                h: 5,
            })
        }
    }

    obj.startBuildingMessage = () => {
        obj.messageContainer.style.display = 'block'
        obj.messageContainer.innerHTML = ''
        var btn = htmlToElement(`
            <span class="empty-dashboard-new-tile-btn">New Dashboard</span>
        `)

        obj.messageContainer.appendChild(
            document.createTextNode('Start building a ')
        )

        obj.messageContainer.appendChild(btn)

        btn.onclick = () => {
            obj.startEditing()
        }
    }

    obj.hideMessage = () => {
        obj.messageContainer.innerHTML = ''
        obj.messageContainer.style.display = 'none'
    }


    if(obj.options.isEditing)obj.startEditing()

    if(obj.isEmpty()){
        if(options.isEditing){
            obj.newTileMessage()
        }else{
            obj.startBuildingMessage()
        }
    }

    refreshTooltips()

    return obj
}
