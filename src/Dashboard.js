function Dashboard(selector){

    var grid1 = new Muuri(selector, {
        dragEnabled: true,
        layoutOnResize: true,
        // dragContainer: document.body,
        dragSort: function () {
            return [grid1]
        }
    });

    return this;
}
