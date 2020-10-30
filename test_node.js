import { DataMessenger } from './src'
import { Dashboard } from './src'
import { Dashboard as DashboardV2 } from './src/DashboardV2/Dashboard'
import { NotificationIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationFeed } from './src'
import { DataAlerts } from './src'
import { getSupportedDisplayTypes } from './src'

import { get } from 'axios';

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjA0MDQyODc5LCAiZXhwIjogMTYwNDA2NDQ3OSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcXVlcnkvKioiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiJdfQ.jHacNNPRn21wNBbVWJxBY6amuGw0Nc_ek-pgR0qtVFlq10m354JKp0umYauFw-38ZzhmKoPTRq8qp1zJ2knjsS7oLtRZPNZFZAnXpXcAZLnVJA3V9giLdRRQ7Lu9q2v9VB-v8JUCF6_tk9ZBEzWTWi9DAHYdnfmN21wzXqxwJj6Q0eHuAkCNoTlsauAjVbD55YzMaBA0Ird2H3rmGXz0nyFSfqkbjVBTxK4gX3yqsq4DNkUZHyl6Z0n8YtnnPVMg9IWVU5uNFJ-oR7isvoCSTkLoddFcmznhwySMto8GrmbAwIRcEqzubHlPWuUgqNmDIfigCeQlMw7KPCkrJ2Eslw`;
const domain = 'https://spira-staging.chata.io';
const apiKey = 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU'
const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${apiKey}&project_id=spira-demo3`;
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
        theme: 'light',
        accentColor: 'tomato'
    },
    autoQLConfig: {
        debug: true,
        enableDrilldowns: true
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
    datamessenger.setOption('queryQuickStartTopics', [{
            topic: 'Test',
            queries: ['test1', 'test2']
        },
        {
            topic: 'Test2',
            queries: ['test3', 'test4']
        },
        {
            topic: 'Test3',
            queries: ['test5', 'test6']
        },

    ]);
    // datamessenger.setOption('enableNotificationsTab', true);

}, 300)


// var alerts = DataAlerts('#alert-settings', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     themeConfig: {
//         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
//         theme: 'light',
//     },
// })
//
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
//
// setTimeout(() => {
//     queryOutput.setOption('displayType', 'table')
//     queryOutput.setOption('renderTooltips', false)
// }, 1000)
//
// queryInput.bind(queryOutput)
//
// var notificationList = new NotificationFeed('#notification-list', {
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
//         theme: 'light',
//     },
// })

// var nButton = new NotificationIcon('#notification-icon', {
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

    dashboard = new DashboardV2('#dashboard-wrapper', {
        authentication: {
            token: _token,
            apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
            domain: domain,
        },
        themeConfig: {
            // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
            theme: 'light',
            accentColor: 'red'
        },
        autoQLConfig: {
            debug: true
        },
        executeOnMount: false,
        tiles: response.data.items[9].data
    })
    console.log(response.data.items[9].data);
    // new DashboardV2('#dashboard-wrapper2')


    // dashboard = new Dashboard('#dashboard', {
    //     authentication: {
    //         token: _token,
    //         apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
    //         domain: domain,
    //     },
    //     themeConfig: {
    //         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    //         theme: 'light',
    //         accentColor: 'red'
    //     },
    //     autoQLConfig: {
    //         debug: true
    //     },
    //     executeOnMount: false,
    //     tiles: response.data[0].data
    // })
    // dashboard.startEditing()
})


var b = document.getElementById('edit')
var b2 = document.getElementById('edit-stop')

b.onclick = () => {
    dashboard.startEditing()
}

b2.onclick = () => {
    dashboard.stopEditing()
}
