import React, { Component } from 'react';
import { AuthenticationForm } from '../AuthenticationForm'
import {
    Switch,
    Button,
    Radio,
    Input,
    InputNumber
} from 'antd'
import { sortable } from 'react-sortable'
import { Item } from './Item'
import {
    ReloadOutlined,
    MenuFoldOutlined,
    CloseOutlined
} from '@ant-design/icons'
import './DataMessengerPage.css'

const SortableItem = sortable(Item)

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

    renderChartColorsList = () => {
        const { chartColors } = this.state
        var listItems = chartColors.map((item, i) => {
            return (
                <SortableItem
                key={i}
                onSortItems={this.onSortChartColors}
                items={chartColors}
                sortId={i}
                >
                {item}
                <CloseOutlined
                style={{ float: 'right', cursor: 'pointer', marginTop: '3px' }}
                onClick={() => {
                    const newChartColors = this.state.chartColors.filter(
                        (color) => color !== item
                    )
                    this.setState({ chartColors: newChartColors })
                    this.props.setDMOption('themeConfig', {
                        chartColors: newChartColors
                    })
                }}
                />
                </SortableItem>
            )
        })
        return (
            <div>
                <ul
                style={{ padding: 0, marginBottom: '3px' }}
                className="sortable-list">
                    {listItems}
                </ul>
                <Input
                placeholder="New Color"
                value={this.state.newColorInput}
                onChange={
                    (e) => this.setState({ newColorInput: e.target.value })
                }
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const newChartColors = [
                            ...this.state.chartColors, e.target.value
                        ]
                        this.setState(
                            { chartColors: newChartColors, newColorInput: '' }
                        )
                        this.props.setDMOption('themeConfig', {
                            chartColors: newChartColors
                        })
                    }
                }}
            />
            </div>
        )
    }

    onChangeRadioGroup = (propName, e) => {
        this.setState({ [propName]: e })
    }

    onChangeDMProp = (propName, e) => {
        console.log(propName);
        this.setState({ [propName]: e })
        this.props.setDMOption(propName, e)
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
            <Radio.Group
            defaultValue={this.state[propName]}
            onChange={(e) => {
                this.setState({ [propName]: e.target.value })
                if(propName === 'theme')this.props.setDMOption('themeConfig', {
                    'theme': e.target.value
                })
                else this.props.setDMOption(propName, e.target.value)
            }}
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
                <div>
                <h1>Authentication</h1>
                <AuthenticationForm onLogin={this.props.onLogin}/>
                {this.createBooleanRadioGroup('Show UI Overlay', 'uiOverlay', [
                    true,
                    false,
                ])}
                <h1>Customize Widgets</h1>
                <Button
                onClick={() => this.props.showDM()}
                type="primary"
                icon={<MenuFoldOutlined />}>
                    Open Data Messenger
                </Button>
                <h2>AutoQL API Configuration Options</h2>
                {this.createBooleanRadioGroup(
                    'Enable Autocomplete',
                    'enableAutocomplete',
                    [true, false],
                    (prop, val) => {
                        this.setState({ [prop]: val })
                        this.props.setDMOption('autoQLConfig', {
                            enableAutocomplete: val
                        })
                    }
                )}
                {this.createBooleanRadioGroup(
                    'Enable Query Validation',
                    'enableQueryValidation',
                    [true, false],
                    (prop, val) => {
                        this.setState({ [prop]: val })
                        this.props.setDMOption('autoQLConfig', {
                            enableQueryValidation: val
                        })
                    }
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
                <h4>Currency Code</h4>
                <Input
                type="text"
                onBlur={(e) => {
                    this.setState({ currencyCode: e.target.value })
                    this.props.setDMOption('dataFormatting', {
                        currencyCode: e.target.value
                    })
                }}
                style={{ width: '55px' }}
                defaultValue={this.state.currencyCode}
                />
                <h4>Language Code</h4>
                <Input
                type="text"
                onBlur={(e) => {
                    this.setState({ languageCode: e.target.value })
                    this.props.setDMOption('dataFormatting', {
                        languageCode: e.target.value
                    })
                }}
                style={{ width: '55px' }}
                defaultValue={this.state.languageCode}
                />
                <h4>Format for Month, Year</h4>
                <h6>
                    Don't know the syntax for formats?{' '}
                    <a href="https://devhints.io/moment" target="_blank">
                        View the cheat sheet
                    </a>
                </h6>
                <Input
                type="text"
                onBlur={(e) => {
                    this.setState({ monthFormat: e.target.value })
                    this.props.setDMOption('dataFormatting', {
                        monthYearFormat: e.target.value
                    })
                }}
                defaultValue={this.state.monthFormat}
                />
                <h4>Format for Day, Month, Year</h4>
                <h6>
                    Don't know the syntax for formats?{' '}
                    <a href="https://devhints.io/moment" target="_blank">
                        View the cheat sheet
                    </a>
                </h6>

                <Input
                type="text"
                onBlur={(e) => {
                    this.setState({ dayFormat: e.target.value })
                    this.props.setDMOption('dataFormatting', {
                        dayMonthYearFormat: e.target.value
                    })
                }}
                defaultValue={this.state.dayFormat}
                />
                <h4>Number of Decimals for Currency Values</h4>
                <InputNumber
                type="number"
                onChange={(e) => {
                    this.setState({ currencyDecimals: e })
                    this.props.setDMOption('dataFormatting', {
                        currencyDecimals: e.target.value
                    })
                }}
                value={this.state.currencyDecimals}
                />
                <h4>Number of Decimals for Quantity Values</h4>
                <InputNumber
                type="number"
                onChange={(e) => {
                    this.setState({ quantityDecimals: e })
                    this.props.setDMOption('dataFormatting', {
                        quantityDecimals: e.target.value
                    })
                }}
                value={this.state.quantityDecimals}
                />
                <h4>User Display Name</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ userDisplayName: e.target.value })
                    this.props.setDMOption('userDisplayName', e.target.value)
                }}
                value={this.state.userDisplayName}
                />
                <h4>Intro Message</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ introMessage: e.target.value })
                    this.props.setDMOption('introMessage', e.target.value)
                }}
                value={this.state.introMessage}
                />
                <h4>Query Input Placeholder</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ inputPlaceholder: e.target.value })
                    this.props.setDMOption('inputPlaceholder', e.target.value)

                }}
                value={this.state.inputPlaceholder}
                />
                {this.createBooleanRadioGroup(
                    'Clear All Messages on Close',
                    'clearOnClose',
                    [true, false],
                    this.onChangeDMProp
                    )}
                <h4>Height</h4>
                <h5>Only for top/bottom placement</h5>
                <InputNumber
                // type="number"
                onChange={(e) => {
                    this.setState({ height: e })
                    this.props.setDMOption('height', e)

                }}
                value={this.state.height}
                />
                <h4>Width</h4>
                <h5>Only for left/right placement</h5>
                <InputNumber
                type="number"
                onChange={(e) => {
                    this.setState({ width: e })
                    this.props.setDMOption('width', e)

                }}
                value={this.state.width}
                />
                <h4>Title</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ title: e.target.value })
                }}
                value={this.state.title}
                />
                <h4>Font Family</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ fontFamily: e.target.value })
                    this.props.setDMOption('themeConfig', {
                        fontFamily: e.target.value
                    })
                }}
                value={this.state.fontFamily}
                />
                <h4>Chart Colors</h4>
                <h5>
                This is an array of colors used for the charts. If the data scale is
                larger than the color array, it will repeat the colors. Any solid
                color formats are accepted. Hit "enter" to add a color.
                </h5>
                {this.renderChartColorsList()}
                {this.createBooleanRadioGroup(
                    'Enable Dynamic Charting',
                    'enableDynamicCharting',
                    [true, false],
                    this.onChangeDMProp
                )}
                <h4>Dashboard Title Color</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ dashboardTitleColor: e.target.value })
                }}
                value={this.state.dashboardTitleColor}
                />
                <h4>Dashboard Background Color</h4>
                <Input
                type="text"
                onChange={(e) => {
                    this.setState({ dashboardBackground: e.target.value })
                }}
                value={this.state.dashboardBackground}
                />
                <h4>Light Theme Accent Color</h4>
                <h5>
                For production version, the user will just choose "accentColor" and it
                <br />
                will be applied to whatever theme. If not provided, the default color
                <br />
                will be used
                </h5>
                <Input
                type="color"
                onChange={(e) => {
                    this.setState({ lightAccentColor: e.target.value })
                    this.props.setDMOption('themeConfig', {
                        accentColor: e.target.value
                    })
                }}
                value={this.state.lightAccentColor}
                />
                <h4>Dark Theme Accent Color</h4>
                <Input
                type="color"
                onChange={(e) => {
                    this.setState({ darkAccentColor: e.target.value })
                    this.props.setDMOption('themeConfig', {
                        accentColor: e.target.value
                    })
                }}
                value={this.state.darkAccentColor}
                />
                <h4>Maximum Number of Messages</h4>
                <InputNumber
                type="number"
                onChange={(e) => {
                    this.setState({ maxMessages: e })
                    this.props.setDMOption('maxMessages', e)
                }}
                value={this.state.maxMessages}
                />
                {this.createBooleanRadioGroup(
                    'Display comparisons as Percent',
                    'comparisonDisplay',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Explore Queries Tab',
                    'enableExploreQueriesTab',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Notifications Tab',
                    'enableNotificationsTab',
                    [true, false],
                    this.onChangeDMProp
                )}
                {this.createBooleanRadioGroup(
                    'Enable Speech to Text',
                    'enableVoiceRecord',
                    [true, false],
                    this.onChangeDMProp
                )}
                </div>
            </div>
        )
    }

}
