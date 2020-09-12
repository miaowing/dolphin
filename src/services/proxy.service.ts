import { Injectable } from "@nestjs/common";
import { exec } from 'child_process';
import { promisify } from 'util';
import { StoreService } from "./store.service";
import { InjectLogger } from "@nestcloud/logger";
import { ILogger } from "update-electron-app";

@Injectable()
export class ProxyService {
    private readonly execute = promisify(exec);
    private readonly REG_PATH = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v`;

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

    async enableProxy() {
        switch(process.platform) {
            case 'win32':
                return this.enableWindowsProxy();
            case 'darwin':
                return this.enableMacOSSocksProxy();
        }
    }

    async disableProxy() {
        switch(process.platform) {
            case 'win32':
                return this.disableWindowsProxy();
            case 'darwin':
                return this.disableMacOSSocksProxy();
        }
    }

    async enableWindowsProxy() {
        const config = this.storeService.getConfig();
        const hostname = 'socks=127.0.0.1';
        await this.execute(
            `${this.REG_PATH} ProxyServer /t REG_SZ /d ${hostname}:${config.proxyPort} /f & ` +
            `${this.REG_PATH} ProxyEnable /t REG_DWORD /d 1 /f`
        );
    }

    async disableWindowsProxy() {
        await this.execute(`${this.REG_PATH} ProxyEnable /t REG_DWORD /d 0 /f`)
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
