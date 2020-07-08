import * as React from 'react';
import { HostListContainer } from "./host-list.container";
import { HostActionsContainer } from "./host-actions.container";

export class HomeModule extends React.Component {
    render() {
        return <div>
            <HostActionsContainer/>
            <HostListContainer/>
        </div>
    }
}
