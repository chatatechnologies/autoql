var DataMessenger = {
    options: {
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
            enableColumnEditor: true,
            enableDrilldowns: true
        },
        themeConfig: {
            theme: 'light',
            chartColors: ['#26A7E9', '#A5CD39', '#DD6A6A', '#FFA700', '#00C1B2'],
            accentColor: undefined,
            fontFamily: 'sans-serif',
        },
        isVisible: false,
        placement: 'right',
        width: 500,
        height: 500,
        title: 'Data Messenger',
        showHandle: true,
        handleStyles: {},
        onVisibleChange: function() {},
        onHandleClick: function(){},
        showMask: true,
        shiftScreen: false,
        onMaskClick: function(){},
        maskClosable: true,
        customerName: 'there',
        maxMessages: -1,
        clearOnClose: false,
        enableVoiceRecord: true,
        autocompleteStyles: {},
        enableQueryInspirationTab: true,
        isRecordVoiceActive: false,
        inputPlaceholder: 'Ask me anything…'
    },
    responses: [],
    xhr: new XMLHttpRequest(),
    speechToText: getSpeech(),
    finalTranscript: ''
};

DataMessenger.init = function(elem, options, registerEventsFlag=true){
    var rootElem = document.getElementById(elem);


    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            DataMessenger.options.authentication[key] = value;
        }
    }

    if('dataFormatting' in options){
        for (var [key, value] of Object.entries(options['dataFormatting'])) {
            DataMessenger.options.dataFormatting[key] = value;
        }
    }

    if('autoQLConfig' in options){
        for (var [key, value] of Object.entries(options['autoQLConfig'])) {
            DataMessenger.options.autoQLConfig[key] = value;
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            DataMessenger.options.themeConfig[key] = value;
        }
    }

    for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            console.log(typeof value);
            console.log(value);
            DataMessenger.options[key] = value;
        }
    }

    if(!('introMessage' in options)){
        DataMessenger.options.introMessage = "Hi " + DataMessenger.options.customerName+ "! I'm  here to help you access, search and analyze your data.";
    }
    if(!('onMaskClick' in options)){
        DataMessenger.options.onMaskClick = DataMessenger.options.onHandleClick;
    }
    DataMessenger.rootElem = rootElem;
    rootElem.classList.add('chata-drawer');
    this.createHeader();
    this.createDrawerContent();
    this.createBar();
    this.createWrapper();
    this.createDrawerButton();
    this.createQueryTabs();
    this.createQueryTips();
    this.registerEvents();

    var isVisible = DataMessenger.options.isVisible;
    DataMessenger.openDrawer();
    DataMessenger.closeDrawer();

    if(isVisible){
        DataMessenger.openDrawer();
    }else{
        DataMessenger.closeDrawer();
    }
    const themeStyles = DataMessenger.options.themeConfig.theme === 'light' ? LIGHT_THEME : DARK_THEME
    if ('accentColor' in options){
        themeStyles['--chata-drawer-accent-color'] = options.themeConfig.accentColor;
    }
    for (let property in themeStyles) {
        document.documentElement.style.setProperty(
            property,
            themeStyles[property],
        );
    }
    DataMessenger.rootElem.style.setProperty(
        '--chata-drawer-font-family',
        DataMessenger.options.themeConfig['fontFamily']
    );
    if(DataMessenger.speechToText){
        DataMessenger.speechToText.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
                let transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    DataMessenger.finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            console.log(DataMessenger.finalTranscript);
            if(DataMessenger.finalTranscript !== ''){
                var button = document.getElementById('chata-voice-record-button');
                var chataInput = document.getElementById('chata-input');
                DataMessenger.sendMessage(chataInput, DataMessenger.finalTranscript);
                DataMessenger.speechToText.stop();
                button.style.background = themeStyles['--chata-drawer-accent-color'];
                DataMessenger.options.isRecordVoiceActive = false;
            }
        }
    }
    refreshTooltips();
    return this;
}

DataMessenger.getChatBar = function(options={}){
    return getChatBar(options);
}

DataMessenger.createResponseRenderer = function(options){
    return createResponseRenderer(options);
}

