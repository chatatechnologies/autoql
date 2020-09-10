import { DataMessenger } from './DataMessenger'
import { getActiveIntegrator, getIntroMessageTopics } from './Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNTk5Nzc3MDg1LCAiZXhwIjogMTU5OTc5ODY4NSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyJdfQ==.bFOB4iSY0equ5iwjCmjAm7lO8Sxx-faJsD5txYLtXKVSalH99rCEL0Uf6uOwYmoc6TOi38Ozznz1-Jk_rwJLFfLJ8AVyK7nZV2UBOcM4M15afOxSYulWXK71xmdFiRZP8WMP0elr1Pswxxp68lI-96cJ-aBfJ63zsga8yF8SkYTVfp0bVtsBHq2aJyJahfhhU95d2foe7K4dysTN2MX7dbg-c8Ul8zbVlomOCsOj31MZnI-W92SJB3fvyogp_ZG8hoiav0wEoUey2xV7DxTBvrTcj_I7FGf4svsmRrvkoMOJyLJjwjihAqnKqT28MkQig67BPs4jwCDQVeNETSZPjA==`;
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
