import { Controller, Get, Giuseppe } from 'giuseppe';
import * as request from 'request';

import { GiuseppeVersionPlugin, Version } from '../src';

async function sendRequest(
    url: string,
    headers?: request.Headers,
): Promise<{ response: request.RequestResponse, body: any }> {
    return new Promise<{ response: request.RequestResponse, body: any }>((resolve, reject) => {
        request.get(url, { headers }, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ response, body });
        });
    });
}

describe('GiuseppeRouteVersion <integration test>', () => {

    let giusi: Giuseppe;
    let controller: Function;

    beforeAll(() => {
        @Controller()
        class Ctrl {
            @Version({ from: 1, until: 1 })
            @Get('version')
            public funcV1(): string {
                return 'v1';
            }

            @Version({ from: 2, until: 4 })
            @Get('version')
            public funcV2toV4(): string {
                return 'v2-v4';
            }

            @Version({ from: 6 })
            @Get('version')
            public funcV6(): string {
                return 'v6';
            }

            @Get('normal')
            public funcNormal(): string {
                return 'normal';
            }
        }

        controller = Ctrl;

        giusi = new Giuseppe();
        giusi.registerPlugin(new GiuseppeVersionPlugin());

        giusi.start();
    });

    afterAll(() => {
        giusi.stop();
        (Giuseppe as any).registrar.controller = [];
    });

    it('should return 404 if no matching url is found', async () => {
        const { response } = await sendRequest('http://localhost:8080');

        expect(response.statusCode).toBe(404);
    });

    const versionCases = [
        {
            version: '1',
            response: '"v1"',
        },
        {
            version: '2',
            response: '"v2-v4"',
        },
        {
            version: '3',
            response: '"v2-v4"',
        },
        {
            version: '4',
            response: '"v2-v4"',
        },
        {
            version: '6',
            response: '"v6"',
        },
        {
            version: '7',
            response: '"v6"',
        },
    ];
    for (const versionCase of versionCases) {
        it('should route to the correct version', async () => {
            const { body } = await sendRequest('http://localhost:8080/version', {
                'Accept-Version': versionCase.version,
            });

            expect(body).toBe(versionCase.response);
        });
    }

    it('should route to a non versioned method', async () => {
        const { body } = await sendRequest('http://localhost:8080/normal');

        expect(body).toBe('"normal"');
    });

    it('should return 404 if the version of the route is not found', async () => {
        const { response } = await sendRequest('http://localhost:8080/version', {
            'Accept-Version': '5',
        });

        expect(response.statusCode).toBe(404);
    });

    it('should default to v1 if no header is present', async () => {
        const { response, body } = await sendRequest('http://localhost:8080/version');

        expect(response.statusCode).toBe(200);
        expect(body).toBe('"v1"');
    });

    it('should default to v1 if header is not parsable to int', async () => {
        const { response, body } = await sendRequest('http://localhost:8080/version', {
            'Accept-Version': 'NaN',
        });

        expect(response.statusCode).toBe(200);
        expect(body).toBe('"v1"');
    });

});
