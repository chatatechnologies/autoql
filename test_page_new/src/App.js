import logo from './logo.svg';
import './App.css';
import { DataMessenger } from 'autoql';
import 'autoql/build/autoql.min.css';
function App() {
  new DataMessenger({
    authentication: {
        token: 'eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjkwNzczOTQzLCAiZXhwIjogMTY5MDc3NzU0MywgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJ2ZXJ0aWNhLXN0YWdpbmcuY2hhdGEuaW8iLCAic3ViIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAiZW1haWwiOiAiZGVtbzMtand0YWNjb3VudEBzdGFnaW5nLTI0NTUxNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsICJwcm9qZWN0X2lkIjogIkNUX29YWldIQnpueDF1NmFtTSIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvdGhlbWVzIiwgIi9hdXRvcWwvYXBpL3YxL3F1ZXJ5LyoqIiwgIi9hdXRvcWwvYXBpL3YxL2Rhc2hib2FyZHMiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvZGF0YS1hbGVydHMvKioiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjIvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvZGFzaGJvYXJkcy8qKiIsICIvYXV0b3FsL2FwaS92MS9kYXRhLWFsZXJ0cyIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS9ub3RpZmljYXRpb25zLyoqIiwgIi9hdXRvcWwvYXBpL3YxLyoqIiwgIi9hdXRvcWwvYXBpL3YxL3RvcGljLXNldCJdfQ.aXnEpw-oIDQOy8X9OhveG8ciEHR9MoBWh-pKpOegTfdgNw6IQSfITGZ0YJClm2PnBCkY3dGRJ2j8mAwnbZadiwpyDBwBGNLzYtnVGdWXRDkf4ikMEOzeSZcmeEw_PqHteu-1FHWVoHIKT1YQy7mR-EMQ_T8ARKyuU8obTiczNuzazKvcTA-EbqNO23B1q-4WvdIzjbGJfOS8jQMqDlkg9fOPwDPdOHGnN8TepF7K5OwNXvjArAOevA1WNj4kKnu7q8QVld6GPUMVlTfvyj1tQqwgj1LzvO7Sj2BcRaDKH7DNnJLVV5ljWnlaFJLk0Iyh91LNJIiqiqK_DswnvCoCkw',
        domain: 'https://vertica-staging.chata.io',
        apiKey: 'YTkxNTNjMzUtY2ZiYy00MWQxLWI4MmItMDA4ZGRlOWE2Njcy',
    },
    autoQLConfig: {
        debug: true,
    },
    onMaskClick: function (datamessenger) {
        datamessenger.closeDrawer();
    },
    resizable: true,
    width: 550,
    enableDynamicCharting: true,
    enableNotificationsTab: true,
    placement: "right",
  });
  return (
    <div className="App">

    </div>
  );
}

export default App;
