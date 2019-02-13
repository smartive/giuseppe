import { createServer } from 'http';
import { AddressInfo } from 'net';

export function getRandomPort(): Promise<number> {
    const server = createServer();
    return new Promise((resolve, reject) => {
        server.listen(0);
        server.on('listening', () => {
            try {
                const port = (server.address() as AddressInfo).port;
                server.close(() => {
                    resolve(port);
                });
            } catch (e) {
                reject(e);
            }
        });
        server.on('error', reject);
    });
}
