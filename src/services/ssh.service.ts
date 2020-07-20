import { Client } from 'ssh2';
import * as socks from 'socksv5';
import { SSHConfig } from "../interfaces/ssh-config.interface";
import { Injectable } from "@nestjs/common";
import { StoreService } from "./store.service";

@Injectable()
export class SSHService {
    private server: any;

    constructor(
        private readonly storeService: StoreService,
    ) {
    }

    stopProxy() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    async createProxy(config: SSHConfig) {
        return new Promise(((resolve, reject) => {
            if (this.server) {
                this.stopProxy();
            }

            const { proxyPort } = this.storeService.getConfig();

            this.server = socks.createServer((info, accept, deny) => {
                const conn = new Client();
                conn.on('ready', function () {
                    conn.forwardOut(info.srcAddr,
                        info.srcPort,
                        info.dstAddr,
                        info.dstPort,
                        (err, stream) => {
                            if (err) {
                                console.log(err);
                                conn.end();
                                return deny();
                            }

                            let clientSocket;
                            if (clientSocket = accept(true)) {
                                stream.pipe(clientSocket).pipe(stream).on('close', function () {
                                    conn.end();
                                });
                            } else
                                conn.end();
                        });
                }).on('error', (err) => {
                    console.log(err);
                    deny();
                }).connect(config);
            }).listen(proxyPort, '127.0.0.1', () => {
                console.log('SOCKSv5 proxy server started on port ' + proxyPort);
                resolve();
            }).useAuth(socks.auth.None());
        }))
    }
}
