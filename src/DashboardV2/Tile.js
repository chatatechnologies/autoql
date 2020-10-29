import './Tile.css'

export function Tile(options){
    var item = document.createElement('div')
    var content = document.createElement('div');

    item.options = {
        query: '',
        title: '',
        displayType: 'table',
        w: 3,
        h: 2,
    }


    for (var [key, value] of Object.entries(options)) {
        item.options[key] = value;
    }

    content.innerHTML = item.options.title

    item.classList.add('grid-stack-item')
    content.classList.add('grid-stack-item-content')
    item.appendChild(content)

    var dragPositions = [
        'left',
        'bottom',
        'top',
        'right'
    ]

    for (var i = 0; i < dragPositions.length; i++) {
        var pos = dragPositions[i]
        var handler = document.createElement('div')
        handler.classList.add('autoql-vanilla-dashboard-tile-drag-handle')
        handler.classList.add(pos)

        content.appendChild(handler)
    }

    return item
}
