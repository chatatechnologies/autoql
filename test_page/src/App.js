import React from 'react';
import { WidgetsMenu } from './WidgetsMenu'
import { DashboardPage } from './DashboardPage'
import { DataMessengerPage } from './DataMessengerPage'

class App extends React.Component{

    state = {
        currentPage: 'drawer'
    }

    componentDidMount = () => {
    }

    renderActivePage = () => {
        const { currentPage } = this.state;
        let widgetPage = null
        switch (currentPage) {
            case 'drawer':
                widgetPage = <DataMessengerPage/>
                break;
            case 'dashboard':
                widgetPage = <DashboardPage/>
                break;
            default:
        }

        return widgetPage;
    }

    renderDataMessenger = () => {

    }

    renderMenu = () => {
        return (<WidgetsMenu
            currentPage={this.state.currentPage}
            onClick={({key}) => {
                this.setState({
                    currentPage: key
                })
        }}/>)
    }

    render = () => {
        return (
            <div className="App" id="test">
                {this.renderMenu()}
                <div>
                {this.renderActivePage()}
                </div>
            </div>
        )
    }

}

export default App;
