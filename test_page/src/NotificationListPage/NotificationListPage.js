import React, { Component } from 'react'
import { NotificationFeed } from 'autoql'


export class NotificationListPage extends Component{

    notificationList = null

    componentDidMount = () => {
        console.log(this.props.themeConfig);
        this.notificationList = new NotificationFeed('#notification-list', {
            authentication: {
                ...this.props.authentication
            },
            themeConfig: {
                ...this.props.themeConfig
            },
        })

        console.log(this.notificationList.options.themeConfig);
    }

    render = () => {
        return(
            <div id="notification-list"></div>
        )
    }

}
