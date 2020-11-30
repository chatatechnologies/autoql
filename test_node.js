import { DataMessenger } from './src'
import { Dashboard } from './src'
import { NotificationIcon } from './src'
import { QueryInput } from './src'
import { QueryOutput } from './src'
import { NotificationFeed } from './src'
import { DataAlerts } from './src'
import { getSupportedDisplayTypes } from './src'

import { get, put } from 'axios';

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjA2NzA0MTIwLCAiZXhwIjogMTYwNjcyNTcyMCwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9kYXRhLWFsZXJ0cyIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiIsICIvYXV0b3FsL2FwaS92MS9kYXRhLWFsZXJ0cy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyJdfQ.enftJR_FWlrF_i2OycETXa3bZaAePAZy2QFw1TzAAKe09UmRb6tHcJ4aBLJyciLN7wP1kBl997Hl1UaC94jnBm3DwXddyBHsuOZo7-X2CEoTnTykZoP8ZpzrKVV0Tz8RoSqGOASL4bWRt1Ov4jgkgqUYJthBGQU3NndSnA7gGoByZaPQPJIbyc8zfx3sM6vJ18Kszd_Cu3OObXZrkuCu-eOwyRyJ5C5-qvm2y0G-HPOOOcHUjyc_m3OsqCSUAQWHTTIkva0dLvxGDgmm1rV2HG904miNhZRLHF6CdxjB62hw-qYzqz3GRjgdumSQs875JfvUnuW9BwckX9x4V8TsOw`;
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
        theme: 'dark',
        // accentColor: 'tomato'
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
//         theme: 'dark',
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
//     queryResponse: {
//         data: {
//             columns: [
//                 {
//                     type: "DATE",
//                     groupable: true,
//                     active: false,
//                     name: "sale__transaction_date__month",
//                 },
//                 {
//                     active: false,
//                     groupable: false,
//                     name: "sale__line_item___sum",
//                     type: "DOLLAR_AMT",
//                 },
//             ],
//             display_type: "line",
//             interpretation: "total sales by line item by transaction month",
//             query_id: "q_y4sWT0IAStWnLeM7COEsSQ",
//             rows: [
//                 [1483142400, 12500],
//                 [1488240000, 8742.68],
//                 [1490918400, 11723.36],
//                 [1493510400, 3243.12],
//                 [1496188800, 14642.19],
//             ]
//         },
//         message: "",
//         referenceId: "1.1.0",
//     },
// })
// queryInput.bind(queryOutput)
//
// setTimeout(() => {
//     queryOutput.setOption('displayType', 'table')
//     queryOutput.setOption('renderTooltips', false)
// }, 1000)
//
//
var notificationList = new NotificationFeed('#notification-list', {
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
    },
    themeConfig: {
        // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
        theme: 'dark',
    },
})

// var nButton = new NotificationIcon('#notification-icon', {
//     authentication: {
//         token: _token,
//         apiKey: apiKey,
//         domain: domain,
//     },
//     useDot: true
// })
let r;
get(DASHBOARD_URL, {
    headers: {
        'Authorization': 'Bearer ' + _token,
        'Integrator-Domain': domain
    }
}).then(function(response){
    // r = response.data.items[0]
    // console.log(response.data);
    // dashboard = new Dashboard('#dashboard-wrapper', {
    //     authentication: {
    //         token: _token,
    //         apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
    //         domain: domain,
    //     },
    //     themeConfig: {
    //         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    //         theme: 'dark',
    //         accentColor: 'red'
    //     },
    //     autoQLConfig: {
    //         debug: true
    //     },
    //     executeOnMount: true,
    //     tiles: r.data,
    //     name: r.name
    // })
    // new DashboardV2('#dashboard-wrapper2')


    // dashboard = new Dashboard('#dashboard', {
    //     authentication: {
    //         token: _token,
    //         apiKey: 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU',
    //         domain: domain,
    //     },
    //     themeConfig: {
    //         // chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    //         theme: 'dark',
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
var b3 = document.getElementById('add-widget')
var b4 = document.getElementById('undo-widget')
var b5 = document.getElementById('show-values')
var b6 = document.getElementById('save-dashboard')

b6.onclick = async () => {
    var d = {
        name: dashboard.options.name
    }
    var tiles = []
    dashboard.tiles.map(tile => tiles.push(tile.getValues()))
    d.data = tiles
    console.log(d);
    const URL = `https://backend-staging.chata.io/api/v1/dashboards/${r.id}?key=${apiKey}`
    console.log(URL);

    var response = await put(URL, d, {
        headers: {
            Authorization: `Bearer ${_token}`,
            'Integrator-Domain': domain,
        },
    })

    console.log(response.status);
}

b5.onclick = () => {
    dashboard.tiles.map(tile => console.log(tile.getValues()))
}

b4.onclick = () => {
    dashboard.undo()
}

b.onclick = () => {
    dashboard.startEditing()
}

b2.onclick = () => {
    dashboard.stopEditing()
}

b3.onclick = () => {
    dashboard.addTile({
        title: '',
        query: '',
        w: 6,
        h: 5,
    })
}
