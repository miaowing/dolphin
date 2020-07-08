import * as React from 'react';
import { Button, List, Result, Spin } from "antd";
import { DatabaseFilled } from '@ant-design/icons';
import * as styles from './host-list.m.less';
import { ipcRenderer } from 'electron';
import {
    EVENT_CONNECT,
    EVENT_CONNECT_CALLBACK, EVENT_CONNECT_STATUS,
    EVENT_DELETE_HOST,
    EVENT_DISCONNECT_HOST,
    EVENT_LIST_HOST
} from "../../constants";
import { SSHConfig } from "../../interfaces/ssh-config.interface";

interface HostListContainerState {
    hosts?: SSHConfig[];
    loading?: boolean;
    connected?: boolean;
    message?: string;
    host?: SSHConfig;
}

export class HostListContainer extends React.Component<any, HostListContainerState> {
    public state = {
        hosts: [],
        loading: false,
        connected: false,
        message: '',
        host: null,
    };

    componentWillUnmount() {
        ipcRenderer.removeAllListeners(EVENT_LIST_HOST);
        ipcRenderer.removeAllListeners(EVENT_CONNECT_CALLBACK);
        ipcRenderer.removeAllListeners(EVENT_CONNECT_STATUS);
    }

    componentWillMount() {
        ipcRenderer.on(EVENT_CONNECT_STATUS, (event, { success, message, host }) => {
            this.setState({ loading: false, connected: success, message, host })
        });
        ipcRenderer.on(EVENT_LIST_HOST, (event, hosts) => {
            console.log(hosts);
            this.setState({ hosts });
        });
        ipcRenderer.send(EVENT_LIST_HOST);
        ipcRenderer.send(EVENT_CONNECT_STATUS);
    }

    componentDidMount() {
        ipcRenderer.on(EVENT_CONNECT_CALLBACK, (event, { success, message, host }) => {
            this.setState({ loading: false, connected: success, message, host })
        });
    }

    onLoading(hostname: string) {
        this.setState({ loading: true, message: '', host: null });
        ipcRenderer.send(EVENT_CONNECT, hostname);
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
                    <Button type="primary" key="console" onClick={() => ipcRenderer.send(EVENT_DISCONNECT_HOST)}>
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
            <a key="delete" onClick={() => ipcRenderer.send(EVENT_DELETE_HOST, item.name)}>删除</a>,
            <a key="connect" onClick={() => this.onLoading(item.name)}>连接</a>
        ]
    }
}
