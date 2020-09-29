import { DataMessenger } from './src'
import { Dashboard } from './src'
import { NotificationsIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationList } from './src'
import { DataAlertsSettings } from './src'

import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAxMzU2ODk0LCAiZXhwIjogMTYwMTM3ODQ5NCwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiJdfQ.jSmsIMr6zYmlFhPvVh-f4tx5sdpClzKKVgzv-52CEXJJ6BP_bPb9jnK3tD5Z_4ysauCvqXbn3Z2cKYzUAnQ7yVYELELCGtmo6-62lTjm1kotCjCT4nQ2cCw3l22ZEMA5OkPzjU-kVcaTAay8VJCMe1hNTlQjyG0F3LFwKt60Wnr1O71B15BjvcPg2XYlpZnbUS7eBY4KYgIC2DxQ-7s5a-2qF0f-0nJT_TrFkt_PrdOzvRpp1NEgofyJpAJk042eVBiA1QX0j6TBbeXFQza2PK-9OyngSj9OjKhqYQ8GgAzQV30d6OMtTEgZiAobbNTA6lFh3PX9mSGJySj3cKTY2w`;
const domain = 'https://spira-staging.chata.io';
const apiKey = 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU'
const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${apiKey}`;
const topics = getIntroMessageTopics(getActiveIntegrator(domain));
let dashboard;
var datamessenger = new DataMessenger('#datamessenger', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    },
    themeConfig: {
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    },
    autoQLConfig: {
        debug: true
    },
    placement: 'right',
    onMaskClick: function(datamessenger){
        datamessenger.closeDrawer();
    },
    resizable: true,
    width: 550,
    // queryQuickStartTopics: topics,
    enableDynamicCharting: true,
    placement: 'right'
})
setTimeout(() => {
    datamessenger.setOption('queryQuickStartTopics', topics);

}, 300)
// var alerts = DataAlertsSettings('#alert-settings', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     }
// })

// var queryInput = new QueryInput('#query-input', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     autoCompletePlacement: 'bottom',
// });
//
// var queryOutput = new QueryOutput('#query-output', {
//     displayType: 'line',
// })
// queryInput.bind(queryOutput)

// var notificationList = new NotificationList('#notification-list', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     showNotificationDetails: true,
//     onExpandCallback: (notification) => {
//         console.log(notification);
//     },
//     onCollapseCallback: (notification) => {
//         console.log(notification);
//     }
// })

// var nButton = new NotificationsIcon('#notification-icon', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     useDot: true
// })

get(DASHBOARD_URL, {
    headers: {
        'Authorization': 'Bearer ' + _token,
        'Integrator-Domain': domain
    }
}).then(function(response){
    dashboard = new Dashboard('#dashboard', {
        authentication: {
            token: _token,
            apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
            domain: domain,
        },
        themeConfig: {
            chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
        },
        autoQLConfig: {
            debug: true
        },
        tiles: response.data[0].data
    })
    dashboard.startEditing()
})
