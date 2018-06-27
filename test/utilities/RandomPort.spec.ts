import { getRandomPort } from '../../src/utilities/RandomPort';

describe('RandomPort', () => {

    describe('getRandomPort()', () => {

        it('should return a random port', async () => {
            const port = await getRandomPort();

            expect(port).toBeGreaterThan(0);
            expect(port).toBeLessThan(65536);
        });

        it('should return multiple random ports', async () => {
            const ports = await Promise.all([
                getRandomPort(),
                getRandomPort(),
                getRandomPort(),
                getRandomPort(),
            ]);

            for (const port of ports) {
                expect(port).toBeGreaterThan(0);
                expect(port).toBeLessThan(65536);
            }
        });

    });

});
