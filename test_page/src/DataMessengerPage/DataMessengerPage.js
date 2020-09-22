import React, { Component } from 'react';
import { AuthenticationForm } from '../AuthenticationForm'
import {
    Switch,
    Button,
    Radio
} from 'antd'
import {
    ReloadOutlined,
    MenuFoldOutlined
} from '@ant-design/icons'
import './DataMessengerPage.css'

export class DataMessengerPage extends Component {

    state = {
        uiOverlay: false,
        isVisible: false,
        placement: 'right',
        showHandle: true,
        theme: 'light',
        response: null,
        showMask: true,
        shiftScreen: false,
        userDisplayName: 'Oscar',
        introMessage: undefined,
        enableAutocomplete: true,
        enableQueryValidation: true,
        enableQuerySuggestions: true,
        enableDrilldowns: true,
        enableExploreQueriesTab: true,
        enableNotificationsTab: true,
        enableNotifications: true,
        enableColumnVisibilityManager: true,
        enableVoiceRecord: true,
        dashboardTitleColor: 'rgb(72, 105, 142)',
        clearOnClose: false,
        height: 500,
        width: 550,
        title: 'Data Messenger',
        lightAccentColor: '#26a7df',
        // lightAccentColor: '#2466AE',
        dashboardBackground: '#fafafa',
        darkAccentColor: '#525252',
        maxMessages: 12,
        isEditing: false,
        debug: true,
        test: true,
        currencyCode: 'USD',
        languageCode: 'en-US',
        currencyDecimals: undefined,
        quantityDecimals: undefined,
        fontFamily: 'sans-serif',
        runDashboardAutomatically: false,
        comparisonDisplay: true,
        chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
        monthFormat: 'MMM YYYY',
        dayFormat: 'll',
        dashboardTiles: [],
        activeDashboardId: undefined,
        enableDynamicCharting: true,
        defaultTab: 'data-messenger',
    }

    onChangeRadioGroup = (propName, e) => {
        this.setState({ [propName]: e })
    }

    onChangeDMProp = (propName, e) => {
        console.log(propName);
        this.setState({ [propName]: e })
    }

    createBooleanRadioGroup = (
        title, propName,
        propValues = [], onChange=this.onChangeRadioGroup) => {
        return (
            <div>
                <h4>{title}</h4>
                <Switch
                defaultChecked={this.state[propName]}
                checked={this.state[propName] === true}
                onChange={(e) => {
                    onChange(propName, e)
                }}
                />
            </div>
        )
    }

    createRadioInputGroup = (title, propName, propValues = [], reload) => {
        return (
            <div>
            <h4>{title}</h4>
            {reload && <h6>(Must click 'Reload Data Messenger' to apply this)</h6>}
            <Radio.Group
            defaultValue={this.state[propName]}
            onChange={(e) => this.setState({ [propName]: e.target.value })}
            buttonStyle="solid"
            >
            {propValues.map((propValue) => {
                return (
                    <Radio.Button value={propValue} key={`${propName}-${propValue}`}>
                    {propValue.toString()}
                    </Radio.Button>
                )
            })}
            </Radio.Group>
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
                <h2>AutoQL API Configuration Options</h2>
                {this.createBooleanRadioGroup(
                    'Enable Autocomplete',
                    'enableAutocomplete',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Query Validation',
                    'enableQueryValidation',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Query Suggestions',
                    'enableQuerySuggestions',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup('Enable Drilldowns', 'enableDrilldowns', [
                    true,
                    false,
                    this.onChangeDMProp
                ])}
                {this.createBooleanRadioGroup(
                    'Enable Column Visibility Editor',
                    'enableColumnVisibilityManager',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Notifications',
                    'enableNotifications',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Debug Mode - Show copy to SQL button in message toolbar',
                    'debug',
                    [true, false],
                    this.onChangeDMProp
                )}
                <h2>UI Configuration Options</h2>
                {this.createBooleanRadioGroup(
                    'Show Data Messenger Button',
                    'showHandle',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Shift Screen on Open/Close',
                    'shiftScreen',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Darken Background Behind Data Messenger',
                    'showMask',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createRadioInputGroup('Theme', 'theme', ['light', 'dark'])}
                {this.createRadioInputGroup('Data Messenger Placement', 'placement', [
                    'top',
                    'bottom',
                    'left',
                    'right',
                ])}
                {this.createRadioInputGroup(
                    'Default Tab',
                    'defaultTab',
                    ['data-messenger', 'explore-queries'],
                    true,
                )}
            </div>
        )
    }

}
