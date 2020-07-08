import { Global, Module } from '@nestjs/common';
import { ConnectService, ProxyService, SSHService, StoreService } from "./services";
import { HostHelper, SleepHelper } from "./helpers";

@Global()
@Module({
    imports: [],
    providers: [SSHService, ProxyService, ConnectService, StoreService, HostHelper, SleepHelper],
    controllers: []
})
export class AppModule {

}
