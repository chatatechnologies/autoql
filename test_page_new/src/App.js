import logo from './logo.svg';
import './App.css';
import { DataMessenger } from 'autoql';

function App() {
  new DataMessenger({
    authentication: {
        token: '',
        domain: '',
        apiKey: '',
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
