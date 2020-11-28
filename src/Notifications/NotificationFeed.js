import { htmlToElement, apiCallPut, apiCallGet } from '../Utils'
import { DISMISS, EMPTY_STATE } from '../Svg'
import { DARK_THEME, LIGHT_THEME } from '../Constants'
import { Notification } from './Notification'
import '../../css/Notifications.css'

export function NotificationFeed(selector, options){
    var parent = document.querySelector(selector);
    var wrapper = document.createElement('div');
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
        onExpandCallback: (notification) => {},
        onCollapseCallback: (notification) => {},
        activeNotificationData: undefined,
        showNotificationDetails: true,
        showDescription: true,
        onErrorCallback: (error) => {},
        onSuccessCallback: (message) => {}
    }

    wrapper.notificationOffset = 0;
    wrapper.isLoading = false;

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            wrapper.options.authentication[key] = value;
        }
    }

    if('themeConfig' in options){
        for (var [key, value] of Object.entries(options['themeConfig'])) {
            wrapper.options.themeConfig[key] = value;
        }
    }

    for (var [key, value] of Object.entries(options)) {
        if(typeof value !== 'object'){
            wrapper.options[key] = value;
        }
    }

    var container = document.createElement('div');
    var dismissAllButton = document.createElement('div');
    var dismissContent = document.createElement('span');
    var dismissIcon = htmlToElement(DISMISS);
    var imageWrapper = document.createElement('div')
    var emptyStateContainer = document.createElement('div')
    emptyStateContainer.style.display = 'none'
    var img = htmlToElement(`
        <img
            class="autoql-vanilla-empty-state-img"
            src="./public/empty-state-blue.png"/>
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
    // wrapper.style.height = '100vh';
    // wrapper.style.background = 'rgb(250, 250, 250)';
    wrapper.classList.add('autoql-vanilla-notification-wrapper');
    container.classList.add('chata-notification-list-container');
    dismissAllButton.classList.add('chata-notification-dismiss-all');
    emptyStateContainer.classList.add('autoql-vanilla-empty-state');
    dismissContent.appendChild(dismissIcon);
    dismissContent.appendChild(document.createTextNode('Dismiss All'));
    dismissAllButton.appendChild(dismissContent);
    container.appendChild(dismissAllButton);
    wrapper.appendChild(container);

    container.addEventListener('scroll', (evt) => {
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

    wrapper.getNotifications = async () => {
        const URL = `${options.authentication.domain}/autoql/api/v1/data-alerts/notifications?key=${options.authentication.apiKey}&offset=${wrapper.notificationOffset}&limit=10`;
        var timeOut = 0;
        var delay = 0.08;
        wrapper.isLoading = true;
        var response = await apiCallGet(URL, wrapper.options)
        var jsonResponse = response.data
        var items = jsonResponse['data']['items'];
        items = []
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
