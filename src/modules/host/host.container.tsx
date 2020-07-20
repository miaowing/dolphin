import * as React from 'react';
import { FormInstance } from "antd/lib/form";
import { Button, Form, Input } from "antd";
import * as styles from './host.m.less';
import { SSHConfig } from "../../interfaces/ssh-config.interface";
import { nestRPC } from 'electron-nest-rpc';
import { StoreService } from "../../services";

interface HostContainerState {
    loading?: boolean;
    success?: boolean;
}

interface HostContainerProps {
    hostId?: number;
}

export class HostContainer extends React.Component<HostContainerProps, HostContainerState> {
    private storeService = nestRPC<StoreService>(StoreService);
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
    }

    async componentDidMount() {
        const { hostId } = this.props;
        if (hostId !== undefined) {
            const host = await this.storeService.getHostByIndex(hostId);
            this.formRef.current.setFieldsValue(host);
        }
    }

    async onConfirm(config: SSHConfig) {
        const { hostId } = this.props;
        this.setState({ loading: true });

        let success = false;
        try {
            if (hostId === undefined) {
                success = await this.storeService.addHost(config);
            } else {
                success = await this.storeService.editHost(hostId, config);
            }
        } catch (e) {
        }

        this.setState({ loading: false, success: success });
        location.hash = 'home';
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
                    <Button style={{ marginLeft: 10 }} htmlType="button" onClick={() => location.hash = 'home'}>
                        取消
                    </Button>
                </Form.Item>
            </Form>
        </div>
    }
}
