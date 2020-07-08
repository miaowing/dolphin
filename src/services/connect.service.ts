import { Injectable, OnModuleInit } from "@nestjs/common";
import { ipcMain } from 'electron';
import {
    EVENT_CONNECT,
    EVENT_CONNECT_CALLBACK,
    EVENT_CONNECT_STATUS,
    EVENT_DISCONNECT_HOST,
    PROXY_PORT
} from "../constants";
import { ProxyService } from "./proxy.service";
import { SSHService } from "./ssh.service";
import { StoreService } from "./store.service";
import * as rp from 'request-promise';
import * as Agent from 'socks5-http-client/lib/Agent';
import { SleepHelper } from "../helpers";

@Injectable()
export class ConnectService implements OnModuleInit {
    private status = {};

    constructor(
        private readonly proxyService: ProxyService,
        private readonly sshService: SSHService,
        private readonly storeService: StoreService,
        private readonly sleepHelper: SleepHelper,
    ) {
    }

    onModuleInit(): any {
        ipcMain.on(EVENT_CONNECT, async (event, hostname) => {
            try {
                await this.handleConnectEvent(hostname);
                const host = this.storeService.getHost(hostname);
                this.status = { success: true, message: '', host };
                event.sender.send(EVENT_CONNECT_CALLBACK, this.status);
            } catch (e) {
                this.status = { success: false, message: e.message, e };
                event.sender.send(EVENT_CONNECT_CALLBACK, this.status);
            }
        });

        ipcMain.on(EVENT_CONNECT_STATUS, event => event.sender.send(EVENT_CONNECT_STATUS, this.status));
        ipcMain.on(EVENT_DISCONNECT_HOST, async (event) => {
            await this.handleDisconnectEvent();
            event.sender.send(EVENT_CONNECT_CALLBACK, { success: false, message: '', host: null });
        });
    }

    private async pingGoogle() {
        const max = 5;
        let current = 0;
        while (true) {
            try {
                await rp({
                    url: 'http://www.google.com',
                    method: 'get',
                    timeout: 5000,
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: '127.0.0.1',
                        socksPort: PROXY_PORT
                    }
                });
                await this.sleepHelper.sleep(2000);
                break;
            } catch (e) {
                if (current >= max) {
                    throw new Error('Connection Error');
                }
                console.log(`Try to test connection fail(${current})`);
                current++;
            }

        }
    }

    private async handleDisconnectEvent() {
        this.status = {};
        this.sshService.stopProxy();
        await this.proxyService.disableMacOSSocksProxy();
    }

    private async handleConnectEvent(hostname: string) {
        const config = this.storeService.getHost(hostname);
        await this.sshService.createProxy(config);
        await this.proxyService.enableMacOSSocksProxy();
        await this.pingGoogle();
    }
}
