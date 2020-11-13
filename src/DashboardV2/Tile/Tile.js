import {
    QUERY,
    NOTEBOOK,
    TILE_RUN_QUERY,
    DASHBOARD_DELETE_ICON,
    SPLIT_VIEW,
    SPLIT_VIEW_ACTIVE
} from '../../Svg'
import { ChataInput, InputContainer } from '../../ChataComponents'
import { TileView } from '../TileView'
import {
    htmlToElement
} from '../../Utils'
import Split from 'split.js'
import './Tile.css'


export function Tile(dashboard, options){
    var item = document.createElement('div')
    item.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2,
        isSplit: false,
        splitView: false
    }

    item.splitInstance = undefined

    var content = document.createElement('div')
    const dragPositions = [
        'left',
        'bottom',
        'top',
        'right'
    ]


    for (var [key, value] of Object.entries(options)) {
        item.options[key] = value
    }

    var placeHolderDrag = document.createElement('div')
    var titleWrapper = document.createElement('div')
    var responseWrapper = document.createElement('div')
    var tileInputContainer = document.createElement('div')
    var deleteButton = document.createElement('span')
    var tilePlayBuytton = document.createElement('div')
    var tileTitleContainer = document.createElement('div')
    var tileTitle = document.createElement('span')

    var vizToolbarSplit = htmlToElement(`
        <div class="autoql-vanilla-tile-toolbar autoql-vanilla-split-view-btn">
        </div>
    `)

    var vizToolbarSplitButton = htmlToElement(`
        <button
        class="autoql-vanilla-chata-toolbar-btn"
        data-tippy-content="Split View">
        </button>
    `)

    var vizToolbarSplitContent = htmlToElement(`
        <span class="autoql-vanilla-chata-icon" style="color: inherit;">
            ${SPLIT_VIEW}
        </span>
    `)

    vizToolbarSplit.appendChild(vizToolbarSplitButton)
    vizToolbarSplitButton.appendChild(vizToolbarSplitContent)

    vizToolbarSplit.onclick = () => {
        item.toggleSplit()
    }

    var inputContainer1 = new InputContainer([
        'chata-rule-input',
        'dashboard-tile-left-input-container'
    ])

    var inputContainer2 = new InputContainer([
        'chata-rule-input',
        'dashboard-tile-right-input-container'
    ])

    var queryInput = new ChataInput('input', {
        placeholder: 'Type a query in your own words',
        type: "single"
    }, QUERY)

    var queryInput2 = new ChataInput('input', {
        placeholder: 'Add descriptive title (optional)',
        type: "single"
    }, NOTEBOOK)

    queryInput.input.setAttribute('data-tippy-content', 'Query')
    queryInput2.input.setAttribute('data-tippy-content', 'Title')


    placeHolderDrag.innerHTML = `
    <div class="autoql-vanilla-placeholder-top"></div>
    <div class="autoql-vanilla-placeholder-content"></div>
    `
    const notExecutedText = dashboard.options.notExecutedText

    const divider = `
    <div class="autoql-vanilla-dashboard-tile-title-divider">
    </div>`

    inputContainer1.appendChild(queryInput.input)
    inputContainer1.appendChild(queryInput.spanIcon)
    inputContainer2.appendChild(queryInput2.input)
    inputContainer2.appendChild(queryInput2.spanIcon)
    queryInput.spanIcon.classList.add('autoql-vanilla-icon-blue')
    queryInput2.spanIcon.classList.add('autoql-vanilla-icon-blue')
    queryInput.input.classList.add('autoql-vanilla-icon-blue')
    queryInput2.input.classList.add('autoql-vanilla-icon-blue')
    queryInput.input.classList.add('query')
    queryInput2.input.classList.add('title')
    tilePlayBuytton.classList.add('autoql-vanilla-dashboard-tile-play-button')
    tilePlayBuytton.classList.add('autoql-vanilla-icon-blue')
    deleteButton.classList.add('autoql-vanilla-dashboard-tile-delete-button')
    placeHolderDrag.classList.add('autoql-vanilla-item-content')
    responseWrapper.classList.add(
        'autoql-vanilla-dashboard-tile-response-wrapper'
    )
    tileTitleContainer.classList.add(
        'autoql-vanilla-dashboard-tile-title-container'
    )
    tileTitle.classList.add('autoql-vanilla-dashboard-tile-title-container')
    tileTitle.classList.add('autoql-vanilla-dashboard-tile-title')
    tileInputContainer.appendChild(inputContainer1)
    tileInputContainer.appendChild(inputContainer2)
    tileInputContainer.appendChild(tilePlayBuytton)
    tileTitleContainer.appendChild(tileTitle)
    tileTitleContainer.appendChild(htmlToElement(divider))


    placeHolderDrag.style.display = 'none'
    tilePlayBuytton.innerHTML = TILE_RUN_QUERY
    deleteButton.innerHTML = DASHBOARD_DELETE_ICON

    item.classList.add('grid-stack-item')
    content.classList.add('grid-stack-item-content')
    content.classList.add('autoql-vanilla-chata-dashboard-item')

    titleWrapper.classList.add('autoql-vanilla-dashboard-title-wrapper')
    tileInputContainer.classList.add(
        'autoql-vanilla-dashboard-tile-input-container'
    )

    titleWrapper.appendChild(tileInputContainer)
    titleWrapper.appendChild(tileTitleContainer)
    content.appendChild(titleWrapper)
    content.appendChild(responseWrapper)
    content.appendChild(deleteButton)
    content.appendChild(placeHolderDrag)
    content.appendChild(vizToolbarSplit)
    item.appendChild(content)

    tileInputContainer.style.display = 'none'
    deleteButton.style.visibility = 'hidden'


    deleteButton.onclick = (evt) => {
        dashboard.grid.removeWidget(item)
    }
    for (var i = 0; i < dragPositions.length; i++) {
        var pos = dragPositions[i]
        var handler = document.createElement('div')
        handler.classList.add('autoql-vanilla-dashboard-tile-drag-handle')
        handler.classList.add(pos)

        content.appendChild(handler)
    }

    item.tilePlayBuytton = tilePlayBuytton
    item.inputQuery = queryInput.input
    item.inputTitle = queryInput2.input
    item.itemContent = content
    item.placeHolderDrag = placeHolderDrag
    item.tileTitle = tileTitle
    item.tileTitle.textContent = options.title
    || item.options.query || 'Untitled'
    item.inputQuery.value = options.query
    item.inputTitle.value = options.title
    || item.options.query
    item.responseWrapper = responseWrapper
    item.dashboard = dashboard


    item.inputQuery.onkeypress = function(evt){
        if(evt.keyCode == 13 && this.value){
            item.runTile()
        }
    }

    item.inputQuery.onblur = (event) => {
        inputContainer1.classList.remove('clicked')
    }

    item.inputQuery.onfocus = (event) => {
        inputContainer1.classList.add('clicked')
    }

    item.inputTitle.onblur = (event) => {
        inputContainer2.classList.remove('clicked')
    }

    item.inputTitle.onfocus = (event) => {
        inputContainer2.classList.add('clicked')
    }

    item.showPlaceHolder = function(){
        titleWrapper.style.display = 'none'
        responseWrapper.style.display = 'none'
        item.placeHolderDrag.style.display = 'block'
    }

    item.hidePlaceHolder = function(){
        titleWrapper.style.display = 'flex'
        responseWrapper.style.display = 'block'
        item.placeHolderDrag.style.display = 'none'
    }

    item.startEditing = () => {
        tileInputContainer.style.display = 'flex'
        tileTitleContainer.style.display = 'none'
        deleteButton.style.visibility = 'visible'
        content.classList.add('editing')
        dashboard.grid.enable()

    }

    item.stopEditing = () => {
        tileInputContainer.style.display = 'none'
        tileTitleContainer.style.display = 'block'
        content.classList.remove('editing')
        dashboard.grid.disable()
        item.tileTitle.textContent = item.inputTitle.value
        || item.inputQuery.value || 'Untitled'
        deleteButton.style.visibility = 'hidden'
    }

    item.switchSplitButton = (svg, tooltip) => {
        vizToolbarSplitContent.innerHTML = svg
        vizToolbarSplitButton.setAttribute(
            'data-tippy-content', tooltip
        )
    }

    item.refreshViews = () => {
        item.views.map(
            view => view.displayData()
        );
    }

    item.focusItem = function(){
        item.inputQuery.focus();
    }

    item.toggleSplit = () => {
        if(item.options.isSplit){
            item.options.isSplit = false
            if(item.splitInstance)item.splitInstance.destroy()
            item.views[1].hide()
            item.switchSplitButton(SPLIT_VIEW, 'Split View')
            item.refreshViews()
        }else{
            item.views.map(view => view.show())
            item.splitInstance = Split(item.views, {
                direction: 'vertical',
                sizes: [50, 50],
                minSize: [0, 0],
                gutterSize: 7,
                cursor: 'row-resize',
                onDragEnd: () => {
                    window.dispatchEvent(new CustomEvent('chata-resize', {}));
                }
            })
            item.options.isSplit = true
            item.switchSplitButton(SPLIT_VIEW_ACTIVE, 'Single View')
            item.refreshViews()
        }
    }

    item.runTile = () => {
        if(item.options.isSplit){
            item.views.map(view => view.run())
        }else{
            item.views[0].run()
        }
    }

    item.tilePlayBuytton.onclick = () => {
        item.runTile()
    }

    item.views = [
        new TileView(item),
        new TileView(item, true)
    ]


    item.views.map(view => responseWrapper.appendChild(view))

    if(!item.options.splitView){
        item.views[1].hide()
    }else{
        item.toggleSplit()
    }

    dashboard.grid.disable()

    return item
}
