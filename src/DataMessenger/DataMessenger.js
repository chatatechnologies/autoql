// TODO: NEXT DEPLOY
// import { ReverseTranslation } from '../ReverseTranslation'
import { ErrorMessage } from '../ErrorMessage';
import { TIMESTAMP_FORMATS } from '../Constants'
import { ChataTable, ChataPivotTable } from '../ChataTable'
import { ChataUtils } from '../ChataUtils'
import { Modal } from '../Modal'
import {
    NotificationSettingsModal,
    NotificationIcon,
    NotificationFeed
} from '../Notifications'
// TODO: NEXT DEPLOY
// import { ReverseTranslation } from '../ReverseTranslation'
import {
    apiCallV2,
    apiCallGet,
    apiCallPut,
    apiCallPost,
} from '../Api'
import { select } from 'd3-selection';
import { getGroupableFields } from '../Charts/ChataChartHelpers';
import { FilterLocking } from '../FilterLocking';
import { createSafetynetContent, createSuggestionArray } from '../Safetynet';
import {
    getSpeech,
    htmlToElement,
    closeAllChartPopovers,
    closeAllSafetynetSelectors,
    uuidv4,
    getSupportedDisplayTypes,
    allColHiddenMessage,
    closeAllToolbars,
    cloneObject,
    getNumberOfGroupables,
    formatData,
    getRecommendationPath,
    getSafetynetValues,
    getSafetynetUserSelection,
    getGroupables,
    showBadge,
    supportsVoiceRecord,
    checkAndApplyTheme,
} from '../Utils';
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
import { Chart } from '../Charts/v2'
import {
    LIGHT_THEME,
    DARK_THEME,
} from '../Constants'
    createStackedColumnChart,
} from '../Charts';

import {
    CHATA_BUBBLES_ICON,
    CLOSE_ICON,
    CLEAR_ALL,
    POPOVER_ICON,
    WATERMARK,
    VOICE_RECORD_IMAGE,
    DATA_MESSENGER,
    QUERY_TIPS,
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
    VERTICAL_DOTS,
    DATA_LIMIT_WARNING,
    HELP_ICON,
    FILTER_LOCKING,
    MAXIMIZE_BUTTON,
    MINIMIZE_BUTTON,
} from '../Svg';
import { strings } from '../Strings';
import tippy, { hideAll } from 'tippy.js';
import { refreshTooltips } from '../Tooltips';

import '../../css/chata-styles.css';
import '../../css/DataMessenger.scss';

