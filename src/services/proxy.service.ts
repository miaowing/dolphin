import { Injectable } from "@nestjs/common";
import { exec } from 'child_process';
import { promisify } from 'util';
import { StoreService } from "./store.service";
import { InjectLogger } from "@nestcloud/logger";
import { ILogger } from "update-electron-app";


@Injectable()
export class ProxyService {
    private readonly execute = promisify(exec);

    constructor(
        @InjectLogger() private readonly logger: ILogger,
        private readonly storeService: StoreService,
    ) {
    }

    async getMacOSEthernet(): Promise<string[]> {
        const { stdout } = await this.execute('networksetup -listallhardwareports');
        return stdout.split('\n')
            .filter(item => item.includes('Hardware Port'))
            .map(item => item.replace('Hardware Port: ', ''));
    }

    async getMacOSProxyState(ethernet?: string): Promise<boolean> {
        if (!ethernet) {
            ethernet = (await this.getMacOSEthernet())[0];
        }
        const { stdout } = await this.execute(`networksetup -getsocksfirewallproxy "${ethernet}"`);
        return stdout.split('\n')
            .filter(item => item.includes('Enabled'))
            .map(item => item.replace('Enabled: ', ''))[0] === 'Yes';
    }

    async enableMacOSSocksProxy(ethernet?: string) {
        if (!ethernet) {
            ethernet = (await this.getMacOSEthernet())[0];
        }
        const config = this.storeService.getConfig();
        await this.execute(`networksetup -setsocksfirewallproxy "${ethernet}" 127.0.0.1 ${config.proxyPort}`);
        await this.execute(`networksetup -setsocksfirewallproxystate "${ethernet}" on`);

        this.logger.log(`Enable socks proxy at ${ethernet}${config.proxyPort} success`);
    }

    async disableMacOSSocksProxy(ethernet?: string) {
        if (!ethernet) {
            ethernet = (await this.getMacOSEthernet())[0];
        }
        await this.execute(`networksetup -setsocksfirewallproxystate "${ethernet}" off`);
        this.logger.log(`Disable socks proxy at ${ethernet} success`);
    }
}
