import { Injectable } from "@nestjs/common";
import { SSHConfig } from "../interfaces/ssh-config.interface";

@Injectable()
export class HostHelper {
    public getHostKey(config: SSHConfig): string {
        return `${config.username}@${config.host}:${config.port}`;
    }

    public isExists(configs: SSHConfig[], hostname: string): boolean {
        return configs.filter(item => item.name === hostname).length > 0;
    }
}
