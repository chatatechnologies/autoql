import React from "react";
import { WidgetsMenu } from "./WidgetsMenu";
import { DashboardPage } from "./DashboardPage";
import { DataMessengerPage } from "./DataMessengerPage";
import { QueryOutputInputPage } from "./QueryOutputInputPage";
import { DataAlertsSettingsPage } from "./DataAlertsSettingsPage";
import { DataMessenger } from "autoql";
import { NotificationIcon } from "autoql";
import { NotificationListPage } from "./NotificationListPage";
import { Modal, Input } from "antd";
import _ from 'lodash'
import "./App.css";
import axios from "axios";

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
        this.setState({
            themeConfig: {
                ...themeConfig,
            },
        });
    };

    onLogin = (values, authentication) => {
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
            console.log(items);
            items = _.sortBy(
                response.data,
                (dashboard) => {
                    return new Date(dashboard.created_at)
                }
            )

            items.map((dashboard) => {
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
                themeConfig={this.state.themeConfig}
                />
            );
            break;
            case "chatbar":
            widgetPage = (
                <QueryOutputInputPage
                authentication={this.state.authentication}
                themeConfig={this.state.themeConfig}
                />
            );
            break;
            case "settings":
            widgetPage = (
                <DataAlertsSettingsPage
                authentication={this.state.authentication}
                themeConfig={this.state.themeConfig}
                />
            );
            break;
            case "notifications":
            widgetPage = (
                <NotificationListPage
                authentication={this.state.authentication}
                themeConfig={this.state.themeConfig}
                />
            );
            break;
            default:
        }

        return widgetPage;
    };

    renderDataMessenger = () => {
        this.datamessenger = new DataMessenger("#datamessenger", {
            authentication: {
                token: "",
                domain: getStoredProp('domain-url') || '',
                apiKey: getStoredProp('api-key') || '',
            },
            themeConfig: {
                ...this.props.themeConfig,
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
                window.dispatchEvent(new CustomEvent('chata-resize', {}));
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

        dashboards.map((dashboard) => {
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
            onOk={this.createDashboard}
            >
            <Input
            placeholder="Dashboard Name"
            value={this.state.dashboardNameInput}
            onChange={(e) =>
                this.setState({ dashboardNameInput: e.target.value })
            }
            onPressEnter={this.createDashboard}
            />
            </Modal>
            </div>
        );
    };
}

export default App;
