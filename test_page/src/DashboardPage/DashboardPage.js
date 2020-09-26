import React, { Component } from 'react';
import { Dashboard } from 'autoql'
import {
    Button
} from 'antd'
import {
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined
} from '@ant-design/icons'

import axios from 'axios'
export class DashboardPage extends Component {
    dashboard = null

    state = {
        isEditing: false
    }

    componentDidMount = () => {
        var obj = this
        const { authentication } = this.props
        const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${authentication.apiKey}`
        axios.get(DASHBOARD_URL, {
            headers: {
                'Authorization': 'Bearer ' + authentication.token,
                'Integrator-Domain': authentication.domain
            }
        }).then(function(response){
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
                tiles: response.data[0].data,
                executeOnStopEditing: false,
                executeOnMount: false
            })
        })
    }

    toggleEditing = () => {
        const isEditing = !this.state.isEditing
        this.setState({
            isEditing
        })

        if(isEditing)this.dashboard.startEditing()
        else this.dashboard.stopEditing()

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
                </div>
                <div id="dashboard"></div>
            </div>
        )
    }

}
