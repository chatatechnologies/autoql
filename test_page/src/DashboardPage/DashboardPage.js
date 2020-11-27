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
import {
    put
} from 'axios'
const { Option } = Select

export class DashboardPage extends Component {
    dashboard = null

    state = {
        isEditing: false,
        loading: false
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

    componentDidUpdate = (prevProps, prevState) => {
        console.log('DID UPDATE');
        if(prevProps.dashboards.length !== this.props.dashboards.length){
            var dashboardEl = document.getElementById('dashboard')
            dashboardEl.innerHTML = '';
            this.instanceDashboard()
        }
        // console.log(prevState);
    }

    instanceDashboard = () => {
        const { authentication } = this.props
        var dashboardData = this.props.dashboards[this.props.activeDashboard]
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
            tiles: dashboardData.data,
            name: dashboardData.name,
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

    save = async() => {
        this.setState({
            loading: true
        })
        const { authentication } = this.props
        var dashboardData = this.props.dashboards[this.props.activeDashboard]
        const URL = `https://backend-staging.chata.io/api/v1/dashboards/${dashboardData.id}?key=${authentication.apiKey}`
        var tiles = []
        var d = {
            name: dashboardData.name
        }
        this.dashboard.tiles.map(tile => tiles.push(tile.getValues()))

        d.data = tiles
        var response = await put(URL, d, {
            headers: {
                Authorization: `Bearer ${authentication.token}`,
                'Integrator-Domain': authentication.domain,
            },
        })

        console.log(response.status);

        this.dashboard.stopEditing()
        this.setState({
            loading: false
        })

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
                            loading={this.state.loading}
                            onClick={() => {this.save()}}
                            style={{ marginLeft: '10px' }}
                            icon={<SaveOutlined  />}>Save Dashboard</Button>
                    </div>
                </div>
                <div id="dashboard"></div>
            </div>
        )
    }

}
