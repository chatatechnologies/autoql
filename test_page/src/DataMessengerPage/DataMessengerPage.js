import React, { Component } from 'react';
import { AuthenticationForm } from '../AuthenticationForm'
import {
    Switch,
    Button
} from 'antd'
import {
    ReloadOutlined,
    MenuFoldOutlined
} from '@ant-design/icons'
import './DataMessengerPage.css'

export class DataMessengerPage extends Component {

    state = {
        uiOverlay: false
    }

    createBooleanRadioGroup = (title, propName, propValues = []) => {
        return (
            <div>
                <h4>{title}</h4>
                <Switch
                defaultChecked={this.state[propName]}
                checked={this.state[propName] === true}
                onChange={(e) => {
                    this.setState({ [propName]: e })
                }}
                />
            </div>
        )
    }

    render = () => {
        return (
            <div className="props-page">
                <h1>Authentication</h1>
                <AuthenticationForm onLogin={this.props.onLogin}/>
                {this.createBooleanRadioGroup('Show UI Overlay', 'uiOverlay', [
                    true,
                    false,
                ])}
                <h1>Customize Widgets</h1>
                <Button
                onClick={this.reloadDataMessenger}
                style={{ marginRight: '10px' }}
                icon={<ReloadOutlined />}>
                    Reload Data Messenger
                </Button>
                <Button
                onClick={() => this.setState({ isVisible: true })}
                type="primary"
                icon={<MenuFoldOutlined />}>
                    Open Data Messenger
                </Button>
            </div>
        )
    }

}
