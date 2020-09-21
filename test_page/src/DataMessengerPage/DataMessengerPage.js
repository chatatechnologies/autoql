import React, { Component } from 'react';
import { AuthenticationForm } from '../AuthenticationForm'
import './DataMessengerPage.css'

export class DataMessengerPage extends Component {

    render = () => {
        return (
            <div className="props-page">
                <h1>Authentication</h1>
                <AuthenticationForm onLogin={this.props.onLogin}/>
            </div>
        )
    }

}
