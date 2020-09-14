import { DataMessenger } from './src_node/DataMessenger'
import { getActiveIntegrator, getIntroMessageTopics } from './src_node/Utils'

var _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwMTExMjM4LCAiZXhwIjogMTYwMDEzMjgzOCwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9ydWxlcy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeS8qKiJdfQ==.hIPStRrVAUYfIV64ewo9fHdisRkXW_F1tzbtM79B7TrWxaS5C-vs6Kq4TOe53j0XWZK9M1WCL3-ayo1ooSC3L1CF-dBTuUAWKPXJV7aG0aUBGeVs5E26pW700tcx59J034YZKZFUWFBUeZGYpTgNhyPaQZifyLV6PTi-KFsTB6CIuM9QvU8EqjJFzT51U9pmO1OCJfA-sfWU3Wr3Q-Al0kY7p5ZJFvVPF5WBGt29qfymVdHai6OEBLN1Rn-cP589MZMt7PTbZXI8GT2Kx19pr8p31cL2tVt0REimHWvqQxvxbJ5PDqj_9FRcv_K2-vID1C-mOhBdSks5NDPh_DZQig==`;
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
