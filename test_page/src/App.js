import React from 'react'
import { WidgetsMenu } from './WidgetsMenu'
import { DashboardPage } from './DashboardPage'
import { DataMessengerPage } from './DataMessengerPage'
import { QueryOutputInputPage } from './QueryOutputInputPage'
import { DataAlertsSettingsPage } from './DataAlertsSettingsPage'
import { DataMessenger } from 'autoql'
import { NotificationsIcon } from 'autoql'
import { NotificationListPage } from './NotificationListPage'
import axios from 'axios'

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
        },
        dashboards: [],
        dashboardNames: [],
        activeDashboard: 0,
    }

    componentDidMount = () => {
        this.renderDataMessenger()
    }

    onChangeDashboard = (val) => {
        this.setState({
            activeDashboard: val
        })
    }

    onLogin = (values) => {
        var obj = this
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
            useDot: false
        })

        const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${values.apiKey}`
        axios.get(DASHBOARD_URL, {
            headers: {
                'Authorization': 'Bearer ' + values.token,
                'Integrator-Domain': values.domain
            }
        }).then(function(response){
            var names = [];
            response.data.map(dashboard => {
                names.push(dashboard.name)
            })

            obj.setState({
                dashboards: response.data,
                dashboardNames: names,
                activeDashboard: 0
            })
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
                    onSelectDashboard={this.onChangeDashboard}
                    activeDashboard={this.state.activeDashboard}
                    dashboardNames={this.state.dashboardNames}
                    dashboards={this.state.dashboards}
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
