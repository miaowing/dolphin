import * as React from 'react';
import { UseRPC } from "electron-nest-rpc";
import { StoreService } from "../../services";
import { Action } from "../../components/action.component";
import { ArrowLeftOutlined } from '@ant-design/icons';
import * as styles from './log.m.less';

interface LogContainerState {
    logs: string[];
}

interface LogContainerProps {
}

export class LogContainer extends React.Component<LogContainerProps, LogContainerState> {
    @UseRPC(StoreService, 'StoreService')
    private readonly storeService: StoreService;
    private timer;

    public state = {
        logs: []
    }

    async componentDidMount() {
        const logs = await this.storeService.readLog();
        this.setState({ logs: logs.reverse() });
        this.timer = setInterval(async () => {
            const logs = await this.storeService.readLog();
            this.setState({ logs: logs.reverse() });
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    render() {
        return <div>
            <Action>
                <ArrowLeftOutlined className={styles.button} onClick={() => location.hash = 'home'}/>
            </Action>
            <ul className={styles.content}>
                {this.state.logs.map((log, index) => <li key={index}>{log}</li>)}
            </ul>
        </div>
    }
}
