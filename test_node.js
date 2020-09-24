import { DataMessenger } from './src'
import { Dashboard } from './src'
import { NotificationsIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationList } from './src'
import { DataAlertsSettings } from './src'

import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwOTcyMDEyLCAiZXhwIjogMTYwMDk5MzYxMiwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSJdfQ==.thv3r81PpwhqrLs5Fk_62LWrkVSTaleH_xDvjWk2adukuYfIgaNaMmWOJ-8KzyEJLsYWJt8VMnHYID98PiDSdAdXusle1vPCC7z6J4r6HuMJfrlzI32emg8jmpakC4JMdpeFKw1pLliGPh4kpQlDnoYJaNu1J_oui8wAxMJksSpLeWocL72Fi_o2t5m6f5oU3dL-Wu__9eOa-QGdek9XpayL6rszKSU_-MS9iQJERqJaAfbtOG_ZANe08OpUdV9d6jY5W6lyl4Ksfh_TUDOQ3KdnAYpkGa9jHoIkOrj_vMAWxjyzFJrjmjI0CjwRkuOtNxhxEnERNnnrrc4zTAgXRA==`;
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
        accentColor: '#d93529'
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
    datamessenger.setOption('queryQuickStartTopics', topics);
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

var notificationList = new NotificationList('#notification-list', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    },
    showNotificationDetails: true,
    onExpandCallback: (notification) => {
        console.log(notification);
    },
    onCollapseCallback: (notification) => {
        console.log(notification);
    }
})

// var nButton = new NotificationsIcon('#notification-icon', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
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
