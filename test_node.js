import { DataMessenger } from './src'
import { Dashboard } from './src'
import { NotificationsIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationList } from './src'
import { DataAlertsSettings } from './src'

import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAyMTgwNjAxLCAiZXhwIjogMTYwMjIwMjIwMSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiJdfQ.qFcbl1_b0_rFQjz5Jy4HpF-hkl0vSiFALDeupsRPfUVAqW1SD3N5wGHWd6gsUFDCywFJMZzBzg8o4KBkEo4nVoepgaKeA3qHxWDDDqYEALvTn6aaYbehsYxi694iWbvZzmlEFtISJuyUi1jXGmt0MPy5zvChig4KewaLiKZh31coA4O1_cDk5btb4hGvNDKdk2d_jNcCrPbxlyIA_-1yWfqlKYdqfcoAjHXzhg9gScSjxxJygUMcCa9Kgx59qyhB5CvzNd299QEMd4PuT4kr1YhZYWx2ThpNtoUBUWCAhczM1i8GwJwHHqZLYUSR-pHEM6ZVBEK6WMn5GedtJb9xUA`;
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
    placement: 'right',
    enableExploreQueriesTab: true,
    enableNotificationsTab: false
})
setTimeout(() => {
    datamessenger.setOption('queryQuickStartTopics', topics);
    datamessenger.setOption('enableNotificationsTab', true);

}, 300)
var alerts = DataAlertsSettings('#alert-settings', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    }
})

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
//
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
//
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
    // dashboard = new Dashboard('#dashboard', {
    //     authentication: {
    //         token: _token,
    //         apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
    //         domain: domain,
    //     },
    //     themeConfig: {
    //         chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    //     },
    //     autoQLConfig: {
    //         debug: true
    //     },
    //     tiles: response.data[0].data
    // })
    // dashboard.startEditing()
})
