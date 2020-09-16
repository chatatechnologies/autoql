import { DataMessenger } from './src_node/DataMessenger'
import { Dashboard } from './src_node/Dashboard'
import { get } from 'axios';
import { getActiveIntegrator, getIntroMessageTopics } from './src_node/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwMjY3MDc3LCAiZXhwIjogMTYwMDI4ODY3NywgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiJdfQ==.c3cOM0yjzBgo8Q9bFRpnSjwhe4voDTctB-tode5MdAjtDj4qWkkv2iXxx7eaJxo1-GBYq4FiIu1elr_RX4yK8Ozpd9otzerD8dILd5ntiPJSIQi61Gve-YNo7jcA8oO6vEbamhnFeKOe3mGN4708oPRALKCbGS9BQ51yHIAcFPXQQgmi_Q0N3W6Dad8SBlpGdLbVRsJZmRKiOlSB5-8lwMeWmX8fvwXx7thdIUfNkEOJ92vbAUNsaZH2eVNzpPTXBGIw0IrnLuDAgrAq8gQgiJIWs1latRRCDqeIoSrjY-iGC7b5Il6S9WMcf_JgBZbufN0Zqis835mM_xOvcHtRJQ==`;
const domain = 'https://spira-staging.chata.io';
const apiKey = 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU'
const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${apiKey}`;
// const domain = 'https://purefacts-staging.chata.io';
const topics = getIntroMessageTopics(getActiveIntegrator(domain));
console.log(topics);
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

get(DASHBOARD_URL, {
    headers: {
        'Authorization': 'Bearer ' + _token,
        'Integrator-Domain': domain
    }
}).then(function(response){
    console.log(response.data[0].data);
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
})
