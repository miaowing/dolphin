import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { HomeModule } from "./home";
import { Header } from "../components/header.component";
import { HostModule } from "./host";
import { SettingsModule } from "./settings";

export class Routes extends React.Component {
    render() {
        return <div>
            <Header/>
            <Route exact={true} path="/" component={() => <Redirect to="/home"/>}/>
            <Route path="/home" component={HomeModule}/>
            <Route path="/settings" component={SettingsModule}/>
            <Route exact={true} path="/hosts" component={HostModule}/>
            <Route exact={true} path="/hosts/:hostId" component={HostModule}/>
        </div>;
    }
}
