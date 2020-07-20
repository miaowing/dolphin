import { Injectable } from "@nestjs/common";
import { ProxyService } from "./proxy.service";
import { SSHService } from "./ssh.service";
import { StoreService } from "./store.service";
import * as rp from 'request-promise';
import * as Agent from 'socks5-http-client/lib/Agent';
import { SleepHelper } from "../helpers";
import { IConnectStatus } from "../interfaces/connect-status.interface";

@Injectable()
export class ConnectService {
    private status: IConnectStatus = { success: false, message: '' };

    constructor(
        private readonly proxyService: ProxyService,
        private readonly sshService: SSHService,
        private readonly storeService: StoreService,
        private readonly sleepHelper: SleepHelper,
    ) {
    }

    public async disconnect(): Promise<IConnectStatus> {
        await this.handleDisconnectEvent();
        return this.stats();
    }

    public async connect(hostname: string): Promise<IConnectStatus> {
        try {
            await this.handleConnectEvent(hostname);
            const host = this.storeService.getHost(hostname);
            this.status = { success: true, message: '', host };
        } catch (e) {
            this.status = { success: false, message: e.message, e };
        }
        return this.status;
    }

    public async stats(): Promise<IConnectStatus> {
        return this.status;
    }

    private async pingGoogle() {
        const max = 3;
        let current = 0;
        while (true) {
            try {
                await rp({
                    url: 'http://www.google.com',
                    method: 'get',
                    timeout: 2000,
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: '127.0.0.1',
                        socksPort: this.storeService.getConfig().proxyPort
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
        this.status = { success: false, message: '' };
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
