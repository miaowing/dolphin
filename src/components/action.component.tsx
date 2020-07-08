import * as React from 'react';
import * as styles from './action.m.less';

export class Action extends React.Component<any, any> {
    render() {
        return <div className={styles.action}>
            {this.props.children}
        </div>
    }
}
