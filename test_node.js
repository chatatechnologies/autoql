import { DataMessenger } from './src'
import { Dashboard } from './src'
import { NotificationsIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationList } from './src'
import { DataAlertsSettings } from './src'
import { getSupportedDisplayTypes } from './src'

import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAyODk0MjIxLCAiZXhwIjogMTYwMjkxNTgyMSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkvKioiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiJdfQ.vQ5JwCO-HqTa8Jp3ly5YKZ_tDx9UcZATG-4Al0PPbgWuWjdqx081-YzVHFiCrx-s47RdqfQ96RR4-QjiRhY8sCGr6266xqWLa3jwALSBp1X97IFrZunESXE4unmmj6PNKd_iYBJHJbMXl174bWwtE95V-Pi_splXV20ZFYfJ36vP8sqGCKmw0ek2KsIhGF92kQpq-5MjE9jm1Eg-9K1K9J5MB_jPUudU2zZWOlrdgDT1XZED-z9u2UVqbj9rmvthMrfL-fBP3yxHogujNP7rLnw4QSmFPG68mH8tXwwZaJeseOW_asbajIB3t-QGpMPdJVwwWEb7Jwnw4WaV5KmZ9A`;
const domain = 'https://spira-staging.chata.io';
const apiKey = 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU'
const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${apiKey}`;
// const topics = getIntroMessageTopics(getActiveIntegrator(domain));
let dashboard;
var datamessenger = new DataMessenger('#datamessenger', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    },
    themeConfig: {
        // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
        theme: 'dark',
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
    enableExploreQueriesTab: true,
    enableNotificationsTab: true
})
setTimeout(() => {
    // datamessenger.setOption('queryQuickStartTopics', topics);
    // datamessenger.setOption('enableNotificationsTab', true);

}, 300)


// var alerts = DataAlertsSettings('#alert-settings', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     themeConfig: {
//         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
//         theme: 'dark',
//     },
// })

var queryInput = new QueryInput('#query-input', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    },
    autoCompletePlacement: 'bottom',
});

var queryOutput = new QueryOutput('#query-output', {
    displayType: 'line',
})
queryInput.bind(queryOutput)
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
//     },
//     themeConfig: {
//         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
//         theme: 'dark',
//     },
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
    // dashboard = new Dashboard('#dashboard', {
    //     authentication: {
    //         token: _token,
    //         apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
    //         domain: domain,
    //     },
    //     themeConfig: {
    //         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    //         theme: 'dark'
    //     },
    //     autoQLConfig: {
    //         debug: true
    //     },
    //     tiles: response.data[0].data
    // })
    // dashboard.startEditing()
})
