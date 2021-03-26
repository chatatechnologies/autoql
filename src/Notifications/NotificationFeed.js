import { htmlToElement, apiCallPut, apiCallGet, apiCallPost } from '../Utils'
import { DISMISS, EMPTY_STATE_BLUE } from '../Svg'
import { DARK_THEME, LIGHT_THEME } from '../Constants'
import { Notification } from './Notification'
import { NotificationSettingsModal } from './NotificationSettingsModal'
import { Modal } from '../Modal'
import { refreshTooltips } from '../Tooltips'
import { ChataConfirmDialog } from '../ChataComponents'
import { $dom } from '../Dom'
import '../../css/Notifications.css'

export function NotificationFeed(selector, options){
    var parent = document.querySelector(selector);
    var wrapper = $dom('div', {
        classes: ['autoql-vanilla-notification-wrapper']
    });
    wrapper.options = {
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
        enableDynamicCharting: true,
        onExpandCallback: () => {},
        onCollapseCallback: () => {},
        activeNotificationData: undefined,
        showNotificationDetails: true,
        showDescription: true,
        onErrorCallback: () => {},
        onSuccessCallback: () => {},
        autoChartAggregations: true,
    }

    wrapper.notificationOffset = 0;
    wrapper.isLoading = false;

    if('authentication' in options){
        for (let [key, value] of Object.entries(options['authentication'])) {
            wrapper.options.authentication[key] = value;
        }
    }

    if('themeConfig' in options){
        for (let [key, value] of Object.entries(options['themeConfig'])) {
            wrapper.options.themeConfig[key] = value;
        }
    }

    for (let [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            wrapper.options[key] = value;
        }
    }

    var container = $dom('div', {
        classes: ['chata-notification-list-container']
    })
    var dismissAllButton = $dom('div', {
        classes: ['chata-notification-dismiss-all']
    })
    var dismissContent = $dom('span', {
    })
    var dismissIcon = htmlToElement(DISMISS);
    var imageWrapper = $dom('div')
    var emptyStateContainer = $dom('div', {
        classes: ['autoql-vanilla-empty-state']
    })
    emptyStateContainer.style.display = 'none'
    var img = htmlToElement(`
        <img
            class="autoql-vanilla-empty-state-img"
            src="${EMPTY_STATE_BLUE}"/>
    `)
    var createDatalertButton = htmlToElement(`
        <button class="autoql-vanilla-chata-btn primary large">
            Create Data Alert
        </button>
    `)
    imageWrapper.appendChild(img)
    emptyStateContainer.appendChild(imageWrapper)
    emptyStateContainer.appendChild(htmlToElement(`
        <div style="margin-bottom:25px">
        <p class="autoql-vanilla-empty-notification">No Notifications yet.</p>
        <p class="autoql-vanilla-empy-notification-message">Stay tuned!</p>
        </div>
        `))
    emptyStateContainer.appendChild(createDatalertButton)
    container.appendChild(emptyStateContainer)
    dismissContent.appendChild(dismissIcon);
    dismissContent.appendChild(document.createTextNode('Dismiss All'));
    dismissAllButton.appendChild(dismissContent);
    container.appendChild(dismissAllButton);
    wrapper.appendChild(container);

    createDatalertButton.onclick = (evt) => {
        wrapper.onAddClick(evt)
    }

    container.addEventListener('scroll', () => {
        if(container.scrollTop + container.offsetHeight + 60
            > container.scrollHeight && !wrapper.isLoading){
            wrapper.notificationOffset += 10;
            wrapper.getNotifications()
        }
    })

    dismissContent.onclick = () => {
        wrapper.dismissAll()
    }

    wrapper.applyStyles = () => {
        const themeStyles = wrapper.options.themeConfig.theme === 'light'
        ? LIGHT_THEME : DARK_THEME
        themeStyles['accent-color']
        = wrapper.options.themeConfig.accentColor;

        for (let property in themeStyles) {
            document.documentElement.style.setProperty(
                '--autoql-vanilla-' + property,
                themeStyles[property],
            );
        }

        wrapper.style.setProperty(
            '--autoql-vanilla-font-family',
            wrapper.options.themeConfig['fontFamily']
        );
    }

    wrapper.dismissAll = async () => {
        var opts = wrapper.options.authentication;
        const URL = `${opts.domain}/autoql/api/v1/data-alerts/notifications?key=${opts.apiKey}`;
        var payload = {
            state: 'DISMISSED'
        }

        await apiCallPut(URL, payload, wrapper.options)
        wrapper.toggleAll()

    }

    wrapper.toggleAll = () => {
        var elItems = container.querySelectorAll(
            '.chata-notification-list-item'
        )
        for (var i = 0; i < elItems.length; i++) {
            elItems[i].options.state = 'DISMISSED';
            elItems[i].toggleDismissIcon();
        }
    }

    wrapper.onAddClick = () => {
        var cancelButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn default"
                style="padding: 5px 16px; margin: 2px 5px;">Cancel</div>`
        )
        var spinner = htmlToElement(`
            <div class="autoql-vanilla-spinner-loader hidden"></div>
        `)
        var saveButton = htmlToElement(
            `<div class="autoql-vanilla-chata-btn primary disabled"
                style="padding: 5px 16px; margin: 2px 5px;"></div>`
        )

        saveButton.appendChild(spinner);
        saveButton.appendChild(document.createTextNode('Save'));

        var modalView = new NotificationSettingsModal(wrapper.options);
        var configModal = new Modal({
            withFooter: true,
            destroyOnClose: true
        }, () => {
            modalView.step1.expand();
        })
        configModal.chataModal.style.width = '95vw';

        modalView.checkSteps = () => {
            if(modalView.isValid()){
                saveButton.classList.remove('disabled')
            }else{
                saveButton.classList.add('disabled')
            }
        }

        configModal.addView(modalView);
        configModal.setTitle('Create New Data Alert');
        configModal.addFooterElement(cancelButton);
        configModal.addFooterElement(saveButton);
        configModal.show();
        refreshTooltips();
        cancelButton.onclick = () => {
            new ChataConfirmDialog(
                'Are you sure you want to leave this page?',
                'All unsaved changes will be lost.',
                () => {
                    configModal.close()
                }
            )
        }
        saveButton.onclick = async () => {
            spinner.classList.remove('hidden')
            saveButton.setAttribute('disabled', 'true')
            var o = wrapper.options
            const URL = `${o.authentication.domain}/autoql/api/v1/data-alerts?key=${o.authentication.apiKey}`;
            var response = await apiCallPost(URL, modalView.getValues(), o)
            var status = response.status
            var json = response.data
            if(status !== 200){
                wrapper.options.onErrorCallback(json.message)
            }
            json['data'].authentication = wrapper.options.authentication;

            configModal.close();

        }
    }

    wrapper.getNotifications = async () => {
        const URL = `${options.authentication.domain}/autoql/api/v1/data-alerts/notifications?key=${options.authentication.apiKey}&offset=${wrapper.notificationOffset}&limit=10`;
        var delay = 0.08;
        wrapper.isLoading = true;
        var response = await apiCallGet(URL, wrapper.options)
        if(!response){
            emptyStateContainer.style.display = 'flex'
            dismissContent.style.display = 'none'
            wrapper.isLoading = false
            return
        }
        var jsonResponse = response.data
        var items = jsonResponse['data']['items'];
        if(items.length > 0){
            for (var i = 0; i < items.length; i++) {
                var notification = new Notification(items[i], wrapper.options);
                notification.style.animationDelay = (delay * i) + 's';
                container.appendChild(
                    notification
                );
            }
        }else{
            emptyStateContainer.style.display = 'flex'
            dismissContent.style.display = 'none'
        }

        wrapper.isLoading = false;
    }

    if(parent)parent.appendChild(wrapper);

    wrapper.applyStyles();
    wrapper.getNotifications();

    return wrapper;
}
