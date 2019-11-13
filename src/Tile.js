function Tile(grid, options={}){
    var chataDashboardItem = document.createElement('div');
    var itemContent = document.createElement('div');
    var tileInputContainer = document.createElement('div');
    var tileTitleContainer = document.createElement('div');
    var tileTitle = document.createElement('span');
    var tileResponseWrapper = document.createElement('div');
    var tileResponseContainer = document.createElement('div');
    var resizeHandler = document.createElement('span');
    var inputQuery = document.createElement('input');
    var inputTitle = document.createElement('input');
    var tilePlayBuytton = document.createElement('div');
    const placeHolderText = `
        <div class="dashboard-tile-placeholder-text">
            <em>Hit "Execute" to run this dashboard</em>
        </div>
    `;

    const divider = `
        <div class="dashboard-tile-title-divider">
        </div>
    `;

    chataDashboardItem.classList.add('chata-dashboard-item');
    itemContent.classList.add('item-content');
    tileInputContainer.classList.add('dashboard-tile-input-container');
    tileTitleContainer.classList.add('dashboard-tile-title-container');
    tileTitle.classList.add('dashboard-tile-title-container');

    tileResponseWrapper.classList.add('dashboard-tile-response-wrapper');
    tileResponseContainer.classList.add('dashboard-tile-response-container');
    tileTitle.classList.add('dashboard-tile-title');
    resizeHandler.classList.add('resize-handler');
    inputQuery.classList.add('dashboard-tile-input');
    inputTitle.classList.add('dashboard-tile-input');
    tilePlayBuytton.classList.add('dashboard-tile-play-button');
    inputQuery.classList.add('query');
    inputTitle.classList.add('title');

    inputQuery.setAttribute('placeholder', 'Query');
    inputTitle.setAttribute('placeholder', 'Title (optional)');
    inputQuery.setAttribute('value', 'profit by month last year');
    inputTitle.setAttribute('value', '2018 Monthly Profit');

    tilePlayBuytton.innerHTML = TILE_RUN_QUERY;
    tileResponseContainer.innerHTML = placeHolderText;


    tileInputContainer.appendChild(inputQuery);
    tileInputContainer.appendChild(inputTitle);
    tileInputContainer.appendChild(tilePlayBuytton);

    tileTitleContainer.appendChild(tileTitle);
    tileTitleContainer.appendChild(htmlToElement(divider));

    tileResponseWrapper.appendChild(tileResponseContainer);

    itemContent.appendChild(tileInputContainer);
    itemContent.appendChild(tileTitleContainer);
    itemContent.appendChild(tileResponseWrapper);
    itemContent.appendChild(resizeHandler);
    chataDashboardItem.appendChild(itemContent);

    resizeHandler.addEventListener('mousedown', initResize, false);
    var startX, startY, startWidth, startHeight;

    function initResize(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(
            document.defaultView.getComputedStyle(
                chataDashboardItem
            ).width,10);
        startHeight = parseInt(
            document.defaultView.getComputedStyle(
                chataDashboardItem
            ).height, 10);
            window.addEventListener('mousemove', resizeItem, false);
            window.addEventListener('mouseup', stopResize, false);
        }
    function resizeItem(e) {
        var newWidth = (startWidth + e.clientX - startX);
        var newHeight = (startHeight + e.clientY - startY);
        if(newWidth < 320){
            newWidth = 320;
        }else if(newWidth >= chataDashboardItem.parentElement.clientWidth - 20){
            newWidth = chataDashboardItem.parentElement.clientWidth - 20;
        }
        if(newHeight < 140){
            newHeight = 140;
        }
        chataDashboardItem.style.width = newWidth + 'px';
        chataDashboardItem.style.height = newHeight + 'px';
        grid.refreshItems(chataDashboardItem).layout();
    }
    function stopResize(e) {
        window.removeEventListener('mousemove', resizeItem, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
    chataDashboardItem.itemContent = itemContent;
    chataDashboardItem.inputQuery = inputQuery;
    chataDashboardItem.inputTitle = inputTitle;
    chataDashboardItem.tileTitle = tileTitle;
    chataDashboardItem.tileInputContainer = tileInputContainer;
    chataDashboardItem.tileTitleContainer = tileTitleContainer;
    chataDashboardItem.tileInputContainer.style.display = 'none';
    chataDashboardItem.tileTitle.textContent = options.title;
    chataDashboardItem.inputQuery.value = options.query;
    chataDashboardItem.inputTitle.value = options.title;


    chataDashboardItem.startEditing = function(){
        chataDashboardItem.tileInputContainer.style.display = 'flex';
        chataDashboardItem.tileTitleContainer.style.display = 'none';
    }

    chataDashboardItem.stopEditing = function(){
        chataDashboardItem.tileInputContainer.style.display = 'none';
        chataDashboardItem.tileTitleContainer.style.display = 'block';
    }

    return chataDashboardItem;
}




    // <div class="chata-dashboard-item">
    //     <div class="item-content">
    //         <div class="dashboard-tile-input-container">
    //             <input class="dashboard-tile-input query" placeholder="Query" value="profit by month last year">
    //             <input class="dashboard-tile-input title" placeholder="Title (optional)" value="2018 Monthly Profit">
    //             <div class="dashboard-tile-play-button">
    //                 <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    //                     <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
    //                 </svg>
    //             </div>
    //         </div>
    //         <!-- <div class="dashboard-tile-title-container">
    //             <span class="dashboard-tile-title">2018 Monthly Profits</span>
    //             <div class="dashboard-tile-title-divider">
    //             </div>
    //         </div> -->
    //         <div class="dashboard-tile-response-wrapper editing small">
    //             <div class="dashboard-tile-response-container">
    //                     <div class="dashboard-tile-placeholder-text">
    //                         <em>Hit "Execute" to run this dashboard</em>
    //                     </div>
    //             </div>
    //         </div>
    //         <span class="resize-handler">
    //         </span>
    //     </div>
    // </div>
