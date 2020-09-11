import { DataMessenger } from './src_node/DataMessenger'
import { getActiveIntegrator, getIntroMessageTopics } from './src_node/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNTk5ODUxODczLCAiZXhwIjogMTU5OTg3MzQ3MywgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyJdfQ==.kbeQmbHUXfXhkllhrCcmxD7A1aCaO91hqikVv6t1JIV2SBdTl2mc8L3bFgrrxG3qUUOJXVJwk7SKtUbyRfN6A1KM-eLoQQOCBwVExyEb8CthS0-ma13-oTBgysVezt5itigEscqaCZl4myKoONSgdgC75pho3Ut-wnHbahQACsqCdQL9SbLZeA3Pq_1VZCtzN4_QtY3_uBOaX18xvuiEglwz1VdFCtugMlfTFrjH7sYygy96uFpsrAuAzTXvyCRUWyMosISEW8gEPQepW4YUF5JEB4QIeYQqt3hUX9wzZnrQgVWkh8knMEW-m4-wdGf75420jDSR3lua8FtP22YY1A==`;
const domain = 'https://spira-staging.chata.io';
// const domain = 'https://purefacts-staging.chata.io';
const topics = getIntroMessageTopics(getActiveIntegrator(domain));
console.log(topics);

var datamessenger = new DataMessenger('#datamessenger', {
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
