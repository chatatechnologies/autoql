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
        handle: '.autoql-vanilla-dashboard-tile-drag-handle'
    }, gridContainer)

    for (var i = 0; i < 12; i++) {
        var e = new Tile({
            title: 'Tile ' + (i+1)
        })
        grid.addWidget(e, {width: 4})
    }

    return parent
}
