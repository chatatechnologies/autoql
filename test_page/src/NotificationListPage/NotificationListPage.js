import React, { Component } from 'react'
import { NotificationList } from 'autoql'


export class NotificationListPage extends Component{

    notificationList = null

    componentDidMount = () => {
        this.notificationList = new NotificationList('#notification-list', {
            authentication: {
                ...this.props.authentication
            }
        })
    }

    render = () => {
        return(
            <div id="notification-list"></div>
        )
    }

}
