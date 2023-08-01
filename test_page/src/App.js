import React from "react";
import { WidgetsMenu } from "./WidgetsMenu";
import { DashboardPage } from "./DashboardPage";
import { DataMessengerPage } from "./DataMessengerPage";
import { QueryOutputInputPage } from "./QueryOutputInputPage";
import { DataAlertsSettingsPage } from "./DataAlertsSettingsPage";
import { DataMessenger, NotificationIcon, configureTheme } from "autoql";
import { NotificationListPage } from "./NotificationListPage";
import { Modal, Input } from "antd";
import { isEqual, sortBy } from 'lodash'
import axios from "axios";

import "./App.css";

const getStoredProp = (name) => {
    return localStorage.getItem(name)
}

class App extends React.Component {
    datamessenger = null;
    notificationsIcon = null;

    state = {
        currentPage: "drawer",
        isLogged: false,
        modalVisible: false,
        isSavingDashboard: false,
        authentication: {
            token: "",
            domain: getStoredProp('domain-url') || '',
            apiKey: getStoredProp('api-key') || '',
        },
        themeConfig: {
            theme: "light",
            chartColors: ["#26A7E9", "#A5CD39", "#DD6A6A", "#FFA700", "#00C1B2"],
            accentColor: "#26a7df",
            fontFamily: "sans-serif",
        },
        dashboards: [],
        dashboardNames: [],
        activeDashboard: 0,
        dashboardNameInput: "",
    };

    componentDidMount = () => {
        this.renderDataMessenger();
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (!isEqual(this.state.themeConfig, prevState.themeConfig)) {
            configureTheme(this.state.themeConfig)
        }
    }

    onChangeDashboard = (val, dashboardpage) => {
        if (val !== "new-dashboard") {
            this.setState(
                {
                    activeDashboard: val,
                },
                () => {
                    var dashboardEl = document.getElementById("dashboard");
                    dashboardEl.innerHTML = "";
                    dashboardpage.instanceDashboard();
                }
            );
        } else {
            this.setState({
                modalVisible: true,
            });
        }
    };

    fetchTopics = async (values, authentication) => {
        const url = `https://backend-staging.chata.io/api/v1/topics?key=${values.apiKey}&project_id=${authentication.projectId}`;
        const topicsResponse = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${values.token}`,
                "Integrator-Domain": values.domain,
            },
        });
        this.datamessenger.setOption(
            "queryQuickStartTopics",
            topicsResponse.data.items
        );
    };

    onChangeTheme = (key, value) => {
        var themeConfig = this.state.themeConfig;
        themeConfig[key] = value;
        this.setState({ themeConfig });
    };


    onLogin = async (values, authentication) => {
        var obj = this;

        this.datamessenger.clearMessages()
        this.datamessenger.setOption("authentication", {
            ...values,
        });
        this.setState({
            isLogged: true,
            authentication: {
                ...values,
                ...authentication,
            },
        });
        this.fetchTopics(values, authentication);
        if (!this.notificationsIcon) {
            this.notificationsIcon = new NotificationIcon("#notifications-icon", {
                authentication: {
                    ...values,
                },
                useDot: false,
            });
        }

        const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${values.apiKey}`;
        axios
        .get(DASHBOARD_URL, {
            headers: {
                Authorization: "Bearer " + values.token,
                "Integrator-Domain": values.domain,
            },
        })
        .then(function (response) {
            var names = [];
            var items = response.data
            items = sortBy(
                response.data,
                (dashboard) => {
                    return new Date(dashboard.created_at)
                }
            )

            items.forEach((dashboard) => {
                names.push(dashboard.name);
            });

            obj.setState({
                dashboards: items,
                dashboardNames: names,
                activeDashboard: 0,
            });
        });
    };

    setDMOption = (propName, e) => {
        this.datamessenger.setOption(propName, e);
    };

    openDrawer = () => {
        this.datamessenger.openDrawer();
    };

    updateDashboard = (data, activeDashboard) => {
        var { dashboards } = this.state
        dashboards[activeDashboard] = data
        this.setState({
            dashboards
        })
    }

    onLogOut = () => {
        this.datamessenger.setOption('authentication', {
            domain: null,
            apiKey: null,
            token: null
        })
        this.datamessenger.clearMessages()
    }

    renderActivePage = () => {
        const { currentPage } = this.state;
        let widgetPage = null;
        switch (currentPage) {
            case "drawer":
            widgetPage = (
                <DataMessengerPage
                onLogin={this.onLogin}
                onLogOut={this.onLogOut}
                setDMOption={this.setDMOption}
                showDM={this.openDrawer}
                onChangeTheme={this.onChangeTheme}
                />
            );
            break;
            case "dashboard":
            widgetPage = (
                <DashboardPage
                onSelectDashboard={this.onChangeDashboard}
                activeDashboard={this.state.activeDashboard}
                dashboardNames={this.state.dashboardNames}
                dashboards={this.state.dashboards}
                updateDashboard={this.updateDashboard}
                authentication={this.state.authentication}
                />
            );
            break;
            case "chatbar":
            widgetPage = (
                <QueryOutputInputPage
                authentication={this.state.authentication}
                />
            );
            break;
            case "settings":
            widgetPage = (
                <DataAlertsSettingsPage
                authentication={this.state.authentication}
                />
            );
            break;
            case "notifications":
            widgetPage = (
                <NotificationListPage
                authentication={this.state.authentication}
                />
            );
            break;
            default:
        }

        return widgetPage;
    };

