import { DataMessenger } from './src_node/DataMessenger'
import { getActiveIntegrator, getIntroMessageTopics } from './src_node/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwMDQ0MTc3LCAiZXhwIjogMTYwMDA2NTc3NywgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiJdfQ==.rkNneZI1TGqUYDJi1eK5xhbO_5cOEbTbrCxoLv_qgtM6yh2Uknd6WLwxA2vjkC6NxNvPvaO5xk1pVRF3gGWnPA2bDSoy9qynaJ4V-48VRuMuwTg3gdVVIy-eUaFqAjbQnakEz74eU4Y0yDMfobtOSewCtnjuZCRDDSzBvj7lnX2m1z6tmlnY_j23tIx7nZ79ahzu35-uWKOQ8WukO-VXelingRQVrpTj6ZdrYVFH6hxasP8BG41Pgd8jAIW3UlyMiarthV5_e_uWbQ6KaV7N_UvgIMngTNlGsA75HzIWav8Pryjdk5oNjb7yJwErdnHNftg0V9eXWv15b9soQxx7NQ==`;
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
