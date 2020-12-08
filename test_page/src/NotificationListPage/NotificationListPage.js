import React, { Component } from 'react'
import { NotificationFeed } from 'autoql'


export class NotificationListPage extends Component{

    notificationList = null

    componentDidMount = () => {
        this.notificationList = new NotificationFeed('#notification-list', {
            authentication: {
                ...this.props.authentication
            },
            themeConfig: {
                ...this.props.themeConfig
            },
        })

    }

    render = () => {
        return(
            <div id="notification-list"></div>
        )
    }

}
