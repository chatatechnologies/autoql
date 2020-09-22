import React, { Component } from 'react'
import {
    Form,
    Button,
    Input,
    message,
} from 'antd'
import axios from 'axios'
import uuid from 'uuid'

const setStoredProp = (name, value) => {
    console.log(name);
    console.log(value);
    localStorage.setItem(name, value)
}

const getBaseUrl = () => {
    return 'https://backend-staging.chata.io'
}

const getStoredProp = (name) => {
    console.log(localStorage.getItem(name));
    return localStorage.getItem(name)
}

export class AuthenticationForm extends Component {

    state = {
        isAuthenticating: false,
        isAuthenticated: false,
        domain: getStoredProp('domain-url') || '',
        projectId: getStoredProp('customer-id') || '',
        displayName: getStoredProp('user-id') || '',
        apiKey: getStoredProp('api-key') || '',
        email: '',
        password: '',

    }

    componentDidMount = () => {
        console.log(this.state);
    }

    getJWT = async (loginToken) => {
        try {
            if (!loginToken) {
                throw new Error('Invalid Login Token')
            }

            const baseUrl = getBaseUrl()
            let url = `${baseUrl}/api/v1/jwt?display_name=${this.state.displayName}&project_id=${this.state.projectId}`

            // Use login token to get JWT token
            const jwtResponse = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${loginToken}`,
                },
            })

            // Put jwt token into storage
            const jwtToken = jwtResponse.data
            setStoredProp('jwtToken', jwtToken)

            if (this.authTimer) {
                clearTimeout(this.authTimer)
            }
            this.authTimer = setTimeout(() => {
                this.setState({
                    isAuthenticated: false,
                })
            }, 2.16e7)

            return Promise.resolve(jwtToken)
        } catch (error) {
            this.setState({ isAuthenticating: false })
        }
    }

    onLogin = async () => {
        try {
            this.setState({
                isAuthenticating: true,
            })
            const baseUrl = getBaseUrl()

            const loginFormData = new FormData()
            loginFormData.append('username', this.state.email)
            loginFormData.append('password', this.state.password)
            const loginResponse = await axios.post(
                `${baseUrl}/api/v1/login`,
                loginFormData,
                {
                    headers: {
                        // 'Access-Control-Allow-Origin': '*'
                    },
                }
            )

            const loginToken = loginResponse.data
            setStoredProp('loginToken', loginToken)

            const jwt = await this.getJWT(loginToken)
            this.props.onLogin({
                token: jwt,
                domain: this.state.domain,
                apiKey: this.state.apiKey
            })
            this.setState({
                isAuthenticating: false
            })

            message.success('Login Sucessful!', 0.8)
        } catch (error) {
            console.error(error)
            setStoredProp('loginToken', null)
            setStoredProp('jwtToken', null)
            this.setState({
                isAuthenticated: false,
                isAuthenticating: false,
                activeIntegrator: null,
                componentKey: uuid.v4(),
            })
            message.error('Invalid Credentials')
        }
    }

    logoutUser = () => {
    }

    render = () => {
        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        }
        const tailLayout = {
            wrapperCol: { offset: 8, span: 16 },
        }
        return (
            <Form
            {...layout}
            initialValues={{
                projectId: this.state.projectId,
                displayName: this.state.displayName,
                apiKey: this.state.apiKey,
                domain: this.state.domain,
            }}
            style={{ marginTop: '20px' }}
            onFinish={this.onLogin}>
                <Form.Item
                label="Project ID"
                name="projectId"
                rules={[
                    { required: true, message: 'Please enter your project ID' },
                ]}>
                    <Input
                    name="customer-id"
                    onChange={(e) => {
                        this.setState({ projectId: e.target.value })
                    }}
                    onBlur={(e) => setStoredProp('customer-id', e.target.value)}
                    value={this.state.projectId}
                    />
                </Form.Item>
                <Form.Item
                label="User Email"
                name="displayName"
                rules={[{ required: true, message: 'Please enter your email' }]}>
                    <Input
                    name="user-id"
                    onChange={(e) => {
                        this.setState({ displayName: e.target.value })
                    }}
                    onBlur={(e) => setStoredProp('user-id', e.target.value)}
                    value={this.state.displayName}
                    />
                </Form.Item>
                <Form.Item
                label="API key"
                name="apiKey"
                rules={[{ required: true, message: 'Please enter your API key' }]}
                >
                    <Input
                    name="api-key"
                    onChange={(e) => {
                        this.setState({ apiKey: e.target.value })
                    }}
                    onBlur={(e) => setStoredProp('api-key', e.target.value)}
                    value={this.state.apiKey}
                    />
                </Form.Item>
                <Form.Item
                label="Domain URL"
                name="domain"
                rules={[
                    { required: true, message: 'Please enter your domain URL' },
                ]}>
                    <Input
                    name="domain-url"
                    onChange={(e) => {
                        this.setState({ domain: e.target.value })
                    }}
                    onBlur={(e) => setStoredProp('domain-url', e.target.value)}
                    value={this.state.domain}
                />
                </Form.Item>
                <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}>
                    <Input
                    onChange={(e) => {
                        this.setState({ email: e.target.value })
                    }}
                    value={this.state.email}
                    />
                </Form.Item>
                <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}>
                    <Input
                    type="password"
                    onChange={(e) => {
                        this.setState({ password: e.target.value })
                    }}
                    value={this.state.password}
                    />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button
                    type="primary"
                    htmlType="submit"
                    loading={this.state.isAuthenticating}>
                        Authenticate
                    </Button>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="default" onClick={this.logoutUser}>
                        Log Out
                    </Button>
                </Form.Item>
            </Form>
        )
    }

}
