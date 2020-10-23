import React from 'react'
import { WidgetsMenu } from './WidgetsMenu'
import { DashboardPage } from './DashboardPage'
import { DataMessengerPage } from './DataMessengerPage'
import { QueryOutputInputPage } from './QueryOutputInputPage'
import { DataAlertsSettingsPage } from './DataAlertsSettingsPage'
import { DataMessenger } from 'autoql'
import { NotificationIcon } from 'autoql'
import { NotificationListPage } from './NotificationListPage'
import './App.css'
import axios from 'axios'


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
        themeConfig: {
            theme: 'light',
            chartColors: [
                '#26A7E9', '#A5CD39',
                '#DD6A6A', '#FFA700',
                '#00C1B2'
            ],
            accentColor: '#26a7df',
            fontFamily: 'sans-serif',
        },
        dashboards: [],
        dashboardNames: [],
        activeDashboard: 0,
    }

    componentDidMount = () => {
        this.renderDataMessenger()
    }

    onChangeDashboard = (val, dashboardpage) => {
        this.setState({
            activeDashboard: val
        }, () => {
            var dashboardEl = document.getElementById('dashboard')
            dashboardEl.innerHTML = '';
            dashboardEl.classList.remove('muuri')
            dashboardpage.instanceDashboard()
        })
    }

    fetchTopics = async (values, authentication) => {
        const url = `https://backend-staging.chata.io/api/v1/topics?key=${values.apiKey}&project_id=${authentication.projectId}`
        const topicsResponse = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${values.token}`,
                'Integrator-Domain': values.domain,
            },
        })
        this.datamessenger.setOption('queryQuickStartTopics', topicsResponse.data.items)

    }

    onChangeTheme = (key, value) => {
        var themeConfig = this.state.themeConfig
        themeConfig[key] = value
        this.setState({
            themeConfig: {
                ...themeConfig
            }
        })
    }

    onLogin = (values, authentication) => {
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
        // const topics = getIntroMessageTopics(getActiveIntegrator(
        //     this.datamessenger.options.authentication.domain
        // ))
        this.fetchTopics(values, authentication)
        if(!this.notificationsIcon){
            this.notificationsIcon = new NotificationIcon('#notifications-icon', {
                authentication: {
                    ...values
                },
                useDot: false
            })
        }

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
                    showDM={this.openDrawer}
                    onChangeTheme={this.onChangeTheme}/>
                break
            case 'dashboard':
                widgetPage =
                    <DashboardPage
                    onSelectDashboard={this.onChangeDashboard}
                    activeDashboard={this.state.activeDashboard}
                    dashboardNames={this.state.dashboardNames}
                    dashboards={this.state.dashboards}
                    authentication={this.state.authentication}
                    themeConfig={this.state.themeConfig}/>
                break
            case 'chatbar':
                widgetPage =
                    <QueryOutputInputPage
                    authentication={this.state.authentication}
                    themeConfig={this.state.themeConfig}/>
                break
            case 'settings':
                widgetPage =
                    <DataAlertsSettingsPage
                    authentication={this.state.authentication}
                    themeConfig={this.state.themeConfig}/>
                break
            case 'notifications':
                widgetPage =
                    <NotificationListPage
                    authentication={this.state.authentication}
                    themeConfig={this.state.themeConfig}/>
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
                ...this.props.themeConfig
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
            enableNotificationsTab: true,
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
