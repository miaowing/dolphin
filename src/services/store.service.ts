import { Injectable, OnModuleInit } from "@nestjs/common";
import { SSHConfig } from "../interfaces/ssh-config.interface";
import { app, ipcMain } from 'electron';
import { resolve } from "path";
import * as mkdirp from 'mkdirp';
import { readFileSync, writeFileSync } from "fs";
import { EVENT_ADD_HOST, EVENT_DELETE_HOST, EVENT_EDIT_HOST, EVENT_GET_HOST, EVENT_LIST_HOST } from "../constants";
import { HostHelper } from "../helpers";

@Injectable()
export class StoreService implements OnModuleInit {
    private readonly homePath = app.getPath('home');
    private readonly appPath = resolve(this.homePath, 'dolphin');
    private hosts: SSHConfig[] = [];

    constructor(
        private readonly hostHelper: HostHelper,
    ) {
    }

    onModuleInit(): any {
        try {
            mkdirp(this.appPath);
            this.hosts = JSON.parse(readFileSync(resolve(this.appPath, 'hosts.json')).toString()) as SSHConfig[];
        } catch (e) {
        }

        ipcMain.on(EVENT_ADD_HOST, (event, config) => {
            const success = this.addHost(config);
            event.sender.send(EVENT_ADD_HOST, success);
        });

        ipcMain.on(EVENT_EDIT_HOST, (event, { index, config }) => {
            const success = this.editHost(index, config);
            event.sender.send(EVENT_ADD_HOST, success);
        });

        ipcMain.on(EVENT_GET_HOST, (event, index) => {
            event.sender.send(EVENT_GET_HOST, this.getHostByIndex(index));
        });
        ipcMain.on(EVENT_LIST_HOST, (event) => {
            event.sender.send(EVENT_LIST_HOST, this.hosts);
        });
        ipcMain.on(EVENT_DELETE_HOST, (event, hostname) => {
            this.deleteHost(hostname);
            event.sender.send(EVENT_LIST_HOST, this.hosts);
        });
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
        writeFileSync(resolve(this.appPath, 'hosts.json'), JSON.stringify([...this.hosts]));
        return true;
    }

    editHost(index: number, config: SSHConfig): boolean {
        const hosts = Object.create(this.hosts);
        hosts.splice(index, 1);
        if (this.hostHelper.isExists(hosts, config.name)) {
            return false;
        }
        this.hosts.splice(index, 1, config);
        writeFileSync(resolve(this.appPath, 'hosts.json'), JSON.stringify([...this.hosts]));
        return true;
    }

    deleteHost(hostname: string) {
        this.hosts = this.hosts.filter(host => host.name !== hostname);
        writeFileSync(resolve(this.appPath, 'hosts.json'), JSON.stringify([...this.hosts]));
    }
}
