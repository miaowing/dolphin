import { SSHConfig } from "./ssh-config.interface";

export interface IConnectStatus {
    success: boolean;
    message: string;
    host?: SSHConfig;
    e?: Error;
}
