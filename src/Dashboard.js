function Dashboard(selector){

    var grid1 = new Muuri(selector, {
        layoutOnResize: true,
        layoutDuration: 400,
        layoutEasing: 'ease',
        dragEnabled: true,
        dragSort: function () {
            return [grid1];
        },
        dragSortInterval: 0,
        dragContainer: document.body,
        dragReleaseDuration: 400,
        dragReleaseEasing: 'ease'
    });


    return this;
}
