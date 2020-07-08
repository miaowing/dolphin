import { Injectable } from "@nestjs/common";

@Injectable()
export class SleepHelper {
    async sleep(timeout: number) {
        return new Promise((resolve => {
            setTimeout(() => resolve(), timeout);
        }));
    }
}
