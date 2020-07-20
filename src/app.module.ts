import { Global, Module } from '@nestjs/common';
import { ConnectService, ProxyService, SSHService, StoreService } from "./services";
import { HostHelper, SleepHelper } from "./helpers";
import { LoggerModule } from "@nestcloud/logger";

@Global()
@Module({
    imports: [
        LoggerModule.forRoot(),
    ],
    providers: [SSHService, ProxyService, ConnectService, StoreService, HostHelper, SleepHelper],
    controllers: []
})
export class AppModule {

}
