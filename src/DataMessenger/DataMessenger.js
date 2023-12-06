import {
    runQuery,
    isDataLimited,
    runDrilldown,
    getAuthentication,
    getAutoQLConfig,
    DEFAULT_DATA_PAGE_SIZE,
    isColumnDateType,
    getFilterDrilldown,
    constructFilter,
    getCombinedFilters,
    runQueryOnly,
    isDrilldown as isDrilldownResponse,
    areAllColumnsHidden,
    REQUEST_CANCELLED_ERROR,
    getColumnIndexConfig,
    getSupportedDisplayTypes,
    fetchSubjectList,
} from 'autoql-fe-utils';
import axios from 'axios';
import { ErrorMessage } from '../ErrorMessage';
import { TIMESTAMP_FORMATS } from '../Constants';
import { ChataTable, ChataPivotTable } from '../ChataTable';
import { ChataUtils } from '../ChataUtils';
import { Modal } from '../Modal';
import { NotificationSettingsModal, NotificationIcon, NotificationFeed } from '../Notifications';
import { ReverseTranslation } from '../ReverseTranslation';
import { apiCallGet, apiCallPut } from '../Api';
import { select } from 'd3-selection';
import { getGroupableFields } from '../Charts/ChataChartHelpers';
import { FilterLocking } from '../FilterLocking';
import { createSafetynetContent, createSuggestionArray } from '../Safetynet';
import {
    getSpeech,
    htmlToElement,
    closeAllSafetynetSelectors,
    uuidv4,
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
    closeAllChartPopovers,
    getLocalStream,
    isTouchDevice,
} from '../Utils';

import {
    CHATA_BUBBLES_ICON,
    CLOSE_ICON,
    CLEAR_ALL,
    POPOVER_ICON,
    WATERMARK,
    VOICE_RECORD_IMAGE,
    DATA_MESSENGER,
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
    HELP_ICON,
    FILTER_LOCKING,
    MAXIMIZE_BUTTON,
    MINIMIZE_BUTTON,
    DATA_EXPLORER_SEARCH_ICON,
    SCATTERPLOT_ICON,
    COLUMN_LINE_ICON,
    HISTOGRAM_ICON,
} from '../Svg';
import { strings } from '../Strings';
import tippy, { hideAll } from 'tippy.js';
import { refreshTooltips } from '../Tooltips';
import { DataExplorer } from '../DataExplorer';
import { ChataChartNew } from '../NewCharts';

import '../../css/chata-styles.css';
import '../../css/DataMessenger.scss';
import '../Toolbar/Toolbar.scss';
import testdata from '../../testdata';
import MobileDetect from 'mobile-detect';

