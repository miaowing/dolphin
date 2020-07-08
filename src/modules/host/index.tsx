import * as React from 'react';
import { HostContainer } from "./host.container";

export class HostModule extends React.Component<any> {
    render() {
        const hostId = this.props.match.params.hostId;
        return <div>
            <HostContainer hostId={hostId}/>
        </div>
    }
}
