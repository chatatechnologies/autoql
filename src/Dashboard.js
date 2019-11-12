function Dashboard(selector){
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
            if (grid._settings.dragEnabled) {
                return Muuri.ItemDrag.defaultStartPredicate(item, event);
            } else {
                return false;
            }
        },
    });

    var resize = document.querySelector('.resize-handler')
    resize.addEventListener('mousedown', initResize, false);
    var startX, startY, startWidth, startHeight;

    function initResize(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(
            document.defaultView.getComputedStyle(
                resize.parentElement.parentElement
            ).width,10);
        startHeight = parseInt(
            document.defaultView.getComputedStyle(
                resize.parentElement.parentElement
            ).height, 10);
            window.addEventListener('mousemove', Resize, false);
            window.addEventListener('mouseup', stopResize, false);
        }
    function Resize(e) {
        var newWidth = (startWidth + e.clientX - startX);
        var newHeight = (startHeight + e.clientY - startY);
        if(newWidth < 320){
            newWidth = 320;
        }else if(newWidth >= resize.parentElement.parentElement.parentElement.clientWidth - 20){
            newWidth = resize.parentElement.parentElement.parentElement.clientWidth - 20;
        }
        if(newHeight < 140){
            newHeight = 140;
        }
        resize.parentElement.parentElement.style.width = newWidth + 'px';
        resize.parentElement.parentElement.style.height = newHeight + 'px';
        grid.refreshItems(resize.parentElement.parentElement).layout()
    }
    function stopResize(e) {
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }

    return this;
}
