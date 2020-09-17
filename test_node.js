import { DataMessenger } from './src_node/DataMessenger'
import { Dashboard } from './src_node/Dashboard'
import { NotificationsIcon } from './src_node/Notifications'
import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src_node/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwMzE2MTIxLCAiZXhwIjogMTYwMDMzNzcyMSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiJdfQ==.oiq-5dtNuaq-pqspupHjStWN13rq_karASw4AvWNGHm2fw27VkDAbkedVPuVu9NuNehcHDrsGA7BnHjHi5CsZgP7ljVv4uh-0kabk6L6Yvv2m7QEzbTco6Yv3IHYyY4p93qxNJF27EQ7pM3hC2-rXS996K6Km4S8PyNxJUE7xYyjhxjUyvDYPiG1Z-UBbb4scfhtJl_fEi6onS2DzbzYoqltZBUtFJEp6OFbr2NX_K6wxa6hwIYLxhNBAq7P06Pzx5DRtfLbEf6BPyQHWqeycE7thznuAZbBmbsKnNkpdP8EkFQGrjMVG9DeIUb9dcEMUYv0-OaQhp6tj-dYfTBr9Q==`;
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
    queryQuickStartTopics: topics,
    enableDynamicCharting: true,
    placement: 'right'
})

var nButton = new NotificationsIcon('#notification-icon', {
    authentication: {
        token: _token,
        apiKey: apiKey,
        domain: domain,
    },
})

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
