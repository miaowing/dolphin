import * as React from 'react';
import { PlusSquareOutlined, SettingOutlined } from '@ant-design/icons';
import { Action } from "../../components/action.component";
import * as styles from './host-actions.m.less';

export class HostActionsContainer extends React.Component<any, any> {
    render() {
        return <Action>
            <PlusSquareOutlined className={styles.button} onClick={() => location.hash = 'hosts'}/>
            <SettingOutlined className={styles.button} onClick={() => location.hash = 'settings'}/>
        </Action>
    }
}
