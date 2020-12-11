import React, { Component, Fragment } from 'react'
import { QueryInput, QueryOutput } from 'autoql'


export class QueryOutputInputPage extends Component {

    queryInput = null
    queryOutput = null

    componentDidMount = () => {
        this.queryInput = new QueryInput('#query-input', {
            authentication: {
                ...this.props.authentication
            },
            themeConfig: {
                ...this.props.themeConfig
            },
            autoCompletePlacement: 'bottom',
        })

        this.queryOutput = new QueryOutput('#query-output', {
            displayType: 'line',
        })
        this.queryInput.bind(this.queryOutput)
    }

    render = () => {
        return (
            <Fragment>
                <div id="query-input"></div>
                <div id="query-output" style={{
                    width: '100%',
                    height: '500px',
                    padding: '5px'
                }}>
                </div>
            </Fragment>

        )
    }

}
