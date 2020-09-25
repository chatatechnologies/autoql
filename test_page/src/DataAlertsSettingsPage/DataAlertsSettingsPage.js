import React, { Component, Fragment } from 'react'
import { DataAlertsSettings } from 'autoql'


export class DataAlertsSettingsPage extends Component {

    dataAlertsSettings = null

    componentDidMount = () => {
        this.dataAlertsSettings = new DataAlertsSettings('#alerts', {
            authentication: {
                ...this.props.authentication
            }
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