    renderDataMessenger = () => {
        this.datamessenger = new DataMessenger({
            authentication: {
                /* token: "",
                domain: getStoredProp('domain-url') || '',
                apiKey: getStoredProp('api-key') || '', */
                token: 'eyJ0eXAiOiAiSldUIiwgImFsZyI6ICJSUzI1NiIsICJraWQiOiAiNzUxZmYzY2YxMjA2ZGUwODJhNzM1MjY5OTI2ZDg0NTgzYjcyOTZmNCJ9.eyJpYXQiOiAxNjkwOTA5NzY5LCAiZXhwIjogMTY5MDkxMzM2OSwgImlzcyI6ICJkZW1vMy1qd3RhY2NvdW50QHN0YWdpbmctMjQ1NTE0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJ2ZXJ0aWNhLXN0YWdpbmcuY2hhdGEuaW8iLCAic3ViIjogImRlbW8zLWp3dGFjY291bnRAc3RhZ2luZy0yNDU1MTQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAiZW1haWwiOiAiZGVtbzMtand0YWNjb3VudEBzdGFnaW5nLTI0NTUxNC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsICJwcm9qZWN0X2lkIjogIkNUX29YWldIQnpueDF1NmFtTSIsICJ1c2VyX2lkIjogInZpZGh5YUBjaGF0YS5haSIsICJkaXNwbGF5X25hbWUiOiAidmlkaHlhQGNoYXRhLmFpIiwgInJlc291cmNlX2FjY2VzcyI6IFsiL2F1dG9xbC9hcGkvdjEvdGhlbWVzIiwgIi9hdXRvcWwvYXBpL3YxL3J1bGVzLyoqIiwgIi9hdXRvcWwvYXBpL3YxL3J1bGVzIiwgIi9hdXRvcWwvYXBpL3YxL2RhdGEtYWxlcnRzLyoqIiwgIi9hdXRvcWwvYXBpL3YxL3RvcGljLXNldCIsICIvYXV0b3FsL2FwaS92MS9kYXNoYm9hcmRzLyoqIiwgIi9hdXRvcWwvYXBpL3YyL3F1ZXJ5IiwgIi9hdXRvcWwvYXBpL3YxL3F1ZXJ5LyoqIiwgIi9hdXRvcWwvYXBpL3YxL2RhdGEtYWxlcnRzIiwgIi9hdXRvcWwvYXBpL3YxL2Rhc2hib2FyZHMiLCAiL2F1dG9xbC9hcGkvdjEvbm90aWZpY2F0aW9ucy8qKiIsICIvYXV0b3FsL2FwaS92MS9xdWVyeSIsICIvYXV0b3FsL2FwaS92MS8qKiJdfQ.mxdSleu5EU7FqUfZZxoetgmY-sfSEZ-bW_OXMLdtC8eKv_S6cD3ylISu9vd4NQKLaD67OK7xXt5M0QDOGMnVWCfaQgD0-xzAmdJZhSokfg01GPJMjr8pIfoFAWdeoYBWKDoWsWIQG9nooJszY4_-5m7IHHX3cd69x8QcMWmjYzIHIHWk_h8LvK7llpHhRDLGDe6swbfx1mVXV7-u3vURtAR150khO5c1IiTFciA2pHCxgXJhQ0opStCG7C9hEI4n5A3H2JsSUrQ2rLFQlE8v9phP1BMZ47j1QmlSaXKxNMBoX46plIKrq2uXQ-HiuBWynu5Gz3xL5bDW0QC5t9oywQ',
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
    };

    renderMenu = () => {
        return (
            <WidgetsMenu
            notificationButton={this.notificationsIcon}
            currentPage={this.state.currentPage}
            isLogged={this.state.isLogged}
            onClick={({ key }) => {
                this.setState({
                    currentPage: key,
                });
                if (key !== "drawer") {
                    this.datamessenger.setOption("placement", "bottom");
                } else {
                    this.datamessenger.setOption("placement", "right");
                }
            }}
            />
        );
    };

    createDashboard = async () => {
        const { dashboardNameInput, authentication, dashboards } = this.state;
        this.setState({
            isSavingDashboard: true,
        });

        const URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${authentication.apiKey}`;
        var data = {
            name: dashboardNameInput,
            project_id: authentication.projectId,
        };
        const response = await axios.post(URL, data, {
            headers: {
                Authorization: `Bearer ${authentication.token}`,
                "Integrator-Domain": authentication.domain,
            },
        });
        var names = [];

        dashboards.forEach((dashboard) => {
            names.push(dashboard.name);
        });

        names.push(response.data.name);

        this.setState({
            dashboards: [...dashboards, response.data],
            dashboardNames: names,
            activeDashboard: dashboards.length,
            isSavingDashboard: false,
            modalVisible: false,
        });
    };

    render = () => {
        return (
            <div className="App" id="test">
            {this.renderMenu()}
                <div>{this.renderActivePage()}</div>
                <div id="datamessenger"></div>
                <Modal
                    title="New Dashboard"
                    okText="Create Dashboard"
                    okButtonProps={{ disabled: !this.state.dashboardNameInput }}
                    onCancel={() => this.setState({ modalVisible: false })}
                    confirmLoading={this.state.isSavingDashboard}
                    visible={this.state.modalVisible}
                    onOk={this.createDashboard}>
                    <Input
                        placeholder="Dashboard Name"
                        value={this.state.dashboardNameInput}
                        onChange={(e) =>
                            this.setState({ dashboardNameInput: e.target.value })
                        }
                        onPressEnter={this.createDashboard}/>
                </Modal>
            </div>
        );
    };
}

export default App;
