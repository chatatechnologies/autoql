import React, { Component } from 'react';
import { Dashboard } from 'autoql'
import axios from 'axios'
export class DashboardPage extends Component {
    dashboard = null

    componentDidMount = () => {
        var obj = this
        const { authentication } = this.props
        const DASHBOARD_URL = `https://backend-staging.chata.io/api/v1/dashboards?key=${authentication.apiKey}`
        console.log(authentication);
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
                    chartColors: ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'],
                },
                autoQLConfig: {
                    debug: true
                },
                tiles: response.data[0].data
            })
            obj.dashboard.startEditing()
        })
    }

    render = () => {
        return (
            <div id="dashboard"></div>
        )
    }

}