export function DataMessenger(options = {}) {
    checkAndApplyTheme();
    var md = new MobileDetect(window.navigator.userAgent);
    const isMobile = md.mobile() === null ? false : true;
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
        enableDataExplorerTab: true,
        enableNotificationsTab: false,
        inputPlaceholder: strings.dmInputPlaceholder,
        enableDynamicCharting: true,
        landingPage: 'data-messenger',
        autoChartAggregations: false,
        pageSize: 500,
        xhr: new XMLHttpRequest(),
        ...options, // Spread all provided options to overwrite defaults
        authentication: {
            token: undefined,
            apiKey: undefined,
            domain: undefined,
            demo: false,
            ...(options.authentication ?? {}),
        },
        dataFormatting: {
            timestampFormat: TIMESTAMP_FORMATS.iso8601,
            currencyCode: 'USD',
            languageCode: 'en-US',
            currencyDecimals: 2,
            quantityDecimals: 2,
            ratioDecimals: 4,
            comparisonDisplay: 'PERCENT',
            monthYearFormat: 'MMM YYYY',
            dayMonthYearFormat: 'll',
            percentDecimals: 2,
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
    obj.speechToText = getSpeech(obj.options.dataFormatting);
    obj.finalTranscript = '';
    obj.isRecordVoiceActive = false;
    obj.zIndexBubble = 1000000;
    obj.id = options?.id ?? `autoql-vanilla-data-messenger-${uuidv4()}`;
    obj.isVisible = !!obj.options.defaultOpen;
    obj.notificationTabId = uuidv4();

    if (!('introMessage' in options)) {
        obj.options.introMessage = strings.introMessage.chataFormat(obj.options.userDisplayName);
    }

    obj.cancelCurrentRequest = () => {
        obj.axiosSource?.cancel(REQUEST_CANCELLED_ERROR);
    };
    obj.isPortrait = () => ['left', 'right'].includes(obj.options.placement);
    obj.isLandscape = () => ['top', 'bottom'].includes(obj.options.placement);

    obj.getSubjects = async () => {
        try {
            const { token, apiKey, domain } = obj.options.authentication;
            if (!token || token === '') {
                return [];
            } else {
                const subjects = await fetchSubjectList({
                    token,
                    apiKey,
                    domain,
                });

                return subjects;
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    obj.setOption = async (option, value) => {
        try {
            if (obj.options[option] === value) {
                return;
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
                    obj.rootElem.classList.remove(`autoql-vanilla-drawer-${obj.options.placement}`);
                    obj.rootElem.classList.add(`autoql-vanilla-drawer-${value}`);
                    obj.options.placement = value;
                    obj.setDMWidthOrHeight();
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
                        : obj.drawerButton.classList.add('autoql-vanilla-drawer-handle-hidden');

                    break;
                case 'handleStyles':
                    obj.applyHandleStyles();
                    break;
                case 'showMask':
                    obj.options.showMask = value;
                    if (value === false) {
                        obj.drawerMask.classList.add('autoql-vanilla-drawer-mask-hidden');
                    } else {
                        obj.drawerMask.classList.remove('autoql-vanilla-drawer-mask-hidden');
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
                case 'enableDataExplorerTab':
                    obj.options.enableDataExplorerTab = value;
                    value
                        ? obj.tabDataExplorer.classList.remove('autoql-vanilla-data-messenger-tab-hidden')
                        : obj.tabDataExplorer.classList.add('autoql-vanilla-data-messenger-tab-hidden');

                    if (!value && obj.landingPage === 'explore-queries') {
                        obj.setActiveTab(obj.tabChataUtils);
                    }
                    break;

                case 'enableNotificationsTab':
                    obj.options.enableNotificationsTab = value;
                    value
                        ? obj.tabNotifications.classList.remove('autoql-vanilla-data-messenger-tab-hidden')
                        : obj.tabNotifications.classList.add('autoql-vanilla-data-messenger-tab-hidden');

                    if (!value && obj.landingPage === 'notifications') {
                        obj.setActiveTab(obj.tabChataUtils);
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
                default:
                    obj.options[option] = value;
            }
            const subjects = await obj.getSubjects();
            obj.dataExplorer.setSubjects(subjects);
            obj.filterLocking.loadConditions();
        } catch (error) {
            console.error(error);
        }
    };

    obj.setOptions = (options = {}) => {
        for (let [key, value] of Object.entries(options)) {
            if (typeof value !== 'object') {
                obj.setOption(key, value);
            }
        }
    };

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
        drawerButton.addEventListener('click', obj.openDrawer);

        var drawerIcon = document.createElement('div');
        drawerIcon.classList.add('autoql-vanilla-chata-bubbles-icon');
        drawerIcon.innerHTML = CHATA_BUBBLES_ICON;
        drawerButton.appendChild(drawerIcon);

        obj.drawerButton = drawerButton;

        if (!obj.options.showHandle) {
            obj.drawerButton.classList.add('autoql-vanilla-drawer-handle-hidden');
        } else {
            obj.applyHandleStyles();
        }

        obj.drawerContentWrapper.appendChild(drawerButton);
    };

    obj.openDrawer = () => {
        if (!obj.rootElem) return;

        obj.isVisible = true;

        obj.rootElem.classList.add('autoql-vanilla-drawer-open');
        document.body.classList.add('autoql-vanilla-drawer-open-body');

        obj.initialScroll = window.scrollY;
        obj.input.focus();
    };

    obj.closeDrawer = () => {
        closeAllChartPopovers();
        obj.closePopOver(obj.clearMessagePop);

        obj.rootElem.classList.remove('autoql-vanilla-drawer-open');
        document.body.classList.remove('autoql-vanilla-drawer-open-body');

        obj.options.isVisible = false;

        if (obj.options.clearOnClose) {
            obj.clearMessages();
        }
    };

    obj.createDrawer = () => {
        const existingDataMessenger = document.body.querySelector('.autoql-vanilla-drawer');
        if (existingDataMessenger) {
            console.warn(
                'You just attempted to create a Data Messenger when one already existed. The previous instance will now be replaced with the new one.',
            );
            existingDataMessenger.parentElement.removeChild(existingDataMessenger);
        }
        var rootElem = document.createElement('div');
        rootElem.id = obj.id;
        rootElem.classList.add('autoql-vanilla-drawer');
        rootElem.classList.add(`autoql-vanilla-drawer-${obj.options.placement}`);

        if (obj.isVisible) {
            rootElem.classList.add('autoql-vanilla-drawer-open');
            document.body.classList.add('autoql-vanilla-drawer-open-body');
        }

        obj.rootElem = rootElem;

        document.body.appendChild(obj.rootElem);
    };

    obj.setDMWidthOrHeight = () => {
        if (obj.isPortrait()) {
            obj.drawerContentWrapper.style.height = '100%';
            obj.drawerContentWrapper.style.width = obj.options.width + 'px';
        } else {
            obj.drawerContentWrapper.style.width = '100%';
            obj.drawerContentWrapper.style.height = obj.options.height + 'px';
        }
    };

    obj.createContentWrapper = () => {
        obj.drawerContentWrapper = document.createElement('div');
        obj.drawerContentWrapper.classList.add('autoql-vanilla-drawer-content-wrapper');

        obj.setDMWidthOrHeight();

        obj.drawerBody = document.createElement('div');
        obj.drawerBody.classList.add('autoql-vanilla-drawer-body');
        obj.drawerContentWrapper.appendChild(obj.drawerBody);

        obj.rootElem.appendChild(obj.drawerContentWrapper);
    };

    obj.createMask = () => {
        obj.drawerMask = document.createElement('div');
        obj.drawerMask.classList.add('autoql-vanilla-drawer-mask');

        if (obj.options.showMask) {
            obj.drawerMask.onclick = (e) => {
                obj.closeDrawer(e);
            };
        } else {
            obj.drawerMask.classList.add('autoql-vanilla-drawer-mask-hidden');
        }

        obj.rootElem.appendChild(obj.drawerMask);
    };

    obj.onLoadHandler = () => {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            obj.initialScroll = window.scrollY;
        }
    };

    obj.dispatchResizeEvent = () => {
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
    };

    obj.tabsAnimation = function (displayNodes, displayBar) {
        var nodes = obj.drawerContent.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style.display = displayNodes;
        }
        obj.chataBarContainer.style.display = displayBar;
        if (displayNodes == 'none') {
            obj.headerTitle.innerHTML = strings.dataExplorer;
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
        if (!obj.options.autoQLConfig.enableNotifications || !obj.options.enableNotificationsTab) {
            return;
        }

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

    obj.setActiveTab = function (tab) {
        if (!tab) return;

        [obj.tabChataUtils, obj.tabDataExplorer, obj.tabNotifications].forEach((tab) => {
            tab?.classList.remove('autoql-vanilla-data-messenger-tab-active');
        });

        tab.classList.add('autoql-vanilla-data-messenger-tab-active');
        obj.landingPage = tab.getAttribute('data-tab');
    };

    obj.createQueryTab = function ({ name, content, tooltip, isEnabled }) {
        var tab = document.createElement('div');
        tab.classList.add('autoql-vanilla-data-messenger-tab');
        if (!isMobile) {
            tab.setAttribute('data-tippy-content', tooltip);
        }
        tab.setAttribute('data-tab', name);

        if (content) tab.appendChild(content);
        if (!isEnabled) tab.classList.add('autoql-vanilla-data-messenger-tab-hidden');
        if (obj.options.landingPage === name) tab.classList.add('autoql-vanilla-data-messenger-tab-active');

        return tab;
    };

    obj.createQueryTabs = function () {
        const { enableDataExplorerTab, enableNotificationsTab } = obj.options;

        var pageSwitcherContainer = document.createElement('div');
        pageSwitcherContainer.classList.add('autoql-vanilla-page-switcher-container');

        var tabChataUtils = obj.createQueryTab({
            name: 'data-messenger',
            content: htmlToElement(DATA_MESSENGER),
            tooltip: 'Home',
            isEnabled: true,
        });
        var tabDataExplorer = obj.createQueryTab({
            name: 'explore-queries',
            content: htmlToElement(DATA_EXPLORER_SEARCH_ICON),
            tooltip: strings.dataExplorer,
            isEnabled: enableDataExplorerTab,
        });
        var tabNotifications = obj.createQueryTab({
            name: 'notifications',
            tooltip: strings.notifications,
            isEnabled: enableNotificationsTab,
        });

        tabChataUtils.onclick = function () {
            obj.setActiveTab(this);
            obj.scrollBox.style.overflow = 'auto';
            obj.scrollBox.style.maxHeight = 'calc(100% - 150px)';
            obj.tabsAnimation('flex', 'block');
            obj.dataExplorer.hide();
            obj.notificationsAnimation('none');
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        };

        tabDataExplorer.onclick = function () {
            obj.setActiveTab(this);
            obj.tabsAnimation('none', 'none');
            obj.dataExplorer.show();
            obj.notificationsAnimation('none');
        };

        tabNotifications.setAttribute('id', obj.notificationTabId);
        tabNotifications.onclick = function () {
            obj.setActiveTab(this);
            obj.scrollBox.scrollTop = 0;
            obj.scrollBox.style.overflow = 'hidden';
            obj.scrollBox.style.maxHeight = '100%';
            obj.tabsAnimation('none', 'none');
            obj.dataExplorer.hide();
            obj.notificationsAnimation('block');
            obj.headerTitle.innerHTML = strings.notifications;
        };

        pageSwitcherContainer.appendChild(tabChataUtils);
        pageSwitcherContainer.appendChild(tabDataExplorer);
        pageSwitcherContainer.appendChild(tabNotifications);

        var pageSwitcherShadowContainer = document.createElement('div');
        pageSwitcherShadowContainer.classList.add('autoql-vanilla-page-switcher-shadow-container');
        pageSwitcherShadowContainer.appendChild(pageSwitcherContainer);

        var tabContainer = document.createElement('div');
        tabContainer.classList.add('autoql-vanilla-data-messenger-tab-container');
        tabContainer.appendChild(pageSwitcherShadowContainer);

        obj.tabChataUtils = tabChataUtils;
        obj.tabDataExplorer = tabDataExplorer;
        obj.tabNotifications = tabNotifications;

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

    obj.createDataExplorer = async function () {
        const subjects = await obj.getSubjects();
        const dataExplorer = new DataExplorer({
            widget: obj,
            subjects,
        });
        obj.dataExplorer = dataExplorer;
        obj.drawerContent.appendChild(dataExplorer.container);
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
                var keyboardEvent = new KeyboardEvent('keydown', {
                    code: 'Enter',
                    key: 'Enter',
                    charCode: 13,
                    keyCode: 13,
                    view: window,
                });

                chataInput.dispatchEvent(keyboardEvent);
            } else {
                chataInput.value = subQuery;
            }
            index++;
        }, 45);
    };

    obj.createResizeHandler = function () {
        var resize = document.createElement('div');
        var startX, startY, startWidth, startHeight;
        var timer;

        resize.classList.add('autoql-vanilla-chata-drawer-resize-handle');

        function resizeItem(e) {
            obj.rootElem.classList.add('autoql-vanilla-drawer-resizing');

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
            if (newWidth <= 400) {
                newWidth = 400;
            }

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
                obj.rootElem.classList.remove('autoql-vanilla-drawer-resizing');
            }, 100);
        }

        function stopResize() {
            window.removeEventListener('mousemove', resizeItem, false);
            window.removeEventListener('mouseup', stopResize, false);
        }

        function initResize(e) {
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
            'filter-locking-menu',
            'autoql-vanilla-condition-locking-input',
            'autoql-vanilla-condition-list',
            'autoql-vanilla-filter-locking-saving-indicator',
            'autoql-vanilla-filter-locking-close-and-saving-container',
            'autoql-vanilla-filter-locking-view',
            'autoql-vanilla-empty-condition-list',
            'autoql-vanilla-filter-locking-title',
            'autoql-vanilla-filter-locking-title-container',
            'autoql-vanilla-filter-locking-empty-condition',
            'autoql-vanilla-suggestion-key-content',
            'autoql-vanilla-suggestion-message-content',
            'autoql-vanilla-filter-suggestion',
            'autoql-vanilla-input',
            'autoql-vanilla-radio-btn',
            'autoql-vanilla-slider',
            'autoql-vanilla-text-include',
            'autoql-vanilla-text-exclude',
            'autoql-vanilla-persist-toggle-column',
            'autoql-vanilla-filter-list-title',
            'autoql-vanilla-filter-list-title-section',
            'autoql-vanilla-condition-table-settings',
            'autoql-vanilla-filter-list',
            'autoql-vanilla-filter-list-title-section-icon',
            'autoql-vanilla-chata-bar-container',
            'autoql-vanilla-filter-lock-category-title',
            'autoql-vanilla-condition-table-list-item',
            'autoql-vanilla-filter-locking-line',
            'autoql-vanilla-interpretation-icon',
            'autoql-vanilla-filter-locking-input-container',
            'autoql-vanilla-condition-lock-header',
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
                obj.filterLocking.hide();
            }

            if (closeAutoComplete) {
                obj.autoCompleteList.style.display = 'none';
            }

            if (evt.target.classList.contains('suggestion')) {
                obj.autoCompleteList.style.display = 'none';
                if (evt.target.textContent) localStorage.setItem('lastQuery', evt.target.textContent);
                obj.sendMessage(evt.target.textContent, 'data_messenger.user');
            }
        });
    };

    obj.createDrawerContent = () => {
        var drawerContent = document.createElement('div');
        var firstMessage = document.createElement('div');
        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container-text');
        var chatMessageBubble = document.createElement('div');
        var scrollBox = document.createElement('div');
        scrollBox.classList.add('autoql-vanilla-chata-scrollbox');
        chatMessageBubble.textContent = obj.options.introMessage;
        drawerContent.classList.add('autoql-vanilla-drawer-content');
        firstMessage.classList.add('autoql-vanilla-chat-single-message-container');
        firstMessage.classList.add('response');
        chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        firstMessage.appendChild(chatMessageBubbleContainer);
        chatMessageBubbleContainer.appendChild(chatMessageBubble);
        drawerContent.appendChild(firstMessage);
        scrollBox.appendChild(drawerContent);
        obj.drawerBody.appendChild(scrollBox);
        obj.drawerContent = drawerContent;
        obj.scrollBox = scrollBox;
        obj.introMessageBubble = chatMessageBubble;
        obj.introMessage = firstMessage;
    };

    obj.createHeader = () => {
        var chatHeaderContainer = document.createElement('div');
        var filterLocking = new FilterLocking(obj);
        var closeButton = htmlToElement(`
            <button
                class="autoql-vanilla-chata-button close-action"
            currentitem="false">
                ${CLOSE_ICON}
            </button>
        `);

        var screenButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button autoql-vanilla-screen-menu autoql-btn-maximize">
                ${MAXIMIZE_BUTTON}
            </button>
        `);

        var filterButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button filter-locking-menu">
                ${FILTER_LOCKING}
            </button>
        `);

        var clearAllButton = htmlToElement(`
            <button class="autoql-vanilla-chata-button clear-all"
           >
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
        if (!isMobile) {
            const closeButtonTooltip = tippy(closeButton);
            closeButtonTooltip.setContent(strings.closeDrawer);
            closeButtonTooltip.setProps({
                theme: 'chata-theme',
                delay: [500],
            });
        }
        closeButton.onclick = () => {
            obj.closeDrawer();
        };
        if (!isMobile) {
            const clearAllButtonTooltip = tippy(clearAllButton);
            clearAllButtonTooltip.setContent(strings.clearMessages);
            clearAllButtonTooltip.setProps({
                theme: 'chata-theme',
                delay: [500],
            });
        }
        clearAllButton.onclick = () => {
            popover.style.visibility = 'visible';
            popover.style.opacity = 1;
        };
        const filterButtonTooltip = tippy(filterButton);
        if (!isMobile) {
            filterButtonTooltip.setContent(strings.filterButton);
            filterButtonTooltip.setProps({
                theme: 'chata-theme',
                delay: [500],
            });
        } else {
            filterButtonTooltip.disable();
        }
        filterButton.onclick = () => {
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
        if (!isMobile) {
            screenButtonTooltip.setContent(strings.maximizeButton);
            screenButtonTooltip.setProps({
                theme: 'chata-theme',
                delay: [500],
            });
        }
        screenButton.onclick = () => {
            if (screenButton.classList.contains('autoql-btn-maximize')) {
                screenButton.classList.remove('autoql-btn-maximize');
                screenButton.classList.add('autoql-btn-minimize');
                screenButton.innerHTML = MINIMIZE_BUTTON;
                if (!isMobile) {
                    screenButtonTooltip.setContent(strings.maximizeButtonExit);
                } else {
                    screenButtonTooltip.disable();
                }
                obj.isPortrait()
                    ? (obj.drawerContentWrapper.style.width = '100%')
                    : (obj.drawerContentWrapper.style.height = '100%');
            } else {
                screenButton.classList.add('autoql-btn-maximize');
                screenButton.classList.remove('autoql-btn-minimize');
                screenButton.innerHTML = MAXIMIZE_BUTTON;
                if (!isMobile) {
                    screenButtonTooltip.setContent(strings.maximizeButton);
                } else {
                    screenButtonTooltip.disable();
                }

                obj.isPortrait()
                    ? (obj.drawerContentWrapper.style.width = `${obj.options.width}px`)
                    : (o.drawerContentWrapper.style.height = `${obj.options.height}px`);
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
        obj.header = chatHeaderContainer;
        obj.clearMessagePop = popover;
        filterLocking.loadConditions();
        obj.filterLocking = filterLocking;
    };

    obj.closePopOver = (popover) => {
        popover.style.visibility = 'hidden';
        popover.style.opacity = 0;
    };

    obj.clearMessages = () => {
        [].forEach.call(obj.drawerContent.querySelectorAll('.autoql-vanilla-chat-single-message-container'), (e) => {
            e.parentNode.removeChild(e);
        });
        obj.cancelCurrentRequest();
        obj.input.removeAttribute('disabled');
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
        if (evt.key == 'Enter' && obj.input.value) {
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

    obj.onArrowUpHandler = (evt) => {
        if (evt.key === 'ArrowUp' && !obj.input.value) {
            evt.stopPropagation();
            const lastQuery = localStorage.getItem('lastQuery');
            if (lastQuery) {
                obj.input.value = lastQuery;
                setTimeout(() => obj.input.setSelectionRange(lastQuery.length, lastQuery.length), 0);
            }
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
        if (!isMobile) {
            voiceRecordButton.setAttribute('data-tippy-content', strings.voiceRecord);
        }

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

        const startListening = async (event) => {
            if (obj.isRecordVoiceActive) {
                obj.speechToText?.stop();
                console.log('STOPPED SP2T 1');
                return;
            }

            obj.finalTranscript = '';
            obj.input.value = '';

            if (obj.voiceDisabled) {
                return;
            }

            if (isTouchDevice()) {
                event.preventDefault();
                event.stopPropagation();
            }

            const permissionCheckStart = Date.now();
            try {
                console.log('about to get local stream...');
                await getLocalStream();
            } catch (error) {
                console.error(error);
                if (error?.message === 'Permission denied') {
                    obj.voiceDisabled = true;
                    voiceRecordButton.style.backgroundColor = 'var(--autoql-vanilla-accent-color)';
                    voiceRecordButton.style.opacity = '0.5';
                    voiceRecordButton.style.cursor = 'default';
                    voiceRecordButton.setAttribute('data-tippy-content', strings.voiceRecordError);
                    refreshTooltips();
                }
                return;
            }

            if (Date.now() - permissionCheckStart > 500) {
                // Assume dialog popped up, and do not start audio recording
                // There is no other easy way that I know of to check if there was a permission dialog
                console.log('STOPPED SP2T 2, permission was just checked instead');

                obj.isRecordVoiceActive = false;
                obj.speechToText?.stop();
                obj.speechToText?.abort();
                return;
            }

            console.log('starting speech to text NOW!');
            voiceRecordButton.classList.add('autoql-vanilla-chat-voice-record-button-listening');
            obj.speechToText.start();
            obj.isRecordVoiceActive = true;

            return false;
        };

        if (isTouchDevice()) {
            voiceRecordButton.ontouchstart = startListening;
        } else {
            voiceRecordButton.onmousedown = startListening;
        }

        obj.chataBarContainer = chataBarContainer;
        obj.input = chataInput;
        obj.voiceRecordButton = voiceRecordButton;
        obj.autoCompleteList = autoCompleteList;
        obj.input.onkeyup = obj.autoCompleteHandler;
        obj.input.addEventListener('keydown', obj.onEnterHandler);
        obj.input.addEventListener('keydown', obj.onArrowUpHandler);

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
            obj.speechToText.onstart = (e) => {
                console.log('onstart callback voice is activated, you may now speak', e);
                console.log(obj.speechToText);
            };
            obj.speechToText.onend = () => {
                console.log('onend callback');
                obj.isRecordVoiceActive = false;
                obj.voiceRecordButton.classList.remove('autoql-vanilla-chat-voice-record-button-listening');
            };

            obj.speechToText.onsoundstart = (e) => {
                console.log('on sound start!', e);
            };
            obj.speechToText.onspeechstart = (e) => {
                console.log('on speech start!', e);
            };
            obj.speechToText.onaudiostart = (e) => {
                console.log('on audio start', e);
            };
            obj.speechToText.onaudioend = (e) => {
                console.log('on audio end', e);
            };
            obj.speechToText.onerror = (e) => {
                console.log('ON SPEECH TO TEXT ERROR!!!', e);
            };
            obj.speechToText.onnomatch = (e) => {
                console.log('ON NO MATCH!', e);
            };
            obj.speechToText.onresult = (e) => {
                console.log('ON SPEECH TO TEXT RESULT!!', e, e.results);
                for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
                    let transcript = e.results?.[i]?.[0]?.transcript ?? '';
                    console.log({ transcript });
                    if (e.results[i].isFinal) {
                        obj.finalTranscript += transcript;
                        console.log('FINAL TRANSCRIPT:', obj.finalTranscript);
                    } else {
                        console.log('cancelling because the transcript was not final');
                    }
                }
                if (obj.finalTranscript !== '') {
                    obj.input.value = obj.finalTranscript;
                    obj.input.focus();
                    obj.speechToText.stop();
                    obj.speechToText.abort();
                }
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

    obj.scrollIntoView = (element, checkElement) => {
        const scrollboxElement = obj.ps?.element ?? obj.scrollBox;
        if (scrollboxElement && element?.scrollIntoView) {
            const scrollElementClientRect = scrollboxElement.getBoundingClientRect();
            const scrollTop = scrollElementClientRect?.y;
            const scrollBottom = scrollTop + scrollElementClientRect?.height;

            const elementClientRect = (checkElement ?? element).getBoundingClientRect();
            const elemTop = elementClientRect?.y;
            const elemBottom = elemTop + elementClientRect?.height;

            if (elemBottom > scrollBottom || elemTop < scrollTop) {
                element.scrollIntoView({ block: 'end', inline: 'nearest' });
            }
        }
    };

    obj.reportProblemHandler = (evt, idRequest, reportProblem, toolbar) => {
        closeAllToolbars();
        reportProblem.classList.toggle('chata-popover-wrapper-show');
        toolbar.classList.toggle('autoql-vanilla-chat-message-toolbar-show');
        var bubble = document.querySelector(`[data-bubble-container-id='${idRequest}']`);
        var bubbleWithRT = document.querySelector(`[data-bubble-id='${idRequest}']`);
        if (bubble === obj.getLastMessageBubble()) {
            if (!bubble.classList.contains('autoql-vanilla-chat-message-response')) {
                obj.scrollIntoView(bubbleWithRT, bubble);
            }
        }
    };

    obj.moreOptionsHandler = (evt, idRequest, moreOptions, toolbar) => {
        closeAllToolbars();
        moreOptions.classList.toggle('chata-popover-wrapper-show');
        toolbar.classList.toggle('autoql-vanilla-chat-message-toolbar-show');
        var bubble = document.querySelector(`[data-bubble-container-id='${idRequest}']`);
        var bubbleWithRT = document.querySelector(`[data-bubble-id='${idRequest}']`);
        if (bubble === obj.getLastMessageBubble()) {
            if (!bubble.classList.contains('autoql-vanilla-chat-message-response')) {
                obj.scrollIntoView(bubbleWithRT, bubble);
            }
        }
    };

    obj.filterTableHandler = (evt, idRequest) => {
        var table = document.querySelector(`[data-componentid="${idRequest}"]`);
        var bubble = document.querySelector(`[data-bubble-container-id='${idRequest}']`);
        var bubbleWithRT = document.querySelector(`[data-bubble-id='${idRequest}']`);
        var tabulator = table.tabulator;
        tabulator.toggleFilters();

        if (table.isFiltering) {
            setTimeout(() => {
                obj.scrollIntoView(bubbleWithRT, bubble);
            }, 50);
        }
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
        const autoQLConfig = obj.options.autoQLConfig ?? {};
        var request = ChataUtils.responses[idRequest];
        let moreOptionsArray = [];
        var toolbar = htmlToElement(`
            <div class="autoql-vanilla-chat-message-toolbar autoql-vanilla-chat-message-toolbar-right">
            </div>
        `);

        if (isTouchDevice()) {
            toolbar.style.visibility = 'visible';
        }

        var reportProblem = obj.getReportProblemMenu(toolbar, idRequest, type);
        reportProblem.classList.add('report-problem');
        var reportProblemButton = obj.getActionButton(
            REPORT_PROBLEM,
            strings.reportProblemTitle,
            idRequest,
            obj.openModalReport,
            [obj.options, undefined, toolbar],
        );

        switch (type) {
            case 'simple':
                if (request['reference_id'] !== '1.9.502') {
                    toolbar.appendChild(reportProblemButton);
                    autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                    autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
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
                        badge.style.visibility = 'inherit';
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
                autoQLConfig.enableCSVDownload && moreOptionsArray.push('csv');
                moreOptionsArray.push('copy');
                autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
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
                autoQLConfig.debug && moreOptionsArray.push('copy_sql');
                autoQLConfig.enableNotifications && moreOptionsArray.push('notification');
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
                request['reference_id'] !== '1.1.432' &&
                request['reference_id'] !== '1.1.461'
            ) {
                if (moreOptionsArray?.length) {
                    toolbar.appendChild(moreOptionsBtn);
                    toolbar.appendChild(moreOptions);
                }

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
            nodes[i].style.display = 'none !important';
        }
    };

    obj.copyFilterMetadata = (component) => {
        component.filterMetadata = component.internalTable.getHeaderFilters();
    };

    obj.copyPivotFilterMetadata = (component) => {
        component.pivotFilterMetadata = component.pivotTabulator.getHeaderFilters();
    };

    obj.refreshToolbarButtons = (oldComponent, ignore) => {
        if (!oldComponent) {
            return;
        }

        if (oldComponent?.internalTable) {
            obj.copyFilterMetadata(oldComponent);
        }
        if (oldComponent?.pivotTabulator) {
            obj.copyPivotFilterMetadata(oldComponent);
        }

        var messageBubble = obj.getParentFromComponent(oldComponent);
        var uuid = messageBubble.parentNode.dataset.bubbleContainerId;
        var json = ChataUtils.responses[uuid];

        if (!json) {
            return;
        }

        var displayTypes = getSupportedDisplayTypes({ response: { data: json } });

        if (['table', 'pivot_table'].includes(ignore) && displayTypes.length <= 5) {
            messageBubble.classList.remove('chart-full-width');
        } else {
            messageBubble.classList.add('chart-full-width');
        }

        var scrollBox = messageBubble.querySelector('.autoql-vanilla-chata-table-scrollbox');
        var toolbarLeft = messageBubble.getElementsByClassName('autoql-vanilla-chat-message-toolbar-left')[0];
        var toolbarRight = messageBubble.getElementsByClassName('autoql-vanilla-chat-message-toolbar-right')[0];

        if (oldComponent.noColumnsElement && !areAllColumnsHidden(json?.data?.columns)) {
            oldComponent.parentElement.removeChild(oldComponent.noColumnsElement);
            oldComponent.noColumnsElement = null;
            oldComponent.style.display = 'block';
        }

        scrollBox.scrollLeft = 0;

        var actionType = ['table', 'pivot_table', 'date_pivot'].includes(ignore) ? 'csvCopy' : 'chart-view';

        if (toolbarLeft) {
            toolbarLeft.innerHTML = '';
            let displayTypeButtons = obj.getDisplayTypesButtons(oldComponent.dataset.componentid, ignore);

            displayTypeButtons.forEach((button) => {
                toolbarLeft.appendChild(button);
            });

            if (isTouchDevice()) {
                toolbarLeft.style.visibility = 'visible';
            } else if (displayTypeButtons.length > 1) {
                toolbarLeft.classList.remove('autoql-vanilla-chat-message-toolbar-hidden');
            } else {
                toolbarLeft.classList.add('autoql-vanilla-chat-message-toolbar-hidden');
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

        var cols = [];
        for (let [key, value] of Object.entries(params)) {
            cols.push({
                name: key,
                value: value,
            });
        }

        const data = {
            ...options.authentication,
            queryID: queryId,
            debug: options.autoQLConfig.debug,
            groupBys: cols,
            source: obj.options.source,
        };

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (let i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.chataBarContainer.appendChild(responseLoadingContainer);

        var response = await runDrilldown(data);
        var responseJson = response?.data;

        if (!responseJson) {
            console.error('Error processing drilldown');
            return;
        }

        responseJson.queryFn = obj.getQueryFn(response);

        var status = response.status;
        obj.chataBarContainer.removeChild(responseLoadingContainer);
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

        responseLoadingContainer.classList.add('autoql-vanilla-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
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

    obj.processDrilldown = async ({
        json,
        groupBys,
        supportedByAPI,
        row,
        stringColumnIndex,
        queryID,
        source,
        column,
        filter,
    }) => {
        if (!json?.data?.data) {
            return;
        }

        if (getAutoQLConfig(obj.options.autoQLConfig)?.enableDrilldowns) {
            try {
                // This will be a new query so we want to reset the page size back to default
                const pageSize = obj.options.pageSize ?? DEFAULT_DATA_PAGE_SIZE;

                if (supportedByAPI) {
                    return runDrilldown({
                        ...getAuthentication(obj.options.authentication),
                        ...getAutoQLConfig(obj.options.autoQLConfig),
                        queryID,
                        source,
                        groupBys,
                    });
                } else if ((!isNaN(stringColumnIndex) && !!row?.length) || filter) {
                    if (!isDataLimited(json) && !isColumnDateType(column) && !filter) {
                        // --------- 1. Use mock filter drilldown from client side --------
                        const mockData = getFilterDrilldown({ stringColumnIndex, row, json });
                        return new Promise((resolve, reject) => {
                            return setTimeout(() => {
                                return resolve(mockData);
                            }, 1500);
                        });
                    } else {
                        // --------- 2. Use subquery for filter drilldown --------
                        const clickedFilter =
                            filter ??
                            constructFilter({
                                column: json.data.data.columns[stringColumnIndex],
                                value: row[stringColumnIndex],
                            });

                        const allFilters = getCombinedFilters(clickedFilter, json, undefined); // TODO: add table params

                        let response;
                        try {
                            response = await json.data?.queryFn?.({ tableFilters: allFilters, pageSize });
                        } catch (error) {
                            console.error(error);
                            return;
                            // response = error;
                        }

                        return response;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        return;
    };

    obj.onChartClick = async (data, idRequest) => {
        const json = ChataUtils.responses[idRequest];
        const component = obj.getComponent(idRequest);

        component.activeKey = data.activeKey;

        obj.input.disabled = true;
        obj.input.value = '';

        var responseLoadingContainer = obj.putMessage('Drilldown');

        const queryID = json?.data?.query_id;

        const response = await obj.processDrilldown({
            ...data,
            queryID,
            source: json?.data?.fe_req?.source,
            json: { data: json },
        });

        if (response?.data) {
            response.data.originalQueryID = queryID;
        }

        obj.createResponseMessage({ response, responseLoadingContainer, isDrilldown: true });
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
        if (!table?.toggleFilters) {
            return;
        }

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

    obj.displayTableHandler = (idRequest) => {
        var component = obj.getComponent(idRequest);
        var json = obj.getRequest(idRequest);
        var chartsVisibleCount = json.data?.rows.length;
        var parentContainer = obj.getParentFromComponent(component);
        var parentElement = component.parentElement;
        var useInfiniteScroll = isDataLimited({ data: json });
        var tableParams = { queryJson: json, sort: undefined, filter: undefined };

        obj.refreshToolbarButtons(component, 'table');

        var table = new ChataTable(
            idRequest,
            obj.options,
            (data) => obj.onCellClick(data, idRequest),
            useInfiniteScroll,
            tableParams,
        );
        table.element.onNewPage({ chartsVisibleCount: chartsVisibleCount });
        component.internalTable = table;
        component.tabulator = table;
        obj.setDefaultFilters(component, table, 'table');
        table.parentContainer = parentContainer;
        table.parentElement = parentElement;
        if (table.parentElement.classList.contains('autoql-vanilla-chata-chart-container')) {
            table.parentElement.classList.remove('autoql-vanilla-chata-chart-container');
        }
        allColHiddenMessage(component);
        select(window).on('chata-resize.' + idRequest, null);
    };

    obj.displayPivotTableHandler = (idRequest) => {
        var component = obj.getComponent(idRequest);
        obj.refreshToolbarButtons(component, 'pivot_table');
        var table = new ChataPivotTable(idRequest, obj.options, (data) => obj.onCellClick(data, idRequest));
        obj.setDefaultFilters(component, table, 'pivot');
        select(window).on('chata-resize.' + idRequest, null);
        component.tabulator = table;
        component.pivotTabulator = table;
    };

    obj.displayChartHandler = (idRequest, displayType) => {
        var json = obj.getRequest(idRequest);
        var component = obj.getComponent(idRequest);

        obj.refreshToolbarButtons(component, displayType);

        new ChataChartNew(component, {
            type: displayType,
            queryJson: json,
            options: obj.options,
            onChartClick: (data) => obj.onChartClick(data, idRequest),
        });

        if (['stacked_column', 'stacked_bar', 'stacked_line'].includes(displayType)) {
            obj.registerDrilldownStackedChartEvent(component);
        } else {
            obj.registerDrilldownChartEvent(component);
        }
    };

    obj.getDisplayTypeButton = (idRequest, svg, tooltip, onClick) => {
        var button = htmlToElement(`
            <button
                class="autoql-vanilla-chata-toolbar-btn"
                data-tippy-content="${tooltip}"
                data-id="${idRequest}">
                ${svg}
            </button>
        `);

        button.onclick = () => onClick(idRequest);

        return button;
    };

    obj.getDisplayTypesButtons = (idRequest, active) => {
        var json = ChataUtils.responses[idRequest];
        var buttons = [];
        var displayTypes = getSupportedDisplayTypes({ response: { data: json } });

        const displayTypeIcons = {
            table: TABLE_ICON,
            pivot_table: PIVOT_ICON,
            column: COLUMN_CHART_ICON,
            bar: BAR_CHART_ICON,
            line: LINE_CHART_ICON,
            pie: PIE_CHART_ICON,
            heatmap: HEATMAP_ICON,
            bubble: BUBBLE_CHART_ICON,
            stacked_column: STACKED_COLUMN_CHART_ICON,
            stacked_bar: STACKED_BAR_CHART_ICON,
            stacked_line: STACKED_AREA_CHART_ICON,
            column_line: COLUMN_LINE_ICON,
            scatterplot: SCATTERPLOT_ICON,
            histogram: HISTOGRAM_ICON,
        };

        displayTypes.forEach((displayType) => {
            let button;

            const displayChartHandlerFn = (idRequest) => obj.displayChartHandler(idRequest, displayType);

            if (displayType == 'table') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    displayTypeIcons[displayType],
                    strings.displayTypes[displayType],
                    obj.displayTableHandler,
                );
            } else if (displayType == 'pivot_table') {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    displayTypeIcons[displayType],
                    strings.displayTypes[displayType],
                    obj.displayPivotTableHandler,
                );
            } else if (Object.keys(displayTypeIcons).includes(displayType)) {
                button = obj.getDisplayTypeButton(
                    idRequest,
                    displayTypeIcons[displayType],
                    strings.displayTypes[displayType],
                    displayChartHandlerFn,
                );
            } else {
                console.warn('Unable to create button for display type: ', displayType);
                return;
            }

            if (displayType == active) {
                button.classList.add('autoql-vanilla-viz-toolbar-btn-active');
            }

            buttons.push(button);
        });

        return buttons;
    };

    obj.putMessage = (value) => {
        if (value) {
            if (value !== 'Drilldown') {
                localStorage.setItem('lastQuery', value);
                var containerMessage = document.createElement('div');
                var messageBubble = document.createElement('div');

                containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
                containerMessage.style.zIndex = --obj.zIndexBubble;
                containerMessage.classList.add('request');
                messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
                messageBubble.classList.add('single');
                messageBubble.classList.add('text');
                messageBubble.textContent = value;
                containerMessage.appendChild(messageBubble);
                obj.drawerContent.appendChild(containerMessage);
            }
        }

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);

        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        obj.checkMaxMessages();
        if (obj.options.landingPage !== 'data-messenger') {
            obj.hideBubbles();
            return null;
        }
        obj.chataBarContainer.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    };

    obj.onCellClick = async (data, idRequest) => {
        const json = ChataUtils.responses[idRequest];

        obj.input.disabled = true;
        obj.input.value = '';

        var responseLoadingContainer = obj.putMessage('Drilldown');

        const queryID = json?.data?.query_id;

        const response = await obj.processDrilldown({
            ...data,
            queryID,
            source: json?.data?.fe_req?.source,
            json: { data: json },
        });

        if (response?.data) {
            response.data.originalQueryID = queryID;
        }

        obj.createResponseMessage({ response, responseLoadingContainer, isDrilldown: true });
    };

    obj.onRTVLClick = (rtChunk) => {
        obj.filterLocking?.show();
        if (rtChunk.lockedFilter) {
            obj.filterLocking.submitVL(rtChunk.lockedFilter, rtChunk.eng);
        } else {
            obj.filterLocking?.submitText(rtChunk.eng);
        }
    };

    obj.putTableResponse = (jsonResponse, isDrilldown = false) => {
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');
        var tableContainer = document.createElement('div');
        var tableRowCount = document.createElement('div');
        var scrollbox = document.createElement('div');
        var tableWrapper = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        var idRequest = uuidv4();
        var { parsed_interpretation } = jsonResponse.data;

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');

        containerMessage.style.zIndex = ++obj.zIndexBubble;
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
        var totalRows = jsonResponse.data.count_rows;
        var initialRows = jsonResponse.data.rows.length;
        var supportedDisplayTypes = obj.getDisplayTypesButtons(idRequest, 'table');

        var toolbar = undefined;
        if (supportedDisplayTypes.length > 0) {
            toolbar = htmlToElement(`
                <div class="autoql-vanilla-chat-message-toolbar autoql-vanilla-chat-message-toolbar-left">
                </div>
            `);
            for (var i = 0; i < supportedDisplayTypes.length; i++) {
                toolbar.appendChild(supportedDisplayTypes[i]);
            }
            if (supportedDisplayTypes.length === 1) {
                toolbar?.classList.add('autoql-vanilla-chat-message-toolbar-hidden');
            }
        }

        if (toolbar) {
            messageBubble.appendChild(toolbar);
        }

        tableContainer.classList.add('autoql-vanilla-chata-table-container');
        if (tableContainer.classList.contains('autoql-vanilla-chata-chart-container')) {
            tableContainer.classList.remove('autoql-vanilla-chata-chart-container');
        }
        scrollbox.classList.add('autoql-vanilla-chata-table-scrollbox');
        tableRowCount.classList.add('autoql-vanilla-chata-table-row-count');
        tableRowCount.textContent = `${strings.scrolledText} ${initialRows} / ${totalRows} ${strings.rowsText}`;
        responseContentContainer.classList.add('autoql-vanilla-chata-response-content-container');
        tableWrapper.setAttribute('data-componentid', idRequest);
        tableWrapper.classList.add('autoql-vanilla-chata-table');
        tableContainer.appendChild(tableWrapper);
        scrollbox.appendChild(tableContainer);
        tableContainer.appendChild(tableRowCount);
        responseContentContainer.appendChild(scrollbox);
        messageBubble.appendChild(responseContentContainer);
        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.setAttribute('data-bubble-container-id', idRequest);
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);
        obj.drawerContent.appendChild(containerMessage);
        var actions = obj.getActionToolbar(idRequest, 'csvCopy', 'table');
        messageBubble.appendChild(actions);

        obj.displayTableHandler(idRequest);

        if (parsed_interpretation) {
            var interpretationView = new ReverseTranslation(jsonResponse, obj.onRTVLClick);
            containerMessage.appendChild(interpretationView);
        }
        setTimeout(function () {
            obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
        }, 350);

        return idRequest;
    };

    obj.sendReport = function (idRequest, options, menu, toolbar) {
        return ChataUtils.sendReport(idRequest, options, menu, toolbar);
    };

    obj.openModalReport = function (evt, idRequest, options, menu, toolbar) {
        ChataUtils.openModalReport(idRequest, options, menu, toolbar);
    };

    obj.showColumnEditor = function (id, badge) {
        ChataUtils.showColumnEditor(id, obj.options, () => {
            var json = ChataUtils.responses[id];
            var component = obj.rootElem.querySelector(`[data-componentid='${id}']`);
            obj.setScrollBubble(obj.getParentFromComponent(component));
            component.tabulator.redraw(true);

            obj.refreshToolbarButtons(component, 'table');

            const newColumnIndexConfig = getColumnIndexConfig({ response: { data: json } });
            component.columnIndexConfig = newColumnIndexConfig;

            if (showBadge(json)) {
                badge.style.visibility = 'inherit';
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
        containerMessage.setAttribute('data-bubble-id', uuid);
        containerMessage.style.zIndex = --obj.zIndexBubble;
        containerMessage.relatedQuery = obj.lastQuery;
        containerMessage.relatedMessage = lastBubble;
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.innerHTML = text;
        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container-text');
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);
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
                var evt = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    keyCode: 13,
                    which: 13,
                });
                input.dispatchEvent(evt);
            } else {
                input.value = subQuery;
            }
            index++;
        }, 45);
    };

    obj.createSuggestions = async function (responseContentContainer, json) {
        var data = json['data']['items'];

        if (!data) {
            return;
        }

        var { domain, apiKey } = obj.options.authentication;
        var queryId = json['data']['query_id'];
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
                        obj.chataBarContainer.removeChild(loading);
                        obj.putClientResponse(strings.feedback, {}, true);
                    }, 500);
                }
            };
        }
    };

    obj.putSuggestionResponse = (jsonResponse) => {
        var uuid = uuidv4();
        ChataUtils.responses[uuid] = jsonResponse;

        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var responseContentContainer = document.createElement('div');

        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.classList.add('autoql-vanilla-suggestions-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.setAttribute('data-bubble-id', uuid);
        containerMessage.classList.add('response');
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('suggestions');
        responseContentContainer.classList.add('autoql-vanilla-chata-response-content-container');

        responseContentContainer.classList.add('suggestions');
        obj.createSuggestions(responseContentContainer, jsonResponse);
        messageBubble.appendChild(responseContentContainer);
        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container-text');
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);

        obj.putClientResponse(strings.suggestionResponse);
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

        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        var div = document.createElement('div');

        if (json.data) {
            div.classList.add('autoql-vanilla-chata-single-response');
        }

        div.appendChild(document.createTextNode(msg.toString()));
        messageBubble.appendChild(div);
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);
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

        responseLoadingContainer.classList.add('autoql-vanilla-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        obj.chataBarContainer.appendChild(responseLoadingContainer);

        return responseLoadingContainer;
    };

    obj.putSimpleResponse = async (jsonResponse, text, statusCode, isDrilldown = false) => {
        var { parsed_interpretation } = jsonResponse.data;
        var ref = jsonResponse['reference_id'];
        var containerMessage = document.createElement('div');
        var messageBubble = document.createElement('div');
        var lastBubble = obj.getLastMessageBubble();
        containerMessage.classList.add('autoql-vanilla-chat-single-message-container');
        containerMessage.style.zIndex = --obj.zIndexBubble;

        containerMessage.classList.add('response');
        if (!isDrilldown) containerMessage.relatedMessage = lastBubble;

        var idRequest = uuidv4();
        ChataUtils.responses[idRequest] = jsonResponse;
        containerMessage.setAttribute('data-bubble-id', idRequest);
        messageBubble.classList.add('autoql-vanilla-chat-message-bubble');
        messageBubble.classList.add('simple-response');
        containerMessage.relatedQuery = obj.lastQuery;

        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container-text');

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
            chatMessageBubbleContainer.appendChild(messageBubble);
            containerMessage.appendChild(chatMessageBubbleContainer);
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

            obj.putSimpleResponse(response.data, '', status);

            if (loading) obj.drawerContent.removeChild(loading);
            if (obj.options.landingPage !== 'data-messenger') {
                obj.hideBubbles();
            }
        }
        if (parsed_interpretation) {
            var interpretationView = new ReverseTranslation(jsonResponse, obj.onRTVLClick);
            containerMessage.appendChild(interpretationView);
        }
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
        messageBubble.classList.add('chart-full-width');
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

        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);
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
        messageBubble.classList.add('chart-full-width');

        var chatMessageBubbleContainer = document.createElement('div');
        chatMessageBubbleContainer.classList.add('autoql-vanilla-chat-message-bubble-container');
        messageBubble.innerHTML = obj.createHelpContent(jsonResponse['data']['rows'][0]);
        chatMessageBubbleContainer.appendChild(messageBubble);
        containerMessage.appendChild(chatMessageBubbleContainer);
        obj.drawerContent.appendChild(containerMessage);
        obj.scrollBox.scrollTop = obj.scrollBox.scrollHeight;
    };

    obj.getQueryFn = (response) => {
        // ------- test data -------
        // var jsonResponseCopy = cloneObject(response)
        // var pageSize = obj.options.pageSize ?? response.data.data.row_limit

        // var rows = []
        // for(let i = 0; i < pageSize; i++) {
        //     rows.push(response.data.data.rows[0])
        // }

        // jsonResponseCopy.data.data.rows = rows
        // jsonResponseCopy.data.data.row_limit = pageSize
        // jsonResponseCopy.data.data.fe_req.page_size = pageSize

        // return () => (new Promise((res, rej) => {
        //     setTimeout(() => {
        //         res(jsonResponseCopy)
        //     }, 2000)
        // }))
        // -------------------------

        let newResponse;

        return async ({ formattedTableParams, ...args }) => {
            try {
                const queryRequestData = response?.data?.data?.fe_req;
                const allFilters = getCombinedFilters(undefined, response, undefined);

                const queryParams = {
                    ...getAuthentication(obj.options.authentication),
                    ...getAutoQLConfig(obj.options.autoQLConfig),
                    source: obj.options.source,
                    scope: obj.options.scope,
                    debug: queryRequestData?.translation === 'include',
                    filters: queryRequestData?.session_filter_locks,
                    pageSize: queryRequestData?.page_size,
                    groupBys: queryRequestData?.columns,
                    orders: formattedTableParams?.sorters,
                    tableFilters: allFilters,
                };

                if (isDrilldownResponse(response)) {
                    newResponse = await runDrilldown({
                        ...queryParams,
                        queryID: response.data.originalQueryID ?? response.data.data.query_id,
                        ...args,
                    });

                    if (newResponse?.data) {
                        newResponse.data.originalQueryID = response.data.originalQueryID;
                        newResponse.data.queryFn = obj.getQueryFn(response);
                    }
                } else {
                    newResponse = await runQueryOnly({
                        ...queryParams,
                        query: queryRequestData?.text,
                        debug: queryRequestData?.translation === 'include',
                        userSelection: queryRequestData?.disambiguation,
                        ...args,
                    });

                    if (newResponse?.data) {
                        newResponse.data.originalQueryID = response.data.data.query_id;
                        newResponse.data.queryFn = obj.getQueryFn(response);
                    }
                }
            } catch (error) {
                console.error(error);
                newResponse = error;
            }

            return newResponse;
        };
    };

    obj.createResponseMessage = ({ response, responseLoadingContainer, textValue, isDrilldown }) => {
        obj.input.removeAttribute('disabled');

        if (!response || !response?.status || !response?.data) {
            if (responseLoadingContainer) {
                obj.chataBarContainer.removeChild(responseLoadingContainer);
            }
            if (response.data.message === 'Request cancelled') {
                return;
            }
            obj.sendResponse(strings.accessDenied);
            return;
        }

        const { status } = response;

        var jsonResponse = response.data;

        if (jsonResponse) {
            jsonResponse.queryFn = obj.getQueryFn(response);
        }

        if (status != 200) {
            let msg = response.data.message;
            let ref = response.data['reference_id'];
            if (ref === '1.1.482') {
                obj.putSimpleResponse(response.data, textValue, status);
            } else {
                if (status === 401) {
                    obj.sendResponse(strings.accessDenied, true);
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
            }
            if (responseLoadingContainer) {
                obj.chataBarContainer.removeChild(responseLoadingContainer);
            }
            refreshTooltips();
            return;
        }

        if (response?.data?.data?.replacements) {
            const suggestions = response.data.data.replacements;

            if (textValue != 'None Of these' && suggestions?.length > 0 && typeof selections === 'undefined') {
                obj.input.removeAttribute('disabled');
                if (responseLoadingContainer) {
                    obj.chataBarContainer.removeChild(responseLoadingContainer);
                }
                obj.putSafetynetMessage(response.data);
                return;
            }
        }

        if (responseLoadingContainer) {
            obj.chataBarContainer.removeChild(responseLoadingContainer);
        }

        if (jsonResponse?.data?.items) {
            obj.putSuggestionResponse(jsonResponse);
            return;
        }

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

        if (jsonResponse.data.rows && jsonResponse.data.rows.length === 0) {
            obj.putSimpleResponse(jsonResponse, textValue, status, isDrilldown);
            return;
        }

        switch (displayType) {
            case 'table':
                if (jsonResponse['data']['columns'].length == 1) {
                    obj.putSimpleResponse(jsonResponse, textValue, status, isDrilldown);
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
                        obj.putSimpleResponse(jsonResponse, textValue, status, isDrilldown);
                    }
                } else {
                    if (rows.length > 0) {
                        obj.putTableResponse(jsonResponse);
                    } else {
                        obj.putSimpleResponse(jsonResponse, textValue, status, isDrilldown);
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
            case 'word_cloud':
                obj.putTableResponse(jsonResponse);
                break;
            case 'column':
            case 'bar':
            case 'line':
            case 'stacked_column':
            case 'stacked_bar':
            case 'stacked_line':
            case 'bubble':
            case 'heatmap':
            case 'pie':
                var component = obj.getComponent(_idRequest);
                obj.refreshToolbarButtons(component, displayType);
                obj.displayChartHandler(_idRequest, displayType);
                break;
            case 'help':
                obj.putHelpMessage(jsonResponse);
                break;
            default:
                obj.putSimpleResponse(jsonResponse, textValue, status, isDrilldown);
        }
        obj.checkMaxMessages();
        refreshTooltips();

        if (obj.options.landingPage != 'data-messenger') {
            obj.hideBubbles();
        }
    };

    obj.sendMessage = async (textValue, source, selections = undefined) => {
        try {
            obj.input.disabled = true;
            obj.input.value = '';
            obj.axiosSource = axios.CancelToken?.source();
            const { domain, apiKey, token } = obj.options.authentication;
            var responseLoadingContainer = obj.putMessage(textValue);

            if (!token) {
                if (responseLoadingContainer) {
                    obj.chataBarContainer.removeChild(responseLoadingContainer);
                }
                obj.sendResponse(strings.accessDenied, true);
                obj.input.removeAttribute('disabled');
                refreshTooltips();
                return;
            }

            const queryParams = {
                query: textValue,
                domain,
                apiKey,
                token,
                userSelection: undefined,
                userSelectionFinal: undefined,
                debug: false,
                test: obj.options.autoQLConfig.test,
                source: 'data_messenger.user',
                scope: 'data_messenger',
                filters: [],
                orders: [],
                tableFilters: [],
                pageSize: obj.options.pageSize,
                translation: 'include',
                allowSuggestions: true,
                enableQueryValidation: obj.options.autoQLConfig.enableQueryValidation,
                skipQueryValidation: false,
                cancelToken: obj.axiosSource?.token,
            };

            let response;
            try {
                response = await runQuery(queryParams);
                if (response?.data) {
                    response.data.queryFn = obj.getQueryFn(response);
                }

                // response = testdata;
            } catch (error) {
                response = error;
            }

            obj.createResponseMessage({ response, responseLoadingContainer, textValue });
        } catch (error) {
            console.error(error);
        }
    };

    obj.createDrawer();
    obj.createMask();
    obj.createContentWrapper();
    obj.createDrawerButton();
    obj.createHeader();
    obj.createDrawerContent();
    obj.createBar();
    obj.createResizeHandler();
    obj.createQueryTabs();
    obj.createDataExplorer();
    obj.createNotifications();
    obj.speechToTextEvent();
    obj.registerWindowClicks();
    obj.scrollBox.onscroll = () => {
        closeAllSafetynetSelectors();
    };

    // Remove for now - causing buggy behaviour
    // obj.ps = new Scrollbars(obj.scrollBox, {
    //     scrollingThreshold: 200,
    // });

    refreshTooltips();

    obj.dispatchResizeEvent = () => {
        window.dispatchEvent(new CustomEvent('chata-resize', {}));
    };

    document.addEventListener('DOMContentLoaded', obj.onLoadHandler);
    window.addEventListener('resize', obj.dispatchResizeEvent);

    obj.destroy = () => {
        obj.drawerButton?.addEventListener('click', obj.openDrawer);
        obj.input?.removeEventListener('keydown', obj.onArrowUpHandler);
        obj.input?.addEventListener('keydown', obj.onEnterHandler);
        document.removeEventListener('DOMContentLoaded', obj.onLoadHandler);
        window.removeEventListener('resize', obj.dispatchResizeEvent);
    };

    return obj;
}
