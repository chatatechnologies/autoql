import React, { Component } from 'react';
import { Dashboard } from 'autoql'
import {
    Button,
    Select
} from 'antd'
import {
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined,
    PlusOutlined,
    RollbackOutlined,
    SaveOutlined
} from '@ant-design/icons'
const { Option } = Select

export class DashboardPage extends Component {
    dashboard = null

    state = {
        isEditing: false,
    }

    renderSelector = () => {
        const { dashboardNames } = this.props
        var options = []
        dashboardNames.map((name, index) => {
            options.push(
                <Option value={index} key={index}>{name}</Option>
            )
        })

        return (
            <Select
                onChange={(val) => {this.props.onSelectDashboard(val)}}
                style={{ minWidth: '200px' }}
                defaultValue={0}>
                {options}
            </Select>
        )
    }

    componentDidMount = () => {
        var obj = this
        const { authentication } = this.props
        if(this.props.dashboards){
            console.log('UPDATE');
            obj.dashboard = new Dashboard('#dashboard', {
                authentication: {
                    token: authentication.token,
                    apiKey: authentication.apiKey,
                    domain: authentication.domain,
                },
                themeConfig: {
                    chartColors: [
                        '#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'
                    ],
                },
                autoQLConfig: {
                    debug: true
                },
                tiles: this.props.dashboards[this.props.activeDashboard].data,
                executeOnStopEditing: false,
                executeOnMount: false,
                notExecutedText: `To get started, enter a query and click
                <svg stroke="currentColor" fill="currentColor"
                stroke-width="0" viewBox="0 0 24 24"
                height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2
                12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
                18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
                </path>
                </svg>`
            })
        }
    }

    toggleEditing = () => {
        const isEditing = !this.state.isEditing
        this.setState({
            isEditing
        })

        if(isEditing)this.dashboard.startEditing()
        else this.dashboard.stopEditing()
    }

    addTile = () => {
        this.dashboard.addTile(
            {
                title: '',
                query: '',
                w: 6,
                h: 5,
            }
        );
    }

    render = () => {
        window.dispatchEvent(new Event('resize'));
        return (
            <div style={{
                width: '100%'
            }}>
                <div style={{
                    textAlign: 'center',
                    background: 'rgb(250,250,250)',
                    padding: '10px'
                }}>
                    <div style={{
                        marginBottom: '10px'
                    }}>
                        {this.renderSelector()}
                    </div>
                    <Button
                        onClick={() => {this.toggleEditing()}}
                        type="default"
                        icon={
                            this.state.isEditing ?
                            <StopOutlined /> : <EditOutlined />}>Edit
                    </Button>
                    <Button
                        type="default"
                        onClick={() => {this.dashboard.run()}}
                        style={{ marginLeft: '10px' }}
                        icon={<PlayCircleOutlined/>}>Execute</Button>
                    <Button
                        onClick={() => {console.log(this.dashboard.tiles);}}
                        style={{ marginLeft: '10px' }}>
                        Log Current Tile State
                    </Button>
                    <div
                        style={{
                            marginTop: '10px',
                            display: this.state.isEditing ? 'block' : 'none'
                        }}>
                        <Button
                            type="primary"
                            onClick={() => {this.addTile()}}
                            icon={<PlusOutlined />}> Add Tile</Button>
                        <Button
                            type="primary"
                            onClick={() => {this.dashboard.undo()}}
                            style={{ marginLeft: '10px' }}
                            icon={<RollbackOutlined />}>Undo</Button>
                        <Button
                            type="primary"
                            onClick={() => {}}
                            style={{ marginLeft: '10px' }}
                            icon={<SaveOutlined  />}>Save Dashboard</Button>
                    </div>
                </div>
                <div id="dashboard"></div>
            </div>
        )
    }

}
