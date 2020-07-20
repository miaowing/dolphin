import * as React from 'react';
import { Button, List, Result, Spin } from "antd";
import { DatabaseFilled } from '@ant-design/icons';
import * as styles from './host-list.m.less';
import { SSHConfig } from "../../interfaces/ssh-config.interface";
import { nestRPC } from "electron-nest-rpc";
import { ConnectService, StoreService } from "../../services";

interface HostListContainerState {
    hosts?: SSHConfig[];
    loading?: boolean;
    connected?: boolean;
    message?: string;
    host?: SSHConfig;
}

export class HostListContainer extends React.Component<any, HostListContainerState> {
    private readonly storeService = nestRPC<StoreService>(StoreService);
    private readonly connectService = nestRPC<ConnectService>(ConnectService);
    public state = {
        hosts: [],
        loading: false,
        connected: false,
        message: '',
        host: null,
    };

    async componentDidMount() {
        const { success, message, host } = await this.connectService.stats();
        this.setState({ loading: false, connected: success, message, host });
        const hosts = await this.storeService.getHosts();
        this.setState({ hosts });
    }

    async onConnect(hostname: string) {
        this.setState({ loading: true, message: '', host: null });
        const { success, message, host } = await this.connectService.connect(hostname);
        this.setState({ loading: false, connected: success, message, host });
    }

    async onDelete(hostname: string) {
        await this.storeService.deleteHost(hostname);
    }

    async onDisconnect() {
        const { success, message, host } = await this.connectService.disconnect();
        this.setState({ loading: false, connected: success, message, host });
    }

    render() {
        const { loading, connected, message, host } = this.state;
        if (loading) {
            return <Spin size="large" className={styles.spin} spinning={true}/>;
        }
        if (!loading && (connected || message)) {
            return <Result
                className={styles.result}
                status={message ? 'error' : 'success'}
                title={message ? '连接失败' : '连接成功'}
                subTitle={message ? message : `当前已连接至 ${host.name} 节点`}
                extra={[
                    <Button type="primary" key="console" onClick={() => this.onDisconnect()}>
                        断开连接
                    </Button>,
                ]}
            />
        }
        return <List
            className={styles.list}
            itemLayout="horizontal"
            dataSource={this.state.hosts}
            renderItem={(item, index) => (
                <List.Item className={styles.item} actions={this.renderActions(item, index)}>
                    <List.Item>
                        <DatabaseFilled className={styles.icon}/>
                        <List.Item.Meta title={item.name}
                                        description={`${item.username}@${item.host}:${item.port}`}/>
                    </List.Item>
                </List.Item>
            )}
        />;
    }

    renderActions(item, index) {
        return [
            <a key="edit" onClick={() => location.hash = `hosts/${index}`}>编辑</a>,
            <a key="delete" onClick={() => this.onDelete(item.name)}>删除</a>,
            <a key="connect" onClick={() => this.onConnect(item.name)}>连接</a>
        ]
    }
}
