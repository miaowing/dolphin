import * as React from 'react';
import { message } from 'antd';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import './styles/index.less';
import { Routes } from "./modules";

message.config({
    top: 100,
    duration: 2,
    maxCount: 3,
});

const renderApp = () => {
    render(
        <Router>
            <Routes/>
        </Router>,
        document.getElementById('app')
    );
};

renderApp();
if ((module as any).hot) {
    (module as any).hot.accept()
}
