import React, { Component } from 'react'
import {
    Form,
    Button,
    Input
} from 'antd'


export class AuthenticationForm extends Component {

    state = {
        isAuthenticating: false,
        projectId: '',
        apiKey: '',
        displayName: '',
        domain: '',
    }

    onLogin = async () => {
        this.setState({
            isAuthenticating: true
        })
        console.log('LOGIN');
    }

    logoutUser = () => {
        console.log('LOGOUT');
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
