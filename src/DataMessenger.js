function DataMessenger(elem, options){
    var obj = this;

    obj.options = {
        authentication: {
            token: undefined,
            apiKey: undefined,
            customerId: undefined,
            userId: undefined,
            username: undefined,
            domain: undefined,
            demo: false
        },
        dataFormatting:{
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 1,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'MMM D, YYYY'
        },
        autoQLConfig: {
            debug: false,
            test: false,
            enableAutocomplete: true,
            enableQueryValidation: true,
            enableQuerySuggestions: true,
            enableColumnVisibilityManager: true,
            enableDrilldowns: true
        },
        themeConfig: {
            theme: 'light',
            chartColors: [
                '#26A7E9', '#A5CD39',
                '#DD6A6A', '#FFA700',
                '#00C1B2'
            ],
            accentColor: '#26a7df',
            fontFamily: 'sans-serif',
        },
        isVisible: false,
        placement: 'right',
        width: 500,
        height: 500,
        resizable: true,
        title: 'Data Messenger',
        showHandle: true,
        handleStyles: {},
        onVisibleChange: function(datamessenger) {},
        onHandleClick: function(datamessenger){},
        showMask: true,
        shiftScreen: false,
        onMaskClick: function(datamessenger){},
        maskClosable: true,
        userDisplayName: 'there',
        maxMessages: -1,
        clearOnClose: false,
        enableVoiceRecord: true,
        autocompleteStyles: {},
        enableExploreQueriesTab: true,
        inputPlaceholder: 'Type your queries here',
        activeIntegrator: ''
    };

    obj.autoCompleteTimer = undefined;
    obj.speechToText = getSpeech();
    obj.finalTranscript = '';
    obj.isRecordVoiceActive = false

    var rootElem = document.querySelector(elem);

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            obj.options.authentication[key] = value;
        }
    }

    if('dataFormatting' in options){
        for (var [key, value] of Object.entries(options['dataFormatting'])) {
            obj.options.dataFormatting[key] = value;
        }
    }

    if('autoQLConfig' in options){
        for (var [key, value] of Object.entries(options['autoQLConfig'])) {
            obj.options.autoQLConfig[key] = value;
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            obj.options.themeConfig[key] = value;
        }
    }

    for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            obj.options[key] = value;
        }
    }

    if(!('introMessage' in options)){
        obj.options.introMessage = "Hi " +
        obj.options.userDisplayName +
        "! Let’s dive into your data. What can I help you discover today?";
    }
    if(!('onMaskClick' in options)){
        obj.options.onMaskClick = obj.options.onHandleClick;
    }

    obj.rootElem = rootElem;
    rootElem.classList.add('autoql-vanilla-chata-drawer');
    obj.options.activeIntegrator = getActiveIntegrator(
        obj.options.authentication.domain
    );

    obj.setOption = (option, value) => {
        switch (option) {
            case 'authentication':
                obj.setObjectProp('authentication', value);
                break;
            case 'dataFormatting':
                obj.setObjectProp('dataFormatting', value);
                break;
            case 'autoQLConfig':
                obj.setObjectProp('autoQLConfig', value);
                break;
            case 'themeConfig':
                obj.setObjectProp('themeConfig', value);
                obj.applyStyles();
                break;
            case 'isVisible':
                if(!value)obj.closeDrawer();
                else obj.openDrawer();
                break;
            case 'placement':
                obj.rootElem.removeAttribute('style');
                obj.drawerButton.classList.remove(
                    obj.options.placement + '-btn'
                );
                obj.queryTabs.classList.remove(obj.options.placement);
                obj.queryTabsContainer.classList.remove(obj.options.placement);
                obj.resizeHandler.classList.remove(obj.options.placement);
                obj.options.placement = value;

                obj.drawerButton.classList.add(
                    obj.options.placement + '-btn'
                );
                obj.queryTabs.classList.add(obj.options.placement);
                obj.queryTabsContainer.classList.add(obj.options.placement);
                obj.resizeHandler.classList.add(obj.options.placement);
                obj.openDrawer();
                obj.closeDrawer();
                break;
            case 'width':
                obj.options.width = parseInt(value);
                if(obj.options.isVisible &&
                    ['left', 'right'].includes(obj.options.placement)){
                    obj.rootElem.style.width = value;
                }
                break;
            case 'height':
                obj.options.height = parseInt(value);
                if(obj.options.isVisible &&
                    ['top', 'bottom'].includes(obj.options.placement)){
                    obj.rootElem.style.height = value;
                }
                break;
            case 'resizable':
                obj.options.resizable = value;
                if(!value) obj.resizeHandler.style.visibility = 'hidden';
                else obj.resizeHandler.style.visibility = 'visible';
                break;
            case 'title':
                obj.options.title = value;
                obj.headerTitle.innerHTML = obj.options.title;
                break;
            case 'showHandle':
                obj.options.showHandle = value;
                if(value && !obj.options.isVisible){
                    obj.drawerButton.style.display = 'flex';
                }
                else obj.drawerButton.style.display = 'none';
                break;
            case 'handleStyles':
                obj.applyHandleStyles();
                break;
            case 'showMask':
                obj.options.showMask = value;
                if(value){
                    if(obj.options.isVisible){
                        obj.wrapper.style.opacity = .3;
                        obj.wrapper.style.height = '100%';
                    }else{
                        obj.wrapper.style.opacity = 0;
                        obj.wrapper.style.height = 0;
                    }
                }else{
                    obj.wrapper.style.opacity = 0;
                    obj.wrapper.style.height = 0;
                }
                break;
            case 'maxMessages':
                obj.options.maxMessages = value;
                obj.checkMaxMessages();
                break;
            case 'enableVoiceRecord':
                obj.options.autoQLConfig.enableVoiceRecord = value;
                var display = value ? 'block' : 'none';
                obj.voiceRecordButton.style.display = display;
                break;
            case 'enableExploreQueriesTab':
                obj.options.enableExploreQueriesTab = value;
                if(value && obj.options.isVisible){
                    obj.queryTabs.style.visibility = 'visible';
                }else obj.queryTabs.style.visibility = 'hidden';
                break;
            case 'inputPlaceholder':
                obj.options.inputPlaceholder = value;
                obj.input.setAttribute('placeholder', value);
            default:
                obj.options[option] = value;
        }
    }

    obj.setObjectProp = (key, _obj) => {
        console.log(typeof _obj);
        for (var [keyValue, value] of Object.entries(_obj)) {
            obj.options[key][keyValue] = value;
        }
    }

    obj.applyHandleStyles = () => {
        for (var [key, value] of Object.entries(obj.options.handleStyles)){
            obj.drawerButton.style.setProperty(key, value, '');
        }
    }

    obj.createDrawerButton = () => {
        var drawerButton = document.createElement("div");
        var drawerIcon = document.createElement("div");
        drawerIcon.setAttribute("height", "22px");
        drawerIcon.setAttribute("width", "22px");
        drawerIcon.classList.add('autoql-vanilla-chata-bubbles-icon');
        drawerIcon.classList.add('open-action');
        drawerIcon.innerHTML = CHATA_BUBBLES_ICON;
        drawerButton.classList.add('autoql-vanilla-drawer-handle');
        drawerButton.classList.add('open-action');
        drawerButton.classList.add(obj.options.placement + '-btn');
        drawerButton.appendChild(drawerIcon);
        drawerButton.addEventListener('click', function(e){
            obj.options.onHandleClick(obj);
            obj.openDrawer();
        })
        document.body.appendChild(drawerButton);
        obj.drawerButton = drawerButton;
        if(!obj.options.showHandle){
            obj.drawerButton.style.display = 'none';
        }
        obj.applyHandleStyles();
    }

    obj.openDrawer = () => {
        document.body.classList.add('autoql-vanilla-chata-body-drawer-open');
        console.log(obj.options.shiftScreen);
        obj.options.isVisible = true;
        obj.input.focus();
        if(obj.options.enableExploreQueriesTab){
            obj.queryTabs.style.visibility = 'visible';
        }
        var body = document.body;
        if(obj.options.showMask){
            obj.wrapper.style.opacity = .3;
            obj.wrapper.style.height = '100%';
        }
        if(obj.options.placement == 'right'){
            obj.rootElem.style.width = obj.options.width + 'px';
            obj.rootElem.style.height = 'calc(100vh)';

            obj.drawerButton.style.display = 'none';
            obj.rootElem.style.right = 0;
            obj.rootElem.style.top = 0;
            if(obj.options.shiftScreen){
                body.style.position = 'relative';
                body.style.overflow = 'hidden';
                body.style.transform = 'translateX(-'
                    + obj.options.width +'px)';
                obj.rootElem.style.transform = 'translateX('
                + obj.options.width +'px)';
            }else{
                obj.rootElem.style.transform = 'translateX(0px)';
            }

        }else if(obj.options.placement == 'left'){
            obj.rootElem.style.width = obj.options.width + 'px';
            obj.rootElem.style.height = 'calc(100vh)';
            obj.rootElem.style.left = 0;
            obj.rootElem.style.top = 0;
            obj.drawerButton.style.display = 'none';
            if(obj.options.shiftScreen){
                body.style.position = 'relative';
                body.style.overflow = 'hidden';
                body.style.transform = 'translateX('
                    + obj.options.width +'px)';
                obj.rootElem.style.transform = 'translateX(-'
                    + obj.options.width +'px)';
            }else{
                obj.rootElem.style.transform = 'translateX(0px)';
            }
        }else if(obj.options.placement == 'bottom'){
            obj.rootElem.style.width = '100%';
            obj.rootElem.style.height = obj.options.height + 'px';
            obj.rootElem.style.bottom = 0;
            obj.rootElem.style.left = 0;
            obj.drawerButton.style.display = 'none';
            obj.rootElem.style.transform = 'translateY(0)';
        }else if(obj.options.placement == 'top'){
            obj.rootElem.style.width = '100%';
            obj.rootElem.style.height = obj.options.height + 'px';
            obj.rootElem.style.top = 0;
            obj.rootElem.style.left = 0;
            obj.drawerButton.style.display = 'none';
            obj.rootElem.style.transform = 'translateY(0)';
        }
        obj.options.onVisibleChange(obj);
    }

    obj.closeDrawer = () => {
        document.body.classList.remove(
            'autoql-vanilla-chata-body-drawer-open'
        );
        obj.options.isVisible = false;
        obj.wrapper.style.opacity = 0;
        obj.wrapper.style.height = 0;
        obj.queryTabs.style.visibility = 'hidden';
        var body = document.body;

        if(obj.options.placement == 'right'){
            obj.rootElem.style.right = 0;
            obj.rootElem.style.top = 0;
            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }
            if(obj.options.shiftScreen){
                body.style.transform = 'translateX(0px)';
            }else{
                obj.rootElem.style.transform = 'translateX('
                + obj.options.width +'px)';
            }
        }else if(obj.options.placement == 'left'){
            obj.rootElem.style.left = 0;
            obj.rootElem.style.top = 0;
            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }
            if(obj.options.shiftScreen){
                body.style.transform = 'translateX(0px)';
            }else{
                obj.rootElem.style.transform = 'translateX(-'
                + obj.options.width +'px)';
            }
        }else if(obj.options.placement == 'bottom'){
            obj.rootElem.style.bottom = '0';
            obj.rootElem.style.transform = 'translateY('
            + obj.options.height +'px)';

            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }
        }else if(obj.options.placement == 'top'){
            obj.rootElem.style.top = '0';
            obj.rootElem.style.transform = 'translateY(-'
            + obj.options.height +'px)';

            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }
        }
        if(obj.options.clearOnClose){
            obj.clearMessages();
        }
        body.removeAttribute('style');

        obj.options.onVisibleChange(obj);
    }

    obj.createWrapper = () => {
        var wrapper = document.createElement('div');
        var body = document.body;
        body.appendChild(wrapper, obj.rootElem);
        wrapper.classList.add('autoql-vanilla-drawer-wrapper');
        obj.wrapper = wrapper;
        if(!obj.options.showMask){
            obj.wrapper.style.opacity = 0;
            obj.wrapper.style.height = 0;
        }
        wrapper.onclick = (evt) => {
            if(obj.options.showMask && obj.options.maskClosable){
                obj.options.onMaskClick(this);
            }
        }
    }

    obj.onLoadHandler = (evt) => {
        if (document.readyState === "interactive" ||
            document.readyState === "complete" ) {
            obj.createDrawerButton();
            obj.createWrapper();
            obj.applyStyles();
            obj.createHeader();
            obj.createDrawerContent();
            obj.createIntroMessageTopics();
            obj.createBar();
            obj.createResizeHandler();
            obj.createQueryTabs();
            obj.createQueryTips();
            obj.speechToTextEvent();

            obj.openDrawer();
            obj.closeDrawer();

            refreshTooltips();

            var isVisible = obj.options.isVisible;

            if(isVisible){
                obj.openDrawer();
            }else{
                obj.closeDrawer();
            }

            obj.rootElem.addEventListener('click', (evt) => {
                // REPLACE WITH onclick event
                if(evt.target.classList.contains('suggestion')){
                    obj.autoCompleteList.style.display = 'none';
                    obj.sendMessage(
                        evt.target.textContent, 'data_messenger.user'
                    );
                }
            });
        }
    }

    obj.tabsAnimation = function(displayNodes, displayBar){
        var nodes = obj.drawerContent.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = displayNodes;
        }
        obj.chataBarContainer.style.display = displayBar;
        if(displayNodes == 'none'){
            obj.headerTitle.innerHTML = 'Explore Queries';
            obj.headerRight.style.visibility = 'hidden';
        }else{
            obj.headerTitle.innerHTML = obj.options.title;
            obj.headerRight.style.visibility = 'visible';
        }
    }

    obj.queryTipsAnimation = function(display){
        obj.queryTips.style.display = display;
    }

    obj.createQueryTabs = function(){
        var orientation = obj.options.placement;
        var pageSwitcherShadowContainer = document.createElement('div');
        var pageSwitcherContainer = document.createElement('div');
        var tabChataUtils = document.createElement('div');
        var tabQueryTips = document.createElement('div');

        var dataMessengerIcon = htmlToElement(DATA_MESSENGER);
        var queryTabsIcon = htmlToElement(QUERY_TIPS);

        pageSwitcherShadowContainer.classList.add(
            'autoql-vanilla-page-switcher-shadow-container'
        );
        pageSwitcherShadowContainer.classList.add(orientation);

        pageSwitcherContainer.classList.add(
            'autoql-vanilla-page-switcher-container'
        );
        pageSwitcherContainer.classList.add(orientation);

        pageSwitcherShadowContainer.appendChild(pageSwitcherContainer);

        tabChataUtils.classList.add('tab');
        tabChataUtils.classList.add('active');
        tabChataUtils.setAttribute('data-tippy-content', 'Data Messenger');
        tabQueryTips.classList.add('tab');
        tabQueryTips.setAttribute('data-tippy-content', 'Explore Queries');

        tabChataUtils.appendChild(dataMessengerIcon);
        tabQueryTips.appendChild(queryTabsIcon);

        pageSwitcherContainer.appendChild(tabChataUtils)
        pageSwitcherContainer.appendChild(tabQueryTips)


        tabChataUtils.onclick = function(event){
            tabChataUtils.classList.add('active');
            tabQueryTips.classList.remove('active');
            obj.tabsAnimation('flex', 'block');
            obj.queryTipsAnimation('none');
        }
        tabQueryTips.onclick = function(event){
            tabQueryTips.classList.add('active');
            tabChataUtils.classList.remove('active');
            obj.tabsAnimation('none', 'none');
            obj.queryTipsAnimation('block');
        }

        var tabs = pageSwitcherShadowContainer;
        obj.rootElem.appendChild(tabs);
        obj.queryTabs = tabs;
        obj.queryTabsContainer = pageSwitcherContainer;
        obj.tabChataUtils = tabChataUtils;
        obj.tabQueryTips = tabQueryTips;
        refreshTooltips();
    }

    obj.createQueryTips = function(){
        const searchIcon = htmlToElement(SEARCH_ICON);
        var container = document.createElement('div');
        var textBar = document.createElement('div');
        var queryTipsResultContainer = document.createElement('div');
        var queryTipsResultPlaceHolder = document.createElement('div');
        var chatBarInputIcon = document.createElement('div');

        var input = document.createElement('input');

        textBar.classList.add('autoql-vanilla-text-bar');
        textBar.classList.add('autoql-vanilla-text-bar-animation');
        chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
        queryTipsResultContainer.classList.add(
            'autoql-vanilla-query-tips-result-container'
        );
        queryTipsResultPlaceHolder.classList.add(
            'query-tips-result-placeholder'
        );
        queryTipsResultPlaceHolder.innerHTML = `
            <p>
                Discover what you can ask by entering
                a topic in the search bar above.
            <p>
            <p>
                Simply click on any of the returned options
                to run the query in Data Messenger.
            <p>
        `;

        queryTipsResultContainer.appendChild(queryTipsResultPlaceHolder);
        chatBarInputIcon.appendChild(searchIcon);
        textBar.appendChild(input);
        textBar.appendChild(chatBarInputIcon);
        container.appendChild(textBar);
        container.appendChild(queryTipsResultContainer);

        input.onkeypress = function(event){

            if(event.keyCode == 13 && this.value){

                var chatBarLoadingSpinner = document.createElement('div');
                var searchVal = this.value;
                var spinnerLoader = document.createElement('div');
                spinnerLoader.classList.add('autoql-vanilla-spinner-loader');
                chatBarLoadingSpinner.classList.add(
                    'chat-bar-loading-spinner'
                );
                chatBarLoadingSpinner.appendChild(spinnerLoader);
                textBar.appendChild(chatBarLoadingSpinner);
                var options = obj.options;
                const URL = obj.getRelatedQueriesPath(
                    1, searchVal, obj.options
                );

                ChataUtils.safetynetCall(URL, function(response, s){
                    textBar.removeChild(chatBarLoadingSpinner);
                    obj.putRelatedQueries(
                        response, queryTipsResultContainer,
                        container, searchVal
                    );
                }, obj.options);
            }
        }

        container.style.display = 'none';

        input.classList.add('autoql-vanilla-chata-input')
        input.classList.add('left-padding')
        input.setAttribute('placeholder', 'Search relevant queries by topic');
        obj.queryTips = container;
        obj.drawerContent.appendChild(container);
        obj.queryTipsInput = input;
    }

    obj.putRelatedQueries = (
        response, queryTipsResultContainer, container, searchVal) => {
        var delay = 0.08;
        var list = response.data.items;
        var queryTipListContainer = document.createElement('div');
        var paginationContainer = document.createElement('div');
        var pagination = document.createElement('ul');
        var paginationPrevious = document.createElement('li');
        var aPrevious = document.createElement('a');
        var aNext = document.createElement('a');
        var paginationNext = document.createElement('li');
        var options = obj.options
        var nextPath = response.data.pagination.next_url;
        var previousPath = response.data.pagination.previous_url;
        var nextUrl = `${options.authentication.domain}${nextPath}`;
        var previousUrl = `${options.authentication.domain}${previousPath}`;


        const pageSize = response.data.pagination.page_size;
        const totalItems = response.data.pagination.total_items;
        const pages = response.data.pagination.total_pages;
        const currentPage = response.data.pagination.current_page;
        aPrevious.textContent = '←';
        aNext.textContent = '→';

        paginationContainer.classList.add('autoql-vanilla-chata-paginate');
        paginationContainer.classList.add('animated-item');
        paginationContainer.classList.add('pagination');
        paginationPrevious.classList.add('pagination-previous');
        paginationNext.classList.add('pagination-next');
        paginationPrevious.appendChild(aPrevious);
        paginationNext.appendChild(aNext);

        pagination.appendChild(paginationPrevious);

        queryTipListContainer.classList.add('query-tip-list-container');

        if(!nextPath){
            paginationNext.classList.add('disabled');
        }

        if(!previousPath){
            paginationPrevious.classList.add('disabled');
        }

        paginationNext.onclick = (evt) => {
            if(!evt.target.classList.contains('disabled')){
                ChataUtils.safetynetCall(nextUrl, function(response, s){
                    obj.putRelatedQueries(
                        response, queryTipsResultContainer, container, searchVal
                    );
                }, obj.options);
            }
        }

        paginationPrevious.onclick = (evt) => {
            if(!evt.target.classList.contains('disabled')){
                ChataUtils.safetynetCall(previousUrl, function(response, s){
                    obj.putRelatedQueries(
                        response, queryTipsResultContainer, container, searchVal
                    );
                }, obj.options);
            }
        }

        const dotEvent = (evt) => {
            var page = evt.target.dataset.page;
            var path = obj.getRelatedQueriesPath(
                page, searchVal, obj.options
            );
            ChataUtils.safetynetCall(path, function(response, s){
                obj.putRelatedQueries(
                    response, queryTipsResultContainer,
                    container, searchVal
                );
            }, obj.options);
        }

        for (var i = 0; i < list.length; i++) {
            var item = document.createElement('div');
            item.classList.add('animated-item');
            item.classList.add('query-tip-item');
            item.innerHTML = list[i];
            item.style.animationDelay = (delay * i) + 's';
            item.onclick = function(event){
                chataInput = obj.input;
                obj.tabChataUtils.classList.add('active');
                obj.tabQueryTips.classList.remove('active');
                obj.tabsAnimation('flex', 'block');
                obj.queryTipsAnimation('none');
                chataInput.focus();
                var selectedQuery = event.target.textContent;
                var subQuery = '';
                var index = 0;
                var int = setInterval(function () {
                    subQuery += selectedQuery[index];
                    if(index >= selectedQuery.length){
                        clearInterval(int);
                        var ev = new KeyboardEvent('keypress', {
                            keyCode: 13,
                            type: "keypress",
                            which: 13
                        });
                        chataInput.dispatchEvent(ev)
                    }else{
                        chataInput.value = subQuery;
                    }
                    index++;
                }, 85);

            }
            queryTipListContainer.appendChild(item);
        }
        queryTipsResultContainer.innerHTML = '';
        queryTipsResultContainer.appendChild(queryTipListContainer);
        // var totalPages = pages > 5 ? 5 : pages;
        for (var i = 0; i < 3; i++) {
            if(i >= pages)break;
            var li = document.createElement('li')
            var a = document.createElement('a')

            if(i == currentPage-1){
                li.classList.add('selected')
            }
            li.appendChild(a)
            pagination.appendChild(li);

            if(i == 2){
                if(currentPage == 3){
                    a.textContent = currentPage;
                    var rightDots = document.createElement('li');
                    var aDots = document.createElement('a');
                    aDots.textContent = '...';
                    rightDots.appendChild(aDots);
                    pagination.appendChild(rightDots);
                    aDots.setAttribute('data-page', currentPage+1);
                    rightDots.onclick = dotEvent;
                }else if(currentPage > 3 && currentPage <= pages-2){
                    a.textContent = currentPage;
                    li.classList.add('selected');
                    var rightDots = document.createElement('li');
                    var aDots = document.createElement('a');
                    aDots.textContent = '...';
                    rightDots.appendChild(aDots);
                    aDots.setAttribute('data-page', currentPage+1);

                    var leftDots = document.createElement('li');
                    var aDotsLeft = document.createElement('a');
                    aDotsLeft.textContent = '...';
                    leftDots.appendChild(aDotsLeft);
                    aDotsLeft.setAttribute('data-page', currentPage-1);
                    pagination.insertBefore(leftDots, li);
                    if(currentPage < pages-2){
                        pagination.appendChild(rightDots);
                    }

                    rightDots.onclick = dotEvent;
                    leftDots.onclick = dotEvent;

                }else{
                    a.textContent = '...';
                }
            }else{
                a.textContent = (i+1);
            }
            if(currentPage > pages-2){
                a.setAttribute('data-page', currentPage-1);
            }else{
                a.setAttribute('data-page', i+1);
            }
            li.onclick = dotEvent;

        }

        if(pages > 3){
            for (var i = pages-2; i < pages; i++) {
                if(i >= pages)break;
                var li = document.createElement('li')
                var a = document.createElement('a')
                if(i == currentPage-1){
                    li.classList.add('selected')
                }
                li.appendChild(a)
                a.textContent = (i+1);
                a.setAttribute('data-page', i+1);

                li.onclick = (evt) => {
                    var page = evt.target.dataset.page;
                    var path = obj.getRelatedQueriesPath(
                        page, searchVal, obj.options
                    );
                    ChataUtils.safetynetCall(path, function(response, s){
                        obj.putRelatedQueries(
                            response, queryTipsResultContainer,
                            container, searchVal
                        );
                    }, obj.options);
                }

                pagination.appendChild(li);
            }
        }
        pagination.appendChild(paginationNext);
        paginationContainer.appendChild(pagination);
        container.appendChild(paginationContainer)
        if(obj.pagination){
            container.removeChild(obj.pagination);
        }
        obj.pagination = paginationContainer;
    }

    obj.getRelatedQueriesPath = (page, searchVal, options) => {
        const url = options.authentication.demo
          ? `https://backend-staging.chata.ai/autoql/api/v1/query/related-queries`
          : `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${searchVal}&page_size=15&page=${page}`;
          return url;
    }

    obj.createResizeHandler = function(){
        var resize = document.createElement('div');
        var startX, startY, startWidth, startHeight;
        resize.classList.add('autoql-vanilla-chata-drawer-resize-handle');
        resize.classList.add(obj.options.placement);

        function resizeItem(e) {
            let newWidth;
            let newHeight;
            switch (obj.options.placement) {
                case 'left':
                    newWidth = (startWidth + e.clientX - startX);
                    break;
                case 'right':
                    newWidth = (startWidth + startX - e.clientX);
                    break;
                case 'top':
                    newHeight = (startHeight + e.clientY - startY);
                    break;
                case 'bottom':
                    newHeight = (startHeight + startY - e.clientY);
                    break;
                default:

            }
            if(['left', 'right'].includes(obj.options.placement)){
                obj.rootElem.style.width = newWidth + 'px';
                obj.options.width = newWidth;
            }else{
                obj.rootElem.style.height = newHeight + 'px';
                obj.options.height = newHeight;
            }
        }

        function stopResize(e) {
            window.removeEventListener('mousemove', resizeItem, false);
            window.removeEventListener('mouseup', stopResize, false);
        }

        function initResize(e){
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(
                document.defaultView.getComputedStyle(
                    obj.rootElem
                ).width, 10);
            startHeight = parseInt(
                document.defaultView.getComputedStyle(
                    obj.rootElem
                ).height, 10);
            window.addEventListener('mousemove', resizeItem, false);
            window.addEventListener('mouseup', stopResize, false);
        }

        resize.addEventListener('mousedown', initResize, false);

        obj.rootElem.appendChild(resize);
        obj.resizeHandler = resize;
        if(!obj.options.resizable){
            obj.resizeHandler.style.visibility = 'hidden';
        }
    }

    obj.createDrawerContent = () => {
        var drawerContent = document.createElement('div');
        var firstMessage = document.createElement('div');
        var chatMessageBubble = document.createElement('div');
        var scrollBox = document.createElement('div');
        scrollBox.classList.add('autoql-vanilla-chata-scrollbox');
        chatMessageBubble.textContent = obj.options.introMessage;
        drawerContent.classList.add('autoql-vanilla-drawer-content');
        firstMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        firstMessage.classList.add('response');
        chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');

        firstMessage.appendChild(chatMessageBubble);
        drawerContent.appendChild(firstMessage);
        scrollBox.appendChild(drawerContent);
        obj.rootElem.appendChild(scrollBox);
        obj.drawerContent = drawerContent;
        obj.scrollBox = scrollBox;
    }

    obj.createIntroMessageTopics = () => {
        const topics = getIntroMessageTopics(obj.options.activeIntegrator);
        if(topics){
            console.log(topics);
            const topicsWidget = new Cascader(topics, obj);
            obj.drawerContent.appendChild(topicsWidget._elem);
            obj.topicsWidget = topicsWidget;
        }
    }

    obj.createHeader = () => {
        var chatHeaderContainer = document.createElement('div');
        var closeButton = htmlToElement(`
            <button
                class="autoql-vanilla-chata-button close close-action"
                data-tippy-content="Close Drawer" currentitem="false">
                ${CLOSE_ICON}
            </button>
        `);
        var clearAllButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button clear-all"
            data-tippy-content="Clear Messages">
                ${CLEAR_ALL}
            </button>
        `);

        var headerLeft = htmlToElement(`
            <div class="chata-header-left">
            </div>
        `)
        var headerTitle = htmlToElement(`
            <div class="autoql-vanilla-chata-header-center-container">
                ${obj.options.title}
            </div>
        `)
        var headerRight = htmlToElement(`
            <div class="chata-header-right-container">
            </div>
        `)
        var popover = htmlToElement(`
            <div class="autoql-vanilla-popover-container">
                <div class="autoql-vanilla-clear-messages-confirm-popover">
                    <div class="autoql-vanilla-chata-confirm-text">
                        ${POPOVER_ICON}
                        Clear all queries & responses?
                    </div>
                    <button class="autoql-vanilla-chata-confirm-btn no">
                        Cancel
                    </button>
                    <button class="autoql-vanilla-chata-confirm-btn yes">
                        Clear
                    </button>
                </div>
            </div>
        `)
        chatHeaderContainer.classList.add(
            'autoql-vanilla-chat-header-container'
        );

        closeButton.onclick = (evt) => {
            obj.closeDrawer();
        }

        clearAllButton.onclick = (evt) => {
            popover.style.visibility = 'visible';
            popover.style.opacity = 1;
        }

        popover.addEventListener('click', (evt) => {
            if(evt.target.classList.contains(
                'autoql-vanilla-chata-confirm-btn')
            ){
                obj.closePopOver(popover);
                if(evt.target.classList.contains('yes')){
                    obj.clearMessages();
                }
            }
        })

        headerLeft.appendChild(closeButton);
        headerRight.appendChild(clearAllButton);
        headerRight.appendChild(popover);

        chatHeaderContainer.appendChild(headerLeft);
        chatHeaderContainer.appendChild(headerTitle);
        chatHeaderContainer.appendChild(headerRight);
        obj.rootElem.appendChild(chatHeaderContainer);
        obj.headerRight = headerRight;
        obj.headerTitle = headerTitle;
    }

    obj.closePopOver = (popover) => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
    }

    obj.clearMessages = () => {
        [].forEach.call(
            obj.drawerContent.querySelectorAll(
                '.autoql-vanilla-chat-single-message-container'
            ),
            (e, index) => {
            if(index == 0) return;
            e.parentNode.removeChild(e);
        });
    }

    obj.autoCompleteHandler = (evt) => {
        if(obj.options.autoQLConfig.enableAutocomplete){
            obj.autoCompleteList.style.display = 'none';
            clearTimeout(obj.autoCompleteTimer);
            if(evt.target.value){
                obj.autoCompleteTimer = setTimeout(() => {
                    ChataUtils.autocomplete(
                        evt.target.value,
                        obj.autoCompleteList,
                        'suggestion',
                        obj.options
                    );
                }, 400);
            }
        }
    }

    obj.onEnterHandler = (evt) => {
        if(evt.keyCode == 13 && obj.input.value){
            clearTimeout(obj.autoCompleteTimer);
            obj.autoCompleteList.style.display = 'none';
            console.log('SEND MESSAGE');
            obj.sendMessage(obj.input.value, 'data_messenger.user');
        }
    }

    obj.createBar = () => {
        const placeholder = obj.options.inputPlaceholder;
        var chataBarContainer = document.createElement('div');
        var autoComplete = document.createElement('div');
        var autoCompleteList = document.createElement('ul');
        var textBar = document.createElement('div');
        var chataInput = document.createElement('input');
        var voiceRecordButton = document.createElement('button');
        var display = obj.options.enableVoiceRecord ? 'block' : 'none';
        var watermark = htmlToElement(`
            <div class="autoql-vanilla-watermark">
                ${WATERMARK}
                We run on AutoQL by Chata
            </div>
        `);

        chataBarContainer.classList.add('autoql-vanilla-chata-bar-container');
        chataBarContainer.classList.add('autoql-vanilla-chat-drawer-chat-bar');
        chataBarContainer.classList.add('autoql-vanilla-autosuggest-top');
        autoComplete.classList.add('autoql-vanilla-auto-complete-suggestions');
        autoCompleteList.classList.add(
            'autoql-vanilla-auto-complete-list'
        );
        textBar.classList.add('autoql-vanilla-text-bar');
        chataInput.classList.add('autoql-vanilla-chata-input');
        chataInput.setAttribute('autocomplete', 'off');
        chataInput.setAttribute('placeholder', placeholder);
        voiceRecordButton.classList.add(
            'autoql-vanilla-chat-voice-record-button'
        );
        voiceRecordButton.classList.add(
            'chata-voice'
        );
        voiceRecordButton.setAttribute(
            'data-tippy-content',
            'Hold to Use Voice'
        );
        voiceRecordButton.innerHTML = VOICE_RECORD_IMAGE;

        autoComplete.appendChild(autoCompleteList);
        textBar.appendChild(chataInput);
        textBar.appendChild(voiceRecordButton);
        chataBarContainer.appendChild(watermark);
        chataBarContainer.appendChild(autoComplete);
        chataBarContainer.appendChild(textBar);

        voiceRecordButton.onmouseup = (evt) => {
            obj.speechToText.stop();
            voiceRecordButton.style.backgroundColor =
            obj.options.themeConfig.accentColor;
            console.log(obj.options.themeConfig.accentColor);
            console.log(obj.finalTranscript);
            obj.input.value = obj.finalTranscript;
            obj.isRecordVoiceActive = false;
        }

        voiceRecordButton.onmousedown = (evt) => {
            obj.speechToText.start();
            voiceRecordButton.style.backgroundColor = '#FF471A';
            obj.isRecordVoiceActive = true;
        }

        obj.chataBarContainer = chataBarContainer;
        obj.input = chataInput;
        obj.voiceRecordButton = voiceRecordButton;
        obj.autoCompleteList = autoCompleteList;
        obj.rootElem.appendChild(chataBarContainer);
        obj.input.onkeyup = obj.autoCompleteHandler;
        obj.input.onkeypress = obj.onEnterHandler;

    }

    obj.speechToTextEvent = () => {
        if(obj.speechToText){
            obj.speechToText.onresult = (e) => {
                let interimTranscript = '';
                for (let i = e.resultIndex,
                    len = e.results.length; i < len; i++) {
                    let transcript = e.results[i][0].transcript;
                    if (e.results[i].isFinal) {
                        obj.finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                if(obj.finalTranscript !== ''){
                    obj.input.value = obj.finalTranscript;
                    obj.speechToText.stop();
                    obj.voiceRecordButton.style.backgroundColor =
                    obj.options.themeConfig.accentColor;
                }
            }
        }
    }

    obj.applyStyles = () => {
        const themeStyles = obj.options.themeConfig.theme === 'light'
        ? LIGHT_THEME : DARK_THEME
        if(options.themeConfig){
            if ('accentColor' in options.themeConfig){
                themeStyles['--chata-drawer-accent-color']
                = options.themeConfig.accentColor;
                obj.options.themeConfig.accentColor =
                options.themeConfig.accentColor;
            }
        }

        for (let property in themeStyles) {
            document.documentElement.style.setProperty(
                property,
                themeStyles[property],
            );
        }

        obj.rootElem.style.setProperty(
            '--chata-drawer-font-family',
            obj.options.themeConfig['fontFamily']
        );
    }

    obj.checkMaxMessages = function(){
        if(obj.options.maxMessages > 2){
            var messages = obj.drawerContent.querySelectorAll(
                '.autoql-vanilla-chat-single-message-container'
            );

            if(messages.length > obj.options.maxMessages){
                messages[1].parentNode.removeChild(messages[1]);
            }
        }
    }

    obj.getActionOption = (svg, text, onClick, params) => {
        var element = htmlToElement(`
            <li>
                <span data-test="chata-icon" class="chata-icon">
                    ${svg}
                </span>
                ${text}
            </li>
        `);
        element.onclick = (evt) => {
            onClick.apply(null, params);
        }
        return element;
    }

    obj.getPopover = () => {
        var optionsMenu = htmlToElement(`
            <div class="chata-more-options-menu">
            </div>
        `);
        var menu = htmlToElement(`
            <div class="chata-popover-wrapper">
            </div>`
        );
        var ul = htmlToElement(`
            <ul class="chata-menu-list">
            </ul>
        `);
        menu.ul = ul;
        optionsMenu.appendChild(ul);
        menu.appendChild(optionsMenu);
        return menu;
    }

    obj.downloadCsvHandler = (idRequest) => {
        var json = ChataUtils.responses[idRequest];
        var csvData = ChataUtils.createCsvData(json);
        var link = document.createElement("a");
        link.setAttribute(
            'href', 'data:text/csv;charset=utf-8,'
            + encodeURIComponent(csvData)
        );
        link.setAttribute('download', 'table.csv');
        link.click();
    }

    obj.copySqlHandler = (idRequest) => {
        console.log(idRequest);
        var json = ChataUtils.responses[idRequest];
        console.log(json);
        var sql = json['data']['sql'][0];
        console.log(sql);
        copyTextToClipboard(sql);
    }

    obj.copyHandler = (idRequest) => {
        var json = ChataUtils.responses[idRequest];
        copyTextToClipboard(ChataUtils.createCsvData(json, '\t'));
    }
    obj.exportPNGHandler = (idRequest) => {
        var component = document.querySelector(
            `[data-componentid='${idRequest}']`
        );
        var svg = component.getElementsByTagName('svg')[0];
        var svgString = getSVGString(svg);

        svgString2Image(
            svgString,
            2*component.clientWidth,
            2*component.clientHeight
        );
    }

    obj.getMoreOptionsMenu = (options, idRequest, type) => {
        var menu = obj.getPopover();
        if(type === 'simple'){
            menu.classList.add('chata-popover-single-message');
        }

        for (var i = 0; i < options.length; i++) {
            let opt = options[i]
            switch (opt) {
                case 'csv':
                    var action = obj.getActionOption(
                        DOWNLOAD_CSV_ICON, 'Download as CSV',
                        obj.downloadCsvHandler,
                        [idRequest]
                    );
                    menu.ul.appendChild(action);
                    break;
                case 'copy':
                    var action = obj.getActionOption(
                        CLIPBOARD_ICON, 'Copy table to clipboard',
                        obj.copyHandler,
                        [idRequest]
                    );
                    menu.ul.appendChild(action);
                    break;
                case 'copy_sql':
                    var action = obj.getActionOption(
                        COPY_SQL, 'Copy generated query to clipboard',
                        obj.copySqlHandler,
                        [idRequest]
                    );
                    menu.ul.appendChild(action);
                    break;
                case 'png':
                    var action = obj.getActionOption(
                        EXPORT_PNG_ICON, 'Download as PNG',
                        obj.exportPNGHandler,
                        [idRequest]
                    );
                    menu.ul.appendChild(action);
                default:

            }
        }

        return menu;
    }

    obj.getReportProblemMenu = (toolbar, idRequest, type) => {
        var menu = obj.getPopover();
        if(type === 'simple'){
            menu.classList.add('chata-popover-single-message');
        }
        menu.ul.appendChild(
            obj.getActionOption(
                '', 'The data is incorrect',
                obj.sendReport,
                [idRequest, obj.options, menu, toolbar]
            )
        );
        menu.ul.appendChild(
            obj.getActionOption(
                '', 'The data is incomplete',
                obj.sendReport,
                [idRequest, obj.options, menu, toolbar]
            )
        );
        menu.ul.appendChild(
            obj.getActionOption(
                '', 'Other...',
                obj.openModalReport,
                [idRequest, obj.options, menu, toolbar]
            )
        );

        return menu;
    }

    obj.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
        var button =  htmlToElement(`
            <button
                class="autoql-vanilla-chata-toolbar-btn"
                data-tippy-content="${tooltip}"
                data-id="${idRequest}">
                ${svg}
            </button>
        `)

        button.onclick = (evt) => {
            onClick.apply(null, [evt, idRequest, ...evtParams]);
        }

        return button;
    }

    obj.reportProblemHandler = (
        evt, idRequest, reportProblem, toolbar) => {

        reportProblem.classList.toggle('show');
        toolbar.classList.toggle('show');
    }

    obj.moreOptionsHandler = (
        evt, idRequest, moreOptions, toolbar) => {

        moreOptions.classList.toggle('show');
        toolbar.classList.toggle('show');
    }

    obj.filterTableHandler = (evt, idRequest) => {
        var table = document.querySelector(
            `[data-componentid="${idRequest}"]`
        );
        var inputs = table.headerElement.getElementsByClassName(
            'autoql-vanilla-tabulator-header-filter'
        );
        var arrows = table.headerElement.getElementsByClassName(
            'autoql-vanilla-tabulator-arrow'
        );
        for (var i = 0; i < inputs.length; i++) {
            if(inputs[i].style.display == ''
            || inputs[i].style.display == 'none'){
                inputs[i].style.display = 'block';
            }else{
                inputs[i].style.display = 'none';
            }
            arrows[i].classList.toggle('tabulator-filter');
        }
    }

    obj.openColumnEditorHandler = (evt, idRequest) => {
        obj.showColumnEditor(idRequest);
    }

    obj.deleteMessageHandler = (evt, idRequest) => {
        console.log(idRequest);
        var table = obj.drawerContent.querySelector(
            `[data-componentid="${idRequest}"]`
        );
        if(!table){
            table = obj.drawerContent.querySelector(
                `[data-containerid="${idRequest}"]`
            );
            obj.drawerContent.removeChild(
                table
            )
        }else{
            obj.drawerContent.removeChild(
                table.parentElement.parentElement
                .parentElement.parentElement.parentElement
            );
        }
    }

    obj.getActionToolbar = (idRequest, type, displayType) => {
        var request = ChataUtils.responses[idRequest];
        let moreOptionsArray = [];
        var toolbar = htmlToElement(`
            <div class="autoql-vanilla-chat-message-toolbar right">
            </div>
        `);

        var reportProblem = obj.getReportProblemMenu(
            toolbar,
            idRequest,
            type
        );
        reportProblem.classList.add('report-problem');


        var reportProblemButton = obj.getActionButton(
            REPORT_PROBLEM,
            'Report a problem',
            idRequest,
            obj.reportProblemHandler,
            [reportProblem, toolbar]
        )

        switch (type) {
            case 'simple':
                if(request['reference_id'] !== '1.1.420'){
                    toolbar.appendChild(
                        reportProblemButton
                    );
                    toolbar.appendChild(
                        obj.getActionButton(
                            DELETE_MESSAGE,
                            'Delete Message',
                            idRequest,
                            obj.deleteMessageHandler,
                            [reportProblem, toolbar]
                        )
                    );
                    moreOptionsArray.push('copy_sql');
                }
                break;
            case 'csvCopy':
                toolbar.appendChild(
                    obj.getActionButton(
                        FILTER_TABLE,
                        'Filter Table',
                        idRequest,
                        obj.filterTableHandler,
                        []
                    )
                );
                var columnVisibility = obj.options.
                autoQLConfig.enableColumnVisibilityManager
                if(columnVisibility && displayType !== 'pivot_table'){
                    toolbar.appendChild(
                        obj.getActionButton(
                            COLUMN_EDITOR,
                            'Show/Hide Columns',
                            idRequest,
                            obj.openColumnEditorHandler,
                            []
                        )
                    );
                }
                if(request['reference_id'] !== '1.1.420'){
                    toolbar.appendChild(
                        reportProblemButton
                    );
                }
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        'Delete Message',
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar]
                    )
                );
                moreOptionsArray.push('csv');
                moreOptionsArray.push('copy');
                moreOptionsArray.push('copy_sql');
                break;
            case 'chart-view':
                if(request['reference_id'] !== '1.1.420'){
                    toolbar.appendChild(
                        reportProblemButton
                    );
                }
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        'Delete Message',
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar]
                    )
                );
                moreOptionsArray.push('png');
                moreOptionsArray.push('copy_sql');
            default:

        }

        var moreOptions = obj.getMoreOptionsMenu(
            moreOptionsArray,
            idRequest,
            type
        );

        var moreOptionsBtn = obj.getActionButton(
            VERTICAL_DOTS,
            'More options',
            idRequest,
            obj.moreOptionsHandler,
            [moreOptions, toolbar]
        )

        if(request['reference_id'] !== '1.1.420'){
            toolbar.appendChild(
                moreOptionsBtn
            );
            toolbar.appendChild(moreOptions);
            toolbar.appendChild(reportProblem);
        }

        return toolbar;
    }

    obj.refreshToolbarButtons = (oldComponent, ignore) => {
        var messageBubble = oldComponent.parentElement
            .parentElement.parentElement;
        if(messageBubble.classList.contains(
            'autoql-vanilla-chata-response-content-container'
        )){
            messageBubble = messageBubble.parentElement;
        }

        var scrollBox = messageBubble.querySelector(
            '.autoql-vanilla-chata-table-scrollbox'
        );
        var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
        var toolbarRight = messageBubble.getElementsByClassName('right')[0];

        if(oldComponent.noColumnsElement){
            oldComponent.parentElement.removeChild(
                oldComponent.noColumnsElement
            );
            oldComponent.noColumnsElement = null;
        }

        scrollBox.scrollLeft = 0;

        var actionType = ['table', 'pivot_table', 'date_pivot'].includes(
            ignore
        ) ? 'csvCopy' : 'chart-view';

        toolbarLeft.innerHTML = ''
        var displayTypes = obj.getDisplayTypesButtons(
            oldComponent.dataset.componentid, ignore
        );

        for (var i = 0; i < displayTypes.length; i++) {
            toolbarLeft.appendChild(displayTypes[i]);
        }

        var newToolbarRight = obj.getActionToolbar(
            oldComponent.dataset.componentid, actionType, ignore
        );
        messageBubble.replaceChild(newToolbarRight, toolbarRight);

        refreshTooltips();
    }


    obj.sendDrilldownMessage = (
        json, indexData, options) =>{
        var queryId = json['data']['query_id'];
        var params = {};
        var groupables = getGroupableFields(json);
        if(indexData != -1){
            for (var i = 0; i < groupables.length; i++) {
                var index = groupables[i].indexCol;
                var value = json['data']['rows'][parseInt(indexData)][index];
                var colData = json['data']['columns'][index]['name'];
                params[colData] = value.toString();
            }
        }

        const URL = options.authentication.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`;
        let data;

        if(options.authentication.demo){
            data = {
                query_id: queryId,
                group_bys: params,
                username: 'demo',
                // customer_id: options.authentication.customerId || "",
                // user_id: options.authentication.userId || "",
                debug: options.autoQLConfig.debug
            }
        }else{
            var cols = [];
            for(var [key, value] of Object.entries(params)){
                cols.push({
                    name: key,
                    value: value
                })
            }
            data = {
                debug: options.autoQLConfig.debug,
                columns: cols
            }
        }

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.drawerContent.appendChild(responseLoadingContainer);
        ChataUtils.ajaxCallPost(URL, function(response, status){
            if(response['data']['rows'].length > 0){
                obj.putTableResponse(response);
            }else{
                obj.putSimpleResponse(response);
            }
            obj.drawerContent.removeChild(responseLoadingContainer);
            refreshTooltips();
        }, data, options);

    }

    obj.rowClick = (evt, idRequest) => {
        var json = ChataUtils.responses[idRequest];
        var row = evt.target.parentElement;
        var indexData = row.dataset.indexrow;
        if(row.dataset.hasDrilldown === 'true'){
            obj.sendDrilldownMessage(json, indexData, obj.options);
        }
    }

    obj.chartElementClick = (evt, idRequest) => {
        var json = ChataUtils.responses[idRequest];
        var indexData = evt.target.dataset.chartindex;
        obj.sendDrilldownMessage(json, indexData, obj.options);
    }

    obj.stackedChartElementClick = (evt, idRequest) => {
        var json = cloneObject(ChataUtils.responses[idRequest]);
        json['data']['rows'][0][0] = evt.target.dataset.unformatvalue1;
        json['data']['rows'][0][1] = evt.target.dataset.unformatvalue2;
        json['data']['rows'][0][2] = evt.target.dataset.unformatvalue3;
        obj.sendDrilldownMessage(json, 0, obj.options);
    }

    obj.updateSelectedBar = (evt, component) => {
        var oldSelect = component.querySelector('.active');
        if(oldSelect)oldSelect.classList.remove('active');
        if(evt.target.tagName !== 'TD') evt.target.classList.add('active');
    }

    obj.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, component.dataset.componentid])
                obj.updateSelectedBar(evt, component);
            }
        }
    }

    obj.registerDrilldownChartEvent = (component) => {
        obj.componentClickHandler(
            obj.chartElementClick, component, '[data-chartindex]'
        )
    }

    obj.registerDrilldownStackedChartEvent = (component) => {
        obj.componentClickHandler(
            obj.stackedChartElementClick, component, '[data-stackedchartindex]'
        )
    }

    obj.registerDrilldownTableEvent = (table) => {
        obj.componentClickHandler(
            obj.rowClick, table, 'tr'
        )
    }

    obj.getComponent = (request) => {
        return obj.drawerContent.querySelector(
            `[data-componentid='${request}']`
        )
    }

    obj.getRequest = (id) => {
        return ChataUtils.responses[id];
    }

    obj.displayTableHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'table');
        var table = createTable(json, component, obj.options);
        obj.registerDrilldownTableEvent(table);
    }
    obj.displayColumChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'column');
        createColumnChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayBarChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bar');
        createBarChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayPieChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pie');
        createPieChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayLineChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'line');
        createLineChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayPivotTableHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        var columns = json['data']['columns'];
        let pivotArray;
        obj.refreshToolbarButtons(component, 'pivot_table');
        if(columns[0].type === 'DATE' && columns[0].name.includes('month')){
            pivotArray = getDatePivotArray(
                json, obj.options, json['data']['rows']
            );
        }else{
            pivotArray = getPivotColumnArray(
                json, obj.options, json['data']['rows']
            );
        }
        createPivotTable(pivotArray, component, obj.options);
    }

    obj.displayHeatmapHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'heatmap');
        createHeatmap(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayBubbleCharthandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bubble');
        createBubbleChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayStackedColumnHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_column');
        createStackedColumnChart(
            component, cloneObject(json), obj.options
        );
        obj.registerDrilldownStackedChartEvent(component);
    }

    obj.displayStackedBarHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_bar');
        createStackedBarChart(
            component, cloneObject(json), obj.options
        );
        obj.registerDrilldownStackedChartEvent(component);
    }

    obj.displayAreaHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_line');
        createAreaChart(
            component, cloneObject(json), obj.options
        );
    }

    obj.getDisplayTypeButton = (idRequest, svg, tooltip, onClick) => {
        var button = htmlToElement(`
            <button
                class="autoql-vanilla-chata-toolbar-btn"
                data-tippy-content="${tooltip}"
                data-id="${idRequest}">
                ${svg}
            </button>
        `);

        button.onclick = (evt) => {
            onClick(evt, idRequest);
        }

        return button;
    }

    obj.getDisplayTypesButtons = (idRequest, ignore) => {
        var json = ChataUtils.responses[idRequest];
        var buttons = [];
        var displayTypes = getSupportedDisplayTypes(json);
        for (var i = 0; i < displayTypes.length; i++) {
            let button;
            if(displayTypes[i] == ignore)continue;
            if(displayTypes[i] == 'table'){
                button = obj.getDisplayTypeButton(
                    idRequest, TABLE_ICON, 'Table', obj.displayTableHandler
                )
            }
            if(displayTypes[i] == 'column'){
                button = obj.getDisplayTypeButton(
                    idRequest, COLUMN_CHART_ICON,
                    'Column Chart', obj.displayColumChartHandler
                );
            }
            if(displayTypes[i] == 'bar'){
                button = obj.getDisplayTypeButton(
                    idRequest, BAR_CHART_ICON,
                    'Bar Chart', obj.displayBarChartHandler
                );
            }
            if(displayTypes[i] == 'pie'
                && json['data']['columns'].length == 2){
                button = obj.getDisplayTypeButton(
                    idRequest, PIE_CHART_ICON,
                    'Pie Chart', obj.displayPieChartHandler
                );
            }
            if(displayTypes[i] == 'line'){
                button = obj.getDisplayTypeButton(
                    idRequest, LINE_CHART_ICON,
                    'Line Chart', obj.displayLineChartHandler
                );
            }
            if(displayTypes[i] == 'pivot_table'){
                button = obj.getDisplayTypeButton(
                    idRequest, PIVOT_ICON,
                    'Pivot Table', obj.displayPivotTableHandler
                );
            }
            if(displayTypes[i] == 'heatmap'){
                button = obj.getDisplayTypeButton(
                    idRequest, HEATMAP_ICON,
                    'Heatmap', obj.displayHeatmapHandler
                );
            }
            if(displayTypes[i] == 'bubble'){
                button = obj.getDisplayTypeButton(
                    idRequest, BUBBLE_CHART_ICON,
                    'Bubble Chart', obj.displayBubbleCharthandler
                );
            }
            if(displayTypes[i] == 'stacked_column'){
                button = obj.getDisplayTypeButton(
                    idRequest, STACKED_COLUMN_CHART_ICON,
                    'Stacked Column Chart', obj.displayStackedColumnHandler
                );
            }
            if(displayTypes[i] == 'stacked_bar'){
                button = obj.getDisplayTypeButton(
                    idRequest, STACKED_BAR_CHART_ICON,
                    'Stacked Bar Chart', obj.displayStackedBarHandler
                );
            }

            if(displayTypes[i] == 'stacked_line'){
                button = obj.getDisplayTypeButton(
                    idRequest, STACKED_AREA_CHART_ICON,
                    'Stacked Area Chart', obj.displayAreaHandler
                );
            }

            if(button){
                buttons.push(button);
            }
        }

        return buttons;
    }

    obj.putMessage = (value) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);

        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('request');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.textContent = value;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.drawerContent.appendChild(responseLoadingContainer);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        obj.checkMaxMessages();
        return responseLoadingContainer;
    }

    obj.putTableResponse = (jsonResponse) => {
        var data = jsonResponse['data']['rows'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var scrollbox = document.createElement('div');
        var table = document.createElement('table');
        var header = document.createElement('tr');
        var groupField = getGroupableField(jsonResponse);
        var cols = jsonResponse['data']['columns'];
        const options = obj.options.dataFormatting;
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        containerMessage.classList.add('autoql-vanilla-chat-message-response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');
        var idRequest = uuidv4();
        ChataUtils.responses[idRequest] = jsonResponse;
        var supportedDisplayTypes = obj.getDisplayTypesButtons(
            idRequest, 'table'
        );
        var actions = obj.getActionToolbar(idRequest, 'csvCopy', 'table');
        var toolbar = undefined;
        if(supportedDisplayTypes.length > 0){
            toolbar = htmlToElement(`
                <div class="autoql-vanilla-chat-message-toolbar left">
                </div>
            `);
            for (var i = 0; i < supportedDisplayTypes.length; i++) {
                toolbar.appendChild(supportedDisplayTypes[i]);
            }
        }
        if(toolbar){
            messageBubble.appendChild(toolbar);
        }
        messageBubble.appendChild(actions);
        tableContainer.classList.add('chata-table-container');
        scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );
        table.classList.add('autoql-vanilla-table-response');
        table.setAttribute('data-componentid', idRequest);
        var dataLines = jsonResponse['data']['rows'];
        var thArray = [];
        for (var i = 0; i < cols.length; i++) {
            var colStr = cols[i]['display_name'] ||
                cols[i]['name'];
            var isVisible = true;
            if('is_visible' in cols[i]){
                isVisible = cols[i]['is_visible']
                || false;
            }
            var colName = formatColumnName(colStr);
            var th = document.createElement('th');
            var arrow = document.createElement('div');
            var col = document .createElement('div');
            col.textContent = colName;
            arrow.classList.add('autoql-vanilla-tabulator-arrow');
            arrow.classList.add('up');
            col.classList.add('column');
            col.setAttribute('data-type', cols[i]['type']);
            col.setAttribute('data-index', i);
            var divFilter = document.createElement('div');
            var filter = document.createElement('input');
            divFilter.classList.add('autoql-vanilla-tabulator-header-filter');
            divFilter.appendChild(filter);
            filter.setAttribute('placeholder', 'Filter column');
            filter.classList.add('filter-input');
            filter.setAttribute('data-dataid', idRequest);
            filter.setAttribute('data-inputindex', i);
            filter.colType = cols[i]['type'];
            filter.onkeyup = function(event){
                var _table = document.querySelector(
                    `[data-componentid='${idRequest}']`
                );
                var rows = applyFilter(idRequest);
                ChataUtils.refreshTableData(
                    _table, cloneObject(rows), options, false
                );
            }
            col.appendChild(divFilter);
            th.appendChild(col);
            th.appendChild(arrow);
            th.onclick = (evt) => {
                ChataUtils.onClickColumn(evt, table, options);
            }
            header.appendChild(th);
            thArray.push(th);
            if(!isVisible){
                th.classList.add('chata-hidden');
            }
            th.addEventListener('contextmenu', function(e){
                e.preventDefault();
                let col;
                if(e.target.tagName == 'DIV'){
                    col = e.target;
                }else{
                    col = e.target.childNodes[0];
                }
                var popoverElements = document.querySelectorAll(
                    '.autoql-vanilla-chata-tiny-popover-container'
                );
                [].forEach.call(popoverElements, function(e, i){
                    e.parentNode.removeChild(e);
                })
                var popoverContainer = htmlToElement(`
                    <div class="autoql-vanilla-chata-tiny-popover-container">
                    </div>
                `);
                var popoverMenu = htmlToElement(`
                    <div class="chata-context-menu">
                    </div>
                `)
                var popoverList = htmlToElement(`
                    <ul class="chata-context-menu-list">
                    </ul>
                `);

                var popoverLi = htmlToElement(`
                    <li>Hide Column</li>
                `)

                popoverLi.onclick = function(evt){
                    var opts = obj.options
                    const url = opts.authentication.demo
                    ? `https://backend-staging.chata.ai/api/v1/chata/query`
                    : `${opts.authentication.domain}/autoql/api/v1/query/column-visibility?key=${opts.authentication.apiKey}`
                    document.body.removeChild(popoverContainer);
                    var parameters = [];
                    var jsonCols = jsonResponse['data']['columns'];
                    for (var i = 0; i < jsonCols.length; i++) {
                        var visibility = col.dataset.index == i ? false : true;
                        if(col.dataset.index == i){
                            visibility = false;
                            jsonResponse.data.columns[i].is_visible = false;
                        }else{
                            visibility = jsonCols[i].is_visible;
                        }
                        parameters.push({
                            name: jsonCols[i].name,
                            is_visible: visibility
                        })
                    }
                    ChataUtils.putCall(
                        url, {columns: parameters}, function(response){
                        adjustTableWidth(
                            table, thArray, jsonResponse['data']['columns']
                        );
                        hideShowTableCols(table);
                    }, opts)
                }

                popoverContainer.appendChild(popoverMenu);
                popoverMenu.appendChild(popoverList);
                popoverList.appendChild(popoverLi);

                popoverContainer.style.left = mouseX(e) + 'px';
                popoverContainer.style.top = mouseY(e) + 'px';
                document.body.appendChild(popoverContainer);
            })
        }
        header.classList.add('autoql-vanilla-table-header');
        scrollbox.appendChild(header);

        for (var i = 0; i < dataLines.length; i++) {
            var data = dataLines[i];
            var tr = document.createElement('tr');
            for (var x = 0; x < data.length; x++) {
                var isVisible = true;
                if('is_visible' in cols[x]){
                    isVisible = cols[x]['is_visible']
                    || false;
                }
                value = formatData(
                    data[x], cols[x],
                    obj.options
                );
                var td = document.createElement('td');
                td.textContent = value;
                if(['PERCENT', 'RATIO'].includes(cols[x]['type']) &&
                    options.comparisonDisplay == 'PERCENT'){
                    if(parseFloat(value) >= 0){
                        td.classList.add(
                            'autoql-vanilla-comparison-value-positive'
                        );
                    }else{
                        td.classList.add(
                            'autoql-vanilla-comparison-value-negative'
                        );
                    }
                }
                tr.appendChild(td);
                if(!isVisible){
                    td.classList.add('chata-hidden');
                }
            }
            tr.setAttribute('data-indexrow', i);
            if(typeof groupField !== 'number'){
                tr.setAttribute('data-has-drilldown', true);
            }else{
                tr.setAttribute('data-has-drilldown', false);
            }
            table.appendChild(tr);
        }
        tableContainer.appendChild(table);
        scrollbox.appendChild(tableContainer);
        responseContentContainer.appendChild(scrollbox);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);

        var headerWidth = adjustTableWidth(table, thArray, cols);
        table.style.width = headerWidth + 'px';
        header.style.width = headerWidth + 'px';
        table.headerElement = header;
        if(!obj.options.authentication.demo){
            allColHiddenMessage(table);
        }
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        table.sort = 'asc';
        obj.registerDrilldownTableEvent(table);
        return table;
    }

    obj.sendReport = function(idRequest, options, menu, toolbar){
        var json = ChataUtils.responses[idRequest];
        var queryId = json['data']['query_id'];
        const URL = options.authentication.demo
          ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
          : `${options.authentication.domain}/autoql/api/v1/query/${queryId}?key=${options.authentication.apiKey}`;

        return new Promise(resolve => {
            ChataUtils.putCall(
                URL, {is_correct: false}, function(r, s){
                    menu.classList.remove('show');
                    toolbar.classList.remove('show');
                    resolve();
                }, options
            )
        })
    }

    obj.openModalReport = function(idRequest, options, menu, toolbar){
        var modal = new Modal({
            destroyOnClose: true,
            withFooter: true
        });
        modal.setTitle('Report a Problem');
        var container = document.createElement('div');
        var textArea = document.createElement('textarea');
        textArea.classList.add('autoql-vanilla-report-problem-text-area');
        var cancelButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn default"
            style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
        )

        var spinner = htmlToElement(`
            <div class="autoql-vanilla-spinner-loader hidden"></div>
        `)

        var reportButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn primary"
                style="padding: 5px 16px; margin: 2px 5px;">
            </div>`
        )

        reportButton.appendChild(spinner);
        reportButton.appendChild(document.createTextNode('Report'));
        container.appendChild(document.createTextNode(
            'Please tell us more about the problem you are experiencing:'
        ));
        container.appendChild(textArea);
        modal.addView(container);
        modal.addFooterElement(cancelButton);
        modal.addFooterElement(reportButton);

        cancelButton.onclick = (evt) => {
            modal.close()
        }

        reportButton.onclick = async (evt) => {
            var reportMessage = textArea.value;
            spinner.classList.remove('hidden');
            await ChataUtils.sendReport(idRequest, options, menu, toolbar);
            modal.close();
        }

        modal.show();
    }

    obj.showColumnEditor = function(id){
        var modal = new Modal({
            destroyOnClose: true,
            withFooter: true
        })
        var json = ChataUtils.responses[id];
        var columns = json['data']['columns'];
        var container = document.createElement('div');
        var headerEditor = document.createElement('div');

        var createCheckbox = (name, checked, colIndex, isLine=false) => {
            var tick = htmlToElement(`
                <div class="autoql-vanilla-chata-checkbox-tick">
                <span class="chata-icon">${TICK}</span>
                </div>
            `);
            var checkboxContainer = document.createElement('div');
            var checkboxWrapper = document.createElement('div');
            var checkboxInput = document.createElement('input');
            checkboxInput.setAttribute('type', 'checkbox');
            checkboxInput.classList.add('autoql-vanilla-m-checkbox__input');
            if(name){
                checkboxInput.setAttribute('data-col-name', name);
            }
            if(isLine){
                checkboxInput.setAttribute('data-line', 'true');
            }
            checkboxInput.setAttribute('data-col-index', colIndex);
            checkboxContainer.style.width = '36px';
            checkboxContainer.style.height = '36px';
            checkboxWrapper.style.width = '36px';
            checkboxWrapper.style.height = '36px';
            checkboxWrapper.style.position = 'relative';

            if(checked){
                checkboxInput.setAttribute('checked', 'true');
            }

            checkboxWrapper.appendChild(checkboxInput);
            checkboxWrapper.appendChild(tick);

            checkboxContainer.appendChild(checkboxWrapper);
            checkboxContainer.input = checkboxInput;
            return checkboxContainer;
        }


        container.style.padding = '0px 15px';
        headerEditor.classList.add('col-visibility-header');
        headerEditor.appendChild(htmlToElement(`
            <div>Column Name</div>
        `))
        var divVisibility = htmlToElement(`
            <div>Visibility</div>
        `);
        divVisibility.style.display = 'flex';
        container.appendChild(headerEditor);
        modal.chataModal.classList.add('chata-modal-column-editor')
        modal.setTitle('Show/Hide Columns')
        var headerCheckbox = createCheckbox(null, true, -1);
        headerEditor.appendChild(divVisibility);
        headerCheckbox.style.marginLeft = '12px';
        headerCheckbox.style.marginTop = '1px';
        divVisibility.appendChild(headerCheckbox);
        for (var i = 0; i < columns.length; i++) {
            var lineItem = document.createElement('div');
            var isVisible = columns[i]['is_visible'] || false;
            var colStr = columns[i]['display_name'] ||
                columns[i]['name'];
            var colName = formatColumnName(colStr);

            lineItem.classList.add('col-visibility-line-item');
            lineItem.appendChild(htmlToElement(`
                <div>${colName}</div>
            `))
            var checkboxContainer = createCheckbox(
                columns[i]['name'], isVisible, i, true
            );

            checkboxContainer.input.onchange = (evt) => {
                var headerChecked = true;
                var inputs = container.querySelectorAll('[data-line]');

                for (var x = 0; x < inputs.length; x++) {
                    if(!inputs[x].checked){
                        headerChecked = false;
                        break;
                    }
                }
                headerCheckbox.input.checked = headerChecked;
            }

            if(!isVisible){
                headerCheckbox.input.checked = false;
            }
            lineItem.appendChild(checkboxContainer);
            container.appendChild(lineItem);
        }

        headerCheckbox.onchange = (evt) => {
            var inputs = container.querySelectorAll('[data-line]');
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].checked = evt.target.checked;
            }
        }

        var cancelButton = htmlToElement(
            `<div
                class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">
                    Cancel
                </div>`
        )

        var spinner = htmlToElement(`
            <div class="autoql-vanilla-spinner-loader hidden"></div>
        `)

        var saveButton = htmlToElement(
            `<div
                class="autoql-vanilla-chata-btn primary"
                style="padding: 5px 16px; margin: 2px 5px;">
            </div>`
        )

        saveButton.appendChild(spinner);
        saveButton.appendChild(document.createTextNode('Apply'));


        cancelButton.onclick = function(event){
            modal.close();
        }

        saveButton.onclick = function(event){
            var opts = obj.options
            const url = opts.authentication.demo
            ? `https://backend-staging.chata.ai/api/v1/chata/query`
            : `${opts.authentication.domain}/autoql/api/v1/query/column-visibility?key=${opts.authentication.apiKey}`
            this.classList.add('disabled');
            spinner.classList.remove('hidden');
            var inputs = container.querySelectorAll('[data-line]');
            var data = [];
            var table = document.querySelector(`[data-componentid='${id}']`);
            var thArray = table.headerElement.getElementsByTagName('th');
            for (var i = 0; i < inputs.length; i++) {
                data.push({
                    name: inputs[i].dataset.colName,
                    is_visible: inputs[i].checked
                })
                json['data']['columns'][i]['is_visible'] = inputs[i].checked;
            }
            var headerWidth = adjustTableWidth(
                table, thArray, json['data']['columns']
            );
            hideShowTableCols(table);
            allColHiddenMessage(table);
            table.style.width = headerWidth + 'px';
            table.headerElement.style.width = headerWidth + 'px';
            ChataUtils.putCall(url, {columns: data}, function(response){
                modal.close();
            }, opts)
        }

        modal.addView(container);
        modal.addFooterElement(cancelButton);
        modal.addFooterElement(saveButton);
        modal.show();
    }

    obj.sendResponse = (text) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.textContent = text;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.createSuggestions = function(responseContentContainer, data){
        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add('autoql-vanilla-chata-suggestion-btn');
            button.textContent = data[i][0];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
            if(i == data.length-1){
                button.classList.add('none-of-these-btn');
                button.onclick = (evt) => {
                    var responseLoadingContainer = obj.putMessage(
                        evt.target.textContent
                    );
                    var interval = setInterval(function(){
                        obj.drawerContent.removeChild(
                            responseLoadingContainer
                        );
                        obj.sendResponse('Thank you for your feedback.');
                        clearInterval(interval);
                    }, 1300);
                }
            }else{
                button.onclick = (evt) => {
                    obj.sendMessage(
                        evt.target.textContent, 'data_messenger.suggestion'
                    );
                }
            }
        }
    }

    obj.putSuggestionResponse = (jsonResponse, query) => {
        var data = jsonResponse['data']['rows'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );
        responseContentContainer.innerHTML = `
            <div>I'm not sure what you mean by <strong>"${query}"</strong>.
            Did you mean:</div>
        `;
        obj.createSuggestions(responseContentContainer, data);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.putSimpleResponse = (jsonResponse) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        var idRequest = uuidv4();
        ChataUtils.responses[idRequest] = jsonResponse;
        containerMessage.setAttribute('data-containerid', idRequest);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        toolbarButtons = obj.getActionToolbar(
            idRequest, 'simple', 'table'
        );
        if(jsonResponse['reference_id'] !== '1.1.420'){
            messageBubble.appendChild(toolbarButtons);
        }
        var value = ''
        if(jsonResponse['data'].rows && jsonResponse['data'].rows.length > 0){
            value = formatData(
                jsonResponse['data']['rows'][0][0],
                jsonResponse['data']['columns'][0],
                obj.options
            );
        }else{
            value = jsonResponse['message'];
        }
        var div = document.createElement('div');
        div.classList.add('autoql-vanilla-chata-single-response');
        div.appendChild(document.createTextNode(value));
        messageBubble.appendChild(div);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.putSafetynetMessage = function(suggestionArray){
        var div = document.createElement('div');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');

        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');

        messageBubble.append(createSafetynetContent(suggestionArray, obj));
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        // updateSelectWidth(containerMessage)
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.createHelpContent = function(link){
        return `
        Great news, I can help with that:
        <br/>
        <button
            onclick="window.open('${link}', '_blank')"
            class="autoql-vanilla-chata-help-link-btn">
            ${HELP_ICON}
            Bar chart 2
        </button>
        `;
    }

    obj.putHelpMessage = function(jsonResponse){
        var div = document.createElement('div');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');

        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');

        messageBubble.innerHTML = obj.createHelpContent(
            jsonResponse['data']['rows'][0]
        );
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.sendMessage = (textValue, source) => {
        obj.input.disabled = true;
        obj.input.value = '';
        var responseLoadingContainer = obj.putMessage(textValue);

        const URL_SAFETYNET = obj.options.authentication.demo
          ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
            textValue
          )}&projectId=1`
          : `${obj.options.authentication.domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            textValue
          )}&key=${obj.options.authentication.apiKey}`


        ChataUtils.safetynetCall(
            URL_SAFETYNET, function(jsonResponse, statusCode){
            var suggestions = {};
            if(jsonResponse != undefined){
                var suggestions = jsonResponse['full_suggestion']
                || jsonResponse['data']['replacements'];
            }
            if(statusCode != 200){
                obj.drawerContent.removeChild(responseLoadingContainer);
                obj.input.removeAttribute("disabled");
                obj.sendResponse(`
                    Uh oh.. It looks like you don't have access
                    to this resource. Please double check that all the
                    required authentication fields are provided.`
                )
            }else if(suggestions.length > 0
                && obj.options.autoQLConfig.enableQueryValidation
                && textValue != 'None of these'){
                obj.input.removeAttribute("disabled");
                obj.drawerContent.removeChild(responseLoadingContainer);

                var suggestionArray = createSuggestionArray(jsonResponse);
                obj.putSafetynetMessage(suggestionArray);

            }else{
                ChataUtils.ajaxCall(textValue, function(jsonResponse, status){
                    obj.input.removeAttribute("disabled");
                    obj.drawerContent.removeChild(responseLoadingContainer);
                    switch(jsonResponse['data']['display_type']){
                        case 'suggestion':
                            obj.putSuggestionResponse(
                                jsonResponse, textValue
                            );
                        break;
                        case 'table':
                            if(jsonResponse['data']['columns'].length == 1){
                                obj.putSimpleResponse(jsonResponse);
                            }else{
                                obj.putTableResponse(jsonResponse);
                            }
                        break;
                        case 'data':
                            var cols = jsonResponse['data']['columns'];
                            var rows = jsonResponse['data']['rows'];
                            if(cols.length == 1 && rows.length == 1){
                                if(cols[0]['name'] == 'query_suggestion'){
                                    obj.putSuggestionResponse(
                                        jsonResponse, textValue
                                    );
                                }else if(cols[0]['name'] == 'Help Link'){
                                    obj.putHelpMessage(jsonResponse);
                                }else{
                                    obj.putSimpleResponse(jsonResponse);
                                }
                            }else{
                                if(rows.length > 0){
                                    obj.putTableResponse(jsonResponse);
                                }else{
                                    obj.putSimpleResponse(jsonResponse);
                                }
                            }
                        break;
                        case 'compare_table':
                            obj.putTableResponse(jsonResponse);
                        break;
                        case 'date_pivot':
                            obj.putTableResponse(jsonResponse);
                        break;
                        case 'pivot_table':
                            obj.putTableResponse(jsonResponse);
                        break;
                        case 'line':
                            var component = obj.putTableResponse(jsonResponse);
                            createLineChart(
                                component, jsonResponse, pbj.options
                            );
                            pbj.refreshToolbarButtons(component, 'line');
                        break;
                        case 'bar':
                            var component = obj.putTableResponse(jsonResponse);
                            createBarChart(
                                component, jsonResponse, pbj.options
                            );
                            pbj.refreshToolbarButtons(component, 'bar');
                        break;
                        case 'word_cloud':
                            obj.putTableResponse(jsonResponse);
                        break;
                        case 'stacked_column':
                            var component = obj.putTableResponse(jsonResponse);
                            obj.refreshToolbarButtons(
                                component, 'stacked_column'
                            );
                            createStackedColumnChart(
                                component, cloneObject(jsonResponse),
                                obj.options
                            );
                        break;
                        case 'stacked_bar':
                            var component = obj.putTableResponse(jsonResponse);
                            obj.refreshToolbarButtons(
                                component, 'stacked_bar'
                            );
                            createStackedBarChart(
                                component,
                                cloneObject(jsonResponse), obj.options
                            );
                        break;
                        case 'bubble':
                            var component = obj.putTableResponse(
                                jsonResponse
                            );
                            var cols = jsonResponse['data']['columns'];
                            createBubbleChart(
                                component, jsonResponse, obj.options
                            );
                            obj.refreshToolbarButtons(component, 'bubble');
                        break;
                        case 'heatmap':
                            var component = obj.putTableResponse(jsonResponse);
                            createHeatmap(
                                component, jsonResponse, obj.options
                            );
                            obj.refreshToolbarButtons(component, 'heatmap');
                        break;
                        case 'pie':
                            obj.putTableResponse(jsonResponse);
                        break;
                        case 'column':
                            var component = obj.putTableResponse(
                                jsonResponse
                            );
                            createColumnChart(
                                component, jsonResponse, obj.options
                            );
                            obj.refreshToolbarButtons(component, 'column');
                        break;
                        case 'help':
                            obj.putHelpMessage(jsonResponse);
                        break;
                        default:
                            // temporary
                            jsonResponse['data'] =
                            'Error: There was no data supplied for this table';
                            obj.putSimpleResponse(jsonResponse);
                    }
                    obj.checkMaxMessages();
                    refreshTooltips();
                }, obj.options, source);
            }
        }, obj.options);
    }

    document.addEventListener('DOMContentLoaded', obj.onLoadHandler);
    return obj;
}
