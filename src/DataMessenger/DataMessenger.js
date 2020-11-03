import { Cascader } from '../Cascader'
import { ChataTable, ChataPivotTable } from '../ChataTable'
import { ChataUtils } from '../ChataUtils'
import { Modal } from '../Modal'
import {
    NotificationSettingsModal,
    NotificationIcon,
    NotificationFeed
} from '../Notifications'
import { select } from 'd3-selection';
import { getGroupableFields } from '../Charts/ChataChartHelpers'
import { createSafetynetContent, createSuggestionArray } from '../Safetynet'
import {
    getSpeech,
    htmlToElement,
    closeAllChartPopovers,
    uuidv4,
    getSupportedDisplayTypes,
    allColHiddenMessage,
    closeAllToolbars,
    mouseY,
    cloneObject,
    getNumberOfGroupables,
    formatData,
    getRecommendationPath
} from '../Utils'
import {
    createAreaChart,
    createBarChart,
    createBubbleChart,
    createColumnChart,
    createHeatmap,
    createLineChart,
    createPieChart,
    createStackedBarChart,
    createStackedColumnChart
} from '../Charts'
import { LIGHT_THEME, DARK_THEME } from '../Constants'
import {
    CHATA_BUBBLES_ICON,
    CLOSE_ICON,
    CLEAR_ALL,
    POPOVER_ICON,
    WATERMARK,
    VOICE_RECORD_IMAGE,
    DATA_MESSENGER,
    QUERY_TIPS,
    NOTIFICATIONS_ICON,
    SEARCH_ICON,
    TABLE_ICON,
    COLUMN_CHART_ICON,
    BAR_CHART_ICON,
    PIE_CHART_ICON,
    LINE_CHART_ICON,
    PIVOT_ICON,
    HEATMAP_ICON,
    BUBBLE_CHART_ICON,
    STACKED_COLUMN_CHART_ICON,
    STACKED_BAR_CHART_ICON,
    STACKED_AREA_CHART_ICON,
    REPORT_PROBLEM,
    FILTER_TABLE,
    COLUMN_EDITOR,
    DELETE_MESSAGE,
    VERTICAL_DOTS
} from '../Svg'
import {
    apiCall,
    apiCallGet,
    apiCallPut,
    apiCallPost
} from '../Api/Api'
import { refreshTooltips } from '../Tooltips'
import '../../css/chata-styles.css'

