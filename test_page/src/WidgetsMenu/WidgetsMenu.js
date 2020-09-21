import React, { Component } from 'react';
import {
    Menu
} from 'antd'

export class WidgetsMenu extends Component{

    state = {
        currentPage: 'drawer'
    }

    render = () => {
        return (
            <Menu
            onClick={({key}) => {
                this.setState({
                    currentPage: key
                })
            }}
            selectedKeys={[this.state.currentPage]}
            mode="horizontal">
                <Menu.Item key="drawer">
                    Data Messenger
                </Menu.Item>
                <Menu.Item key="dashboard">
                    Dashboard
                </Menu.Item>
                <Menu.Item key="chatbar">
                    QueryInput / QueryOutput
                </Menu.Item>
                <Menu.Item key="settings">
                    Notification Settings
                </Menu.Item>
                <Menu.Item key="notifications">

                </Menu.Item>
            </Menu>
        )
    }

}