export function DataMessenger(options = {}) {
    checkAndApplyTheme();

    var obj = this;
    obj.options = {
        defaultOpen: true,
        placement: 'right',
        width: 550,
        height: 550,
        resizable: true,
        title: 'Data Messenger',
        showHandle: true,
        handleStyles: {},
        showMask: true,
        userDisplayName: strings.there,
        maxMessages: -1,
        clearOnClose: false,
        enableVoiceRecord: true,
        autocompleteStyles: {},
        enableExploreQueriesTab: true,
        enableNotificationsTab: false,
        inputPlaceholder: strings.dmInputPlaceholder,
        enableDynamicCharting: true,
        queryQuickStartTopics: undefined,
        landingPage: 'data-messenger',
        autoChartAggregations: true,
        xhr: new XMLHttpRequest(),
        ...options, // Spread all provided options to overwrite defaults
        authentication: {
            token: undefined,
            apiKey: undefined,
            domain: undefined,
            demo: false,
            ...(options.authentication ?? {}),
        },
        dataFormatting:{
            timestampFormat: TIMESTAMP_FORMATS.iso8601,
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 2,
            ratioDecimals: 4,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'll',
            ...(options.dataFormatting ?? {}),
        },
        autoQLConfig: {
            debug: false,
            test: false,
            enableAutocomplete: true,
            enableQueryInterpretation: true,
            enableQueryValidation: true,
            enableQuerySuggestions: true,
            enableColumnVisibilityManager: true,
            enableDrilldowns: true,
            enableNotifications: false,
            enableCSVDownload: true,
            enableReportProblem: true,
            ...(options.autoQLConfig ?? {}),
        },
    };

    obj.autoCompleteTimer = undefined;
    obj.speechToText = getSpeech();
    obj.finalTranscript = '';
    obj.isRecordVoiceActive = false;
    obj.zIndexBubble = 1000000;
    obj.lastQuery = '';
    obj.id = options?.id ?? `autoql-vanilla-data-messenger-${uuidv4()}`;
    obj.isVisible = !!obj.options.defaultOpen
    obj.notificationTabId = uuidv4();

    if (!('introMessage' in options)) {
        obj.options.introMessage = strings.introMessage.chataFormat(obj.options.userDisplayName);
    }

    obj.isPortrait = () => ['left', 'right'].includes(obj.options.placement)
    obj.isLandscape = () => ['top', 'bottom'].includes(obj.options.placement)

    obj.setOption = (option, value) => {
        try {
          if (obj.options[option] === value) {
            return
          }

        switch (option) {
            case 'authentication':
                obj.setObjectProp('authentication', value);
                if (obj.notificationIcon) {
                    obj.notificationIcon.setOption('authentication', value);
                }
                break;
            case 'dataFormatting':
                obj.setObjectProp('dataFormatting', value);
                break;
            case 'autoQLConfig':
                obj.setObjectProp('autoQLConfig', value);
                if (!obj.options.autoQLConfig.enableAutocomplete) {
                    obj.autoCompleteList.style.display = 'none';
                }
                break;
            case 'placement':
                obj.rootElem.classList.remove(`autoql-vanilla-drawer-${value}`);
                obj.rootElem.classList.remove(`autoql-vanilla-drawer-${obj.options.placement}`);
                obj.options.placement = value;
                break;
            case 'width':
                obj.options.width = parseInt(value);
                if (obj.isVisible && obj.isPortrait()) {
                    obj.drawerContentWrapper.style.width = value + 'px';
                }
                break;
            case 'height':
                obj.options.height = parseInt(value);
                if (obj.isVisible && obj.isLandscape()) {
                    obj.drawerContentWrapper.style.height = value + 'px';
                }
                break;
            case 'resizable':
                obj.options.resizable = value;
                if (!value) obj.resizeHandler.style.visibility = 'hidden';
                else obj.resizeHandler.style.visibility = 'visible';
                break;
            case 'title':
                obj.options.title = value;
                obj.headerTitle.innerHTML = obj.options.title;
                break;
            case 'showHandle':
                obj.options.showHandle = value;

                value
                  ? obj.drawerButton.classList.remove('autoql-vanilla-drawer-handle-hidden')
                  : obj.drawerButton.classList.add('autoql-vanilla-drawer-handle-hidden')

                break;
            case 'handleStyles':
                obj.applyHandleStyles();
                break;
            case 'showMask':
                obj.options.showMask = value;
                if (value === false) {
                  obj.drawerMask.classList.add('autoql-vanilla-drawer-mask-hidden')
                } else {
                  obj.drawerMask.classList.remove('autoql-vanilla-drawer-mask-hidden')
                }
                break;
            case 'maxMessages':
                obj.options.maxMessages = value;
                obj.checkMaxMessages();
                break;
            case 'enableVoiceRecord':
                obj.options.enableVoiceRecord = value;
                if (!supportsVoiceRecord()) return;
                var display = value ? 'flex' : 'none';
                obj.voiceRecordButton.style.display = display;
                break;
            case 'enableExploreQueriesTab':
                obj.options.enableExploreQueriesTab = value;
                value
                  ? obj.tabQueryTips.classList.remove('autoql-vanilla-data-messenger-tab-hidden')
                  : obj.tabQueryTips.classList.add('autoql-vanilla-data-messenger-tab-hidden');

                if (!value && obj.landingPage === 'explore-queries') {
                  obj.setActiveTab(obj.tabChataUtils)
                }
                break;

            case 'enableNotificationsTab':
                obj.options.enableNotificationsTab = value;
                value
                  ? obj.tabNotifications.classList.remove('autoql-vanilla-data-messenger-tab-hidden')
                  : obj.tabNotifications.classList.add('autoql-vanilla-data-messenger-tab-hidden');

                if (!value && obj.landingPage === 'notifications') {
                  obj.setActiveTab(obj.tabChataUtils)
                }

                obj.instanceNotificationIcon();
                obj.toggleNotificationOption();

                break;
            case 'inputPlaceholder':
                obj.options.inputPlaceholder = value;
                obj.input.setAttribute('placeholder', value);
                break;
            case 'userDisplayName':
                obj.options.userDisplayName = value;
                obj.options.introMessage = strings.introMessage.chataFormat(value);
                obj.introMessageBubble.textContent = obj.options.introMessage;
                break;
            case 'introMessage':
                obj.options.introMessage = value;
                obj.introMessageBubble.textContent = value;
                break;
            case 'queryQuickStartTopics':
                obj.options.queryQuickStartTopics = value;
                obj.createIntroMessageTopics();
                break;
            default:
                obj.options[option] = value;
        }
      } catch (error) {
        console.error(error)
      }
    };

    obj.setOptions = (options = {}) => {
        for (let [key, value] of Object.entries(options)) {
            if (typeof value !== 'object') {
                obj.setOption(key, value)
            }
        }
    }

    obj.setObjectProp = (key, _obj) => {
        for (var [keyValue, value] of Object.entries(_obj)) {
            obj.options[key][keyValue] = value;
        }
    };

    obj.applyHandleStyles = () => {
        for (var [key, value] of Object.entries(obj.options.handleStyles)) {
            obj.drawerButton.style.setProperty(key, value, '');
        }
    };

    obj.createDrawerButton = () => {
        var drawerButton = document.createElement('div');
        drawerButton.classList.add('autoql-vanilla-drawer-handle');
        drawerButton.addEventListener('click', function () {
            obj.openDrawer();
        });

        var drawerIcon = document.createElement('div');
        drawerIcon.classList.add('autoql-vanilla-chata-bubbles-icon');
        drawerIcon.innerHTML = CHATA_BUBBLES_ICON;
        drawerButton.appendChild(drawerIcon);

        obj.drawerButton = drawerButton;

        if (!obj.options.showHandle) {
            obj.drawerButton.classList.add('autoql-vanilla-drawer-handle-hidden')
        } else {
            obj.applyHandleStyles();
        }

        obj.drawerContentWrapper.appendChild(drawerButton);
    };

    obj.openDrawer = () => {
        if (!obj.rootElem) return

        obj.isVisible = true;
        obj.rootElem.classList.add('autoql-vanilla-drawer-open');
        obj.initialScroll = window.scrollY;
        obj.input.focus();
    };

    obj.closeDrawer = () => {
        obj.closePopOver(obj.clearMessagePop);
        closeAllChartPopovers();

        obj.rootElem.classList.remove('autoql-vanilla-drawer-open');
        obj.options.isVisible = false;

        if (obj.options.clearOnClose) {
            obj.clearMessages();
        }
    };

    obj.createDrawer = () => {
        var rootElem = document.createElement('div');
        rootElem.id = obj.id;
        rootElem.classList.add('autoql-vanilla-drawer');
        rootElem.classList.add(`autoql-vanilla-drawer-${obj.options.placement}`);

        if (obj.isVisible) {
            rootElem.classList.add('autoql-vanilla-drawer-open');
        }

        obj.rootElem = rootElem

        document.body.appendChild(obj.rootElem);
    }

    obj.createContentWrapper = () => {
        obj.drawerContentWrapper = document.createElement('div');
        obj.drawerContentWrapper.classList.add('autoql-vanilla-drawer-content-wrapper')

        if (obj.options.placement == 'right') {
            obj.drawerContentWrapper.style.width = obj.options.width + 'px';
        } else if (obj.options.placement == 'left') {
            obj.drawerContentWrapper.style.width = obj.options.width + 'px';
        } else if (obj.options.placement == 'bottom') {
            obj.drawerContentWrapper.style.height = obj.options.height + 'px';
        } else if (obj.options.placement == 'top') {
            obj.drawerContentWrapper.style.height = obj.options.height + 'px';
        }

        obj.drawerBody = document.createElement('div')
        obj.drawerBody.classList.add('autoql-vanilla-drawer-body')
        obj.drawerContentWrapper.appendChild(obj.drawerBody)

        obj.rootElem.appendChild(obj.drawerContentWrapper)
    }

    obj.createMask = () => {
      obj.drawerMask = document.createElement('div');
      obj.drawerMask.classList.add('autoql-vanilla-drawer-mask')

      if (obj.options.showMask) {
        obj.drawerMask.onclick = () => {
          obj.closeDrawer()
        }
      } else {
        obj.drawerMask.classList.add('autoql-vanilla-drawer-mask-hidden')
      }

      obj.rootElem.appendChild(obj.drawerMask)
    }

    obj.onLoadHandler = () => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            obj.initialScroll = window.scrollY;
        }
    };

    obj.showWarningIcon = (messageBubble, json) => {
        if (json.data.rows.length >= 500) {
            const warningIcon = htmlToElement(`
                <span
                class="chata-icon data-limit-warning-icon warning"
                data-tippy-content="${strings.dataRowLimit.chataFormat(500)}">
                    ${DATA_LIMIT_WARNING}
                </span>
            `);
            messageBubble.appendChild(warningIcon);
            refreshTooltips();
        }
    };

    obj.tabsAnimation = function (displayNodes, displayBar) {
        var nodes = obj.drawerContent.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = displayNodes;
        }
        obj.chataBarContainer.style.display = displayBar;
        if (displayNodes == 'none') {
            obj.headerTitle.innerHTML = strings.exploreQueries;
            obj.headerRight.style.visibility = 'hidden';
            obj.scrollBox.classList.add('max-height');
        } else {
            obj.headerTitle.innerHTML = obj.options.title;
            obj.headerRight.style.visibility = 'visible';
            obj.scrollBox.classList.remove('max-height');
        }
        obj.updateBubbleTables();
    };

    obj.updateBubbleTables = () => {
        if (obj.options.landingPage === 'data-messenger') {
            var nodes = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');
            for (var i = 0; i < nodes.length; i++) {
                var component = nodes[i].querySelector('[data-componentid]');
                if (component && component.tabulator) component.tabulator.redraw(true);
            }
        }
    };

    obj.queryTipsAnimation = function (display) {
        obj.queryTips.style.display = display;
        if (display !== 'none') obj.queryTipsInput.focus();
    };

    obj.createNotifications = function () {
        var notificationsContainerId = uuidv4();
        const container = htmlToElement(`
            <div
                id=${notificationsContainerId}>

            </div>
        `);
        const button = htmlToElement(`
            <button class="autoql-vanilla-chata-btn primary"
            style="padding: 5px 16px; margin: 10px 5px 2px;">
                Create a New Notification
            </button>
        `);

        button.onclick = () => {
            var modalView = new NotificationSettingsModal(obj.options);
            var configModal = new Modal(
                {
                    withFooter: true,
                    destroyOnClose: true,
                },
                () => {
                    modalView.step1.expand();
                },
            );
            var cancelButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`,
            );
            var spinner = htmlToElement(`
                <div class="autoql-vanilla-spinner-loader hidden"></div>
                `);
            var saveButton = htmlToElement(
                `<div class="autoql-vanilla-chata-btn primary "
                style="padding: 5px 16px; margin: 2px 5px;"></div>`,
            );

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
            cancelButton.onclick = () => {
                configModal.close();
            };
            saveButton.onclick = () => {
                spinner.classList.remove('hidden');
                saveButton.setAttribute('disabled', 'true');
                var o = obj.options;
                const URL = `${o.authentication.domain}/autoql/api/v1/rules?key=${o.authentication.apiKey}`;
                ChataUtils.ajaxCallPost(
                    URL,
                    () => {
                        configModal.close();
                    },
                    modalView.getValues(),
                    o,
                );
            };
        };

        container.style.display = 'none';
        obj.notificationsContainer = container;
        obj.notificationsContainerId = notificationsContainerId;
        obj.drawerContent.appendChild(container);
    };

    obj.notificationsAnimation = function (display) {
        obj.notificationsContainer.style.display = display;
        obj.notificationsContainer.innerHTML = '';
        var id = obj.notificationsContainerId;
        var notificationList = new NotificationFeed(`[id="${id}"]`, {
            authentication: {
                ...obj.options.authentication,
            },
            showNotificationDetails: true,
            showDescription: false,
        });

        if (obj.isPortrait()) {
            notificationList.style.height = obj.drawerContent.clientHeight - 60 + 'px';
        } else {
            notificationList.style.height = obj.options.height - 60 + 'px';
        }
    };

    obj.getQueryTipsPageSize = () => {
        const height = obj.drawerContent.clientHeight;
        return parseInt((height - 62 - 72 - 60 - 50) / 47);
    };

    obj.setActiveTab = function (tab) {
      if (!tab) return

      [obj.tabChataUtils, obj.tabQueryTips, obj.tabNotifications].forEach(tab => {
        tab?.classList.remove('autoql-vanilla-data-messenger-tab-active')
      })

      tab.classList.add('autoql-vanilla-data-messenger-tab-active')
      obj.landingPage = tab.getAttribute('data-tab')
    }

    obj.createQueryTab = function ({name, content, tooltip, isEnabled}) {
      var tab = document.createElement('div');
      tab.classList.add('autoql-vanilla-data-messenger-tab');
      tab.setAttribute('data-tippy-content', tooltip);
      tab.setAttribute('data-tab', name)

      if (content) tab.appendChild(content);
      if (!isEnabled) tab.classList.add('autoql-vanilla-data-messenger-tab-hidden');
      if (obj.options.landingPage === name) tab.classList.add('autoql-vanilla-data-messenger-tab-active');

      return tab
    }

    obj.createQueryTabs = function () {
        const { enableExploreQueriesTab, enableNotificationsTab } = obj.options;

        var pageSwitcherContainer = document.createElement('div');
        pageSwitcherContainer.classList.add('autoql-vanilla-page-switcher-container');

        var tabChataUtils = obj.createQueryTab({name: 'data-messenger', content: htmlToElement(DATA_MESSENGER), tooltip: 'Data Messenger', isEnabled: true})
        var tabQueryTips = obj.createQueryTab({name: 'explore-queries', content: htmlToElement(QUERY_TIPS), tooltip: strings.exploreQueries, isEnabled: enableExploreQueriesTab })
        var tabNotifications = obj.createQueryTab({name: 'notifications', tooltip: strings.notifications, isEnabled: enableNotificationsTab })

        tabChataUtils.onclick = function () {
            obj.setActiveTab(this)
            obj.scrollBox.style.overflow = 'auto';
            obj.scrollBox.style.maxHeight = 'calc(100% - 150px)';
            obj.tabsAnimation('flex', 'block');
            obj.queryTipsAnimation('none');
            obj.notificationsAnimation('none');
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        };

        tabQueryTips.onclick = function () {
            obj.setActiveTab(this)
            obj.tabsAnimation('none', 'none');
            obj.queryTipsAnimation('block');
            obj.notificationsAnimation('none');
        };

        tabNotifications.setAttribute('id', obj.notificationTabId);
        tabNotifications.onclick = function () {
            obj.setActiveTab(this)
            obj.scrollBox.scrollTop = 0;
            obj.scrollBox.style.overflow = 'hidden';
            obj.scrollBox.style.maxHeight = '100%';
            obj.tabsAnimation('none', 'none');
            obj.queryTipsAnimation('none');
            obj.notificationsAnimation('block');
            obj.headerTitle.innerHTML = strings.notifications;
        };

        pageSwitcherContainer.appendChild(tabChataUtils)
        pageSwitcherContainer.appendChild(tabQueryTips)
        pageSwitcherContainer.appendChild(tabNotifications)

        var pageSwitcherShadowContainer = document.createElement('div');
        pageSwitcherShadowContainer.classList.add('autoql-vanilla-page-switcher-shadow-container');
        pageSwitcherShadowContainer.appendChild(pageSwitcherContainer);

        var tabContainer = document.createElement('div');
        tabContainer.classList.add('autoql-vanilla-data-messenger-tab-container');
        tabContainer.appendChild(pageSwitcherShadowContainer);

        obj.tabChataUtils = tabChataUtils
        obj.tabQueryTips = tabQueryTips
        obj.tabNotifications = tabNotifications

        obj.drawerBody.appendChild(tabContainer);

        if (enableNotificationsTab) {
            obj.instanceNotificationIcon();
        }

        refreshTooltips();
    };

    obj.instanceNotificationIcon = () => {
        if (obj.options.enableNotificationsTab) {
            var tabId = obj.notificationTabId;
            if (obj.notificationIcon) return;
            var notificationIcon = new NotificationIcon(`[id="${tabId}"]`, {
                authentication: {
                    ...obj.options.authentication,
                },
                useDot: true,
            });
            obj.notificationIcon = notificationIcon;
        }
    };

    obj.createQueryTips = function () {
        const searchIcon = htmlToElement(SEARCH_ICON);
        var container = document.createElement('div');
        var textBar = document.createElement('div');
        var queryTipsResultContainer = document.createElement('div');
        var queryTipsResultPlaceHolder = document.createElement('div');
        var chatBarInputIcon = document.createElement('div');

        var input = document.createElement('input');

        textBar.classList.add('autoql-vanilla-text-bar');
        textBar.classList.add('autoql-vanilla-text-bar-animation');
        textBar.classList.add('autoql-vanilla-text-bar-with-icon')
        chatBarInputIcon.classList.add('autoql-vanilla-chat-bar-input-icon');
        container.classList.add('autoql-vanilla-querytips-container');
        queryTipsResultContainer.classList.add('autoql-vanilla-query-tips-result-container');
        queryTipsResultPlaceHolder.classList.add('query-tips-result-placeholder');
        queryTipsResultPlaceHolder.innerHTML = `
            <p>
                ${strings.exploreQueriesMessage1}
            <p>
            <p>
                ${strings.exploreQueriesMessage2}
            <p>
        `;

        queryTipsResultContainer.appendChild(queryTipsResultPlaceHolder);
        chatBarInputIcon.appendChild(searchIcon);
        textBar.appendChild(input);
        textBar.appendChild(chatBarInputIcon);
        container.appendChild(textBar);
        container.appendChild(queryTipsResultContainer);

        input.onkeypress = async function (event) {
            if (event.keyCode == 13 && this.value) {
                var chatBarLoadingSpinner = document.createElement('div');
                var searchVal = this.value.split(' ').join(',');
                var spinnerLoader = document.createElement('div');
                spinnerLoader.classList.add('autoql-vanilla-spinner-loader');
                chatBarLoadingSpinner.classList.add('chat-bar-loading-spinner');
                chatBarLoadingSpinner.appendChild(spinnerLoader);
                textBar.appendChild(chatBarLoadingSpinner);
                var options = obj.options;
                const URL = obj.getRelatedQueriesPath(1, searchVal, options);

                var response = await apiCallGet(URL, options);
                textBar.removeChild(chatBarLoadingSpinner);
                obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
            }
        };

        container.style.display = 'none';

        input.classList.add('autoql-vanilla-chata-input');
        input.classList.add('left-padding');
        input.setAttribute('placeholder', strings.exploreQueriesInput);
        obj.queryTips = container;
        obj.drawerContent.appendChild(container);
        obj.queryTipsInput = input;
    };

    obj.safetynetAnimation = (text, selections) => {
        var chataInput = obj.input;
        chataInput.focus();
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += text[index];
            if (index >= text.length) {
                clearInterval(int);
                obj.sendMessage(chataInput.value, 'data_messenger.validation', selections);
            } else {
                chataInput.value = subQuery;
            }
            index++;
        }, 45);
    };

    obj.keyboardAnimation = (text) => {
        var chataInput = obj.input;
        chataInput.focus();
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += text[index];
            if (index >= text.length) {
                clearInterval(int);
                var ev = new KeyboardEvent('keypress', {
                    keyCode: 13,
                    type: 'keypress',
                    which: 13,
                });
                chataInput.dispatchEvent(ev);
            } else {
                chataInput.value = subQuery;
            }
            index++;
        }, 45);
    };

    obj.putRelatedQueries = (response, queryTipsResultContainer, container, searchVal) => {
        var delay = 0.08;
        var list = response.data.items;
        var queryTipListContainer = document.createElement('div');
        var paginationContainer = document.createElement('div');
        var pagination = document.createElement('ul');
        var paginationPrevious = document.createElement('li');
        var aPrevious = document.createElement('a');
        var aNext = document.createElement('a');
        var paginationNext = document.createElement('li');
        var options = obj.options;
        var nextPath = response.data.pagination.next_url;
        var previousPath = response.data.pagination.previous_url;
        var nextUrl = `${options.authentication.domain}${nextPath}`;
        var previousUrl = `${options.authentication.domain}${previousPath}`;

        const totalItems = response.data.pagination.total_items;
        const pages = response.data.pagination.total_pages;
        var currentPage = response.data.pagination.current_page;
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

        if (!nextPath) {
            paginationNext.classList.add('disabled');
        }

        if (!previousPath) {
            paginationPrevious.classList.add('disabled');
        }

        paginationNext.onclick = async (evt) => {
            if (!evt.target.classList.contains('disabled')) {
                var response = await apiCallGet(nextUrl, obj.options);
                obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
            }
        };

        paginationPrevious.onclick = async (evt) => {
            if (!evt.target.classList.contains('disabled')) {
                var response = await apiCallGet(previousUrl, obj.options);
                obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
            }
        };

        const dotEvent = async (evt) => {
            var page = evt.target.dataset.page;
            var path = obj.getRelatedQueriesPath(page, searchVal, obj.options);
            var response = await apiCallGet(path, obj.options);
            obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
        };

        for (var i = 0; i < list.length; i++) {
            var item = document.createElement('div');
            item.classList.add('animated-item');
            item.classList.add('query-tip-item');
            item.innerHTML = list[i];
            item.style.animationDelay = delay * i + 's';
            item.onclick = function (event) {
                obj.tabChataUtils.classList.add('active');
                obj.tabQueryTips.classList.remove('active');
                obj.tabsAnimation('flex', 'block');
                obj.queryTipsAnimation('none');
                obj.notificationsAnimation('none');
                var selectedQuery = event.target.textContent;
                obj.keyboardAnimation(selectedQuery);
                obj.options.landingPage = 'data-messenger';
            };
            queryTipListContainer.appendChild(item);
        }

        queryTipsResultContainer.innerHTML = '';
        queryTipsResultContainer.appendChild(queryTipListContainer);
        for (let i = 0; i < 3; i++) {
            if (i >= pages) break;
            var li = document.createElement('li');
            var a = document.createElement('a');

            if (i == currentPage - 1) {
                li.classList.add('selected');
            }
            li.appendChild(a);
            pagination.appendChild(li);

            if (i == 2) {
                if (currentPage == 3) {
                    a.textContent = currentPage;
                    let rightDots = document.createElement('li');
                    let aDots = document.createElement('a');
                    if (pages != 3) {
                        aDots.textContent = '...';
                        rightDots.appendChild(aDots);
                        pagination.appendChild(rightDots);
                        aDots.setAttribute('data-page', currentPage + 1);
                        rightDots.onclick = dotEvent;
                    }
                } else if (currentPage > 3 && currentPage <= pages - 2) {
                    a.textContent = currentPage;
                    li.classList.add('selected');
                    let rightDots = document.createElement('li');
                    let aDots = document.createElement('a');
                    aDots.textContent = '...';
                    rightDots.appendChild(aDots);
                    aDots.setAttribute('data-page', currentPage + 1);

                    var leftDots = document.createElement('li');
                    var aDotsLeft = document.createElement('a');
                    aDotsLeft.textContent = '...';
                    leftDots.appendChild(aDotsLeft);
                    aDotsLeft.setAttribute('data-page', currentPage - 1);
                    pagination.insertBefore(leftDots, li);
                    if (currentPage < pages - 2) {
                        pagination.appendChild(rightDots);
                    }

                    rightDots.onclick = dotEvent;
                    leftDots.onclick = dotEvent;
                } else {
                    if (pages != 3) {
                        a.textContent = '...';
                    } else {
                        a.textContent = i + 1;
                    }
                }
            } else {
                a.textContent = i + 1;
            }

            a.setAttribute('data-page', i + 1);
            li.onclick = dotEvent;
        }

        if (pages > 3) {
            for (let i = pages - 2; i < pages; i++) {
                if (i >= pages) break;
                let li = document.createElement('li');
                let a = document.createElement('a');
                if (i == currentPage - 1) {
                    li.classList.add('selected');
                }
                li.appendChild(a);
                a.textContent = i + 1;
                a.setAttribute('data-page', i + 1);

                li.onclick = async (evt) => {
                    var page = evt.target.dataset.page;
                    var path = obj.getRelatedQueriesPath(page, searchVal, obj.options);
                    var response = await apiCallGet(path, obj.options);
                    obj.putRelatedQueries(response.data, queryTipsResultContainer, container, searchVal);
                };

                pagination.appendChild(li);
            }
        }
        pagination.appendChild(paginationNext);
        if (totalItems != 0) {
            paginationContainer.appendChild(pagination);
        } else {
            queryTipsResultContainer.appendChild(document.createTextNode(strings.relatedQueriesNotFound));
        }
        container.appendChild(paginationContainer);
        if (obj.pagination) {
            container.removeChild(obj.pagination);
        }
        obj.pagination = paginationContainer;
    };

    obj.getRelatedQueriesPath = (page, searchVal, options) => {
        const pageSize = obj.getQueryTipsPageSize();
        const s = encodeURIComponent(searchVal);
        const url = options.authentication.demo
            ? `https://backend-staging.chata.ai/autoql/api/v1/query/related-queries`
            : `${options.authentication.domain}/autoql/api/v1/query/related-queries?key=${options.authentication.apiKey}&search=${s}&page_size=${pageSize}&page=${page}`;
        return url;
    };

    obj.createResizeHandler = function () {
        var resize = document.createElement('div');
        var startX, startY, startWidth, startHeight;
        var timer;

        resize.classList.add('autoql-vanilla-chata-drawer-resize-handle');

        function resizeItem(e) {
            let newWidth;
            let newHeight;
            switch (obj.options.placement) {
                case 'left':
                    newWidth = startWidth + e.clientX - startX;
                    break;
                case 'right':
                    newWidth = startWidth + startX - e.clientX;
                    break;
                case 'top':
                    newHeight = startHeight + e.clientY - startY;
                    break;
                case 'bottom':
                    newHeight = startHeight + startY - e.clientY;
                    break;
                default:
            }
            if (newWidth <= 400) return;

            if (obj.isPortrait()) {
                obj.drawerContentWrapper.style.width = newWidth + 'px';
                obj.options.width = newWidth;
            } else {
                obj.drawerContentWrapper.style.height = newHeight + 'px';
                obj.options.height = newHeight;
            }

            clearTimeout(timer);
            timer = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('chata-resize', {}));
            }, 100);
        }

        function stopResize() {
            obj.rootElem.classList.remove('autoql-vanilla-drawer-resizing')
            window.removeEventListener('mousemove', resizeItem, false);
            window.removeEventListener('mouseup', stopResize, false);
        }

        function initResize(e) {
            obj.rootElem.classList.add('autoql-vanilla-drawer-resizing')
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(obj.drawerContentWrapper).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(obj.drawerContentWrapper).height, 10);
            window.addEventListener('mousemove', resizeItem, false);
            window.addEventListener('mouseup', stopResize, false);
        }

        resize.addEventListener('mousedown', initResize, false);

        obj.drawerBody.appendChild(resize);
        obj.resizeHandler = resize;
        if (!obj.options.resizable) {
            obj.resizeHandler.style.visibility = 'hidden';
        }
    };

    obj.registerWindowClicks = () => {
        const excludeElementsForClearMessages = [
            'clear-all',
            'autoql-vanilla-clear-messages-confirm-popover',
            'autoql-vanilla-chata-confirm-text',
            'autoql-vanilla-chata-confirm-icon',
        ];

        obj.rootElem.addEventListener('click', (evt) => {
            var closePop = true;
            var closeAutoComplete = true;
            if (evt.target.classList.contains('autoql-vanilla-chata-input')) {
                closeAutoComplete = false;
            }
            for (var i = 0; i < excludeElementsForClearMessages.length; i++) {
                var c = excludeElementsForClearMessages[i];
                if (evt.target.classList.contains(c)) {
                    closePop = false;
                    break;
                }
            }

            if (closePop) {
                obj.closePopOver(obj.clearMessagePop);
            }

            if (closeAutoComplete) {
                obj.autoCompleteList.style.display = 'none';
            }

            if (evt.target.classList.contains('suggestion')) {
                obj.autoCompleteList.style.display = 'none';
                obj.lastQuery = evt.target.textContent;
                obj.sendMessage(evt.target.textContent, 'data_messenger.user');
            }
        });
    };

    obj.createDrawerContent = () => {
        var drawerContent = document.createElement('div');
        var firstMessage = document.createElement('div');
        var chatMessageBubble = document.createElement('div');
        var scrollBox = document.createElement('div');
        scrollBox.classList.add('autoql-vanilla-chata-scrollbox');
        chatMessageBubble.textContent = obj.options.introMessage;
        drawerContent.classList.add('autoql-vanilla-drawer-content');
        firstMessage.classList.add('autoql-vanilla-chat-single-message-container');
        firstMessage.classList.add('response');
        chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        chatMessageBubble.classList.add('text');

        firstMessage.appendChild(chatMessageBubble);
        drawerContent.appendChild(firstMessage);
        scrollBox.appendChild(drawerContent);
        obj.drawerBody.appendChild(scrollBox);
        obj.drawerContent = drawerContent;
        obj.scrollBox = scrollBox;
        obj.introMessageBubble = chatMessageBubble;
        obj.introMessage = firstMessage;
    };

    obj.createIntroMessageTopics = () => {
        const topics = obj.options.queryQuickStartTopics;
        if (obj.topicsWidget) {
            obj.drawerContent.removeChild(obj.topicsWidget._elem);
        }

        if (topics && topics.length) {
            const topicsWidget = new Cascader(topics, obj);
            obj.drawerContent.insertBefore(topicsWidget._elem, obj.introMessageBubble.nextSibling);
            obj.topicsWidget = topicsWidget;
            if (obj.options.landingPage !== 'data-messenger') {
                obj.topicsWidget._elem.style.display = 'none';
            }
        }
    };

    obj.createHeader = () => {
        var chatHeaderContainer = document.createElement('div');
        var filterLocking = new FilterLocking(obj);
        var closeButton = htmlToElement(`
            <button
                class="autoql-vanilla-chata-button close-action"
                data-tippy-content="${strings.closeDrawer}" currentitem="false">
                ${CLOSE_ICON}
            </button>
        `);

        var screenButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button autoql-vanilla-screen-menu autoql-btn-maximize">
                ${MAXIMIZE_BUTTON}
            </button>
        `);

        var filterButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button filter-locking-menu"
            data-tippy-content="${strings.filterButton}">
                ${FILTER_LOCKING}
            </button>
        `);

        var clearAllButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button clear-all"
            data-tippy-content="${strings.clearMessages}">
                ${CLEAR_ALL}
            </button>
        `);

        var headerLeft = htmlToElement(`
            <div class="chata-header-left">
            </div>
        `);
        var headerTitle = htmlToElement(`
            <div class="autoql-vanilla-chata-header-center-container">
                ${obj.options.title}
            </div>
        `);
        var headerRight = htmlToElement(`
            <div class="chata-header-right-container">
            </div>
        `);
        var popover = htmlToElement(`
            <div class="autoql-vanilla-popover-container">
                <div class="autoql-vanilla-clear-messages-confirm-popover">
                    <div class="autoql-vanilla-chata-confirm-text">
                        ${POPOVER_ICON}
                        ${strings.clearMessagesTitle}
                    </div>
                    <button class="autoql-vanilla-chata-confirm-btn no">
                        ${strings.cancel}
                    </button>
                    <button class="autoql-vanilla-chata-confirm-btn yes">
                        ${strings.clear}
                    </button>
                </div>
            </div>
        `);
        chatHeaderContainer.classList.add('autoql-vanilla-chat-header-container');

        closeButton.onclick = () => {
            obj.closeDrawer();
        };

        clearAllButton.onclick = () => {
            closeAllChartPopovers();
            popover.style.visibility = 'visible';
            popover.style.opacity = 1;
        };

        filterButton.onclick = () => {
            closeAllChartPopovers();
            if (filterLocking.isOpen) {
                filterLocking.hide();
            } else {
                filterLocking.show();
            }
        };

        popover.addEventListener('click', (evt) => {
            if (evt.target.classList.contains('autoql-vanilla-chata-confirm-btn')) {
                obj.closePopOver(popover);
                if (evt.target.classList.contains('yes')) {
                    obj.clearMessages();
                }
            }
        });

        const screenButtonTooltip = tippy(screenButton);
        screenButtonTooltip.setContent(strings.maximizeButton);
        screenButtonTooltip.setProps({
            theme: 'chata-theme',
            delay: [500],
        });
        screenButton.onclick = () => {
            if (screenButton.classList.contains('autoql-btn-maximize')) {
                screenButton.classList.remove('autoql-btn-maximize');
                screenButton.classList.add('autoql-btn-minimize');
                screenButton.innerHTML = MINIMIZE_BUTTON;
                screenButtonTooltip.setContent(strings.maximizeButtonExit);

                obj.isPortrait() ? obj.drawerContentWrapper.style.width = '100%' : obj.drawerContentWrapper.style.height = '100%'
            } else {
                screenButton.classList.add('autoql-btn-maximize');
                screenButton.classList.remove('autoql-btn-minimize');
                screenButton.innerHTML = MAXIMIZE_BUTTON;
                screenButtonTooltip.setContent(strings.maximizeButton);

                obj.isPortrait() ? obj.setOption('width', obj.options.width) : obj.setOption('height', obj.options.height);
            }

            window.dispatchEvent(new CustomEvent('chata-resize', {}));
        };

        headerLeft.appendChild(closeButton);
        headerLeft.appendChild(screenButton);
        headerRight.appendChild(filterButton);
        headerRight.appendChild(clearAllButton);
        headerRight.appendChild(popover);
        headerRight.appendChild(filterLocking);

        chatHeaderContainer.appendChild(headerLeft);
        chatHeaderContainer.appendChild(headerTitle);
        chatHeaderContainer.appendChild(headerRight);
        obj.drawerBody.appendChild(chatHeaderContainer);
        obj.headerRight = headerRight;
        obj.headerTitle = headerTitle;
        obj.clearMessagePop = popover;
        filterLocking.loadConditions();
    };

    obj.closePopOver = (popover) => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
    };

    obj.clearMessages = () => {
        [].forEach.call(obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container'), (e) => {
            e.parentNode.removeChild(e);
        });

        obj.drawerContent.appendChild(obj.introMessage);

        if (obj.topicsWidget) {
            obj.topicsWidget.reset();
            obj.drawerContent.appendChild(obj.topicsWidget._elem);
        }
    };

    obj.autoCompleteHandler = (evt) => {
        if (obj.options.autoQLConfig.enableAutocomplete) {
            obj.autoCompleteList.style.display = 'none';
            clearTimeout(obj.autoCompleteTimer);
            if (evt.target.value) {
                obj.autoCompleteTimer = setTimeout(() => {
                    ChataUtils.autocomplete(evt.target.value, obj.autoCompleteList, 'suggestion', obj.options);
                }, 150);
            }
        }
    };

    obj.onEnterHandler = (evt) => {
        if (evt.keyCode == 13 && obj.input.value) {
            try {
                obj.options.xhr.abort();
            } catch (e) {
                console.error(e);
            }
            clearTimeout(obj.autoCompleteTimer);
            obj.autoCompleteList.style.display = 'none';
            obj.sendMessage(obj.input.value, 'data_messenger.user');
        }
    };

    obj.createBar = () => {
        const placeholder = obj.options.inputPlaceholder;
        var chataBarContainer = document.createElement('div');
        var autoComplete = document.createElement('div');
        var autoCompleteList = document.createElement('ul');
        var textBar = document.createElement('div');
        var chataInput = document.createElement('input');
        var voiceRecordButton = document.createElement('button');
        var watermark = htmlToElement(`
            <div class="autoql-vanilla-watermark">
                ${WATERMARK}
                ${strings.watermark}
            </div>
        `);

        chataBarContainer.classList.add('autoql-vanilla-chata-bar-container');
        chataBarContainer.classList.add('autoql-vanilla-chat-drawer-chat-bar');
        chataBarContainer.classList.add('autoql-vanilla-autosuggest-top');
        autoComplete.classList.add('autoql-vanilla-auto-complete-suggestions');
        autoCompleteList.classList.add('autoql-vanilla-auto-complete-list');
        textBar.classList.add('autoql-vanilla-text-bar');
        chataInput.classList.add('autoql-vanilla-chata-input');
        chataInput.setAttribute('autocomplete', 'off');
        chataInput.setAttribute('placeholder', placeholder);
        voiceRecordButton.classList.add('autoql-vanilla-chat-voice-record-button');
        voiceRecordButton.classList.add('chata-voice');
        voiceRecordButton.setAttribute('data-tippy-content', strings.voiceRecord);
        voiceRecordButton.innerHTML = VOICE_RECORD_IMAGE;

        if (!supportsVoiceRecord() || !obj.options.enableVoiceRecord) {
          voiceRecordButton.style.display = 'none';
        }

        autoComplete.appendChild(autoCompleteList);
        textBar.appendChild(chataInput);
        textBar.appendChild(voiceRecordButton);
        chataBarContainer.appendChild(watermark);
        chataBarContainer.appendChild(autoComplete);
        chataBarContainer.appendChild(textBar);

        chataInput.onfocus = (evt) => {
            obj.autoCompleteHandler(evt);
        };

        voiceRecordButton.onmouseup = () => {
            obj.speechToText.stop();
            obj.input.value = obj.finalTranscript;
            obj.isRecordVoiceActive = false;
        };

        voiceRecordButton.onmousedown = () => {
            obj.speechToText.start();
            voiceRecordButton.style.backgroundColor = '#FF471A';
            obj.isRecordVoiceActive = true;
        };

        obj.chataBarContainer = chataBarContainer;
        obj.input = chataInput;
        obj.voiceRecordButton = voiceRecordButton;
        obj.autoCompleteList = autoCompleteList;
        obj.input.onkeyup = obj.autoCompleteHandler;
        obj.input.onkeypress = obj.onEnterHandler;
        obj.input.onkeydown = (evt) => {
            if (evt.keyCode == 38) {
                if (obj.lastQuery !== '') {
                    obj.input.value = obj.lastQuery;
                }
            }
        };

        obj.drawerBody.appendChild(chataBarContainer);
    };

    obj.toggleNotificationOption = () => {
        var opts = obj.drawerContent.querySelectorAll('.autoql-vanilla-notification-option');
        var display = 'none';

        if (obj.options.enableNotificationsTab) {
            display = 'block';
        }

        for (var i = 0; i < opts.length; i++) {
            opts[i].style.display = display;
        }
    };

    obj.speechToTextEvent = () => {
        if (obj.speechToText) {
            obj.speechToText.onresult = (e) => {
                for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
                    let transcript = e.results[i][0].transcript;
                    if (e.results[i].isFinal) {
                        obj.finalTranscript += transcript;
                    }
                }
                if (obj.finalTranscript !== '') {
                    obj.input.value = obj.finalTranscript;
                    obj.speechToText.stop();
                    ChataUtils.autocomplete(obj.input.value, obj.autoCompleteList, 'suggestion', obj.options);
                }
                obj.finalTranscript = '';
            };
        }
    };

    obj.checkMaxMessages = function () {
        if (obj.options.maxMessages > 2) {
            var messages = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');

            if (messages.length > obj.options.maxMessages) {
                messages[0].parentNode.removeChild(messages[0]);
            }
        }
    };

    obj.getActionOption = (svg, text, onClick, params) => {
        return ChataUtils.getActionOption(svg, text, onClick, params);
    };

    obj.getPopover = () => {
        return ChataUtils.getPopover();
    };

    obj.getMoreOptionsMenu = (options, idRequest, type) => {
        var bubble = obj.drawerContent.querySelector(`[data-bubble-id="${idRequest}"]`);
        return ChataUtils.getMoreOptionsMenu(options, idRequest, type, {
            caller: this,
            query: bubble.relatedQuery,
        });
    };

    obj.getReportProblemMenu = (toolbar, idRequest, type) => {
        return ChataUtils.getReportProblemMenu(toolbar, idRequest, type, obj.options);
    };

    obj.getActionButton = (svg, tooltip, idRequest, onClick, evtParams) => {
        return ChataUtils.getActionButton(svg, tooltip, idRequest, onClick, evtParams);
    };

    obj.reportProblemHandler = (evt, idRequest, reportProblem, toolbar) => {
        closeAllToolbars();
        reportProblem.classList.toggle('show');
        toolbar.classList.toggle('show');
        var bubble = document.querySelector(`[data-bubble-id='${idRequest}']`);
        if (bubble === obj.getLastMessageBubble()) {
            if (!bubble.classList.contains('autoql-vanilla-chat-message-response')) {
                bubble.scrollIntoView();
            }
        }
    };

    obj.moreOptionsHandler = (evt, idRequest, moreOptions, toolbar) => {
        closeAllToolbars();
        moreOptions.classList.toggle('show');
        toolbar.classList.toggle('show');
        var bubble = document.querySelector(`[data-bubble-id='${idRequest}']`);
        if (bubble === obj.getLastMessageBubble()) {
            if (!bubble.classList.contains('autoql-vanilla-chat-message-response')) {
                bubble.scrollIntoView();
            }
        }
    };

    obj.filterTableHandler = (evt, idRequest) => {
        var table = document.querySelector(`[data-componentid="${idRequest}"]`);
        var bubble = document.querySelector(`[data-bubble-id='${idRequest}']`);
        var tabulator = table.tabulator;
        tabulator.toggleFilters();
        setTimeout(() => {
            bubble.scrollIntoView();
        }, 50);
    };

    obj.openColumnEditorHandler = (evt, idRequest, badge) => {
        obj.showColumnEditor(idRequest, badge);
    };

    obj.getLastMessageBubble = () => {
        var bubbles = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');

        return bubbles[bubbles.length - 1];
    };

    obj.deleteMessageHandler = (evt, idRequest) => {
        hideAll({ duration: 0 });
        var bubble = obj.drawerContent.querySelector(`[data-bubble-id="${idRequest}"]`);

        setTimeout(() => {
            obj.drawerContent.removeChild(bubble);
        }, 10);
        if (bubble.relatedMessage) {
            obj.drawerContent.removeChild(bubble.relatedMessage);
        }
    };

    obj.getBadge = () => {
        return htmlToElement(`<div class="autoql-vanilla-badge"></div>`);
    };

    obj.getActionToolbar = (idRequest, type, displayType) => {
        var request = ChataUtils.responses[idRequest];
        let moreOptionsArray = [];
        var toolbar = htmlToElement(`
            <div class="autoql-vanilla-chat-message-toolbar right">
            </div>
        `);

        var reportProblem = obj.getReportProblemMenu(toolbar, idRequest, type);
        reportProblem.classList.add('report-problem');

        var reportProblemButton = obj.getActionButton(
            REPORT_PROBLEM,
            strings.reportProblemTitle,
            idRequest,
            obj.reportProblemHandler,
            [reportProblem, toolbar],
        );

        switch (type) {
            case 'simple':
                if (request['reference_id'] !== '1.9.502') {
                    toolbar.appendChild(reportProblemButton);
                    moreOptionsArray.push('copy_sql');
                    moreOptionsArray.push('notification');
                }
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        strings.deleteDataResponse,
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar],
                    ),
                );
                break;
            case 'csvCopy':
                var filterBtn = obj.getActionButton(
                    FILTER_TABLE,
                    strings.filterTable,
                    idRequest,
                    obj.filterTableHandler,
                    [],
                );
                toolbar.appendChild(filterBtn);
                filterBtn.setAttribute('data-name-option', 'filter-action');
                var columnVisibility = obj.options.autoQLConfig.enableColumnVisibilityManager;
                if (columnVisibility && displayType !== 'pivot_table') {
                    let badge = obj.getBadge();
                    let editorBtn = obj.getActionButton(
                        COLUMN_EDITOR,
                        strings.showHideCols,
                        idRequest,
                        obj.openColumnEditorHandler,
                        [badge],
                    );
                    editorBtn.setAttribute('data-name-option', 'column-editor');
                    toolbar.appendChild(editorBtn);

                    editorBtn.appendChild(badge);
                    editorBtn.badge = badge;
                    if (showBadge(request)) {
                        badge.style.visibility = 'visible';
                    } else {
                        badge.style.visibility = 'hidden';
                    }
                }
                if (request['reference_id'] !== '1.1.420') {
                    toolbar.appendChild(reportProblemButton);
                }
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        strings.deleteDataResponse,
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar],
                    ),
                );
                moreOptionsArray.push('csv');
                moreOptionsArray.push('copy');
                moreOptionsArray.push('copy_sql');
                moreOptionsArray.push('notification');
                break;
            case 'chart-view':
                if (request['reference_id'] !== '1.1.420') {
                    toolbar.appendChild(reportProblemButton);
                }
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        strings.deleteDataResponse,
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar],
                    ),
                );
                moreOptionsArray.push('png');
                moreOptionsArray.push('copy_sql');
                moreOptionsArray.push('notification');
                break;
            case 'safety-net':
                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        strings.deleteDataResponse,
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar],
                    ),
                );
                break;
            case 'suggestions':
                toolbar.appendChild(reportProblemButton);

                toolbar.appendChild(
                    obj.getActionButton(
                        DELETE_MESSAGE,
                        strings.deleteDataResponse,
                        idRequest,
                        obj.deleteMessageHandler,
                        [reportProblem, toolbar],
                    ),
                );
                break;
            default:
        }

        var moreOptions = obj.getMoreOptionsMenu(moreOptionsArray, idRequest, type);

        if (type === 'chart-view') {
            moreOptions.classList.add('chart');
        }

        var moreOptionsBtn = obj.getActionButton(
            VERTICAL_DOTS,
            strings.moreOptions,
            idRequest,
            obj.moreOptionsHandler,
            [moreOptions, toolbar],
        );
        moreOptionsBtn.classList.add('autoql-vanilla-more-options');
        if (request) {
            if (
                request['reference_id'] !== '1.1.420' &&
                type !== 'safety-net' &&
                type !== 'suggestions' &&
                request['reference_id'] !== '1.9.502' &&
                request['reference_id'] !== '1.1.550' &&
                request['reference_id'] !== '1.1.432'
            ) {
                toolbar.appendChild(moreOptionsBtn);
                toolbar.appendChild(moreOptions);
                toolbar.appendChild(reportProblem);
            }

            if (type === 'suggestions') {
                toolbar.appendChild(reportProblem);
            }

            if (
                request['reference_id'] === '1.1.550' ||
                request['reference_id'] === '1.1.420' ||
                request['reference_id'] === '1.1.432'
            ) {
                toolbar.appendChild(reportProblem);
                reportProblem.classList.remove('chata-popover-single-message');
            }
        }

        return toolbar;
    };

    obj.getParentFromComponent = (component) => {
        var messageBubble = component.parentElement.parentElement.parentElement;
        if (messageBubble.classList.contains('autoql-vanilla-chata-response-content-container')) {
            messageBubble = messageBubble.parentElement;
        }

        return messageBubble;
    };

    obj.hideBubbles = () => {
        var nodes = obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = 'none';
        }
    };

    obj.copyFilterMetadata = (component) => {
        component.filterMetadata = component.internalTable.getHeaderFilters();
    };

    obj.copyPivotFilterMetadata = (component) => {
        component.pivotFilterMetadata = component.pivotTabulator.getHeaderFilters();
    };

    obj.refreshToolbarButtons = (oldComponent, ignore) => {
        closeAllChartPopovers();
        if (oldComponent.internalTable) {
            obj.copyFilterMetadata(oldComponent);
        }
        if (oldComponent.pivotTabulator) {
            obj.copyPivotFilterMetadata(oldComponent);
        }
        var messageBubble = obj.getParentFromComponent(oldComponent);
        if (['table', 'pivot_table'].includes(ignore)) {
            var uuid = messageBubble.parentNode.dataset.bubbleId;
            var json = ChataUtils.responses[uuid];
            var displayTypes = getSupportedDisplayTypes(json);
            if (displayTypes.length <= 5) {
                messageBubble.classList.remove('full-width');
            } else {
                messageBubble.classList.add('full-width');
            }
        } else {
            messageBubble.classList.add('full-width');
        }

        var scrollBox = messageBubble.querySelector('.autoql-vanilla-chata-table-scrollbox');
        var toolbarLeft = messageBubble.getElementsByClassName('left')[0];
        var toolbarRight = messageBubble.getElementsByClassName('right')[0];

        if (oldComponent.noColumnsElement) {
            oldComponent.parentElement.removeChild(oldComponent.noColumnsElement);
            oldComponent.noColumnsElement = null;
            oldComponent.style.display = 'block';
        }

        scrollBox.scrollLeft = 0;

        var actionType = ['table', 'pivot_table', 'date_pivot'].includes(ignore) ? 'csvCopy' : 'chart-view';

        if (toolbarLeft) {
            toolbarLeft.innerHTML = '';
            let displayTypes = obj.getDisplayTypesButtons(oldComponent.dataset.componentid, ignore);

            for (var i = 0; i < displayTypes.length; i++) {
                toolbarLeft.appendChild(displayTypes[i]);
            }
        }

        var newToolbarRight = obj.getActionToolbar(oldComponent.dataset.componentid, actionType, ignore);
        messageBubble.replaceChild(newToolbarRight, toolbarRight);
        obj.setScrollBubble(messageBubble);
        refreshTooltips();
    };

    obj.setScrollBubble = (messageBubble) => {
        setTimeout(() => {
            messageBubble.parentElement.scrollIntoView();
        }, 200);
    };

    obj.sendDrilldownMessage = async (json, indexData, options) => {
        if (!options.autoQLConfig.enableDrilldowns) return;
        var queryId = json['data']['query_id'];
        var params = {};
        var groupables = getGroupableFields(json);
        if (indexData != -1) {
            for (var i = 0; i < groupables.length; i++) {
                var index = groupables[i].indexCol;
                var value = json['data']['rows'][parseInt(indexData)][index];
                var colData = json['data']['columns'][index]['name'];
                if (!value) value = '';
                params[colData] = value.toString() || '';
            }
        }

        const URL = options.authentication.demo
            ? `https://backend-staging.chata.ai/api/v1/chata/query/drilldown`
            : `${options.authentication.domain}/autoql/api/v1/query/${queryId}/drilldown?key=${options.authentication.apiKey}`;
        let data;

        if (options.authentication.demo) {
            data = {
                query_id: queryId,
                group_bys: params,
                username: 'demo',
                debug: options.autoQLConfig.debug,
            };
        } else {
            var cols = [];
            for (let [key, value] of Object.entries(params)) {
                cols.push({
                    name: key,
                    value: value,
                });
            }
            data = {
                debug: options.autoQLConfig.debug,
                columns: cols,
            };
        }

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (let i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.drawerContent.appendChild(responseLoadingContainer);
        var response = await apiCallPost(URL, data, options);
        var responseJson = response.data;
        var status = response.status;
        obj.drawerContent.removeChild(responseLoadingContainer);
        if (!responseJson['data']['rows']) {
            obj.putClientResponse(strings.errorMessage);
        } else if (responseJson['data']['rows'].length > 0) {
            obj.putTableResponse(responseJson, true);
        } else {
            obj.putSimpleResponse(responseJson, '', status, true);
        }
        refreshTooltips();
    };

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
    };

    obj.sendDrilldownClientSide = (json, indexValue, filterBy, options) => {
        if (!options.autoQLConfig.enableDrilldowns) return;
        var newJson = cloneObject(json);
        var newData = [];
        var oldData = newJson['data']['rows'];
        var col = newJson['data']['columns'][indexValue];

        for (var i = 0; i < oldData.length; i++) {
            var compareValue = oldData[i][indexValue];
            if (!compareValue) compareValue = 'null';
            compareValue = formatData(compareValue, col, options);
            if (compareValue === 'Invalid date' && filterBy == 'undefined') {
                newData.push(oldData[i]);
            }

            if (compareValue === filterBy) newData.push(oldData[i]);
        }
        var loading = obj.createLoadingDots();
        obj.drawerContent.appendChild(loading);
        if (newData.length > 0) {
            newJson.data.rows = newData;

            setTimeout(() => {
                obj.putTableResponse(newJson, true);
                obj.drawerContent.removeChild(loading);
                refreshTooltips();
            }, 400);
        } else {
            setTimeout(() => {
                obj.putClientResponse(strings.noDataFound, json, true);
                obj.drawerContent.removeChild(loading);
                refreshTooltips();
            }, 400);
        }
    };

    obj.chartElementClick = (evt, idRequest) => {
        var json = cloneObject(ChataUtils.responses[idRequest]);
        var target = evt.target;
        var indexData = target.dataset.chartindex;
        var colValue = target.dataset.colvalue1;
        var indexValue = target.dataset.filterindex;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if (groupableCount == 1 || groupableCount == 2) {
            if (!target.dataset.isStackedDrill) {
                obj.sendDrilldownMessage(json, indexData, obj.options);
            } else {
                let newJson = cloneObject(ChataUtils.responses[idRequest]);
                newJson['data']['rows'][0][0] = evt.target.dataset.unformatvalue1;
                newJson['data']['rows'][0][1] = evt.target.dataset.unformatvalue2;
                newJson['data']['rows'][0][2] = evt.target.dataset.unformatvalue3;
                obj.sendDrilldownMessage(newJson, 0, obj.options);
            }
        } else {
            obj.sendDrilldownClientSide(json, indexValue, colValue, obj.options);
        }
    };

    obj.stackedChartElementClick = (evt, idRequest) => {
        var json = cloneObject(ChataUtils.responses[idRequest]);
        json['data']['rows'][0][0] = evt.target.dataset.unformatvalue1;
        json['data']['rows'][0][1] = evt.target.dataset.unformatvalue2;
        json['data']['rows'][0][2] = evt.target.dataset.unformatvalue3;
        obj.sendDrilldownMessage(json, 0, obj.options);
    };

    obj.updateSelectedBar = (evt, component) => {
        var oldSelect = component.querySelector('.active');
        if (oldSelect) oldSelect.classList.remove('active');
        if (evt.target.tagName !== 'TD') evt.target.classList.add('active');
    };

    obj.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, component.dataset.componentid]);
                obj.updateSelectedBar(evt, component);
            };
        }
    };

    obj.registerDrilldownChartEvent = (component) => {
        obj.componentClickHandler(obj.chartElementClick, component, '[data-chartindex]');
    };

    obj.registerDrilldownStackedChartEvent = (component) => {
        obj.componentClickHandler(obj.stackedChartElementClick, component, '[data-stackedchartindex]');
    };

    obj.getComponent = (request) => {
        return obj.drawerContent.querySelector(`[data-componentid='${request}']`);
    };

    obj.getRequest = (id) => {
        return ChataUtils.responses[id];
    };

    obj.setDefaultFilters = (component, table, type) => {
        var filters = [];
        if (type === 'table') filters = component.filterMetadata;
        else if (type === 'pivot') filters = component.pivotFilterMetadata;

        if (!filters) return;

        table.toggleFilters();
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            table.setHeaderFilterValue(filter.field, filter.value);
        }
        table.toggleFilters();
    };

    obj.displayTableHandler = (evt, idRequest) => {
        var component = obj.getComponent(idRequest);
        var parentContainer = obj.getParentFromComponent(component);
        obj.refreshToolbarButtons(component, 'table');
        var table = new ChataTable(idRequest, obj.options, obj.onRowClick, () => {
            parentContainer.parentElement.scrollIntoView();
        });
        component.internalTable = table;
        component.tabulator = table;
        obj.setDefaultFilters(component, table, 'table');
        table.parentContainer = parentContainer;
        allColHiddenMessage(component);
        select(window).on('chata-resize.' + idRequest, null);
    }
    obj.displayColumChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'column');
        createColumnChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        Chart(obj.options, {
            width: 500,
            height: 400,
            displayType: 'column_chart',
            json,
            component,
        })
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayBarChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bar');
        createBarChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayPieChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pie');
        createPieChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayLineChartHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'line');
        createLineChart(
            component, json, obj.options, obj.registerDrilldownChartEvent
        );
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayPivotTableHandler = (evt, idRequest) => {
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pivot_table');
        var table = new ChataPivotTable(
            idRequest, obj.options, obj.onCellClick
        );
        obj.setDefaultFilters(component, table, 'pivot')
        select(window).on('chata-resize.'+idRequest, null);
        component.tabulator = table
        component.pivotTabulator = table
    }

    obj.displayHeatmapHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'heatmap');
        createHeatmap(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayBubbleCharthandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'bubble');
        createBubbleChart(component, json, obj.options);
        obj.registerDrilldownChartEvent(component);
    };

    obj.displayStackedColumnHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_column');
        createStackedColumnChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
        );
        obj.registerDrilldownStackedChartEvent(component);
    };

    obj.displayStackedBarHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_bar');
        createStackedBarChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
        );
        obj.registerDrilldownStackedChartEvent(component);
    };

    obj.displayAreaHandler = (evt, idRequest) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'stacked_line');
        createAreaChart(
            component, cloneObject(json), obj.options,
            obj.registerDrilldownStackedChartEvent
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
        };

        return button;
    };

    obj.getDisplayTypesButtons = (idRequest, active) => {
        var json = ChataUtils.responses[idRequest];
        var buttons = [];
        var displayTypes = getSupportedDisplayTypes(json);

        for (var i = 0; i < displayTypes.length; i++) {
            let button;
            //if(displayTypes[i] == ignore)continue;
            if(displayTypes[i] == 'table'){
                button = obj.getDisplayTypeButton(
                    idRequest, TABLE_ICON, strings.table, obj.displayTableHandler
                )
            }
            if (displayTypes[i] == 'column') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    COLUMN_CHART_ICON,
                    strings.columnChart,
                    obj.displayColumChartHandler,
                );
            }
            if (displayTypes[i] == 'bar') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    BAR_CHART_ICON,
                    strings.barChart,
                    obj.displayBarChartHandler,
                );
            }
            if (displayTypes[i] == 'pie') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    PIE_CHART_ICON,
                    strings.pieChart,
                    obj.displayPieChartHandler,
                );
            }
            if (displayTypes[i] == 'line') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    LINE_CHART_ICON,
                    strings.lineChart,
                    obj.displayLineChartHandler,
                );
            }
            if (displayTypes[i] == 'pivot_table') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    PIVOT_ICON,
                    strings.pivotTable,
                    obj.displayPivotTableHandler,
                );
            }
            if (displayTypes[i] == 'heatmap') {
                button = obj.getDisplayTypeButton(idRequest, HEATMAP_ICON, strings.heatmap, obj.displayHeatmapHandler);
            }
            if (displayTypes[i] == 'bubble') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    BUBBLE_CHART_ICON,
                    strings.bubbleChart,
                    obj.displayBubbleCharthandler,
                );
            }
            if (displayTypes[i] == 'stacked_column') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    STACKED_COLUMN_CHART_ICON,
                    strings.stackedColumn,
                    obj.displayStackedColumnHandler,
                );
            }
            if (displayTypes[i] == 'stacked_bar') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    STACKED_BAR_CHART_ICON,
                    strings.stackedBar,
                    obj.displayStackedBarHandler,
                );
            }

            if (displayTypes[i] == 'stacked_line') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    STACKED_AREA_CHART_ICON,
                    strings.stackedLine,
                    obj.displayAreaHandler,
                );
            }

            if(displayTypes[i] == active){
                button.classList.add('autoql-vanilla-viz-toolbar-btn-active')
            }
            buttons.push(button);
        }

        return buttons;
    };

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

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.classList.add('request');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('single');
        messageBubble.classList.add('text');
        messageBubble.textContent = value;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        obj.checkMaxMessages();
        if (obj.options.landingPage !== 'data-messenger') {
            obj.hideBubbles();
            return null;
        }
        obj.drawerContent.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    };

    obj.onRowClick = (e, row, json) => {
        var index = 0;
        var groupableCount = getNumberOfGroupables(json['data']['columns']);
        if (groupableCount > 0) {
            for (var entries of Object.entries(row._row.data)) {
                json['data']['rows'][0][index++] = entries[1];
            }
            obj.sendDrilldownMessage(json, 0, obj.options);
        }
    };

    obj.onCellClick = (e, cell, json) => {
        const selectedColumn = cell._cell.column;
        const row = cell._cell.row;
        if (selectedColumn.definition.index != 0) {
            var entries = Object.entries(row.data);
            if (row.data.Month) {
                json['data']['rows'][0][0] = selectedColumn.definition.field;
                json['data']['rows'][0][1] = row.data.Month;
            } else {
                json['data']['rows'][0][0] = entries[0][1];
                json['data']['rows'][0][1] = selectedColumn.definition.field;
                json['data']['rows'][0][2] = cell.getValue();
            }
            obj.sendDrilldownMessage(json, 0, obj.options);
        }
    };

    obj.putTableResponse = (jsonResponse, isDrilldown = false) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var scrollbox = document.createElement('div');
        var tableWrapper = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        var idRequest = uuidv4();
        var { interpretation } = jsonResponse.data;

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');

        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.style.maxHeight = '85%';

        containerMessage.setAttribute('data-bubble-id', idRequest);
        if (!isDrilldown) {
            containerMessage.relatedMessage = lastBubble;
        }

        containerMessage.classList.add('response');
        containerMessage.classList.add('autoql-vanilla-chat-message-response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        containerMessage.relatedQuery = obj.lastQuery;

        ChataUtils.responses[idRequest] = jsonResponse;
        var supportedDisplayTypes = obj.getDisplayTypesButtons(idRequest, 'table');

        var toolbar = undefined;
        if (supportedDisplayTypes.length > 0) {
            toolbar = htmlToElement(`
                <div class="autoql-vanilla-chat-message-toolbar left">
                </div>
            `);
            for (var i = 0; i < supportedDisplayTypes.length; i++) {
                toolbar.appendChild(supportedDisplayTypes[i]);
            }
        }

        if (toolbar) {
            messageBubble.appendChild(toolbar);
        }

        tableContainer.classList.add('autoql-vanilla-chata-table-container');
        scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        responseContentContainer.classList.add('autoql-vanilla-chata-response-content-container');

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
        var table = new ChataTable(idRequest, obj.options, obj.onRowClick, () => {
            setTimeout(function () {
                parentContainer.parentElement.scrollIntoView();
            }, 350);
        });

        tableWrapper.internalTable = table;
        tableWrapper.tabulator = table;
        table.parentContainer = parentContainer;
        // TODO: next deploy
        // if(interpretation && !isDrilldown){
        //     var interpretationView = new ReverseTranslation(interpretation)
        //     messageBubble.appendChild(interpretationView)
        // }
        setTimeout(function () {
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        }, 350);
        allColHiddenMessage(tableWrapper);
        obj.showWarningIcon(messageBubble, jsonResponse);
        return idRequest;
    };

    obj.sendReport = function (idRequest, options, menu, toolbar) {
        return ChataUtils.sendReport(idRequest, options, menu, toolbar);
    };

    obj.openModalReport = function (idRequest, options, menu, toolbar) {
        ChataUtils.openModalReport(idRequest, options, menu, toolbar);
    };

    obj.showColumnEditor = function (id, badge) {
        ChataUtils.showColumnEditor(id, obj.options, () => {
            var json = ChataUtils.responses[id];
            var component = obj.rootElem.querySelector(`[data-componentid='${id}']`);
            obj.setScrollBubble(obj.getParentFromComponent(component));
            component.tabulator.redraw(true);
            if (showBadge(json)) {
                badge.style.visibility = 'visible';
            } else {
                badge.style.visibility = 'hidden';
            }
        });
    };

    obj.sendResponse = (text, withDeleteBtn = false) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        var uuid = uuidv4();
        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.classList.add('text');
        containerMessage.setAttribute('data-bubble-id', uuid);
        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.relatedQuery = obj.lastQuery;
        containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.innerHTML = text;
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        if (withDeleteBtn) {
            let toolbarButtons = obj.getActionToolbar(uuid, 'safety-net', '');
            messageBubble.appendChild(toolbarButtons);
        }
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    };

    obj.inputAnimation = (text) => {
        var input = obj.input;
        var selectedQuery = text;
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += selectedQuery[index];
            if (index >= selectedQuery.length) {
                clearInterval(int);
                var evt = new KeyboardEvent('keypress', {
                    keyCode: 13,
                    type: 'keypress',
                    which: 13,
                });
                input.dispatchEvent(evt);
            } else {
                input.value = subQuery;
            }
            index++;
        }, 45);
    };

    obj.createSuggestions = async function (responseContentContainer, relatedJson, json) {
        var data = json['data']['items'];
        var { domain, apiKey } = obj.options.authentication;
        var queryId = relatedJson['data']['query_id'];
        const url = `${domain}/autoql/api/v1/query/${queryId}/suggestions?key=${apiKey}`;

        for (var i = 0; i < data.length; i++) {
            var div = document.createElement('div');
            var button = document.createElement('button');
            button.classList.add('autoql-vanilla-chata-suggestion-btn');
            button.textContent = data[i];
            div.appendChild(button);
            responseContentContainer.appendChild(div);
            button.onclick = async (evt) => {
                var body = {
                    suggestion: evt.target.textContent,
                };
                let loading = null;
                if (evt.target.textContent === strings.noneOfThese) {
                    loading = obj.showLoading();
                } else {
                    obj.inputAnimation(evt.target.textContent);
                }

                await apiCallPut(url, body, obj.options);

                if (loading) {
                    setTimeout(() => {
                        obj.drawerContent.removeChild(loading);
                        obj.putClientResponse(strings.feedback, {}, true);
                    }, 500);
                }
            };
        }
    };

    obj.putSuggestionResponse = (relatedJson, jsonResponse) => {
        var uuid = uuidv4();
        ChataUtils.responses[uuid] = jsonResponse;
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');

        containerMessage.classList.add('autoql-vanilla-suggestions-container');
        containerMessage.classList.add('text');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.setAttribute('data-bubble-id', uuid);
        // containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('suggestions')
        responseContentContainer.classList.add(
            'autoql-vanilla-chata-response-content-container'
        );

        responseContentContainer.classList.add('suggestions')

        obj.createSuggestions(responseContentContainer, relatedJson, jsonResponse);
        messageBubble.appendChild(responseContentContainer);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        messageBubble.appendChild(obj.getActionToolbar(uuid, 'suggestions', ''));
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        3;
        refreshTooltips();
        obj.checkMaxMessages();
    };

    obj.putClientResponse = (msg, json = {}, withDeleteBtn = false) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var uuid = uuidv4();
        ChataUtils.responses[uuid] = json;
        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        containerMessage.setAttribute('data-bubble-id', uuid);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('simple-response');
        messageBubble.classList.add('no-hover-response');

        var div = document.createElement('div');
        div.classList.add('autoql-vanilla-chata-single-response');
        div.appendChild(document.createTextNode(msg.toString()));
        messageBubble.appendChild(div);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        if (withDeleteBtn) {
            var toolbarButtons = obj.getActionToolbar(uuid, 'safety-net', '');
            messageBubble.appendChild(toolbarButtons);
        }
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        refreshTooltips();
    };

    obj.showLoading = () => {
        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('response-loading-container');
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.drawerContent.appendChild(responseLoadingContainer);

        return responseLoadingContainer;
    };

    obj.putSimpleResponse = async (jsonResponse, text, statusCode, isDrilldown = false) => {
        var { interpretation } = jsonResponse.data;
        var ref = jsonResponse['reference_id'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.classList.add('text');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        if (!isDrilldown) containerMessage.relatedMessage = lastBubble;

        var idRequest = uuidv4();
        ChataUtils.responses[idRequest] = jsonResponse;
        containerMessage.setAttribute('data-bubble-id', idRequest);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('simple-response');
        containerMessage.relatedQuery = obj.lastQuery;

        if (
            jsonResponse['reference_id'] === '1.1.211' ||
            jsonResponse['reference_id'] === '1.1.430' ||
            jsonResponse['reference_id'] === '1.9.502'
        ) {
            messageBubble.classList.add('no-hover-response');
        }

        var value = '';
        var hasDrilldown = false;
        if (jsonResponse['data'].rows && jsonResponse['data'].rows.length > 0) {
            value = formatData(jsonResponse['data']['rows'][0][0], jsonResponse['data']['columns'][0], obj.options);
            hasDrilldown = true;
        } else {
            var error = new ErrorMessage(jsonResponse['message'], () => {
                ChataUtils.openModalReport(idRequest, obj.options, null, null);
            });
            messageBubble.appendChild(error);
            messageBubble.classList.add('no-hover-response');
        }
        var div = document.createElement('div');
        if (hasDrilldown) {
            div.onclick = () => {
                obj.sendDrilldownMessage(jsonResponse, 0, obj.options);
            };
        }
        div.classList.add('autoql-vanilla-chata-single-response');
        var content = htmlToElement(`<div>${value.toString()}</div>`);
        div.appendChild(content);
        if (statusCode != 200 && jsonResponse['reference_id'] !== '1.1.430') {
            div.appendChild(document.createElement('br'));
            var errorId = htmlToElement(`<div>${strings.errorID}: ${jsonResponse.reference_id}</div>`);
            div.appendChild(errorId);
        }
        messageBubble.appendChild(div);
        obj.drawerContent.appendChild(containerMessage);
        var toolbarButtons = obj.getActionToolbar(idRequest, 'simple', 'table');

        if (ref !== '1.1.430') {
            messageBubble.appendChild(toolbarButtons);
        }

        if (ref === '1.1.430') {
            toolbarButtons = obj.getActionToolbar(idRequest, 'safety-net', '');
            messageBubble.appendChild(toolbarButtons);
        }
        if (ref != '1.1.430') {
            containerMessage.appendChild(messageBubble);
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        }
        if (ref === '1.1.430') {
            let loading = null;
            if (obj.options.landingPage === 'data-messenger') {
                loading = obj.showLoading();
                obj.drawerContent.appendChild(loading);
            }
            const path =
                getRecommendationPath(obj.options, encodeURIComponent(text)) +
                '&query_id=' +
                jsonResponse['data']['query_id'];
            var response = await apiCallGet(path, obj.options);
            var { status } = response;
            if (status == 200) {
                containerMessage.appendChild(messageBubble);
                obj.putSuggestionResponse(jsonResponse, response.data);
            } else {
                obj.putSimpleResponse(response.data, '', status);
            }
            if (loading) obj.drawerContent.removeChild(loading);
            if (obj.options.landingPage !== 'data-messenger') {
                obj.hideBubbles();
            }
        }
        // TODO: Next deploy
        // if(interpretation){
        //     var interpretationView = new ReverseTranslation(interpretation)
        //     messageBubble.appendChild(interpretationView)
        // }
        refreshTooltips();
    };

    obj.putSafetynetMessage = function (jsonResponse) {
        var suggestionArray = createSuggestionArray(jsonResponse);
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var uuid = uuidv4();
        var lastBubble = obj.getLastMessageBubble();
        ChataUtils.responses[uuid] = jsonResponse;
        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.setAttribute('data-bubble-id', uuid);
        containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');
        messageBubble.append(
            createSafetynetContent(suggestionArray, () => {
                var words = getSafetynetValues(messageBubble);
                var selections = getSafetynetUserSelection(messageBubble);
                var query = words.join(' ');
                if (query !== '') {
                    obj.safetynetAnimation(query, selections);
                }
            }),
        );

        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        var toolbar = obj.getActionToolbar(uuid, 'safety-net', '');
        messageBubble.appendChild(toolbar);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        refreshTooltips();
    };

    obj.createHelpContent = function (link) {
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
    };

    obj.putHelpMessage = function (jsonResponse) {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('full-width');

        messageBubble.innerHTML = obj.createHelpContent(jsonResponse['data']['rows'][0]);
        containerMessage.appendChild(messageBubble);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    };

    obj.sendMessage = async (textValue, source, selections = undefined) => {
        obj.input.disabled = true;
        obj.input.value = '';
        const { domain, apiKey, token } = obj.options.authentication;
        var responseLoadingContainer = obj.putMessage(textValue);

        if (!token) {
            if (responseLoadingContainer) {
                obj.drawerContent.removeChild(responseLoadingContainer);
            }
            obj.sendResponse(strings.accessDenied, true);
            obj.input.removeAttribute('disabled');
            refreshTooltips();
            return;
        }

        const URL_SAFETYNET = `${domain}/autoql/api/v1/query/validate?text=${encodeURIComponent(
            textValue,
        )}&key=${apiKey}`;

        if (obj.options.autoQLConfig.enableQueryValidation) {
            let response = await apiCallGet(URL_SAFETYNET, obj.options);
            if (!response) {
                obj.input.removeAttribute('disabled');
                if (responseLoadingContainer) {
                    obj.drawerContent.removeChild(responseLoadingContainer);
                }
                obj.sendResponse(strings.accessDenied);
                return;
            }

            obj.input.removeAttribute('disabled');
            if (response.status != 200) {
                let msg = response.data.message;
                let ref = response.data['reference_id'];
                if (ref === '1.1.482') {
                    obj.putSimpleResponse(response.data, textValue, response.status);
                } else {
                    obj.sendResponse(
                        `
                        <div>${msg}</div>
                        <br/>
                        <div>${strings.errorID}: ${ref}</div>
                        `,
                        true,
                    );
                }
                if (responseLoadingContainer) {
                    obj.drawerContent.removeChild(responseLoadingContainer);
                }
                refreshTooltips();
                return;
            } else {
                let suggestions = {};
                if (response.data != undefined) {
                    suggestions = response.data['full_suggestion'] || response.data['data']['replacements'];
                }

                if (textValue != 'None Of these' && suggestions.length > 0 && typeof selections === 'undefined') {
                    obj.input.removeAttribute('disabled');
                    if (responseLoadingContainer) {
                        obj.drawerContent.removeChild(responseLoadingContainer);
                    }
                    obj.putSafetynetMessage(response.data);
                    return;
                }
            }
        }

        let response = await apiCallV2(
            obj.options,
            {
                "date_format": TIMESTAMP_FORMATS.iso8601,
                "page_size": 500,
                "scope": "data_messenger",
                "session_filter_locks": [],
                "source": "data_messenger.user",
                "test":  obj.options.autoQLConfig.test,
                "text": textValue,
                "translation": "include"
            }
        )
        if(!response){
            obj.input.removeAttribute("disabled")
            if(responseLoadingContainer){
                obj.drawerContent.removeChild(responseLoadingContainer)
            }
            obj.sendResponse(strings.accessDenied);
            return;
        }
        var status = response.status;
        var jsonResponse = response.data;
        var groupables = [];
        if (jsonResponse.data.columns) {
            groupables = getGroupables(jsonResponse);
        }
        var displayType = jsonResponse['data']['display_type'];
        if (groupables.length === 1 && obj.options.autoChartAggregations && jsonResponse.data.rows.length > 1) {
            displayType = 'column';
        }

        if (groupables.length === 2 && obj.options.autoChartAggregations && jsonResponse.data.rows.length > 1) {
            displayType = 'stacked_column';
        }

        obj.input.removeAttribute('disabled');
        if (responseLoadingContainer) {
            obj.drawerContent.removeChild(responseLoadingContainer);
        }
        if (jsonResponse.data.rows && jsonResponse.data.rows.length === 0) {
            obj.putSimpleResponse(jsonResponse, textValue, status);
            return;
        }

        switch (displayType) {
            case 'table':
                if (jsonResponse['data']['columns'].length == 1) {
                    obj.putSimpleResponse(jsonResponse, textValue, status);
                } else {
                    obj.putTableResponse(jsonResponse);
                }
                break;
            case 'data':
                var cols = jsonResponse['data']['columns'];
                var rows = jsonResponse['data']['rows'];
                if (cols.length == 1 && rows.length == 1) {
                    if (cols[0]['name'] == 'query_suggestion') {
                        obj.putSuggestionResponse(jsonResponse);
                    } else if (cols[0]['name'] == 'Help Link') {
                        obj.putHelpMessage(jsonResponse);
                    } else {
                        obj.putSimpleResponse(jsonResponse, textValue, status);
                    }
                } else {
                    if (rows.length > 0) {
                        obj.putTableResponse(jsonResponse);
                    } else {
                        obj.putSimpleResponse(jsonResponse, textValue, status);
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
                var lineContainer = obj.putTableResponse(jsonResponse);
                createLineChart(lineContainer, jsonResponse, obj.options);
                obj.refreshToolbarButtons(lineContainer, 'line');
                break;
            case 'bar':
                var barContainer = obj.putTableResponse(jsonResponse);
                createBarChart(barContainer, jsonResponse, obj.options);
                obj.refreshToolbarButtons(barContainer, 'bar');
                break;
            case 'word_cloud':
                obj.putTableResponse(jsonResponse);
                break;
            case 'stacked_column':
                var idRequest = obj.putTableResponse(jsonResponse);
                obj.displayStackedColumnHandler(null, idRequest);
                break;
            case 'stacked_bar':
                var component = obj.putTableResponse(jsonResponse);
                obj.refreshToolbarButtons(component, 'stacked_bar');
                createStackedBarChart(component, cloneObject(jsonResponse), obj.options);
                break;
            case 'bubble':
                var bubbleContainer = obj.putTableResponse(jsonResponse);
                createBubbleChart(bubbleContainer, jsonResponse, obj.options);
                obj.refreshToolbarButtons(bubbleContainer, 'bubble');
                break;
            case 'heatmap':
                var mapContainer = obj.putTableResponse(jsonResponse);
                createHeatmap(mapContainer, jsonResponse, obj.options);
                obj.refreshToolbarButtons(mapContainer, 'heatmap');
                break;
            case 'pie':
                obj.putTableResponse(jsonResponse);
                break;
            case 'column':
                var _idRequest = obj.putTableResponse(jsonResponse);
                obj.displayColumChartHandler(null, _idRequest);

                break;
            case 'help':
                obj.putHelpMessage(jsonResponse);
                break;
            default:
                obj.putSimpleResponse(jsonResponse, textValue, status);
        }
        obj.checkMaxMessages();
        refreshTooltips();

        if (obj.options.landingPage != 'data-messenger') {
            obj.hideBubbles();
        }
    };

    obj.createDrawer();
    obj.createMask();
    obj.createContentWrapper();
    obj.createDrawerButton();
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
    obj.scrollBox.onscroll = () => {
        closeAllChartPopovers();
        closeAllSafetynetSelectors();
    };

    refreshTooltips();

    document.addEventListener('DOMContentLoaded', obj.onLoadHandler);
    window.addEventListener('resize', () => {
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
    });
    return obj;
}
