import { Injectable, OnModuleInit } from "@nestjs/common";
import { SSHConfig } from "../interfaces/ssh-config.interface";
import { app } from 'electron';
import { resolve } from "path";
import * as mkdirp from 'mkdirp';
import { readFileSync, writeFileSync } from "fs";
import { HostHelper } from "../helpers";
import { default as JSEncrypt } from 'nodejs-jsencrypt';
import { IConfig } from "../interfaces/config.interface";

@Injectable()
export class StoreService implements OnModuleInit {
    private readonly publicKey = '-----BEGIN PUBLIC KEY-----\n' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Q5sipeAib/aqutKquf+\n' +
        'emY+X8fSsJL33XnvAR990f6lgZndY2q+nu6uDK7EKyNQWAyh4KJVOFdLpoq/59Fo\n' +
        'MfQkn1Nc5nig/nAFDrTscPVY5O6f4DEGkaQWfa9nPJZpiBqPNam/HwXya6xMK/ZN\n' +
        'DOKz4eyqLPJN7240MvrwpiA78bRmq3l7FrZGAFYOfRQNKoc65tEQ8UKKU7asncLC\n' +
        'yPYjkjjIn6jH+u3ZucHtnMycBYzQsvrcMI69NgCIP5IsVrdq53bvFLiOmyDakZQD\n' +
        'DGI18UDYujaC0UCB8B7QZUXm6ShrWqqEu9UqYRg5TH8G58Em7LdKSLAyQY0Nc/u4\n' +
        'mwIDAQAB\n' +
        '-----END PUBLIC KEY-----';
    private readonly privateKey = '-----BEGIN PRIVATE KEY-----\n' +
        'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDRDmyKl4CJv9qq\n' +
        '60qq5/56Zj5fx9Kwkvfdee8BH33R/qWBmd1jar6e7q4MrsQrI1BYDKHgolU4V0um\n' +
        'ir/n0Wgx9CSfU1zmeKD+cAUOtOxw9Vjk7p/gMQaRpBZ9r2c8lmmIGo81qb8fBfJr\n' +
        'rEwr9k0M4rPh7Kos8k3vbjQy+vCmIDvxtGareXsWtkYAVg59FA0qhzrm0RDxQopT\n' +
        'tqydwsLI9iOSOMifqMf67dm5we2czJwFjNCy+twwjr02AIg/kixWt2rndu8UuI6b\n' +
        'INqRlAMMYjXxQNi6NoLRQIHwHtBlRebpKGtaqoS71SphGDlMfwbnwSbst0pIsDJB\n' +
        'jQ1z+7ibAgMBAAECggEAUjXF4UpqtcDIkOYuWr8Yh7GlXa0K4X0qE+JbZqmnpOjq\n' +
        '1OhY8zuK8p0RvNMNOZmNgtKU5e1wbdOGYFu308W5n8tOi4kQw2E0jlom4v2q7VDO\n' +
        'QFjGbjdZSfSpE4vioSTVIzyujH/QNLb1+fmriq405phP/MxAr6QpmbpQtKuR7wGP\n' +
        '/u6D4fm0cSI+joMaoP6eHZVII7qpbj0z2nRMxM0yoBbHK/sG6WR4yciBXzcCwuQ0\n' +
        'TLwcSfJ4eyXkO5CnIWcXlQ42sO149QcJ6iM9fihbyY7xCq2t3MwwFby/cVcNoOzV\n' +
        'L7imGKmg+qj4fKlV1S3YyrEtL4a90a+E/w+OelfToQKBgQDv+BRDTe+ackEJsWX3\n' +
        'p9Iys6Nd0VXRZjkje5dJsbI+gdZpQySTg5SptHHJ6+oYrmotr4+hNuypCHdMy1sy\n' +
        'scX23tHvgKX747d2h8ccAmEOXODsbOar4wgEyg9R5hnxAmC0L4Megnm7pMImTxbu\n' +
        'FXx3wVEm2F8Jz2UQn3grQdhuJQKBgQDfBa3v8ioEdBN+0F8huAqDmyHzAaqjYiAR\n' +
        'inFnM82IUVxye+A/ZXi9iu6KgKNTJOiT6f2SmRzWUvrMOaVtNuEjbZZ0naVsbo0B\n' +
        'LXvCcHeOMevno2+qVSecFj4g/9KUsDso035iKwlkzRJtqh/xZKqcQbbszU2CtFz8\n' +
        'D01eYenvvwKBgD+At+QDuNd3SszE3EYIbDCspxvJrNsoIRDJwQRoeNHfzBy4/vHm\n' +
        'jS3HqaEUxDNZ3JFQd0LjZQdqTR/OZMjqkIe++XFW6xXYchF05vT7kDGb1I3cV8K+\n' +
        '5r1Vt24l5VGJHowwUpN9VbeZZyN6JIhGuVR7nP0ZnzTaZFVczhEscJjdAoGAECI0\n' +
        'DAiju4C+LE1cpG7Q6+ZcFV1If9tIYJx4SbP4qWThYDLP7SYlDukvCnv11Lz1ykWC\n' +
        'H4nOCT8lf4KoEfeHX+28laEV53sz3iLxMga6z2GTJEWxfUv9uo/tXKvFCxaYoQJz\n' +
        'wRxF6LHhJGfLOcZDhVxHpGfRtKPhmiZtPWet6bcCgYAkTskr18FALSJYPTXzp9o6\n' +
        'n6gBCGVugRuof8pPYdO3tOICd0o3Kl9XBqisYSeFjcCxNMythWhbqEvZeEfiB+ZY\n' +
        '2hYMaG8i8ZK16RHhYAY1PDN8mo47/K0priP38lDxnk3pw8VlVGBxbmjbsSDjAFKq\n' +
        'jbpXvu01QC0rQcUiht1Qlw==\n' +
        '-----END PRIVATE KEY-----';
    private readonly homePath = app.getPath('home');
    private readonly appPath = resolve(this.homePath, 'dolphin');
    private readonly hostsFilename = 'hosts.data';
    private readonly configFilename = 'data.data';
    private hosts: SSHConfig[] = [];
    private config: IConfig = { proxyPort: 1080 };
    private encrypt = new JSEncrypt();
    private decrypt = new JSEncrypt();

    constructor(
        private readonly hostHelper: HostHelper,
    ) {
        this.decrypt.setPrivateKey(this.privateKey);
        this.encrypt.setPublicKey(this.publicKey);
    }

    onModuleInit(): any {
        mkdirp(this.appPath);
        try {
            const dataEncrypted = readFileSync(resolve(this.appPath, this.hostsFilename)).toString();
            this.hosts = JSON.parse(this.decrypt.decrypt(dataEncrypted)) || [] as SSHConfig[];
        } catch (e) {
            console.log(e);
        }
        try {
            const configEncrypted = readFileSync(resolve(this.appPath, this.configFilename)).toString();
            this.config = JSON.parse(this.decrypt.decrypt(configEncrypted)) || { proxyPort: 1080 } as IConfig;
        } catch (e) {
            console.log(e);
        }
    }

    getConfig(): IConfig {
        return this.config;
    }

    updateConfig(config: IConfig) {
        this.config = config;
        writeFileSync(
            resolve(this.appPath, this.configFilename),
            this.encrypt.encrypt(JSON.stringify(config))
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
            this.encrypt.encrypt(JSON.stringify([...this.hosts]))
        );
    }
}
