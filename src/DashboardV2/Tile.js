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

    return item
}
