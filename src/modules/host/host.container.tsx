import * as React from 'react';
import { FormInstance } from "antd/lib/form";
import { Button, Form, Input } from "antd";
import * as styles from './host.m.less';
import { ipcRenderer } from 'electron';
import { SSHConfig } from "../../interfaces/ssh-config.interface";
import { EVENT_ADD_HOST, EVENT_EDIT_HOST, EVENT_GET_HOST } from "../../constants";

interface HostContainerState {
    loading?: boolean;
    success?: boolean;
}

interface HostContainerProps {
    hostId?: number;
}

export class HostContainer extends React.Component<HostContainerProps, HostContainerState> {
    private readonly formRef = React.createRef<FormInstance>();
    private readonly layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    public state = {
        loading: false,
        success: undefined,
    };

    componentWillUnmount() {
        this.formRef.current.resetFields();
        ipcRenderer.removeAllListeners(EVENT_ADD_HOST);
        ipcRenderer.removeAllListeners(EVENT_GET_HOST);
    }

    componentWillMount() {
        const { hostId } = this.props;
        if (hostId !== undefined) {
            console.log('hostId: ', hostId);
            ipcRenderer.on(EVENT_GET_HOST, (event, host) => {
                console.log(host);
                this.formRef.current.setFieldsValue(host);
            });
            ipcRenderer.send(EVENT_GET_HOST, hostId);
        }
    }

    componentDidMount() {
        this.formRef.current.setFieldsValue({ port: 22 });
        ipcRenderer.on(EVENT_ADD_HOST, async (event, success) => {
            this.setState({ loading: false, success: success as boolean });
            await this.formRef.current.validateFields(['name']);
            if (success) {
                location.hash = 'home';
            }
        });
    }

    onConfirm(config: SSHConfig) {
        const { hostId } = this.props;
        this.setState({ loading: true });
        ipcRenderer.send(
            hostId !== undefined ? EVENT_EDIT_HOST : EVENT_ADD_HOST,
            hostId ? { index: hostId, config } : config
        );
    }

    render() {
        return <div>
            <Form className={styles.form} {...this.layout} ref={this.formRef} name="control-ref"
                  onFinish={(values) => this.onConfirm(values as SSHConfig)}>
                <Form.Item name="name" label="名称" rules={[{ required: true }, {
                    required: true, validator: (rule, value, callback) => {
                        if (this.state.success || this.state.success === undefined) {
                            return callback();
                        } else if (this.state.success === false) {
                            return callback('名称重复');
                        }
                    }
                }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="host" label="主机" rules={[{ required: true }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="port" label="端口" rules={[{ required: true }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                    <Input/>
                </Form.Item>
                <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                    <Input.Password/>
                </Form.Item>
                <Form.Item {...this.layout}>
                    <Button loading={this.state.loading} type="primary" htmlType="submit">
                        确认
                    </Button>
                    <Button htmlType="button" onClick={() => location.hash = 'home'}>
                        取消
                    </Button>
                </Form.Item>
            </Form>
        </div>
    }
}
