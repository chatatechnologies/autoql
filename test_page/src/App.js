import React from 'react'
import { WidgetsMenu } from './WidgetsMenu'
import { DashboardPage } from './DashboardPage'
import { DataMessengerPage } from './DataMessengerPage'
import { DataMessenger } from 'vanilla-autoql'

class App extends React.Component{
    _token =  `eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjAwMzk0NzI1LCAiZXhwIjogMTYwMDQxNjMyNSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJkZW1vMy1zdGFnaW5nLmNoYXRhLmlvIiwgInN1YiI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImVtYWlsIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAicHJvamVjdF9pZCI6ICJzcGlyYS1kZW1vMyIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvcXVlcnkvKioiLCAiL2F1dG9xbC9hcGkvdjEvcXVlcnkiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMiLCAiL2F1dG9xbC9hcGkvdjEvcnVsZXMvKioiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiJdfQ==.VB69X0QXkd57U7v66aAO8B4zZsrxL472mz6KbLeKme-ZN7T5_UHzPRQBBuVH2_B-VdCrUsP-IwPj04qspmnaLcCvCC3kILeCaBzRHn8ZO0tSZvtzPqOnCvlAn7bQk7UMkVvbFU1qd0L2x-fblZC_DzRNn7DUM4Qz8AaoG4QLLsX5ruNqru30QaurpBxxAlTcyw2nW1CQ869EusbzQsJF2g6DSI4aWD6qFwwlUns7vjQAeRAjtmR8IbfqRHOm2Bjg1--fybxmQS5xxyKobifSgXlr_70Z30UiHd9dQSrtsh4_9qQmTwTcVarcTbRpQPo9R9AoIeNCKErKmSUVA592Kw==`
    domain = 'https://spira-staging.chata.io';
    apiKey = 'AIzaSyD4ewBvQdgdYfXl3yIzXbVaSyWGOcRFVeU'
    datamessenger = null

    state = {
        currentPage: 'drawer'
    }

    componentDidMount = () => {
        this.renderDataMessenger()
    }

    onLogin = (values) => {
        this.datamessenger.setOption('authentication', {
            ...values
        })
    }

    setDMOption = (propName, e) => {
        this.datamessenger.setOption(propName, e)
    }

    openDrawer = () => {
        this.datamessenger.openDrawer()
    }

    renderActivePage = () => {
        const { currentPage } = this.state
        let widgetPage = null
        switch (currentPage) {
            case 'drawer':
                widgetPage =
                <DataMessengerPage
                    onLogin={this.onLogin}
                    setDMOption={this.setDMOption}
                    showDM={this.openDrawer}/>
                break
            case 'dashboard':
                widgetPage = <DashboardPage/>
                break
            default:
        }

        return widgetPage
    }

    renderDataMessenger = () => {
        this.datamessenger = new DataMessenger('#datamessenger', {
            authentication: {
                token: this._token,
                apiKey: this.apiKey,
                domain: this.domain,
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
    }

    renderMenu = () => {
        return (<WidgetsMenu
            currentPage={this.state.currentPage}
            onClick={({key}) => {
                this.setState({
                    currentPage: key
                })
                if(key !== 'drawer'){
                    this.datamessenger.setOption('placement', 'bottom')
                }else{
                    this.datamessenger.setOption('placement', 'right')
                }
        }}/>)
    }

    render = () => {
        return (
            <div className="App" id="test">
                {this.renderMenu()}
                <div>
                {this.renderActivePage()}
                </div>
                <div id="datamessenger"></div>
            </div>
        )
    }

}

export default App
