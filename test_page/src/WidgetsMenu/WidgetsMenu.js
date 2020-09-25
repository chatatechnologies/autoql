import React, { Component, Fragment } from 'react'
import {
    Menu
} from 'antd'
import './WidgetsMenu.css'

export class WidgetsMenu extends Component{

    render = () => {
        return (
            <Fragment>
                <Menu
                onClick={this.props.onClick}
                selectedKeys={[this.props.currentPage]}
                mode="horizontal">
                    <Menu.Item key="drawer">
                        Data Messenger
                    </Menu.Item>
                    <Menu.Item
                    key="dashboard"
                    className={this.props.isLogged ? '' : 'chata-hidden'}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item
                        key="chatbar"
                        className={this.props.isLogged ? '' : 'chata-hidden'}>
                        QueryInput / QueryOutput
                    </Menu.Item>
                    <Menu.Item
                        key="settings"
                        className={this.props.isLogged ? '' : 'chata-hidden'}>
                        Notification Settings
                    </Menu.Item>
                    <Menu.Item key="notifications"
                    id="notifications-icon"
                    className={this.props.isLogged ? '' : 'chata-hidden'}>
                    </Menu.Item>
                </Menu>
            </Fragment>
        )
    }

}
