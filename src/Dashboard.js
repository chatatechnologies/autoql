function Dashboard(selector, options={}){
    var grid = new Muuri(selector, {
        // layoutOnResize: true,
        layoutDuration: 400,
        showDuration: 0,
        dragSortHeuristics: {
            sortInterval: 10,
            minDragDistance: 1,
            minBounceBackAngle: 1
        },
        layoutEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        dragEnabled: true,
        dragSort: function () {
            return [grid];
        },
        dragSortInterval: 0,
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease',
        dragStartPredicate: function (item, event) {
            if(event.target.tagName == 'SPAN'){
                return false;
            }
            if(event.target.classList.contains('item-content')){
                if (grid._settings.dragEnabled) {
                    return Muuri.ItemDrag.defaultStartPredicate(item, event);
                } else {
                    return false;
                }
            }
        },
    });

    var items = [];
    for (var i = 0; i < options.tiles.length; i++) {
        var opts = {
            query: options.tiles[i].query,
            title: options.tiles[i].title
        }
        items.push(new Tile(grid, opts));
    }


    this.grid = grid;
    this.tiles = items;
    this.grid.add(this.tiles);

    this.startEditing = function(){
        this.tiles.forEach(function(tile){
            tile.startEditing();
        })
    }

    this.stopEditing = function(){
        this.tiles.forEach(function(tile){
            tile.stopEditing();
        })
    }
    return this;
}