export function DataMessenger(elem, options){
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
        enableNotificationsTab: true,
        inputPlaceholder: 'Type your queries here',
        enableDynamicCharting: true,
        queryQuickStartTopics: undefined,
        xhr: new XMLHttpRequest()
    };

    obj.autoCompleteTimer = undefined;
    obj.speechToText = getSpeech();
    obj.finalTranscript = '';
    obj.isRecordVoiceActive = false
    obj.zIndexBubble = 1000000;
    obj.lastQuery = '';

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

    if('queryQuickStartTopics' in options){
        obj.options['queryQuickStartTopics'] = options.queryQuickStartTopics;
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


    obj.setOption = (option, value) => {
        switch (option) {
            case 'authentication':
                obj.setObjectProp('authentication', value);
                if(obj.notificationIcon){
                    obj.notificationIcon.setOption('authentication', value)
                }
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
                    obj.queryTabs.style.display = 'block';
                }else obj.queryTabs.style.display = 'none';
                break;
            case 'enableNotificationsTab':
                obj.options.enableNotificationsTab = value;
                if(value && obj.options.isVisible){
                    obj.tabNotifications.style.display = 'block';
                }else obj.tabNotifications.style.display = 'none';
                obj.instanceNotificationIcon();
                break;
            case 'inputPlaceholder':
                obj.options.inputPlaceholder = value;
                obj.input.setAttribute('placeholder', value);
            case 'userDisplayName':
                obj.options.userDisplayName = value;
                obj.options.introMessage = "Hi " +
                obj.options.userDisplayName +
                `! Let’s dive into your data.
                What can I help you discover today?`;
                obj.introMessageBubble.textContent = obj.options.introMessage;
            break;
            case 'introMessage':
                obj.options.introMessage = value
                obj.introMessageBubble.textContent = value;
            break;
            case 'queryQuickStartTopics':
                obj.options.queryQuickStartTopics = value;
                obj.createIntroMessageTopics();
            default:
                obj.options[option] = value;
        }
    }

    obj.setObjectProp = (key, _obj) => {
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
        obj.rootElem.style.zIndex = 2000;
        obj.options.isVisible = true;
        obj.input.focus();
        obj.initialScroll = window.scrollY;
        var body = document.body;
        if(obj.options.enableExploreQueriesTab){
            obj.queryTabs.style.visibility = 'visible';
            obj.tabQueryTips.style.display = 'flex';
            obj.tabChataUtils.style.display = 'flex';
        }
        if(obj.options.enableNotificationsTab){
            obj.queryTabs.style.visibility = 'visible';
            obj.tabNotifications.style.display = 'flex';
            obj.tabChataUtils.style.display = 'flex';
        }
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
                window.scrollTo(0, 0);
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
                window.scrollTo(0, 0);
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
            if(obj.options.shiftScreen){
                window.scrollTo(0, document.body.scrollHeight);
                body.style.position = 'relative';
                body.style.overflow = 'hidden';
                body.style.transform = 'translateY(-'
                    + obj.options.height +'px)';
                    obj.rootElem.style.transform = 'translateY('
                        + obj.options.height +'px)';
            }else{
                obj.rootElem.style.transform = 'translateY(0)';
            }
        }else if(obj.options.placement == 'top'){
            obj.rootElem.style.width = '100%';
            obj.rootElem.style.height = obj.options.height + 'px';
            obj.rootElem.style.top = 0;
            obj.rootElem.style.left = 0;
            obj.drawerButton.style.display = 'none';
            if(obj.options.shiftScreen){
                window.scrollTo(0, 0);
                body.style.position = 'relative';
                body.style.overflow = 'hidden';
                body.style.transform = 'translateY('
                    + obj.options.height +'px)';
            }else{
                obj.rootElem.style.transform = 'translateY(0)';
            }
        }
        obj.options.onVisibleChange(obj);
    }

    obj.closeDrawer = () => {
        obj.closePopOver(obj.clearMessagePop);
        closeAllChartPopovers();
        document.body.classList.remove(
            'autoql-vanilla-chata-body-drawer-open'
        );
        obj.options.isVisible = false;
        obj.wrapper.style.opacity = 0;
        obj.wrapper.style.height = 0;
        obj.queryTabs.style.visibility = 'hidden';
        obj.tabNotifications.style.display = 'none';
        obj.tabChataUtils.style.display = 'none';

        obj.tabQueryTips.style.display = 'none';
        var body = document.body;

        if(obj.options.placement == 'right'){
            obj.rootElem.style.right = 0;
            obj.rootElem.style.top = 0;
            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }
            if(obj.options.shiftScreen){
                body.style.transform = 'translateX(0px)';
                window.scrollTo(0, obj.initialScroll);
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
                window.scrollTo(0, obj.initialScroll);
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

            if(obj.options.shiftScreen){
                window.scrollTo(0, obj.initialScroll);
            }

        }else if(obj.options.placement == 'top'){
            obj.rootElem.style.top = '0';
            obj.rootElem.style.transform = 'translateY(-'
            + obj.options.height +'px)';

            if(obj.options.showHandle){
                obj.drawerButton.style.display = 'flex';
            }

            if(obj.options.shiftScreen){
                window.scrollTo(0, obj.initialScroll);
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
            obj.initialScroll = window.scrollY;
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
            obj.createNotifications();
            obj.speechToTextEvent();
            obj.registerWindowClicks();
            obj.openDrawer();
            obj.closeDrawer();
            refreshTooltips();
            var isVisible = obj.options.isVisible;

            if(isVisible){
                obj.openDrawer();
            }else{
                obj.closeDrawer();
            }

            // obj.rootElem.addEventListener('click', (evt) => {
            //     // REPLACE WITH onclick event
            //
            // });
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

    obj.createNotifications = function() {
        var notificationsContainerId = uuidv4();
        const container = htmlToElement(`
            <div
                id=${notificationsContainerId}>

            </div>
        `)
        const button = htmlToElement(`
            <button class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 10px 5px 2px;">
                Create a New Notification
            </button>
        `)

        // container.appendChild(button);

        button.onclick = (evt) => {
            var modalView = new NotificationSettingsModal(obj.options);
            var configModal = new Modal({
                withFooter: true,
                destroyOnClose: true
            }, () => {modalView.step1.expand();})
            var cancelButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
            )
            var spinner = htmlToElement(`
                <div class="autoql-vanilla-spinner-loader hidden"></div>
                `)
            var saveButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn primary "
                style="padding: 5px 16px; margin: 2px 5px;"></div>`
            )

            saveButton.appendChild(spinner);
            saveButton.appendChild(document.createTextNode('Save'));
            configModal.addFooterElement(cancelButton);
            configModal.addFooterElement(saveButton);
            configModal.show();
            refreshTooltips();
            configModal.chataModal.style.width = '95vw';
            configModal.addView(modalView);
            configModal.setTitle('Create New Data Alert');
            configModal.show();
            cancelButton.onclick = (e) => {
                configModal.close();
            }
            saveButton.onclick = (e) => {
                spinner.classList.remove('hidden')
                saveButton.setAttribute('disabled', 'true')
                var o = obj.options
                const URL = `${o.authentication.domain}/autoql/api/v1/rules?key=${o.authentication.apiKey}`;
                ChataUtils.ajaxCallPost(URL, (json, status) => {
                    configModal.close();
                }, modalView.getValues(), o)
            }
        }

        container.style.display = 'none';
        obj.notificationsContainer = container;
        obj.notificationsContainerId = notificationsContainerId;
        obj.drawerContent.appendChild(container);
    }

    obj.notificationsAnimation = function (display){
        obj.notificationsContainer.style.display = display;
        obj.notificationsContainer.innerHTML = '';
        var id = obj.notificationsContainerId;
        var notificationList = new NotificationFeed(`[id="${id}"]`, {
            authentication: {
                ...obj.options.authentication
            },
            themeConfig: {
                ...obj.options.themeConfig
            },
            showNotificationDetails: true,
            showDescription: false
        })
        if(['bottom', 'top'].includes(obj.options.placement)){
            notificationList.style.height = (obj.options.height - 60) + 'px';
        }else{
            notificationList.style.height = (
                obj.drawerContent.clientHeight - 60
            ) + 'px';
        }
    }

    obj.createQueryTabs = function(){
        var tabId = uuidv4();

        var orientation = obj.options.placement;
        var pageSwitcherShadowContainer = document.createElement('div');
        var pageSwitcherContainer = document.createElement('div');
        var tabChataUtils = document.createElement('div');
        var tabQueryTips = document.createElement('div');
        var tabNotifications = document.createElement('div');
        tabNotifications.setAttribute('id', tabId);

        var dataMessengerIcon = htmlToElement(DATA_MESSENGER);
        var queryTabsIcon = htmlToElement(QUERY_TIPS);
        var notificationTabIcon = htmlToElement(NOTIFICATIONS_ICON);
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
        tabNotifications.classList.add('tab');
        tabNotifications.setAttribute('data-tippy-content', 'Notifications');

        tabChataUtils.appendChild(dataMessengerIcon);
        tabQueryTips.appendChild(queryTabsIcon);

        pageSwitcherContainer.appendChild(tabChataUtils)
        pageSwitcherContainer.appendChild(tabQueryTips)
        pageSwitcherContainer.appendChild(tabNotifications);

        tabChataUtils.onclick = function(event){
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
            obj.scrollBox.style.overflow = 'auto';
            obj.scrollBox.style.maxHeight = 'calc(100% - 150px)';
            tabChataUtils.classList.add('active');
            tabQueryTips.classList.remove('active');
            tabNotifications.classList.remove('active');
            obj.tabsAnimation('flex', 'block');
            obj.queryTipsAnimation('none');
            obj.notificationsAnimation('none');
        }
        tabQueryTips.onclick = function(event){
            tabQueryTips.classList.add('active');
            tabChataUtils.classList.remove('active');
            tabNotifications.classList.remove('active');
            obj.tabsAnimation('none', 'none');
            obj.queryTipsAnimation('block');
            obj.notificationsAnimation('none');
        }

        tabNotifications.onclick = function(event){
            obj.scrollBox.scrollTop = 0;
            obj.scrollBox.style.overflow = 'hidden';
            obj.scrollBox.style.maxHeight = '100%';

            tabNotifications.classList.add('active');
            tabQueryTips.classList.remove('active');
            tabChataUtils.classList.remove('active');
            obj.tabsAnimation('none', 'none');
            obj.queryTipsAnimation('none');
            obj.notificationsAnimation('block');
            obj.headerTitle.innerHTML = 'Notifications';
        }

        var tabs = pageSwitcherShadowContainer;
        obj.rootElem.appendChild(tabs);
        obj.queryTabs = tabs;
        obj.queryTabsContainer = pageSwitcherContainer;
        obj.tabChataUtils = tabChataUtils;
        obj.tabQueryTips = tabQueryTips;
        obj.tabNotifications = tabNotifications;
        obj.tabId = tabId;
        obj.instanceNotificationIcon();
        refreshTooltips();
    }

    obj.instanceNotificationIcon = () => {
        if(obj.options.enableNotificationsTab){
            var tabId = obj.tabId;
            if(obj.notificationIcon)return
            var notificationIcon = new NotificationIcon(`[id="${tabId}"]`, {
                authentication: {
                    ...obj.options.authentication,
                },
                useDot: true
            })
            obj.notificationIcon = notificationIcon;
        }
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
        container.classList.add('autoql-vanilla-querytips-container');
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

        input.onkeypress = async function(event){

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

                var response = await apiCallGet(URL, obj.options)
                textBar.removeChild(chatBarLoadingSpinner);
                obj.putRelatedQueries(
                    response.data, queryTipsResultContainer,
                    container, searchVal
                );
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

    obj.keyboardAnimation = (text) => {
        var chataInput = obj.input;
        chataInput.focus();
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += text[index];
            if(index >= text.length){
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

    obj.putRelatedQueries = (
        response, queryTipsResultContainer, container, searchVal
    ) => {
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

        paginationNext.onclick = async (evt) => {
            if(!evt.target.classList.contains('disabled')){
                var response = await apiCallGet(nextUrl, obj.options)
                obj.putRelatedQueries(
                    response.data, queryTipsResultContainer,
                    container, searchVal
                );
            }
        }

        paginationPrevious.onclick = async (evt) => {
            if(!evt.target.classList.contains('disabled')){
                var response = await apiCallGet(previousUrl, obj.options)
                obj.putRelatedQueries(
                    response.data, queryTipsResultContainer,
                    container, searchVal
                );
            }
        }

        const dotEvent = async(evt) => {
            var page = evt.target.dataset.page;
            var path = obj.getRelatedQueriesPath(
                page, searchVal, obj.options
            );
            var response = await apiCallGet(path, obj.options)
            obj.putRelatedQueries(
                response.data, queryTipsResultContainer,
                container, searchVal
            );
        }

        for (var i = 0; i < list.length; i++) {
            var item = document.createElement('div');
            item.classList.add('animated-item');
            item.classList.add('query-tip-item');
            item.innerHTML = list[i];
            item.style.animationDelay = (delay * i) + 's';
            item.onclick = function(event){
                obj.tabChataUtils.classList.add('active');
                obj.tabQueryTips.classList.remove('active');
                obj.tabsAnimation('flex', 'block');
                obj.queryTipsAnimation('none');
                obj.notificationsAnimation('none');
                var selectedQuery = event.target.textContent;
                obj.keyboardAnimation(selectedQuery);

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

                li.onclick = async (evt) => {
                    var page = evt.target.dataset.page;
                    var path = obj.getRelatedQueriesPath(
                        page, searchVal, obj.options
                    );
                    var response = await apiCallGet(path, obj.options)
                    obj.putRelatedQueries(
                        response.data, queryTipsResultContainer,
                        container, searchVal
                    );
                }

                pagination.appendChild(li);
            }
        }
        pagination.appendChild(paginationNext);
        if(totalItems != 0){
            paginationContainer.appendChild(pagination);
        }else{
            queryTipsResultContainer.appendChild(document.createTextNode(`
                Sorry, I couldn’t find any queries matching your input.
                Try entering a different topic or keyword instead.
            `))
        }
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
        var timer;
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
            clearTimeout(timer);
            timer = setTimeout(() => {

                window.dispatchEvent(new CustomEvent('chata-resize', {}));

            }, 100);
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

    obj.registerWindowClicks = () => {
        const excludeElementsForClearMessages = [
            'clear-all',
            'autoql-vanilla-clear-messages-confirm-popover',
            'autoql-vanilla-chata-confirm-text',
            'autoql-vanilla-chata-confirm-icon'
        ]

        obj.rootElem.addEventListener('click', (evt) => {
            var closePop = true;
            var closeAutoComplete = true;
            if(evt.target.classList.contains('autoql-vanilla-chata-input')){
                closeAutoComplete=false;
            }
            for (var i = 0; i < excludeElementsForClearMessages.length; i++) {
                var c = excludeElementsForClearMessages[i];
                if(evt.target.classList.contains(c)){
                    closePop = false;
                    break;
                }
            }

            if(closePop){
                obj.closePopOver(obj.clearMessagePop);
            }

            if(closeAutoComplete){
                obj.autoCompleteList.style.display = 'none';
            }

            if(evt.target.classList.contains('suggestion')){
                obj.autoCompleteList.style.display = 'none';
                obj.lastQuery = evt.target.textContent;
                obj.sendMessage(
                    evt.target.textContent, 'data_messenger.user'
                );
            }
        })
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
        chatMessageBubble.classList.add('text');

        firstMessage.appendChild(chatMessageBubble);
        drawerContent.appendChild(firstMessage);
        scrollBox.appendChild(drawerContent);
        obj.rootElem.appendChild(scrollBox);
        obj.drawerContent = drawerContent;
        obj.scrollBox = scrollBox;
        obj.introMessageBubble = chatMessageBubble;
    }

    obj.createIntroMessageTopics = () => {
        const topics = obj.options.queryQuickStartTopics;
        if(obj.topicsWidget){
            obj.drawerContent.removeChild(
                obj.topicsWidget._elem
            )
        }
        if(topics){
            const topicsWidget = new Cascader(topics, obj);
            // obj.drawerContent.appendChild(topicsWidget._elem);
            obj.drawerContent.insertBefore(
                topicsWidget._elem, obj.introMessageBubble.nextSibling
            )
            obj.topicsWidget = topicsWidget;
        }
    }

    obj.createHeader = () => {
        var chatHeaderContainer = document.createElement('div');
        var closeButton = htmlToElement(`
            <button
                class="autoql-vanilla-chata-button close-action"
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
            closeAllChartPopovers();
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
        obj.clearMessagePop = popover;
    }

    obj.closePopOver = (popover) => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
    }

    obj.clearMessages = () => {
        var size = 0;
        if(obj.options.queryQuickStartTopics)size = 1;
        [].forEach.call(
            obj.drawerContent.querySelectorAll(
                '.autoql-vanilla-chat-single-message-container'
            ),
            (e, index) => {
            if(index > size){
                e.parentNode.removeChild(e);
            }
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
                        obj.options,
                    );
                }, 150);
            }
        }
    }

    obj.onEnterHandler = (evt) => {

        if(evt.keyCode == 13 && obj.input.value){
            try {
                obj.options.xhr.abort();
            } catch (e) {
            }
            clearTimeout(obj.autoCompleteTimer);
            obj.autoCompleteList.style.display = 'none';
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
            'Hold for voice-to-text'
        );
        voiceRecordButton.innerHTML = VOICE_RECORD_IMAGE;

        autoComplete.appendChild(autoCompleteList);
        textBar.appendChild(chataInput);
        textBar.appendChild(voiceRecordButton);
        chataBarContainer.appendChild(watermark);
        chataBarContainer.appendChild(autoComplete);
        chataBarContainer.appendChild(textBar);

        chataInput.onfocus = (evt) => {
            obj.autoCompleteHandler(evt);
        }

        voiceRecordButton.onmouseup = (evt) => {
            obj.speechToText.stop();
            voiceRecordButton.style.backgroundColor =
            obj.options.themeConfig.accentColor;
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
        obj.input.onkeydown = (evt) => {
            if(evt.keyCode == 38){
                if(obj.lastQuery !== ''){
                    obj.input.value = obj.lastQuery
                }
            }
        }
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
        themeStyles['accent-color']
        = obj.options.themeConfig.accentColor;

        for (let property in themeStyles) {
            document.documentElement.style.setProperty(
                '--autoql-vanilla-' + property,
                themeStyles[property],
            );
        }

        obj.rootElem.style.setProperty(
            '--autoql-vanilla-font-family',
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
        return ChataUtils.getActionOption(svg, text, onClick, params);
    }

    obj.getPopover = () => {
        return ChataUtils.getPopover();
    }

    obj.getMoreOptionsMenu = (options, idRequest, type) => {
        var bubble = obj.drawerContent.querySelector(
            `[data-bubble-id="${idRequest}"]`
        )
        return ChataUtils.getMoreOptionsMenu(options, idRequest, type, {
            caller: this,
            query: bubble.relatedQuery
        });
    }

    obj.getReportProblemMenu = (toolbar, idRequest, type) => {
        return ChataUtils.getReportProblemMenu(
            toolbar, idRequest, type, obj.options
        );
    }

    obj.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
        return ChataUtils.getActionButton(
            svg, tooltip, idRequest, onClick, evtParams
        );
    }

    obj.reportProblemHandler = (
        evt, idRequest, reportProblem, toolbar) => {
        closeAllToolbars();
        reportProblem.classList.toggle('show');
        toolbar.classList.toggle('show');
        var bubble = obj.drawerContent.querySelector(
            `[data-bubble-id="${idRequest}"]`
        )
        bubble.scrollIntoView()
    }

    obj.moreOptionsHandler = (
        evt, idRequest, moreOptions, toolbar) => {
        closeAllToolbars();
        var bubble = obj.drawerContent.querySelector(
            `[data-bubble-id="${idRequest}"]`
        )
        moreOptions.classList.toggle('show');
        toolbar.classList.toggle('show');
        bubble.scrollIntoView()
    }

    obj.filterTableHandler = (evt, idRequest) => {
        var table = document.querySelector(
            `[data-componentid="${idRequest}"]`
        );
        var tabulator = table.tabulator;
        tabulator.toggleFilters();
    }

    obj.openColumnEditorHandler = (evt, idRequest) => {
        obj.showColumnEditor(idRequest);
    }

    obj.getLastMessageBubble = () => {
        var bubbles = obj.drawerContent.querySelectorAll(
            '.autoql-vanilla-chat-single-message-container'
        );

        return bubbles[bubbles.length-1];
    }

    obj.deleteMessageHandler = (evt, idRequest) => {
        var bubble = obj.drawerContent.querySelector(
            `[data-bubble-id="${idRequest}"]`
        );

        obj.drawerContent.removeChild(bubble);
        if(bubble.relatedMessage){
            obj.drawerContent.removeChild(bubble.relatedMessage)
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
                if(request['reference_id'] !== '1.1.420'
                    && request['reference_id'] !== '1.9.502'){
                    toolbar.appendChild(
                        reportProblemButton
                    );
                    moreOptionsArray.push('copy_sql');
                    moreOptionsArray.push('notification');

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
                break;
            case 'csvCopy':
                var filterBtn = obj.getActionButton(
                    FILTER_TABLE,
                    'Filter Table',
                    idRequest,
                    obj.filterTableHandler,
                    []
                )
                toolbar.appendChild(
                    filterBtn
                );
                filterBtn.setAttribute('data-name-option', 'filter-action');
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
                moreOptionsArray.push('notification');
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
                moreOptionsArray.push('notification');
            break;
            case 'safety-net':
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        'Delete Message',
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar]
                    )
                );
            break;
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
        moreOptionsBtn.classList.add('autoql-vanilla-more-options');

        if(request['reference_id'] !== '1.1.420' && type !== 'safety-net'
        && request['reference_id'] !== '1.9.502'){
            toolbar.appendChild(
                moreOptionsBtn
            );
            toolbar.appendChild(moreOptions);
            toolbar.appendChild(reportProblem);
        }

        return toolbar;
    }

    obj.getParentFromComponent = (component) => {
        var messageBubble = component.parentElement.parentElement.parentElement;
        if(messageBubble.classList.contains(
            'autoql-vanilla-chata-response-content-container'
        )){
            messageBubble = messageBubble.parentElement;
        }

        return messageBubble;
    }

    obj.setHeightBubble = (oldComponent) => {
        var messageBubble = obj.getParentFromComponent(oldComponent);
        var chartContainer = oldComponent.getElementsByTagName('svg');
        if(chartContainer.length){
            if(messageBubble.parentElement.style.maxHeight == '85%'){
                messageBubble.parentElement.style.maxHeight =
                (
                    parseInt(chartContainer[0].getAttribute('height')) + 55
                ) + 'px';
            }
        }else{
            messageBubble.parentElement.style.maxHeight = '85%';
        }
    }

    obj.refreshToolbarButtons = (oldComponent, ignore) => {
        closeAllChartPopovers();
        var messageBubble = obj.getParentFromComponent(oldComponent);
        if(['table', 'pivot_table'].includes(ignore)){
            messageBubble.classList.remove('full-width');
        }else{
            messageBubble.classList.add('full-width');
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
            oldComponent.style.display = 'block';
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
        obj.setScrollBubble(messageBubble);
        refreshTooltips();
    }

    obj.setScrollBubble = (messageBubble) => {
        setTimeout(() => {
            messageBubble.parentElement.scrollIntoView();
        }, 200)
    }


    obj.sendDrilldownMessage = async (
        json, indexData, options) =>{
        if(!options.autoQLConfig.enableDrilldowns)return
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
        var response = await apiCallPost(URL, data, options);
        var json = response.data
        var status = response.status
        obj.drawerContent.removeChild(responseLoadingContainer);
        if(!json['data']['rows']){
            obj.putClientResponse(ERROR_MESSAGE);
        }
        else if(json['data']['rows'].length > 0){
            obj.putTableResponse(json, true);
        }else{
            obj.putSimpleResponse(json, '', status, true);
        }
        refreshTooltips();
    }

    obj.createLoadingDots = () => {
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);

        return responseLoadingContainer;
    }

    obj.sendDrilldownClientSide = (json, indexValue, filterBy, options) => {
        if(!options.autoQLConfig.enableDrilldowns)return
        var newJson = cloneObject(json);
        var newData = [];
        var oldData = newJson['data']['rows'];

        for (var i = 0; i < oldData.length; i++) {
            if(oldData[i][indexValue] === filterBy)newData.push(oldData[i]);
        }
        var loading = obj.createLoadingDots();
        obj.drawerContent.appendChild(loading);
        if(newData.length > 0){
            newJson.data.rows = newData;

            setTimeout(() => {
                obj.putTableResponse(newJson, true);
                obj.drawerContent.removeChild(loading);

            }, 400)
        }else{
            setTimeout(() => {
                obj.putClientResponse('No data found.', true, json);
                obj.drawerContent.removeChild(loading);
            }, 400)
        }
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
        var json = cloneObject(ChataUtils.responses[idRequest]);
        var indexData = evt.target.dataset.chartindex;
        var colValue = evt.target.dataset.colvalue1;
        var indexValue = evt.target.dataset.filterindex;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if(groupableCount == 1 || groupableCount == 2){
            obj.sendDrilldownMessage(json, indexData, obj.options);
        }else{
            obj.sendDrilldownClientSide(
                json, indexValue, colValue, obj.options
            );
        }
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
        var component = obj.getComponent(idRequest);
        var parentContainer = obj.getParentFromComponent(component);
        obj.refreshToolbarButtons(component, 'table');
        var table = new ChataTable(
            idRequest,
            obj.options,
            obj.onRowClick,
            () => {
                parentContainer.parentElement.scrollIntoView()
            }
        );
        component.tabulator = table;
        table.parentContainer = parentContainer;
        allColHiddenMessage(component);
        obj.setHeightBubble(component);
        select(window).on('chata-resize.'+idRequest, null);
    }
    obj.displayColumChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'column');
        createColumnChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayBarChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bar');
        createBarChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayPieChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pie');
        createPieChart(component, json, obj.options);
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayLineChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'line');
        createLineChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayPivotTableHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pivot_table');
        var table = new ChataPivotTable(
            idRequest, obj.options, obj.onCellClick
        );
        obj.setHeightBubble(component);
        select(window).on('chata-resize.'+idRequest, null);

        component.tabulator = table;
    }

    obj.displayHeatmapHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'heatmap');
        createHeatmap(component, json, obj.options);
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayBubbleCharthandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bubble');
        createBubbleChart(component, json, obj.options);
        obj.setHeightBubble(component);
        obj.registerDrilldownChartEvent(component);
    }

    obj.displayStackedColumnHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_column');
        createStackedColumnChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
        );
        obj.setHeightBubble(component);
        obj.registerDrilldownStackedChartEvent(component);
    }

    obj.displayStackedBarHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_bar');
        createStackedBarChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
        );
        obj.setHeightBubble(component);
        obj.registerDrilldownStackedChartEvent(component);
    }

    obj.displayAreaHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_line');
        createAreaChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
        );
        obj.setHeightBubble(component);
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
            if(displayTypes[i] == 'pie'){
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
        obj.lastQuery = value;
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
        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.classList.add('request');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('single');
        messageBubble.classList.add('text');
        messageBubble.textContent = value;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.drawerContent.appendChild(responseLoadingContainer);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        obj.checkMaxMessages();
        return responseLoadingContainer;
    }

    obj.onRowClick = (e, row, json) => {
        var index = 0;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if(groupableCount > 0){
            for(var[key, value] of Object.entries(row._row.data)){
                json['data']['rows'][0][index++] = value;
            }
            obj.sendDrilldownMessage(json, 0, obj.options);
        }
    }

    obj.onCellClick = (e, cell, json) => {
        const columns = json['data']['columns'];
        const selectedColumn = cell._cell.column;
        const row = cell._cell.row;
        if(selectedColumn.definition.index != 0){
            var entries = Object.entries(row.data)[0];
            json['data']['rows'][0][0] = entries[1];
            json['data']['rows'][0][1] = selectedColumn.definition.field;
            json['data']['rows'][0][2] = cell.getValue();
            obj.sendDrilldownMessage(json, 0, obj.options);
        }

    }

    obj.putTableResponse = (jsonResponse, isDrilldown=false) => {
        var data = jsonResponse['data']['rows'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var scrollbox = document.createElement('div');
        var tableWrapper = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        var idRequest = uuidv4();

        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );

        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.style.maxHeight = '85%';

        containerMessage.setAttribute('data-bubble-id', idRequest);
        if(!isDrilldown){
            containerMessage.relatedMessage = lastBubble;
        }


        containerMessage.classList.add('response');
        containerMessage.classList.add('autoql-vanilla-chat-message-response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        containerMessage.relatedQuery = obj.lastQuery;

        ChataUtils.responses[idRequest] = jsonResponse;
        var supportedDisplayTypes = obj.getDisplayTypesButtons(
            idRequest, 'table'
        );

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

        tableContainer.classList.add('autoql-vanilla-chata-table-container');
        scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );

        tableWrapper.setAttribute('data-componentid', idRequest);
        tableWrapper.classList.add('autoql-vanilla-chata-table');

        tableContainer.appendChild(tableWrapper);
        scrollbox.appendChild(tableContainer);
        responseContentContainer.appendChild(scrollbox);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        var actions = obj.getActionToolbar(idRequest, 'csvCopy', 'table');
        messageBubble.appendChild(actions);
        var parentContainer = obj.getParentFromComponent(tableWrapper);
        var table = new ChataTable(
            idRequest,
            obj.options,
            obj.onRowClick,
            () => {
                setTimeout(function () {
                    parentContainer.parentElement.scrollIntoView()
                }, 350);
            }
        );

        tableWrapper.tabulator = table;
        table.parentContainer = parentContainer;
        setTimeout(function(){
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        }, 350);
        allColHiddenMessage(tableWrapper);
        return tableWrapper;
    }

    obj.sendReport = function(idRequest, options, menu, toolbar){
        return ChataUtils.sendReport(idRequest, options, menu, toolbar);
    }

    obj.openModalReport = function(idRequest, options, menu, toolbar) {
        ChataUtils.openModalReport(idRequest, options, menu, toolbar);
    }

    obj.showColumnEditor = function(id){
        ChataUtils.showColumnEditor(id, obj.options, () => {
            var component = obj.rootElem.querySelector(
                `[data-componentid='${id}']`
            );
            obj.setScrollBubble(obj.getParentFromComponent(component));
        });
    }

    obj.sendResponse = (text) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add(
            'text'
        );
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.textContent = text;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.inputAnimation = (text) => {
        var input = obj.input;
        var selectedQuery = text;
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += selectedQuery[index];
            if(index >= selectedQuery.length){
                clearInterval(int);
                var evt = new KeyboardEvent('keypress', {
                    keyCode: 13,
                    type: "keypress",
                    which: 13
                });
                input.dispatchEvent(evt)
            }else{
                input.value = subQuery;
            }
            index++;
        }, 60);
    }

    obj.createSuggestions = async function(
        responseContentContainer, relatedJson, json){

        var data = json['data']['items'];
        var {
            domain,
            apiKey
        } = obj.options.authentication
        var queryId = relatedJson['data']['query_id'];
        const url = `${domain}/autoql/api/v1/query/${queryId}/suggestions?key=${apiKey}`

        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add('autoql-vanilla-chata-suggestion-btn');
            button.textContent = data[i];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
            button.onclick = async (evt) => {
                var body = {
                    suggestion: evt.target.textContent
                };
                let loading = null;
                if(evt.target.textContent === 'None of these'){
                    loading = obj.showLoading()
                }else{
                    obj.inputAnimation(evt.target.textContent);
                }

                var response = await apiCallPut(url, body, obj.options)
                console.log(response);
                obj.drawerContent.removeChild(loading);
                obj.sendResponse('Thank you for your feedback')

                // ChataUtils.putCall(url, body , (jsonResponse) => {
                //     if(evt.target.textContent === 'None of these'){
                //         obj.drawerContent.removeChild(loading);
                //         obj.sendResponse('Thank you for your feedback')
                //     }
                // }, obj.options)
            }
        }
    }

    obj.putSuggestionResponse = (relatedJson, jsonResponse) => {
        var uuid = uuidv4();
        ChataUtils.responses[uuid] = jsonResponse;
        var data = jsonResponse['data']['items'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();

        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add(
            'text'
        );
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.setAttribute('data-bubble-id', uuid);
        // containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );


        obj.createSuggestions(
            responseContentContainer, relatedJson, jsonResponse
        );
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        messageBubble.appendChild(obj.getActionToolbar(
            uuid, 'safety-net', ''
        ))
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.putClientResponse = (msg, json={}, withDeleteBtn=false) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var uuid = uuidv4();
        ChataUtils.responses[uuid] = json;
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        containerMessage.setAttribute('data-bubble-id', uuid);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('simple-response')
        messageBubble.classList.add('no-hover-response')


        var div = document.createElement('div');
        div.classList.add('autoql-vanilla-chata-single-response');
        div.appendChild(document.createTextNode(msg.toString()));
        messageBubble.appendChild(div);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        if(withDeleteBtn){
            var toolbarButtons = obj.getActionToolbar(
                uuid, 'safety-net', ''
            );
            messageBubble.appendChild(toolbarButtons);
        }
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    }

    obj.showLoading = () => {
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add(
            'response-loading-container'
        );
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.drawerContent.appendChild(responseLoadingContainer);

        return responseLoadingContainer;
    }

    obj.putSimpleResponse = async (
        jsonResponse, text, statusCode, isDrilldown=false
    ) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.classList.add(
            'text'
        );
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        if(!isDrilldown)containerMessage.relatedMessage = lastBubble;

        var idRequest = uuidv4();
        ChataUtils.responses[idRequest] = jsonResponse;
        containerMessage.setAttribute('data-bubble-id', idRequest);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('simple-response')
        containerMessage.relatedQuery = obj.lastQuery;

        if(jsonResponse['reference_id'] === '1.1.211'
        || jsonResponse['reference_id'] === '1.1.430'
        || jsonResponse['reference_id'] === '1.9.502'){
            messageBubble.classList.add('no-hover-response');
        }

        var value = '';
        var hasDrilldown = false;
        if(jsonResponse['data'].rows && jsonResponse['data'].rows.length > 0){
            value = formatData(
                jsonResponse['data']['rows'][0][0],
                jsonResponse['data']['columns'][0],
                obj.options
            );
            hasDrilldown = true;

        }else{
            value = jsonResponse['message'].replace('<report>', '');
            messageBubble.classList.add('no-hover-response');
        }
        var div = document.createElement('div');
        if(hasDrilldown){
            div.onclick = (evt) => {
                obj.sendDrilldownMessage(jsonResponse, 0, obj.options);
            }
        }
        div.classList.add('autoql-vanilla-chata-single-response');
        var content = htmlToElement(`<div>${value.toString()}</div>`)
        div.appendChild(content);
        if(statusCode != 200 && jsonResponse['reference_id'] !== '1.1.430'){
            div.appendChild(document.createElement('br'));
            var errorId = htmlToElement(
                `<div>Error ID: ${jsonResponse.reference_id}</div>`
            )
            div.appendChild(errorId);
        }
        messageBubble.appendChild(div);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        var toolbarButtons = obj.getActionToolbar(
            idRequest, 'simple', 'table'
        );

        if(jsonResponse['reference_id'] !== '1.1.420' &&
           jsonResponse['reference_id'] !== '1.1.430'){
            messageBubble.appendChild(toolbarButtons);
        }

        if(jsonResponse['reference_id'] === '1.1.430'){
            toolbarButtons = obj.getActionToolbar(
                idRequest, 'safety-net', ''
            );
            messageBubble.appendChild(toolbarButtons);
        }
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        if(jsonResponse['reference_id'] === '1.1.430'){
            containerMessage.setAttribute('suggestion-message', '1');
            var responseLoadingContainer = document.createElement('div');
            var responseLoading = document.createElement('div');

            responseLoadingContainer.classList.add(
                'response-loading-container'
            );
            responseLoading.classList.add('response-loading');
            for (var i = 0; i <= 3; i++) {
                responseLoading.appendChild(document.createElement('div'));
            }

            responseLoadingContainer.appendChild(responseLoading);
            obj.drawerContent.appendChild(responseLoadingContainer);
            const path = getRecommendationPath(
                obj.options,
                text.split(' ').join(',')
            ) + '&query_id=' + jsonResponse['data']['query_id'];
            var response = await apiCallGet(path, obj.options)
            obj.drawerContent.removeChild(responseLoadingContainer);
            obj.putSuggestionResponse(jsonResponse, response.data);
        }
    }

    obj.putSafetynetMessage = function(jsonResponse){
        var suggestionArray = createSuggestionArray(jsonResponse);
        var div = document.createElement('div');
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var uuid = uuidv4();
        var lastBubble = obj.getLastMessageBubble();
        ChataUtils.responses[uuid] = jsonResponse
        containerMessage.classList.add(
            'autoql-vanilla-chat-single-message-container'
        );
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.setAttribute('data-bubble-id', uuid);
        containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');
        messageBubble.append(createSafetynetContent(suggestionArray, obj));

        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        var toolbar = obj.getActionToolbar(uuid, 'safety-net', '');
        messageBubble.appendChild(toolbar);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        refreshTooltips();
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
        containerMessage.style.zIndex = --obj.zIndexBubble;

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

    obj.sendMessage = async (textValue, source) => {
        obj.input.disabled = true;
        obj.input.value = '';
        const {
            domain,
            apiKey
        } = obj.options.authentication
        var responseLoadingContainer = obj.putMessage(textValue);

        const URL_SAFETYNET = `${domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            textValue
        )}&key=${apiKey}`

        var response = await apiCallGet(URL_SAFETYNET, obj.options)
        let suggestions = {}
        if(response.data != undefined){
            suggestions = response.data['full_suggestion']
            || response.data['data']['replacements']
        }

        if(
            obj.options.autoQLConfig.enableQueryValidation
            && textValue != 'None Of these'
            && suggestions.length > 0
        ){

            obj.input.removeAttribute("disabled")
            obj.drawerContent.removeChild(responseLoadingContainer)

            obj.putSafetynetMessage(response.data)
        }else{
            var response = await apiCall(textValue, obj.options, source)
            var status = response.status
            var jsonResponse = response.data
            const displayType = jsonResponse['data']['display_type'];
            obj.input.removeAttribute("disabled");
            obj.drawerContent.removeChild(responseLoadingContainer);
            switch(jsonResponse['data']['display_type']){
                case 'table':
                    if(jsonResponse['data']['columns'].length == 1){
                        obj.putSimpleResponse(jsonResponse, textValue, status);
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
                                jsonResponse
                            );
                        }else if(cols[0]['name'] == 'Help Link'){
                            obj.putHelpMessage(jsonResponse);
                        }else{
                            obj.putSimpleResponse(
                                jsonResponse, textValue, status
                            );
                        }
                    }else{
                        if(rows.length > 0){
                            obj.putTableResponse(jsonResponse);
                        }else{
                            obj.putSimpleResponse(
                                jsonResponse, textValue, status
                            );
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
                    obj.putSimpleResponse(jsonResponse, textValue, status);
            }
            obj.checkMaxMessages();
            refreshTooltips();
        }
    }

    document.addEventListener('DOMContentLoaded', obj.onLoadHandler);
    return obj;
}