DataMessenger.createQueryTips = function(){
    const searchIcon = htmlToElement(SEARCH_ICON);
    var container = document.createElement('div');
    var textBar = document.createElement('div');
    var queryTipsResultContainer = document.createElement('div');
    var queryTipsResultPlaceHolder = document.createElement('div');
    var chatBarInputIcon = document.createElement('div');

    var input = document.createElement('input');

    textBar.classList.add('text-bar');
    textBar.classList.add('text-bar-animation');
    chatBarInputIcon.classList.add('chat-bar-input-icon');
    queryTipsResultContainer.classList.add('query-tips-result-container');
    queryTipsResultPlaceHolder.classList.add('query-tips-result-placeholder');
    queryTipsResultPlaceHolder.innerHTML = `
        <p>Your query suggestions will show up here.<p>
        <p>Click on the suggestion to execute it in Data Messenger<p>
    `;

    queryTipsResultContainer.appendChild(queryTipsResultPlaceHolder);
    chatBarInputIcon.appendChild(searchIcon);
    textBar.appendChild(input);
    textBar.appendChild(chatBarInputIcon);
    container.appendChild(textBar);
    container.appendChild(queryTipsResultContainer);
    // <div class="chat-bar-loading-spinner"><div class="spinner-loader" style="width: 19px; height: 20px; color: rgb(153, 153, 153);"></div></div>

    input.onkeypress = function(event){

        if(event.keyCode == 13 && this.value){

            console.log(this.value);
            var temp = [
                'list all sales',
                'Sales per month last year',
                'Total sales this year',
                'All sales per customer',
                'Sales per service per month',
                'All Sales last year',
                'Sales for porcelain sink',
                'Sales per product per month',
                'Sales per year',
                'All sales over $1000',
            ]
            var chatBarLoadingSpinner = document.createElement('div');
            var spinnerLoader = document.createElement('div');
            var queryTipListContainer = document.createElement('div');
            var paginationContainer = document.createElement('div');
            var pagination = document.createElement('ul');
            var paginationPrevious = document.createElement('li');
            var aPrevious = document.createElement('a');
            var aNext = document.createElement('a');
            var paginationNext = document.createElement('li');

            const pageSize = 10;
            const pages = 10;
            aPrevious.textContent = '←';
            aNext.textContent = '→';

            paginationContainer.setAttribute('id', 'react-paginate')
            paginationContainer.classList.add('animated-item')
            paginationContainer.classList.add('pagination')
            paginationPrevious.classList.add('pagination-previous')
            paginationNext.classList.add('pagination-next')
            paginationPrevious.appendChild(aPrevious);
            paginationNext.appendChild(aNext);

            pagination.appendChild(paginationPrevious);

            spinnerLoader.classList.add('spinner-loader');
            chatBarLoadingSpinner.classList.add('chat-bar-loading-spinner');
            queryTipListContainer.classList.add('query-tip-list-container');
            chatBarLoadingSpinner.appendChild(spinnerLoader);
            textBar.appendChild(chatBarLoadingSpinner);
            var interval = setInterval(function(){
                textBar.removeChild(chatBarLoadingSpinner);
                clearInterval(interval);
                var delay = 0.08;
                for (var i = 0; i < temp.length; i++) {
                    var item = document.createElement('div');
                    item.classList.add('animated-item');
                    item.classList.add('query-tip-item');
                    item.innerHTML = temp[i];
                    item.style.animationDelay = (delay * i) + 's';
                    item.onclick = function(event){
                        chataInput = document.getElementById('chata-input');
                        DataMessenger.tabsAnimation('flex', 'block');
                        DataMessenger.queryTipsAnimation('none');
                        chataInput.focus();
                        var selectedQuery = event.target.textContent;
                        var subQuery = '';
                        console.log(selectedQuery);
                        var index = 0;
                        var int = setInterval(function () {
                            subQuery += selectedQuery[index];
                            console.log(selectedQuery[index]);
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
                for (var i = 0; i < 5; i++) {
                    var li = document.createElement('li')
                    var a = document.createElement('a')
                    if(i == 0){
                        li.classList.add('selected')
                    }
                    li.appendChild(a)
                    if(i == 2){
                        li.classList.add('break');
                        a.textContent = '...';
                    }else{
                        a.textContent = (i+1);
                    }
                    pagination.appendChild(li)
                }
                pagination.appendChild(paginationNext);
                paginationContainer.appendChild(pagination);
                container.appendChild(paginationContainer)
                if(DataMessenger.pagination){
                    container.removeChild(DataMessenger.pagination);
                }
                DataMessenger.pagination = paginationContainer;
            }, 600);
        }
    }

    container.style.display = 'none';

    input.classList.add('chata-input')
    input.classList.add('left-padding')
    input.setAttribute('placeholder', 'Enter a topic');
    DataMessenger.queryTips = container;
    DataMessenger.drawerContent.appendChild(container);
}

DataMessenger.createQueryTabs = function(){
    var orientation = DataMessenger.options.placement;
    var pageSwitcherShadowContainer = document.createElement('div');
    var pageSwitcherContainer = document.createElement('div');
    var tabDataMessenger = document.createElement('div');
    var tabQueryTips = document.createElement('div');

    var dataMessengerIcon = htmlToElement(DATA_MESSENGER);
    var queryTabsIcon = htmlToElement(QUERY_TIPS);

    pageSwitcherShadowContainer.classList.add('page-switcher-shadow-container');
    pageSwitcherShadowContainer.classList.add(orientation);

    pageSwitcherContainer.classList.add('page-switcher-container');
    pageSwitcherContainer.classList.add(orientation);

    pageSwitcherShadowContainer.appendChild(pageSwitcherContainer);

    tabDataMessenger.classList.add('tab');
    tabDataMessenger.classList.add('active');
    tabQueryTips.classList.add('tab');
    tabDataMessenger.appendChild(dataMessengerIcon);
    tabQueryTips.appendChild(queryTabsIcon);

    pageSwitcherContainer.appendChild(tabDataMessenger)
    pageSwitcherContainer.appendChild(tabQueryTips)


    tabDataMessenger.onclick = function(event){
        tabDataMessenger.classList.add('active');
        tabQueryTips.classList.remove('active');
        DataMessenger.tabsAnimation('flex', 'block');
        DataMessenger.queryTipsAnimation('none');
    }
    tabQueryTips.onclick = function(event){
        tabQueryTips.classList.add('active');
        tabDataMessenger.classList.remove('active');
        DataMessenger.tabsAnimation('none', 'none');
        DataMessenger.queryTipsAnimation('block');

    }

    var tabs = pageSwitcherShadowContainer;
    DataMessenger.rootElem.appendChild(tabs);
    DataMessenger.queryTabs = tabs;
    DataMessenger.queryTabsContainer = pageSwitcherContainer;

}

DataMessenger.tabsAnimation = function(displayNodes, displayBar){
    var nodes = DataMessenger.drawerContent.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = displayNodes;
    }
    DataMessenger.chataBarContainer.style.display = displayBar;
    if(displayNodes == 'none'){
        DataMessenger.headerTitle.innerHTML = 'What Can I Ask?';
        DataMessenger.headerRight.style.visibility = 'hidden';
    }else{
        DataMessenger.headerTitle.innerHTML = DataMessenger.options.title;
        DataMessenger.headerRight.style.visibility = 'visible';
    }
}

DataMessenger.queryTipsAnimation = function(display){
    DataMessenger.queryTips.style.display = display;
}

DataMessenger.createBar = function(){
    const placeholder = DataMessenger.options.inputPlaceholder;
    var chataBarContainer = document.createElement('div');
    chataBarContainer.classList.add('chata-bar-container');
    chataBarContainer.classList.add('chat-drawer-chat-bar');
    chataBarContainer.classList.add('autosuggest-top');
    var display = DataMessenger.options.enableVoiceRecord ? 'block' : 'none';
    var htmlBar = `
    <div class="watermark">
        ${WATERMARK}
        We run on AutoQL by Chata
    </div>
    <div class="auto-complete-suggestions">
        <ul id="auto-complete-list">
        </ul>
    </div>
    <div class="text-bar">
        <input type="text" autocomplete="off" aria-autocomplete="list" class="chata-input" placeholder="${placeholder}" value="" id="chata-input">
        <button style="display: ${display};" id="chata-voice-record-button" class="chat-voice-record-button chata-voice" data-tippy-content="Hold to Use Voice" data-for="chata-speech-to-text-tooltip" data-tippy-content-disable="false" currentitem="false">
            <img class="chat-voice-record-icon chata-voice" src="data:image/svg+xml;base64,${VOICE_RECORD_ICON}" alt="speech to text button" height="22px" width="22px" draggable="false">
        </button>
    </div>
    `;
    chataBarContainer.innerHTML = htmlBar;
    DataMessenger.chataBarContainer = chataBarContainer;
    DataMessenger.rootElem.appendChild(chataBarContainer);
}

DataMessenger.createDrawerContent = function(){
    var drawerContent = document.createElement('div');
    var firstMessage = document.createElement('div');
    var chatMessageBubble = document.createElement('div');
    var scrollBox = document.createElement('div');
    scrollBox.classList.add('chata-scrollbox');
    chatMessageBubble.textContent = DataMessenger.options.introMessage;
    drawerContent.classList.add('drawer-content');
    firstMessage.classList.add('chat-single-message-container');
    firstMessage.classList.add('response');
    chatMessageBubble.classList.add('chat-message-bubble');

    firstMessage.appendChild(chatMessageBubble);
    drawerContent.appendChild(firstMessage);
    scrollBox.appendChild(drawerContent);
    DataMessenger.rootElem.appendChild(scrollBox);
    DataMessenger.drawerContent = drawerContent;
    DataMessenger.scrollBox = scrollBox;
}

DataMessenger.createHeader = function(){
    var chatHeaderContainer = document.createElement('div');
    var headerLeft = htmlToElement(`
        <div class="chata-header-left">
            <button class="chata-button close close-action" data-tippy-content="Close Drawer" currentitem="false"><svg class="close-action" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="close-action" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button>
        </div>
    `)
    var headerTitle = htmlToElement(`
        <div class="chata-header-center-container">
            ${DataMessenger.options.title}
        </div>
    `)
    var headerRight = htmlToElement(`
        <div class="chata-header-right-container">
            <button class="chata-button clear-all" data-tippy-content="Clear Messages">
                ${CLEAR_ALL}
            </button>
        </div>
    `)
    var popover = htmlToElement(`
        <div class="popover-container">
            <div class="clear-messages-confirm-popover">
                <div class="chata-confirm-text">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="chata-confirm-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                    </svg>
                    Clear all messages?
                </div>
                <button class="chata-confirm-btn no">No</button>
                <button class="chata-confirm-btn yes">Yes</button>
            </div>
        </div>
    `)
    headerRight.appendChild(popover);
        // style="overflow: hidden; position: absolute; top: 48px; left: 964px; opacity: 1; transition: opacity 0.35s ease 0s;"
        // <svg class="clear-all" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path class="clear-all" d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path></svg>
    chatHeaderContainer.classList.add('chat-header-container');
    chatHeaderContainer.appendChild(headerLeft);
    chatHeaderContainer.appendChild(headerTitle);
    chatHeaderContainer.appendChild(headerRight);

    DataMessenger.rootElem.appendChild(chatHeaderContainer);
    DataMessenger.headerRight = headerRight;
    DataMessenger.headerTitle = headerTitle;
}

DataMessenger.sendDrilldownMessage = function(
    json, indexData, options, context='DataMessenger',
    responseRenderer=undefined, loading=undefined){
    var obj = {};
    if(indexData != -1){
        for (var i = 0; i < getGroupableCount(json); i++) {
            var value = json['data']['rows'][parseInt(indexData)][i]
            var colData = json['data']['columns'][i]['name'];
            obj[colData] = value.toString();
        }
    }

    const URL = options.authentication.demo
      ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
      : `${options.authentication.domain}/api/v1/chata/query/drilldown?key=${options.authentication.apiKey}`;

    const data = {
        query_id: json['data']['query_id'],
        group_bys: obj,
        username: options.authentication.demo ? 'widget-demo' : options.authentication.userId || 'widget-user',
        customer_id: options.authentication.customerId || "",
        user_id: options.authentication.userId || "",
        debug: options.autoQLConfig.debug
    }

    if(context == 'DataMessenger'){
        // var responseLoadingContainer = DataMessenger.putMessage(msg);
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        DataMessenger.drawerContent.appendChild(responseLoadingContainer);
        DataMessenger.ajaxCallPost(URL, function(response){
            DataMessenger.putTableResponse(response);
            DataMessenger.drawerContent.removeChild(responseLoadingContainer);
            refreshTooltips();
        }, data, options);
    }else{
        DataMessenger.ajaxCallPost(URL, function(response){
            responseRenderer.innerHTML = '';
            var topBar = responseRenderer.chataBarContainer.getElementsByClassName(
                'chat-bar-text'
            )[0]
            topBar.removeChild(loading);
            var uuid = uuidv4();
            DataMessenger.responses[uuid] = response;
            var div = document.createElement('div');
            div.classList.add('chata-table-container');
            div.classList.add('chata-table-container-renderer');
            responseRenderer.appendChild(div);
            console.log(response);
            if(response['data']['rows'].length == 0){
                responseRenderer.innerHTML = `<div>No data found.</div>`;
            }
            if(response['data']['columns'].length == 1){
                var data = response['data'];
                responseRenderer.innerHTML = `<div>${data}</div>`;
            }else{
                createTable(response, div, options, 'append', uuid, 'table-response-renderer');
            }
        }, data, options);
    }
}

DataMessenger.showColumnEditor = function(id){
    var modal = new Modal({
        destroyOnClose: true,
        withFooter: true
    })
    var json = DataMessenger.responses[id];
    var columns = json['data']['columns'];
    var container = document.createElement('div');
    var headerEditor = document.createElement('div');

    container.style.padding = '0px 15px';
    headerEditor.classList.add('col-visibility-header');
    headerEditor.appendChild(htmlToElement(`
        <div>Column Name</div>
    `))
    headerEditor.appendChild(htmlToElement(`
        <div>Visible</div>
    `))
    container.appendChild(headerEditor);
    modal.chataModal.classList.add('chata-modal-column-editor')
    modal.setTitle('Show/Hide Columns')

    for (var i = 0; i < columns.length; i++) {
        var lineItem = document.createElement('div');
        var isVisible = columns[i]['is_visible'] || false;
        var colStr = columns[i]['display_name'] ||
            columns[i]['name'];
        var colName = formatColumnName(colStr);
        var checkboxContainer = document.createElement('div');
        var checkboxWrapper = document.createElement('div');
        var mCheckbox = document.createElement('div');
        var checkboxInput = document.createElement('input');
        checkboxInput.setAttribute('type', 'checkbox');
        checkboxInput.classList.add('m-checkbox__input')
        checkboxInput.setAttribute('data-col-name', columns[i]['name']);
        checkboxInput.setAttribute('data-col-index', i);
        checkboxContainer.style.width = '36px';
        checkboxContainer.style.height = '36px';
        checkboxWrapper.style.width = '36px';
        checkboxWrapper.style.height = '36px';
        mCheckbox.classList.add('m-checkbox')

        if(isVisible){
            checkboxInput.setAttribute('checked', 'true');
        }

        checkboxWrapper.appendChild(mCheckbox);
        checkboxWrapper.appendChild(checkboxInput);

        checkboxContainer.appendChild(checkboxWrapper);
        lineItem.classList.add('col-visibility-line-item')
        lineItem.appendChild(htmlToElement(`
            <div>${colName}</div>
        `))
        lineItem.appendChild(checkboxContainer);
        container.appendChild(lineItem);
    }
    var cancelButton = htmlToElement(
        `<div class="chata-btn default" style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
    )
    var saveButton = htmlToElement(
        `<div class="chata-btn primary " style="padding: 5px 16px; margin: 2px 5px;">Save</div>`
    )

    cancelButton.onclick = function(event){
        modal.close();
    }

    saveButton.onclick = function(event){
        var inputs = container.getElementsByClassName('m-checkbox__input');
        var data = [];
        for (var i = 0; i < inputs.length; i++) {
            console.log(inputs[i].checked);
            console.log(inputs[i].dataset.colName);
            console.log(inputs[i].dataset.colIndex);
            data.push({
                name: inputs[i].dataset.colName,
                is_visible: inputs[i].checked
            })
            json['data']['columns'][i]['is_visible'] = inputs[i].checked;
            hideShowTableCols(id);
        }
        console.log(data);
        DataMessenger.putCall(data, function(response){
            modal.close();
            console.log(response);
        }, DataMessenger.options)
    }

    modal.addView(container);
    modal.addFooterElement(cancelButton);
    modal.addFooterElement(saveButton);
    modal.show();
}

DataMessenger.clickHandler = function(e){

    if(DataMessenger.options.autoQLConfig.enableDrilldowns){
        if(e.target.parentElement.dataset.hasDrilldown === 'true'){
            var table = e.target.parentElement.parentElement;
            var json = DataMessenger.responses[table.dataset.componentid];
            var indexData = e.target.parentElement.dataset.indexrow;
            DataMessenger.sendDrilldownMessage(json, indexData, DataMessenger.options);
        }
        if(e.target.hasAttribute('data-chartindex')){
            var component = e.target.parentElement.parentElement.parentElement;
            if(component.tagName == 'svg'){
                component = component.parentElement;
            }
            if(component.tagName === 'g'){
                component = component.parentElement.parentElement;
            }
            var json = DataMessenger.responses[component.dataset.componentid];
            var indexData = e.target.dataset.chartindex;
            DataMessenger.sendDrilldownMessage(json, indexData, DataMessenger.options);
        }
        if (e.target.hasAttribute('data-stackedchartindex')) {
            var component = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
            var json = cloneObject(DataMessenger.responses[component.dataset.componentid]);
            json['data']['rows'][0][0] = e.target.dataset.unformatvalue1;
            json['data']['rows'][0][1] = e.target.dataset.unformatvalue2;
            json['data']['rows'][0][2] = e.target.dataset.unformatvalue3;
            DataMessenger.sendDrilldownMessage(json, 0, DataMessenger.options);
        }

        if(e.target.classList.contains('chata-single-response')){
            var component = e.target.parentElement.parentElement;
            var json = DataMessenger.responses[component.dataset.containerid];
            DataMessenger.sendDrilldownMessage(json, -1, DataMessenger.options);

        }
    }

    if(e.target){
        var chataInput = document.getElementById('chata-input');
        var suggestionList = document.getElementById('auto-complete-list');
        if(e.target.classList.contains('bar') || e.target.classList.contains('line-dot')
        || e.target.classList.contains('square') || e.target.classList.contains('circle')){
            var selectedBars = e.target.parentElement.getElementsByClassName('active');
            for (var i = 0; i < selectedBars.length; i++) {
                selectedBars[i].classList.remove('active');
            }
            e.target.classList.add('active');
        }

        if(e.target.classList.contains('chata-confirm-btn')){
            DataMessenger.closePopOver();
            if(e.target.classList.contains('yes')){
                DataMessenger.clearMessages();
            }
        }

        if(e.target.classList.contains('close-action')){
            DataMessenger.closeDrawer();
        }

        if(e.target.classList.contains('chata-voice')){
            var button = document.getElementById('chata-voice-record-button');


            if(DataMessenger.options.isRecordVoiceActive){
                const themeStyles = DataMessenger.options.themeConfig.theme === 'light' ? LIGHT_THEME : DARK_THEME;
                DataMessenger.options.isRecordVoiceActive = false;
                DataMessenger.speechToText.stop();
                button.style.background = themeStyles['--chata-drawer-accent-color'];
            }else{
                DataMessenger.finalTranscript = '';
                button.style.background = 'red';
                DataMessenger.options.isRecordVoiceActive = true;
                DataMessenger.speechToText.start();
            }
        }

        if(e.target.classList.contains('filter-table')){
            if(e.target.tagName == 'svg'){
                parent = e.target.parentElement.parentElement.parentElement;
            }else if(e.target.tagName == 'path'){
                parent = e.target.parentElement.parentElement.parentElement.parentElement;
            }else{
                parent = e.target.parentElement.parentElement;
            }
            var table = parent.getElementsByTagName('table')[0];
            var inputs = table.headerElement.getElementsByClassName(
                'tabulator-header-filter'
            );
            var arrows = table.headerElement.getElementsByClassName(
                'tabulator-arrow'
            );
            for (var i = 0; i < inputs.length; i++) {
                if(inputs[i].style.display == '' || inputs[i].style.display == 'none'){
                    inputs[i].style.display = 'block';
                }else{
                    inputs[i].style.display = 'none';
                }
                arrows[i].classList.toggle('tabulator-filter');
            }
        }

        if(e.target.classList.contains('delete-message')){
            if(e.target.tagName == 'svg'){
                parent = e.target.parentElement.parentElement.
                parentElement.parentElement;
            }else if(e.target.tagName == 'path'){
                parent = e.target.parentElement.parentElement.
                    parentElement.parentElement.parentElement;
            }else{
                parent = e.target.parentElement.parentElement.parentElement;
            }
            DataMessenger.drawerContent.removeChild(parent);
        }

        if(e.target.classList.contains('suggestion')){
            console.log(e.target.textContent);
            suggestionList.style.display = 'none';
            DataMessenger.sendMessage(chataInput, e.target.textContent);
        }
        if(e.target.classList.contains('chata-suggestion-btn')){
            if(!e.target.classList.contains('none-of-these-btn')){
                DataMessenger.sendMessage(chataInput, e.target.textContent);
            }else{
                var responseLoadingContainer = DataMessenger.putMessage(
                    e.target.textContent
                );
                var interval = setInterval(function(){
                    DataMessenger.drawerContent.removeChild(responseLoadingContainer);
                    DataMessenger.sendResponse('Thank you for your feedback.');
                    clearInterval(interval);
                }, 1300);
            }
        }
        if(e.target.classList.contains('clipboard')){
            if(e.target.tagName == 'svg'){
                var json = DataMessenger.responses[e.target.parentElement.dataset.id];
            }else if(e.target.tagName == 'path'){
                var json = DataMessenger.responses[e.target.parentElement.parentElement.dataset.id];
            }else{
                var json = DataMessenger.responses[e.target.dataset.id];
            }
            copyTextToClipboard(DataMessenger.createCsvData(json, '\t'));
        }
        if(e.target.classList.contains('sql')){
            let parent;
            if(e.target.tagName == 'svg'){
                parent = e.target.parentElement;
            }else if(e.target.tagName == 'path'
            || e.target.tagName == 'ellipse'){
                parent = e.target.parentElement.parentElement;
            }else{
                parent = e.target;
            }
            var json = DataMessenger.responses[parent.dataset.id];
            parent.classList.add('btn-green')
            var interval = setInterval(function(){
                parent.classList.remove('btn-green');
                clearInterval(interval);
            }, 1000);
            copyTextToClipboard(json['data']['sql']);
        }
        if(e.target.classList.contains('show-hide-columns')){
            if(e.target.tagName == 'svg'){
                var id = e.target.parentElement.dataset.id
            }else if(e.target.tagName == 'path'){
                var id = e.target.parentElement.parentElement.dataset.id;
            }else{
                var id = e.target.dataset.id;
            }
            DataMessenger.showColumnEditor(id);
        }
        if(e.target.classList.contains('csv')){
            if(e.target.tagName == 'svg'){
                var json = DataMessenger.responses[e.target.parentElement.dataset.id];
            }else if(e.target.tagName == 'path'){
                var json = DataMessenger.responses[e.target.parentElement.parentElement.dataset.id];
            }else{
                var json = DataMessenger.responses[e.target.dataset.id];
            }
            var csvData = DataMessenger.createCsvData(json);
            var link = document.createElement("a");
            link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData));
            link.setAttribute('download', 'test.csv');
            link.click();
        }
        if(e.target.classList.contains('column')){
            var container = e.target.parentElement.parentElement.parentElement;
            var tableElement = container.querySelector('[data-componentid]');
            console.log(tableElement);
            if(e.target.nextSibling.classList.contains('up')){
                e.target.nextSibling.classList.remove('up');
                e.target.nextSibling.classList.add('down');
                var data = applyFilter(tableElement.dataset.componentid);
                var sortData = DataMessenger.sort(data, 'desc', e.target.dataset.index, e.target.dataset.type);
                DataMessenger.refreshTableData(tableElement, sortData, DataMessenger.options);
            }else{
                e.target.nextSibling.classList.remove('down');
                e.target.nextSibling.classList.add('up');
                var data = applyFilter(tableElement.dataset.componentid);
                var sortData = DataMessenger.sort(data, 'asc', parseInt(e.target.dataset.index), e.target.dataset.type);
                DataMessenger.refreshTableData(tableElement, sortData, DataMessenger.options);
            }
        }
        if(e.target.classList.contains('column-pivot')){
            var container = e.target.parentElement.parentElement.parentElement;
            var tableElement = container.querySelector('[data-componentid]');
            var pivotArray = [];
            var json = cloneObject(DataMessenger.responses[tableElement.dataset.componentid]);
            var columns = json['data']['columns'];
            if(columns[0].type === 'DATE' &&
                columns[0].name.includes('month')){
                pivotArray = getDatePivotArray(json, DataMessenger.options, cloneObject(json['data']['rows']));
            }else{
                pivotArray = getPivotColumnArray(json, DataMessenger.options, cloneObject(json['data']['rows']));
            }
            var rows = applyFilter(tableElement.dataset.componentid, pivotArray);
            if(e.target.nextSibling.classList.contains('up')){
                e.target.nextSibling.classList.remove('up');
                e.target.nextSibling.classList.add('down');
                rows.unshift([]); //Simulate header
                var sortData = sortPivot(rows, e.target.dataset.index, 'desc');
                // sortData.unshift([]); //Simulate header
                DataMessenger.refreshPivotTable(tableElement, sortData);
            }else{
                e.target.nextSibling.classList.remove('down');
                e.target.nextSibling.classList.add('up');
                rows.unshift([]); //Simulate header
                var sortData = sortPivot(rows, e.target.dataset.index, 'asc');
                // sortData.unshift([]); //Simulate header
                DataMessenger.refreshPivotTable(tableElement, sortData);
            }
        }
        if(e.target.classList.contains('pivot_table')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var columns = json['data']['columns'];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'pivot_column');
            if(columns[0].type === 'DATE' &&
            columns[0].name.includes('month')){
                var pivotArray = getDatePivotArray(json, DataMessenger.options, json['data']['rows']);
                createPivotTable(pivotArray, component);
            }else{
                var pivotArray = getPivotColumnArray(json, DataMessenger.options, json['data']['rows']);
                createPivotTable(pivotArray, component);
            }
        }
        if(e.target.classList.contains('column_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            console.log('GROUPABLES: ' + getGroupableCount(json));
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'column');
            if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = DataMessenger.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(
                        data[i][0],
                        json['data']['columns'][0],
                        DataMessenger.options
                    );
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(
                        groups[i],
                        json['data']['columns'][0],
                        DataMessenger.options
                    )
                }
                // var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
                var cols = json['data']['columns'];
                var dataGrouped = DataMessenger.formatCompareData(json['data']['columns'], data, groups);
                createGroupedColumnChart(component, groups, dataGrouped, cols, DataMessenger.options);
            }else{
                var values = formatDataToBarChart(json, DataMessenger.options);
                var grouped = values[0];
                var cols = json['data']['columns'];

                var hasNegativeValues = values[1];
                createColumnChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
            }
        }
        if(e.target.classList.contains('pie_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'pie');
            var data = DataMessenger.groupBy(json['data']['rows'], row => row[0]);
            var cols = json['data']['columns'];
            createPieChart(component, data, DataMessenger.options, cols);
        }
        if(e.target.classList.contains('stacked_column_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'stacked_column');
            var data = cloneObject(json['data']['rows']);

            var groups = DataMessenger.getUniqueValues(data, row => row[1]);
            groups = groups.sort().reverse();
            var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
            var cols = json['data']['columns']

            var dataGrouped = DataMessenger.format3dData(json['data']['columns'], data, groups);
            console.log(dataGrouped);
            createStackedColumnChart(component, dataGrouped, groups, subgroups, cols, DataMessenger.options);
        }
        if(e.target.classList.contains('stacked_bar_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'stacked_bar');
            var data = cloneObject(json['data']['rows']);
            var groups = DataMessenger.getUniqueValues(data, row => row[1]);
            groups = groups.sort().reverse();
            var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
            var cols = json['data']['columns'];
            var dataGrouped = DataMessenger.format3dData(json['data']['columns'], data, groups);
            createStackedBarChart(component, dataGrouped, groups, subgroups, cols, DataMessenger.options);
        }
        if(e.target.classList.contains('table')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'table');
            createTable(json, component, DataMessenger.options);
        }

        if(e.target.classList.contains('bar_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            console.log('ID REQUESTS: ' + idRequest);
            console.log('GROUPABLES: ' + getGroupableCount(json));
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'bar');
            var groupCount = getGroupableCount(json);
            if(groupCount == 1 && json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = DataMessenger.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(data[i][0], json['data']['columns'][0], DataMessenger.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][0], DataMessenger.options)
                }
                // var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
                var cols = json['data']['columns']
                var dataGrouped = DataMessenger.formatCompareData(json['data']['columns'], data, groups);
                createGroupedBarChart(component, groups, dataGrouped, cols, DataMessenger.options);
            }else{
                var values = formatDataToBarChart(json, DataMessenger.options);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var cols = json['data']['columns'];
                createBarChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
            }

        }

        if(e.target.classList.contains('line_chart')){
            if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                var idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            DataMessenger.refreshToolbarButtons(component, 'line');
            if(json['data']['display_type'] == 'compare_table' || json['data']['columns'].length >= 3){
                var data = cloneObject(json['data']['rows']);

                var groups = DataMessenger.getUniqueValues(data, row => row[0]);
                groups = groups.sort();
                for (var i = 0; i < data.length; i++) {
                    data[i][0] = formatData(data[i][0], json['data']['columns'][0], DataMessenger.options);
                }
                for (var i = 0; i < groups.length; i++) {
                    groups[i] = formatData(groups[i], json['data']['columns'][0], DataMessenger.options)
                }
                // var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
                var cols = json['data']['columns'];
                var dataGrouped = DataMessenger.formatCompareData(json['data']['columns'], data, groups);
                createGroupedLineChart(component, groups, dataGrouped, cols, DataMessenger.options);
                console.log(dataGrouped);
            }else{
                var values = formatDataToBarChart(json, DataMessenger.options);
                var grouped = values[0];
                var hasNegativeValues = values[1];
                var cols = json['data']['columns'];
                createLineChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
            }
        }

        if(e.target.classList.contains('heatmap')){
            console.log(e.target.tagName);
            if(e.target.tagName == 'BUTTON'){
                var idRequest = e.target.dataset.id;
            }
            else if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else{
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            var values = formatDataToHeatmap(json, DataMessenger.options);
            var labelsX = DataMessenger.getUniqueValues(values, row => row.unformatX);
            var labelsY = DataMessenger.getUniqueValues(values, row => row.unformatY);
            labelsY = formatLabels(labelsY, json['data']['columns'][0], DataMessenger.options);
            labelsX = formatLabels(labelsX, json['data']['columns'][1], DataMessenger.options);
            var cols = json['data']['columns'];

            createHeatmap(component, labelsX, labelsY, values, cols, DataMessenger.options);
            DataMessenger.refreshToolbarButtons(component, 'heatmap');
        }

        if(e.target.classList.contains('bubble_chart')){
            if(e.target.tagName == 'BUTTON'){
                var idRequest = e.target.dataset.id;
            }
            else if(e.target.tagName == 'svg'){
                var idRequest = e.target.parentElement.dataset.id;
            }else{
                var idRequest = e.target.parentElement.parentElement.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            var values = formatDataToHeatmap(json, DataMessenger.options);
            var labelsX = DataMessenger.getUniqueValues(values, row => row.unformatX);
            var labelsY = DataMessenger.getUniqueValues(values, row => row.unformatY);
            labelsY = formatLabels(labelsY, json['data']['columns'][0], DataMessenger.options);
            labelsX = formatLabels(labelsX, json['data']['columns'][1], DataMessenger.options);

            var cols = json['data']['columns'];
            createBubbleChart(component, labelsX, labelsY, values, cols, DataMessenger.options);
            DataMessenger.refreshToolbarButtons(component, 'bubble');
        }
        if(e.target.classList.contains('export_png')){
            if(e.target.tagName == 'svg'){
                idRequest = e.target.parentElement.dataset.id;
            }else if(e.target.tagName == 'path'){
                idRequest = e.target.parentElement.parentElement.dataset.id;
            }else{
                idRequest = e.target.dataset.id;
            }
            var json = DataMessenger.responses[idRequest];
            var component = document.querySelectorAll(`[data-componentid='${idRequest}']`)[0];
            var svg = component.getElementsByTagName('svg')[0];
            var svgString = getSVGString(svg);
            // svgToPng(svg);
            svgString2Image( svgString, 2*component.clientWidth, 2*component.clientHeight);
        }
        if(e.target.classList.contains('clear-all')){
            var confirm = document.querySelector('.popover-container');
            confirm.style.visibility = 'visible';
            confirm.style.opacity = 1;
        }
    }
}

DataMessenger.closePopOver = function(){
    var confirm = document.querySelector('.popover-container');
    confirm.style.opacity = 0;
    confirm.style.visibility = 'hidden';
}

DataMessenger.drilldownHandler = function(e){

}

DataMessenger.sendResponse = function(text){
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.textContent = text;
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
}

DataMessenger.registerEvents = function(){
    var chataInput = document.getElementById('chata-input');
    var suggestionList = document.getElementById('auto-complete-list');
    document.addEventListener('click', function(e){
        if(e.target.id == 'drawer-wrapper'){
            if(DataMessenger.options.showMask && DataMessenger.options.maskClosable){
                DataMessenger.options.onMaskClick();
            }
        }
    })
    // document.addEventListener('dblclick', DataMessenger.drilldownHandler);

    DataMessenger.rootElem.addEventListener('click', DataMessenger.clickHandler);

    chataInput.onkeyup = function(){
        if(DataMessenger.options.autoQLConfig.enableAutocomplete){
            suggestionList.style.display = 'none';
            if(this.value){
                DataMessenger.autocomplete(this.value, suggestionList, 'suggestion', DataMessenger.options);
            }
        }
    }

    chataInput.onkeypress = function(event){
        if(event.keyCode == 13 && this.value){
            try {
                DataMessenger.xhr.onreadystatechange = null;
                DataMessenger.xhr.abort();
            } catch (e) {}
            suggestionList.style.display = 'none';
            DataMessenger.sendMessage(chataInput, this.value);
        }
    }
}

DataMessenger.clearMessages = function(){
    [].forEach.call(DataMessenger.drawerContent.querySelectorAll('.chat-single-message-container'), function(e, index){
        if(index == 0) return;
        e.parentNode.removeChild(e);
    });
}

DataMessenger.makeBarChartDomain = function(data, hasNegativeValues){
    if(hasNegativeValues){
        return d3.extent(data, function(d) { return d.value; });
    }else{
        return [0, d3.max(data, function(d) {
            return d.value;
        })];
    }
}

DataMessenger.getUniqueValues = function(data, getter){
    let unique = {};
    data.forEach(function(i) {
        if(!unique[getter(i)]) {
            unique[getter(i)] = true;
        }
    });
    return Object.keys(unique);
}

DataMessenger.formatCompareData = function(col, data, groups){
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][0] == group){
                dataGrouped[i]['value1'] = parseFloat(data[x][1]);
                dataGrouped[i]['value2'] = parseFloat(data[x][2]);
            }
        }
    }
    return dataGrouped;
}

DataMessenger.format3dData = function(cols, data, groups){
    var dataGrouped = [];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({group: group});
        for (var x = 0; x < data.length; x++) {
            if(data[x][1] == group){
                dataGrouped[i][data[x][0]] = parseFloat(data[x][2]);
            }
        }
    }

    return dataGrouped;
}

DataMessenger.groupBy = function(list, keyGetter) {
    obj = {};
    list.forEach((item) => {
        const key = keyGetter(item);
        if (!obj.hasOwnProperty(key)) {
            obj[key] = item[1];
        }
    });
    return obj;
}

DataMessenger.refreshToolbarButtons = function(oldComponent, activeDisplayType){
    var messageBubble = oldComponent.parentElement.parentElement.parentElement;
    if(messageBubble.classList.contains('chata-response-content-container')){
        messageBubble = messageBubble.parentElement;
    }
    console.log(messageBubble);
    var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
    var toolbarRight = messageBubble.getElementsByClassName('right')[0];
    var actionType = ['table', 'pivot_column', 'date_pivot'].includes(activeDisplayType) ? 'csvCopy' : '';
    toolbarLeft.innerHTML = DataMessenger.getSupportedDisplayTypes(oldComponent.dataset.componentid, activeDisplayType);
    toolbarRight.innerHTML = DataMessenger.getActionButtons(oldComponent.dataset.componentid, actionType);
    refreshTooltips();
}

DataMessenger.sort = function(data, operator, colIndex, colType){
    var lines = data;
    var values = []
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = [];
        for (var x = 0; x < data.length; x++) {
            row.push(data[x]);
        }
        values.push(row);
    }
    if(operator == 'asc'){
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) > parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) > (b[colIndex]) ? 1 : -1;
            }
        }
    }else{
        var comparator = function(a, b) {
            if (colType == 'DOLLAR_AMT' || colType == 'DATE'){
                return parseFloat(a[colIndex]) < parseFloat(b[colIndex]) ? 1 : -1;
            }else{
                return (a[colIndex]) < (b[colIndex]) ? 1 : -1;
            }
        }
    }
    var sortedArray = values.sort(comparator);

    return sortedArray;
}

DataMessenger.refreshPivotTable = function(table, pivotArray){
    var rows = table.childNodes;
    var cols = DataMessenger.responses[table.dataset.componentid]['columns'];
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'table-row';
    }

    for (var i = 0; i < pivotArray.length; i++) {
        var tdList = rows[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = pivotArray[i][x];
        }
    }

    for (var i = pivotArray.length; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
}

DataMessenger.refreshTableData = function(table, newData, options){
    var rows = newData;//table.childNodes;
    var nodes = table.childNodes;
    var cols = DataMessenger.responses[table.dataset.componentid]['data']['columns'];
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.display = 'table-row';
    }
    for (var i = 0; i < newData.length; i++) {
        var tdList = nodes[i].childNodes;
        for (var x = 0; x < tdList.length; x++) {
            tdList[x].textContent = formatData(newData[i][x], cols[x], options);
        }
    }
    for (var i = newData.length; i < nodes.length; i++) {
        nodes[i].style.display = 'none';
    }
}

DataMessenger.createCsvData = function(json, separator=','){
    var output = '';
    var lines = json['data']['rows'];
    for(var i = 0; i<json['data']['columns'].length; i++){
        var colStr = json['data']['columns'][i]['display_name'] ||
            json['data']['columns'][i]['name'];
        var colName = formatColumnName(colStr);
        output += colName + separator;
    }
    output += '\n';
    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        for (var x = 0; x < data.length; x++) {
            output += data[x] + separator;
        }
        output += '\n';
    }
    return output
}

DataMessenger.closeDrawer = function(){
    DataMessenger.options.isVisible = false;
    DataMessenger.wrapper.style.opacity = 0;
    DataMessenger.wrapper.style.height = 0;
    DataMessenger.queryTabs.style.visibility = 'hidden';
    var body = document.getElementsByTagName('body')[0];

    if(DataMessenger.options.placement == 'right'){
        DataMessenger.rootElem.style.right = 0;
        DataMessenger.rootElem.style.top = 0;
        if(DataMessenger.options.showHandle){
            DataMessenger.drawerButton.style.display = 'flex';
        }
        if(DataMessenger.options.shiftScreen){
            body.style.transform = 'translateX(0px)';
        }else{
            DataMessenger.rootElem.style.transform = 'translateX('+ DataMessenger.options.width +'px)';
        }
    }else if(DataMessenger.options.placement == 'left'){
        DataMessenger.rootElem.style.left = 0;
        DataMessenger.rootElem.style.top = 0;
        if(DataMessenger.options.showHandle){
            DataMessenger.drawerButton.style.display = 'flex';
        }
        if(DataMessenger.options.shiftScreen){
            body.style.transform = 'translateX(0px)';
        }else{
            DataMessenger.rootElem.style.transform = 'translateX(-'+ DataMessenger.options.width +'px)';
        }
    }else if(DataMessenger.options.placement == 'bottom'){
        DataMessenger.rootElem.style.bottom = '0';
        DataMessenger.rootElem.style.transform = 'translateY('+ DataMessenger.options.height +'px)';

        if(DataMessenger.options.showHandle){
            DataMessenger.drawerButton.style.display = 'flex';
        }
    }else if(DataMessenger.options.placement == 'top'){
        DataMessenger.rootElem.style.top = '0';
        DataMessenger.rootElem.style.transform = 'translateY(-'+ DataMessenger.options.height +'px)';

        if(DataMessenger.options.showHandle){
            DataMessenger.drawerButton.style.display = 'flex';
        }
    }
    if(DataMessenger.options.clearOnClose){
        DataMessenger.clearMessages();
    }
    DataMessenger.options.onVisibleChange();
}

DataMessenger.openDrawer = function(){
    DataMessenger.options.isVisible = true;
    if(DataMessenger.options.enableQueryInspirationTab){
        DataMessenger.queryTabs.style.visibility = 'visible';
    }
    var body = document.getElementsByTagName('body')[0];
    if(DataMessenger.options.showMask){
        DataMessenger.wrapper.style.opacity = .3;
        DataMessenger.wrapper.style.height = '100%';
    }
    if(DataMessenger.options.placement == 'right'){
        DataMessenger.rootElem.style.width = DataMessenger.options.width + 'px';
        DataMessenger.rootElem.style.height = 'calc(100vh)';

        DataMessenger.drawerButton.style.display = 'none';
        DataMessenger.rootElem.style.right = 0;
        DataMessenger.rootElem.style.top = 0;
        if(DataMessenger.options.shiftScreen){
            body.style.position = 'relative';
            body.style.overflow = 'hidden';
            body.style.transform = 'translateX(-'+ DataMessenger.options.width +'px)';
            DataMessenger.rootElem.style.transform = 'translateX('+ DataMessenger.options.width +'px)';
        }else{
            DataMessenger.rootElem.style.transform = 'translateX(0px)';
        }

    }else if(DataMessenger.options.placement == 'left'){
        DataMessenger.rootElem.style.width = DataMessenger.options.width + 'px';
        DataMessenger.rootElem.style.height = 'calc(100vh)';
        DataMessenger.rootElem.style.left = 0;
        DataMessenger.rootElem.style.top = 0;
        DataMessenger.drawerButton.style.display = 'none';
        if(DataMessenger.options.shiftScreen){
            body.style.position = 'relative';
            body.style.overflow = 'hidden';
            body.style.transform = 'translateX('+ DataMessenger.options.width +'px)';
            DataMessenger.rootElem.style.transform = 'translateX(-'+ DataMessenger.options.width +'px)';
        }else{
            DataMessenger.rootElem.style.transform = 'translateX(0px)';
        }
    }else if(DataMessenger.options.placement == 'bottom'){
        DataMessenger.rootElem.style.width = '100%';
        DataMessenger.rootElem.style.height = DataMessenger.options.height + 'px';
        DataMessenger.rootElem.style.bottom = 0;
        DataMessenger.rootElem.style.left = 0;
        DataMessenger.drawerButton.style.display = 'none';
        DataMessenger.rootElem.style.transform = 'translateY(0)';
    }else if(DataMessenger.options.placement == 'top'){
        DataMessenger.rootElem.style.width = '100%';
        DataMessenger.rootElem.style.height = DataMessenger.options.height + 'px';
        DataMessenger.rootElem.style.top = 0;
        DataMessenger.rootElem.style.left = 0;
        DataMessenger.drawerButton.style.display = 'none';
        DataMessenger.rootElem.style.transform = 'translateY(0)';
    }
    DataMessenger.options.onVisibleChange();
}

DataMessenger.createWrapper = function(rootElem){
    var wrapper = document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(wrapper, rootElem);
    wrapper.setAttribute('id', 'drawer-wrapper');
    DataMessenger.wrapper = wrapper;
    if(!DataMessenger.options.showMask){
        DataMessenger.wrapper.style.opacity = 0;
        DataMessenger.wrapper.style.height = 0;
    }
}

DataMessenger.createDrawerButton = function(rootElem){
    var drawerButton = document.createElement("div");
    var drawerIcon = document.createElement("div");
    drawerIcon.setAttribute("height", "22px");
    drawerIcon.setAttribute("width", "22px");
    drawerIcon.classList.add('chata-bubbles-icon');
    drawerIcon.classList.add('open-action');
    drawerIcon.innerHTML = CHATA_BUBBLES_ICON;
    drawerButton.classList.add('drawer-handle');
    drawerButton.classList.add('open-action');
    drawerButton.classList.add(DataMessenger.options.placement + '-btn');
    drawerButton.appendChild(drawerIcon);
    drawerButton.addEventListener('click', function(e){
        DataMessenger.options.onHandleClick();
        DataMessenger.openDrawer();
    })
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(drawerButton, rootElem);
    DataMessenger.drawerButton = drawerButton;
    if(!DataMessenger.options.showHandle){
        DataMessenger.drawerButton.style.display = 'none';
    }
    for (var [key, value] of Object.entries(DataMessenger.options.handleStyles)){
        DataMessenger.drawerButton.style.setProperty(key, value, '');
    }
}

DataMessenger.safetynetCall = function(url, callback, options){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            console.log(xhr.status);
            var jsonResponse = undefined;
            if(xhr.status == 200){
                jsonResponse = JSON.parse(xhr.responseText);
            }
            callback(jsonResponse, xhr.status);
        }
    };
    xhr.open('GET', url);
    // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    xhr.send();
}

DataMessenger.ajaxCall = function(val, callback, options){
    const url = options.authentication.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query`
    : `${options.authentication.domain}/autoql/api/v1/query?key=${options.authentication.apiKey}`

    const data = {
        text: val,
        source: "data_messenger",
        username: options.authentication.demo ? 'widget-demo' : options.authentication.userId || 'widget-user',
        customer_id: options.authentication.customerId || "",
        user_id: options.authentication.userId || "",
        debug: options.autoQLConfig.debug
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        // xhr.setRequestHeader("Access-Control-Allow-Origin","*");
        xhr.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xhr.send(JSON.stringify(data));
}

DataMessenger.putCall = function(data, callback, options){
    const url = options.authentication.demo
    ? `https://backend-staging.chata.ai/api/v1/chata/query`
    : `${options.authentication.domain}/autoql/api/v1/query/column-visibility?key=${options.authentication.apiKey}`

    var body = {
        columns: data
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            var jsonResponse = JSON.parse(xhr.responseText);
            callback(jsonResponse);
        }
    }

    xhr.open('PUT', url);
    xhr.setRequestHeader("Content-Type", "application/json");
    if(!options.authentication.demo){
        xhr.setRequestHeader(
            "Authorization", `Bearer ${options.authentication.token}`
        );
    }
    xhr.send(JSON.stringify(body));

    console.log(url);
}

DataMessenger.ajaxCallPost = function(url, callback, data, options){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    // xmlhttp.setRequestHeader("Access-Control-Allow-Origin","*");
    if(!options.authentication.demo){
        xmlhttp.setRequestHeader("Authorization", `Bearer ${options.authentication.token}`);
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4){
            var jsonResponse = JSON.parse(xmlhttp.responseText);
            callback(jsonResponse);
        }
    };
    xmlhttp.send(JSON.stringify(data));
}

DataMessenger.ajaxCallAutoComplete = function(url, callback, options){

    DataMessenger.xhr.onreadystatechange = function() {
        if (DataMessenger.xhr.readyState === 4){
            var jsonResponse = JSON.parse(DataMessenger.xhr.responseText);
            callback(jsonResponse);
        }
    };
    DataMessenger.xhr.open('GET', url);
    DataMessenger.xhr.setRequestHeader("Access-Control-Allow-Origin","*");
    DataMessenger.xhr.setRequestHeader("Authorization", options.authentication.token ? `Bearer ${DataMessenger.options.authentication.token}` : undefined);
    DataMessenger.xhr.send();
}

DataMessenger.autocomplete = function(suggestion, suggestionList, liClass='suggestion', options){
    const URL = options.authentication.demo
      ? `https://backend.chata.ai/api/v1/autocomplete?q=${encodeURIComponent(
        suggestion
      )}&projectid=1`
      : `${options.authentication.domain}/autoql/api/v1/query/autocomplete?text=${encodeURIComponent(
        suggestion
      )}&key=${options.authentication.apiKey}&customer_id=${options.authentication.customerId}&user_id=${options.authentication.userId}`

    DataMessenger.ajaxCallAutoComplete(URL, function(jsonResponse){
        suggestionList.innerHTML = '';
        var matches = jsonResponse['matches'] || jsonResponse['data']['matches'];
        if(matches.length > 0){
            for(var [key, value] of Object.entries(options.autocompleteStyles)){
                suggestionList.style.setProperty(key, value, '');
            }
            for (var i = matches.length-1; i >= 0; i--) {
                var li = document.createElement('li');
                li.classList.add(liClass);
                li.textContent = matches[i];
                suggestionList.appendChild(li);
            }
            suggestionList.style.display = 'block';
        }else{
            suggestionList.style.display = 'none';
        }
    }, options);
}

DataMessenger.createHelpContent = function(link){
    return `
    Great news, I can help with that:
    <br/>
    <button onclick="window.open('${link}', '_blank')" class="chata-help-link-btn">
    ${HELP_ICON}
    Bar chart 2</button>
    `;
}

DataMessenger.putHelpMessage = function(jsonResponse){
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');

    messageBubble.innerHTML = DataMessenger.createHelpContent(jsonResponse['data']['rows'][0]);
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
}

DataMessenger.putSafetynetMessage = function(suggestionArray){
    var div = document.createElement('div');
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');

    messageBubble.append(createSafetynetContent(suggestionArray));
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    updateSelectWidth(containerMessage)
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
}

DataMessenger.sendMessage = function(chataInput, textValue){
    chataInput.disabled = true;
    chataInput.value = '';
    var responseLoadingContainer = DataMessenger.putMessage(textValue);
    // const URL_SAFETYNET = `https://backend-staging.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
    //   textValue
    // )}&projectId=${DataMessenger.options.projectId}&unified_query_id=${uuidv4()}`;

    const URL_SAFETYNET = DataMessenger.options.authentication.demo
      ? `https://backend.chata.ai/api/v1/safetynet?q=${encodeURIComponent(
        textValue
      )}&projectId=1`
      : `${DataMessenger.options.authentication.domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
        textValue
      )}&key=${DataMessenger.options.authentication.apiKey}&customer_id=${DataMessenger.options.authentication.customerId}&user_id=${DataMessenger.options.authentication.userId}`


    DataMessenger.safetynetCall(URL_SAFETYNET, function(jsonResponse, statusCode){
        var suggestions = {};
        if(jsonResponse != undefined){
            var suggestions = jsonResponse['full_suggestion'] || jsonResponse['data']['replacements'];
        }
        if(statusCode != 200){
            DataMessenger.drawerContent.removeChild(responseLoadingContainer);
            chataInput.removeAttribute("disabled");
            DataMessenger.sendResponse(`
                Uh oh.. It looks like you don't have access to this resource.
                Please double check that all the required authentication fields are provided.`
            )
        }else if(suggestions.length > 0 && DataMessenger.options.autoQLConfig.enableQueryValidation
        && textValue != 'None of these'){
            chataInput.removeAttribute("disabled");
            DataMessenger.drawerContent.removeChild(responseLoadingContainer);

            var suggestionArray = createSuggestionArray(jsonResponse);
            DataMessenger.putSafetynetMessage(suggestionArray);
        }else{
            DataMessenger.ajaxCall(textValue, function(jsonResponse){
                chataInput.removeAttribute("disabled");
                DataMessenger.drawerContent.removeChild(responseLoadingContainer);
                switch(jsonResponse['data']['display_type']){
                    case 'suggestion':
                        DataMessenger.putSuggestionResponse(jsonResponse, textValue);
                    break;
                    case 'table':
                        if(jsonResponse['data']['columns'].length == 1){
                            DataMessenger.putSimpleResponse(jsonResponse);
                        }else{
                            DataMessenger.putTableResponse(jsonResponse);
                        }
                    break;
                    case 'data':
                        var cols = jsonResponse['data']['columns'];
                        var rows = jsonResponse['data']['rows'];
                        if(cols.length == 1 && rows.length == 1){
                            if(cols[0]['name'] == 'query_suggestion'){
                                DataMessenger.putSuggestionResponse(jsonResponse, textValue);
                            }else if(cols[0]['name'] == 'Help Link'){
                                DataMessenger.putHelpMessage(jsonResponse);
                            }else{
                                DataMessenger.putSimpleResponse(jsonResponse);
                            }
                        }else{
                            DataMessenger.putTableResponse(jsonResponse);
                        }
                    break;
                    case 'compare_table':
                        DataMessenger.putTableResponse(jsonResponse);
                    break;
                    case 'date_pivot':
                        DataMessenger.putTableResponse(jsonResponse);
                    break;
                    case 'pivot_column':
                        DataMessenger.putTableResponse(jsonResponse);
                    break;
                    case 'line':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        var values = formatDataToBarChart(jsonResponse, DataMessenger.options);
                        var grouped = values[0];
                        var hasNegativeValues = values[1];
                        var cols = jsonResponse['data']['columns'];
                        createLineChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
                        DataMessenger.refreshToolbarButtons(component, 'line');
                    break;
                    case 'bar':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        var values = formatDataToBarChart(jsonResponse, DataMessenger.options);
                        var grouped = values[0];
                        var hasNegativeValues = values[1];
                        var cols = jsonResponse['data']['columns'];
                        createBarChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
                        DataMessenger.refreshToolbarButtons(component, 'bar');
                    break;
                    case 'word_cloud':
                        DataMessenger.putTableResponse(jsonResponse);
                    break;
                    case 'stacked_column':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        DataMessenger.refreshToolbarButtons(component, 'stacked_column');
                        var data = cloneObject(jsonResponse['data']['rows']);

                        var groups = DataMessenger.getUniqueValues(data, row => row[1]);
                        groups = groups.sort().reverse();
                        for (var i = 0; i < data.length; i++) {
                            data[i][1] = formatData(data[i][1], jsonResponse['data']['columns'][1], DataMessenger.options);
                        }
                        for (var i = 0; i < groups.length; i++) {
                            groups[i] = formatData(groups[i], jsonResponse['data']['columns'][1], DataMessenger.options)
                        }
                        var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
                        var cols = jsonResponse['data']['columns']
                        var dataGrouped = DataMessenger.format3dData(jsonResponse['data']['columns'], data, groups);
                        createStackedColumnChart(component, dataGrouped, groups, subgroups, cols, DataMessenger.options);
                    break;
                    case 'stacked_bar':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        DataMessenger.refreshToolbarButtons(component, 'stacked_bar');
                        var data = cloneObject(jsonResponse['data']['rows']);

                        var groups = DataMessenger.getUniqueValues(data, row => row[1]);
                        groups = groups.sort().reverse();
                        var subgroups = DataMessenger.getUniqueValues(data, row => row[0]);
                        var cols = jsonResponse['data']['columns'];
                        var dataGrouped = DataMessenger.format3dData(jsonResponse['data']['columns'], data, groups);
                        createStackedBarChart(component, dataGrouped, groups, subgroups, cols, DataMessenger.options);
                    break;
                    case 'bubble':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        var values = formatDataToHeatmap(jsonResponse);
                        var labelsX = DataMessenger.getUniqueValues(values, row => row.unformatX);
                        var labelsY = DataMessenger.getUniqueValues(values, row => row.unformatY);
                        labelsY = formatLabels(labelsY, jsonResponse['data']['columns'][0], DataMessenger.options);
                        labelsX = formatLabels(labelsX, jsonResponse['data']['columns'][1], DataMessenger.options);

                        var cols = jsonResponse['data']['columns'];
                        createBubbleChart(component, labelsX, labelsY, values, cols, DataMessenger.options);
                        DataMessenger.refreshToolbarButtons(component, 'bubble');
                    break;
                    case 'heatmap':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        var values = formatDataToHeatmap(jsonResponse);
                        var labelsX = DataMessenger.getUniqueValues(values, row => row.unformatX);
                        var labelsY = DataMessenger.getUniqueValues(values, row => row.unformatY);
                        labelsY = formatLabels(labelsY, jsonResponse['data']['columns'][0], DataMessenger.options);
                        labelsX = formatLabels(labelsX, jsonResponse['data']['columns'][1], DataMessenger.options);
                        var cols = jsonResponse['data']['columns'];

                        createHeatmap(component, labelsX, labelsY, values, cols, DataMessenger.options);
                        DataMessenger.refreshToolbarButtons(component, 'heatmap');
                    break;
                    case 'pie':
                        DataMessenger.putTableResponse(jsonResponse);
                    break;
                    case 'column':
                        var component = DataMessenger.putTableResponse(jsonResponse);
                        var values = formatDataToBarChart(jsonResponse, DataMessenger.options);
                        var grouped = values[0];
                        var hasNegativeValues = values[1];
                        var cols = jsonResponse['data']['columns'];

                        createColumnChart(component, grouped, cols, hasNegativeValues, DataMessenger.options);
                        DataMessenger.refreshToolbarButtons(component, 'column');
                    break;
                    case 'help':
                        DataMessenger.putHelpMessage(jsonResponse);
                    break;
                    default:
                        // temporary
                        jsonResponse['data'] = 'Error: There was no data supplied for this table';
                        DataMessenger.putSimpleResponse(jsonResponse);
                }
                DataMessenger.checkMaxMessages();
                refreshTooltips();
            }, DataMessenger.options);
        }
    }, DataMessenger.options);


}

DataMessenger.putSimpleResponse = function(jsonResponse){
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    var idRequest = uuidv4();
    DataMessenger.responses[idRequest] = jsonResponse;
    containerMessage.setAttribute('data-containerid', idRequest);
    messageBubble.classList.add('chat-message-bubble');
    toolbarButtons = DataMessenger.getActionButtons(idRequest, 'simple');
    messageBubble.innerHTML = `
    <div class="chat-message-toolbar right">
        ${toolbarButtons}
    </div>`;
    var value = formatData(
        jsonResponse['data']['rows'][0][0],
        jsonResponse['data']['columns'][0],
        DataMessenger.options
    );
    var div = document.createElement('div');
    div.classList.add('chata-single-response');
    div.appendChild(document.createTextNode(value));
    messageBubble.appendChild(div);
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
}

DataMessenger.getActionButtons = function(idRequest, type){
    var request = DataMessenger.responses[idRequest];
    var tooltipContent = request['data']['interpretation'];
    var copySqlButton = '';
    const deleteMessage = `
        <button class="chata-toolbar-btn delete-message" data-tippy-content="Delete Message" data-id="${idRequest}">
                ${DELETE_MESSAGE}
        </button>`;
    if(DataMessenger.options.autoQLConfig.debug){
        copySqlButton = `<button class="chata-toolbar-btn sql" data-tippy-content="Copy SQL to Clipboard" data-id="${idRequest}">
            ${COPY_SQL}
        </button>`;
    }
    if(type == 'simple'){
        return `
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>
        ${copySqlButton}
        ${deleteMessage}
        `;
    }else if (type == 'csvCopy'){
        var filterButton = `
            <button class="chata-toolbar-btn filter-table" data-tippy-content="Filter Table" data-id="${idRequest}">
                ${FILTER_TABLE}
            </button>
        `;
        var showHideColumnsButton = '';

        if(request['data']['rows'].length == 1){
            filterButton = '';
        }
        if(request['data']['rows'].length > 1 &&
           request['data']['columns'].length > 1 &&
           DataMessenger.options.autoQLConfig.enableColumnEditor){
            showHideColumnsButton = `
                   <button class="chata-toolbar-btn show-hide-columns" data-tippy-content="Show/Hide Columns" data-id="${idRequest}">
                       ${COLUMN_EDITOR}
                   </button>
               `;
        }

        return `
        ${filterButton}
        ${showHideColumnsButton}
        <button class="chata-toolbar-btn clipboard" data-tippy-content="Copy to Clipboard" data-id="${idRequest}">
            ${CLIPBOARD_ICON}
        </button>
        <button class="chata-toolbar-btn csv" data-tippy-content="Download as CSV" data-id="${idRequest}">
            ${DOWNLOAD_CSV_ICON}
        </button>
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>
        ${copySqlButton}
        ${deleteMessage}
        `;
    }else{
        if(DataMessenger.options.autoQLConfig.debug){
            copySqlButton = `<button class="chata-toolbar-btn sql" data-tippy-content="Copy SQL to Clipboard" data-id="${idRequest}">
                ${COPY_SQL}
            </button>`;
        }
        return `
        <button class="chata-toolbar-btn export_png" data-tippy-content="Download as PNG" data-id="${idRequest}">
            ${EXPORT_PNG_ICON}
        </button>
        <button class="chata-toolbar-btn chata-interpretation" data-id="${idRequest}">
            ${INFO_ICON}
        </button>
        ${copySqlButton}
        ${deleteMessage}
        `;
    }
}

DataMessenger.getSupportedDisplayTypesArray = function(){
    return getSupportedDisplayTypesArray();
}

DataMessenger.getSupportedDisplayTypes = function(idRequest, ignore){
    var json = DataMessenger.responses[idRequest];
    var buttons = '';
    var displayTypes = getSupportedDisplayTypes(json);

    for (var i = 0; i < displayTypes.length; i++) {
        console.log(displayTypes[i]);
        if(displayTypes[i] == ignore)continue;
        if(displayTypes[i] == 'table'){
            buttons += DataMessenger.getTableButton(idRequest);
        }
        if(displayTypes[i] == 'column'){
            buttons += DataMessenger.getColumnChartButton(idRequest);
        }
        if(displayTypes[i] == 'bar'){
            buttons += DataMessenger.getBarChartButton(idRequest);
        }
        if(displayTypes[i] == 'pie' && json['data']['columns'].length == 2){
            buttons += DataMessenger.getPieChartButton(idRequest);
        }
        if(displayTypes[i] == 'line'){
            buttons += DataMessenger.getLineChartButton(idRequest);
        }
        if(displayTypes[i] == 'pivot_column'){
            buttons += DataMessenger.getPivotTableButton(idRequest);
        }
        if(displayTypes[i] == 'heatmap'){
            buttons += DataMessenger.getHeatmapChartButton(idRequest);
        }
        if(displayTypes[i] == 'bubble'){
            buttons += DataMessenger.getBubbleChartButton(idRequest);
        }
        if(displayTypes[i] == 'stacked_column'){
            buttons += DataMessenger.getStackedColumnChartButton(idRequest);
        }
        if(displayTypes[i] == 'stacked_bar'){
            buttons += DataMessenger.getStackedBarChartButton(idRequest);
        }
    }
    return buttons;
}

DataMessenger.getTableButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn table" data-tippy-content="Table" data-id="${idRequest}">
        ${TABLE_ICON}
    </button>`;
}

DataMessenger.getPivotTableButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn pivot_table" data-tippy-content="Pivot Table" data-id="${idRequest}">
        ${PIVOT_ICON}
    </button>
    `;
}

DataMessenger.getColumnChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn column_chart" data-tippy-content="Column Chart" data-id="${idRequest}">
        ${COLUMN_CHART_ICON}
    </button>
    `;
}

DataMessenger.getBarChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn bar_chart" data-tippy-content="Bar Chart" data-id="${idRequest}">
        ${BAR_CHART_ICON}
    </button>
    `;
}

DataMessenger.getLineChartButton = function(idRequest) {
    return `
    <button class="chata-toolbar-btn line_chart" data-tippy-content="Line Chart" data-id="${idRequest}">
        ${LINE_CHART_ICON}
    </button>
    `;
}

DataMessenger.getPieChartButton = function(idRequest) {
    return `
    <button class="chata-toolbar-btn pie_chart" data-tippy-content="Pie Chart" data-id="${idRequest}">
        ${PIE_CHART_ICON}
    </button>
    `;
}

DataMessenger.getHeatmapChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn heatmap" data-tippy-content="Heatmap" data-id="${idRequest}">
        ${HEATMAP_ICON}
    </button>
    `;
}

DataMessenger.getBubbleChartButton = function(idRequest){
    return `
    <button class="chata-toolbar-btn bubble_chart" data-tippy-content="Bubble Chart" data-id="${idRequest}">
        ${BUBBLE_CHART_ICON}
    </button>
    `;
}

DataMessenger.getStackedColumnChartButton = function(idRequest){
    return `<button class="chata-toolbar-btn stacked_column_chart" data-tippy-content="Stacked Column Chart" data-id="${idRequest}">
        ${STACKED_COLUMN_CHART_ICON}
    </button>`;
}

DataMessenger.getStackedBarChartButton = function(idRequest){
    return `<button class="chata-toolbar-btn stacked_bar_chart" data-tippy-content="Stacked Bar Chart" data-id="${idRequest}">
        ${STACKED_BAR_CHART_ICON}
    </button>`;
}

DataMessenger.putTableResponse = function(jsonResponse){
    var data = jsonResponse['data']['rows'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    var tableContainer = document.createElement('div');
    var scrollbox = document.createElement('div');
    var table = document.createElement('table');
    var header = document.createElement('tr');
    var groupField = getGroupableField(jsonResponse);
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');
    var idRequest = uuidv4();
    DataMessenger.responses[idRequest] = jsonResponse;
    var supportedDisplayTypes = DataMessenger.getSupportedDisplayTypes(idRequest, 'table');
    var actions = DataMessenger.getActionButtons(idRequest, 'csvCopy');
    var toolbar = '';
    if(supportedDisplayTypes != ''){
        toolbar += `
        <div class="chat-message-toolbar left">
            ${supportedDisplayTypes}
        </div>
        `
    }
    toolbar += `
        <div class="chat-message-toolbar right">
            ${actions}
        </div>`;

    messageBubble.innerHTML = toolbar;
    tableContainer.classList.add('chata-table-container');
    scrollbox.classList.add('chata-table-scrollbox');
    responseContentContainer.classList.add('chata-response-content-container');
    table.classList.add('table-response');
    table.setAttribute('data-componentid', idRequest);
    var dataLines = jsonResponse['data']['rows'];
    var thArray = [];
    for (var i = 0; i < jsonResponse['data']['columns'].length; i++) {
        var colStr = jsonResponse['data']['columns'][i]['display_name'] ||
            jsonResponse['data']['columns'][i]['name'];
        var isVisible = jsonResponse['data']['columns'][i]['is_visible']
        || false;
        var colName = formatColumnName(colStr);
        var th = document.createElement('th');
        var arrow = document.createElement('div');
        var col = document .createElement('div');
        col.textContent = colName;
        arrow.classList.add('tabulator-arrow');
        arrow.classList.add('up');
        col.classList.add('column');
        col.setAttribute('data-type', jsonResponse['data']['columns'][i]['type']);
        col.setAttribute('data-index', i);
        var divFilter = document.createElement('div');
        var filter = document.createElement('input');
        divFilter.classList.add('tabulator-header-filter');
        divFilter.appendChild(filter);
        filter.setAttribute('placeholder', 'Filter column');
        filter.classList.add('filter-input');
        filter.setAttribute('data-dataid', idRequest);
        filter.setAttribute('data-inputindex', i);
        filter.colType = jsonResponse['data']['columns'][i]['type'];
        filter.onkeyup = function(event){
            var _table = document.querySelector(`[data-componentid='${idRequest}']`);
            var rows = applyFilter(idRequest);
            DataMessenger.refreshTableData(_table, cloneObject(rows), DataMessenger.options, false);
        }
        col.appendChild(divFilter);
        th.appendChild(col);
        th.appendChild(arrow);
        header.appendChild(th);
        thArray.push(th);
        if(!isVisible){
            th.classList.add('chata-hidden');
        }
    }
    header.classList.add('table-header');
    scrollbox.appendChild(header);

    for (var i = 0; i < dataLines.length; i++) {
        var data = dataLines[i];
        var tr = document.createElement('tr');
        for (var x = 0; x < data.length; x++) {
            var isVisible = jsonResponse['data']['columns'][x]['is_visible']
            || false;
            value = formatData(
                data[x], jsonResponse['data']['columns'][x],
                DataMessenger.options
            );
            var td = document.createElement('td');
            td.textContent = value;
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
    DataMessenger.drawerContent.appendChild(containerMessage);

    var headerWidth = adjustTableWidth(table, thArray);
    table.style.width = headerWidth + 'px';
    header.style.width = headerWidth + 'px';
    table.headerElement = header;
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
    return table;
}

DataMessenger.createSuggestions = function(responseContentContainer, data, classButton='chata-suggestion-btn'){
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement('div');
        var button = document.createElement('button');
        button.classList.add(classButton);
        button.textContent = data[i][0];
        div.appendChild(button);
        responseContentContainer.appendChild(div);
        if(i == data.length-1){
            button.classList.add('none-of-these-btn');
        }
    }
}

DataMessenger.putSuggestionResponse = function(jsonResponse, query){
    var data = jsonResponse['data']['rows'];
    var containerMessage = document.createElement('div');
    var messageBubble = document.createElement('div');
    var responseContentContainer = document.createElement('div');
    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('response');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.classList.add('full-width');
    responseContentContainer.classList.add('chata-response-content-container');
    responseContentContainer.innerHTML = `<div>I'm not sure what you mean by <strong>"${query}"</strong>. Did you mean:</div>`;
    DataMessenger.createSuggestions(responseContentContainer, data);
    messageBubble.appendChild(responseContentContainer);
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
}

DataMessenger.checkMaxMessages = function(){
    if(DataMessenger.options.maxMessages > 2){
        var messages = DataMessenger.drawerContent.querySelectorAll('.chat-single-message-container');
        if(messages.length > DataMessenger.options.maxMessages){
            messages[1].parentNode.removeChild(messages[1]);
        }
    }
}

DataMessenger.putMessage = function(value){
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

    containerMessage.classList.add('chat-single-message-container');
    containerMessage.classList.add('request');
    messageBubble.classList.add('chat-message-bubble');
    messageBubble.textContent = value;
    containerMessage.appendChild(messageBubble);
    DataMessenger.drawerContent.appendChild(containerMessage);
    DataMessenger.drawerContent.appendChild(responseLoadingContainer);
    DataMessenger.scrollBox.scrollTop = DataMessenger.scrollBox.scrollHeight;
    DataMessenger.checkMaxMessages();
    return responseLoadingContainer;
}
