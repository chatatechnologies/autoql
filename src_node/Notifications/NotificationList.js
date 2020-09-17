import { htmlToElement } from '../Utils'
import { DISMISS } from '../Svg'
import { ChataUtils } from '../ChataUtils'
import { Notification } from './Notification'
import '../../css/Notifications.css'

export function NotificationList(selector, options){
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
        enableDynamicCharting: true
    }

    if('authentication' in options){
        for (var [key, value] of Object.entries(options['authentication'])) {
            wrapper.options.authentication[key] = value;
        }
    }

    var container = document.createElement('div');
    var dismissAllButton = document.createElement('div');
    var dismissContent = document.createElement('span');
    var dismissIcon = htmlToElement(DISMISS);
    wrapper.style.height = '100vh';
    wrapper.style.background = 'rgb(250, 250, 250)';

    container.classList.add('chata-notification-list-container');
    dismissAllButton.classList.add('chata-notification-dismiss-all');
    dismissContent.appendChild(dismissIcon);
    dismissContent.appendChild(document.createTextNode('Dismiss All'));
    dismissAllButton.appendChild(dismissContent);
    container.appendChild(dismissAllButton);
    wrapper.appendChild(container);

    wrapper.getNotifications = () => {
        const URL = `${options.authentication.domain}/autoql/api/v1/rules/notifications?key=${options.authentication.apiKey}&offset=0&limit=10`;
        var timeOut = 0;
        ChataUtils.safetynetCall(URL, (jsonResponse, status) => {
            var items = jsonResponse['data']['notifications'];
            for (var i = 0; i < items.length; i++) {
                container.appendChild(
                    new Notification(items[i], wrapper.options)
                );
            }
        }, wrapper.options)
    }

    if(parent)parent.appendChild(wrapper);

    wrapper.getNotifications();

    return wrapper;
}
