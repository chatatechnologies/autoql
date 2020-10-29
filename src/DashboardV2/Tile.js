export function Tile(options){
    var item = document.createElement('div')

    item.innerHTML = '1'

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

    item.innerHTML = item.options.title

    return item
}
