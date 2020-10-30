import './Tile.css'
import {
    QUERY,
    NOTEBOOK,
    TILE_RUN_QUERY,
    DASHBOARD_DELETE_ICON
} from '../Svg'
import { ChataInput, InputContainer } from '../ChataComponents'

export function Tile(dashboard, options){
    var item = document.createElement('div')
    item.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2,
    }

    var content = document.createElement('div');
    const dragPositions = [
        'left',
        'bottom',
        'top',
        'right'
    ]


    for (var [key, value] of Object.entries(options)) {
        item.options[key] = value;
    }

    var placeHolderDrag = document.createElement('div');
    var titleWrapper = document.createElement('div')
    var tileInputContainer = document.createElement('div')
    var deleteButton = document.createElement('span');
    var tilePlayBuytton = document.createElement('div');
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
    }, QUERY);

    var queryInput2 = new ChataInput('input', {
        placeholder: 'Add descriptive title (optional)',
        type: "single"
    }, NOTEBOOK);

    queryInput.input.setAttribute('data-tippy-content', 'Query')
    queryInput2.input.setAttribute('data-tippy-content', 'Title')


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
    placeHolderDrag.classList.add('autoql-vanilla-item-content');
    tileInputContainer.appendChild(inputContainer1)
    tileInputContainer.appendChild(inputContainer2)
    tileInputContainer.appendChild(tilePlayBuytton)

    placeHolderDrag.innerHTML = `
        <div class="autoql-vanilla-placeholder-top"></div>
        <div class="autoql-vanilla-placeholder-content"></div>
    `
    tilePlayBuytton.innerHTML = TILE_RUN_QUERY
    deleteButton.innerHTML = DASHBOARD_DELETE_ICON

    item.classList.add('grid-stack-item')
    content.classList.add('grid-stack-item-content')
    content.classList.add('autoql-vanilla-chata-dashboard-item')
    content.classList.add('editing')

    titleWrapper.classList.add('autoql-vanilla-dashboard-title-wrapper')
    tileInputContainer.classList.add(
        'autoql-vanilla-dashboard-tile-input-container'
    )

    titleWrapper.appendChild(tileInputContainer)
    content.appendChild(titleWrapper)
    content.appendChild(deleteButton)
    content.appendChild(placeHolderDrag)
    item.appendChild(content)

    item.inputQuery = queryInput.input
    item.inputTitle = queryInput2.input
    item.itemContent = content;
    item.placeHolderDrag = placeHolderDrag

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
        item.placeHolderDrag.style.display = 'block'
    }

    item.hidePlaceHolder = function(){
        titleWrapper.style.display = 'flex'
        item.placeHolderDrag.style.display = 'none'
    }

    for (var i = 0; i < dragPositions.length; i++) {
        var pos = dragPositions[i]
        var handler = document.createElement('div')
        handler.classList.add('autoql-vanilla-dashboard-tile-drag-handle')
        handler.classList.add(pos)

        content.appendChild(handler)
    }


    item.showPlaceHolder()

    return item
}
