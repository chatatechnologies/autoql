import { DataMessenger } from './DataMessenger'
import { getActiveIntegrator, getIntroMessageTopics } from './Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNTk5ODA1ODAwLCAiZXhwIjogMTU5OTgyNzQwMCwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ydWxlcyIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiJdfQ==.m1lIJjsV3Y7zQ526Ti6F6FkTWlrRcwIzyN5-TH6DRg_4smH05L63YTwBpJpdrIi2h3W8MYLecUxGRHpWvwNE4JyWQJLxF5q7hUEwUl6_407SqQ7Dw1sJLHp2h-EW99f9VEr-KBVNWEVC51ozB6xYHSqpbvG5-O569bDZz_1nOlg7W30zS9Zmun8UuON6E4deUdnpq3x2B1DX1nIrYJfzugwtifR_qp9NHpR46rIp8XscROBbL3xgVkq95Kq0fQtkK4KODGLqeWlzOkbahkAD2w0K-sTRINimpJ71XU_z2sNbYef5j4qekv1Njes9mEZT1sGJe2Ir8NaORgHlsKXVxQ==`;
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
