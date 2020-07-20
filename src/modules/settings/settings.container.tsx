import * as React from 'react';
import { FormInstance } from "antd/lib/form";
import { Button, Form, Input } from "antd";
import * as styles from './settings.m.less';
import { nestRPC } from "electron-nest-rpc";
import { StoreService } from "../../services";
import { IConfig } from "../../interfaces/config.interface";

interface SettingsContainerState {
    loading?: boolean;
    success?: boolean;
}

interface SettingsContainerProps {
}

export class SettingsContainer extends React.Component<SettingsContainerProps, SettingsContainerState> {
    private readonly storeService = nestRPC<StoreService>(StoreService);
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
        this.formRef.current.setFieldsValue({ proxyPort: 1080 });
        const { proxyPort } = await this.storeService.getConfig();
        this.formRef.current.setFieldsValue({ proxyPort });
    }

    async onConfirm(config: IConfig) {
        this.setState({ loading: true });
        await this.storeService.updateConfig(config);
        this.setState({ loading: false });
        location.hash = 'home';
    }

    render() {
        return <div>
            <Form className={styles.form} {...this.layout} ref={this.formRef} name="control-ref"
                  onFinish={(values) => this.onConfirm(values as IConfig)}>
                <Form.Item name="proxyPort" label="代理服务器端口" rules={[{ required: true }]}>
                    <Input/>
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
