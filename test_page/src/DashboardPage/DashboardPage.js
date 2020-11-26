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
        const { dashboardNames, activeDashboard } = this.props
        var options = []
        dashboardNames.map((name, index) => {
            options.push(
                <Option value={index} key={index}>{name}</Option>
            )
        })

        options.push(
            <Option value="new-dashboard" key={'new-dashboard'}>
                <PlusOutlined /> New Dashboard
            </Option>
        )

        return (
            <Select
                onChange={(val) => {
                    this.props.onSelectDashboard(val, this)
                }}
                style={{ minWidth: '200px' }}
                value={activeDashboard}
                defaultValue={activeDashboard}>
                {options}
            </Select>
        )
    }

    componentDidUpdate = () => {
    }

    instanceDashboard = () => {
        const { authentication } = this.props
        this.dashboard = new Dashboard('#dashboard', {
            authentication: {
                token: authentication.token,
                apiKey: authentication.apiKey,
                domain: authentication.domain,
            },
            themeConfig: {
                ...this.props.themeConfig
            },
            autoQLConfig: {
                debug: true
            },
            tiles: this.props.dashboards[this.props.activeDashboard].data,
            executeOnStopEditing: false,
            executeOnMount: false,
        })
    }

    componentDidMount = () => {
        if(this.props.dashboards){
            this.instanceDashboard()
        }else{
            this.dashboard.options.themeConfig = this.props.themeConfig
            this.dashboard.applyCSS()
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
                            <StopOutlined /> : <EditOutlined />}>
                             {this.state.isEditing ? 'Cancel' : 'Edit'}
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
