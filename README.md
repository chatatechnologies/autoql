<h1 align="center"><img src="public/autoql-logo.png" style="text-align: center; width: 400px"/></h1>
<h3 align="center"><b>Vanilla JS Components for AutoQL</b></h3>
<!-- [![Coverage](coverage/badge.svg)]() -->

# Documentation

Full documentation can be found [here](https://chata.readme.io/docs/vanilla-components)

# Demo

A live demo can be found [here](https://vanilla-autoql.herokuapp.com/)

# Components

### DataMessenger

Deliver the power of AutoQL to your users through Data Messenger, a state-of-the-art conversational interface you can easily build into your existing application.

<img src="public/data-messenger.png" width="400px">

### Dashboard

Democratize the data in your application and deliver extended reporting and analytics capabilities to all your users with Dashboards you can build and deploy in a snap.

<img src="public/dashboard.png" width="400px">

### QueryInput

Query Input is an input box component that can be placed anywhere in the DOM. The QueryInput component works together with the QueryOutput component to automatically handle certain interactions with the data.

<img src="public/query-input.png" width="400px">

### QueryOutput

Query Output is a data visualization widget that accepts the response from our API's query endpoint.

<img src="public/query-output.jpg" width="400px">

# Quick Start

Using npm:

```
$ npm install autoql
```

Import the widget

```
import { DataMessenger } from 'autoql';
```

Instance the widget

```
var datamessenger = new DataMessenger('#datamessenger', {
    authentication: {
        apiKey: "your-api-key",
        domain: "https://yourdomain.com",
        token: "yourToken"
    },
    themeConfig: {
        chartColors: [
            '#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'
        ],
    },
    autoQLConfig: {
        debug: true
    },
    onMaskClick: function(datamessenger){
        datamessenger.closeDrawer()
    },
    resizable: true,
    width: 550,
    enableDynamicCharting: true,
    placement: 'right'
})
```

Dashboard Example

```
import { Dashboard } from 'autoql';
```
Mount Dashboard

```
var dashboard = new Dashboard('#dashboard', {
    authentication: {
        apiKey: "your-api-key",
        domain: "https://yourdomain.com",
        token: "yourToken"
    },
    themeConfig: {
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
    },
    autoQLConfig: {
        debug: true
    },
    tiles: arrayOfTiles
})
```
