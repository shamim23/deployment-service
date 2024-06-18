import { createClient, commandOptions } from "redis";
// import { copyFinalDist, downloadS3Folder } from "./aws";
// import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

(async () => {
    const subscriber = createClient();
    subscriber.on('error', err => console.log('Redis Client Error', err));
    await subscriber.connect();
    subscriber.on('connect', () => {
        console.log('redis connected');
    });
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
          );
          console.log(res);
    }
})();

async function main() {
    while(1) {
        const res = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
          );
          console.log(res);
    }
    
}
// main();