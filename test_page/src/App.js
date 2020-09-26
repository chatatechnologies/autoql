import React from 'react'
import { WidgetsMenu } from './WidgetsMenu'
import { DashboardPage } from './DashboardPage'
import { DataMessengerPage } from './DataMessengerPage'
import { QueryOutputInputPage } from './QueryOutputInputPage'
import { DataAlertsSettingsPage } from './DataAlertsSettingsPage'
import { DataMessenger } from 'autoql'
import { NotificationsIcon } from 'autoql'
import { NotificationListPage } from './NotificationListPage'

import { getActiveIntegrator, getIntroMessageTopics } from './Utils'


class App extends React.Component{

    datamessenger = null
    notificationsIcon = null

    state = {
        currentPage: 'drawer',
        isLogged: false,
        authentication: {
            token: '',
            domain: '',
            apiKey: ''
        }
    }

    componentDidMount = () => {
        this.renderDataMessenger()
    }

    onLogin = (values) => {
        this.datamessenger.setOption('authentication', {
            ...values
        })
        this.setState({
            isLogged: true,
            authentication: {
                ...values
            }
        })
        const topics = getIntroMessageTopics(getActiveIntegrator(
            this.datamessenger.options.authentication.domain
        ))
        this.datamessenger.setOption('queryQuickStartTopics', topics)
        this.notificationsIcon = new NotificationsIcon('#notifications-icon', {
            authentication: {
                ...values
            },
            useDot: true
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
                widgetPage =
                    <DashboardPage
                    authentication={this.state.authentication}/>
                break
            case 'chatbar':
                widgetPage =
                    <QueryOutputInputPage
                    authentication={this.state.authentication}/>
                break
            case 'settings':
                widgetPage =
                    <DataAlertsSettingsPage
                    authentication={this.state.authentication}/>
                break
            case 'notifications':
                widgetPage =
                    <NotificationListPage
                    authentication={this.state.authentication}/>
                break
            default:
        }

        return widgetPage
    }

    renderDataMessenger = () => {
        this.datamessenger = new DataMessenger('#datamessenger', {
            authentication: {
                token: '',
                apiKey: '',
                domain: '',
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
        return (
            <WidgetsMenu
            notificationButton={this.notificationsIcon}
            currentPage={this.state.currentPage}
            isLogged={this.state.isLogged}
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
