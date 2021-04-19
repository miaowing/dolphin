import { Injectable, OnModuleInit } from "@nestjs/common";
import { SSHConfig } from "../interfaces/ssh-config.interface";
import { app } from 'electron';
import { resolve } from "path";
import * as mkdirp from 'mkdirp';
import { readFileSync, writeFileSync } from "fs";
import { HostHelper } from "../helpers";
import { IConfig } from "../interfaces/config.interface";
import { ILogger } from "update-electron-app";
import { InjectLogger } from "@nestcloud/logger";

@Injectable()
export class StoreService implements OnModuleInit {
    private readonly homePath = app.getPath('home');
    private readonly appPath = resolve(this.homePath, 'dolphin');
    private readonly hostsFilename = 'hosts.data';
    private readonly configFilename = 'data.data';
    private readonly logFilename = 'dolphin.log';
    private hosts: SSHConfig[] = [];
    private config: IConfig = { proxyPort: 1080 };

    constructor(
        @InjectLogger() private readonly logger: ILogger,
        private readonly hostHelper: HostHelper,
    ) {
    }

    onModuleInit(): any {
        mkdirp(this.appPath);
        try {
            const data = readFileSync(resolve(this.appPath, this.hostsFilename)).toString();
            this.hosts = JSON.parse(data) || [] as SSHConfig[];
        } catch (e) {
            this.logger.error(`read data file error: ${e.message}`);
        }
        try {
            const configData = readFileSync(resolve(this.appPath, this.configFilename)).toString();
            this.config = JSON.parse(configData) || { proxyPort: 1080 } as IConfig;
        } catch (e) {
            this.logger.error(`read config file error: ${e.message}`);
        }
    }

    getConfig(): IConfig {
        return this.config;
    }

    readLog() {
        const logs = readFileSync(resolve(this.appPath, this.logFilename)).toString();
        return logs.split('\n');
    }

    updateConfig(config: IConfig) {
        this.config = config;
        writeFileSync(
            resolve(this.appPath, this.configFilename),
            JSON.stringify(config)
        );
    }

    getHosts() {
        return this.hosts;
    }

    getHostByIndex(index: number) {
        return this.hosts[index];
    }

    getHost(hostname: string) {
        return this.hosts.find(host => host.name === hostname);
    }

    addHost(config: SSHConfig): boolean {
        if (this.hostHelper.isExists(this.hosts, config.name)) {
            return false;
        }
        this.hosts.push(config);
        this.syncToFile();
        return true;
    }

    editHost(index: number, config: SSHConfig): boolean {
        const hosts = Object.create(this.hosts);
        hosts.splice(index, 1);
        if (this.hostHelper.isExists(hosts, config.name)) {
            return false;
        }
        this.hosts.splice(index, 1, config);
        this.syncToFile();
        return true;
    }

    deleteHost(hostname: string) {
        this.hosts = this.hosts.filter(host => host.name !== hostname);
        this.syncToFile();
    }

    private syncToFile() {
        writeFileSync(
            resolve(this.appPath, this.hostsFilename),
            JSON.stringify([...this.hosts])
        );
    }
}
