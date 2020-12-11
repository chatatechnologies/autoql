import React, { Component, Fragment } from 'react'
import { DataAlerts } from 'autoql'


export class DataAlertsSettingsPage extends Component {

    dataAlertsSettings = null

    componentDidMount = () => {
        this.dataAlertsSettings = new DataAlerts('#alerts', {
            authentication: {
                ...this.props.authentication
            },
            themeConfig: {
                ...this.props.themeConfig
            },
        })
    }

    render = () => {
        return (
            <Fragment>
                <div id="alerts"></div>
            </Fragment>

        )
    }

}
