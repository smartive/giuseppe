import 'reflect-metadata';

import { NoReturnValueHandlerFoundError } from '../src/errors/NoReturnValueHandlerFoundError';
import { ReturnTypeHandler } from '../src/ReturnTypeHandler';
import { ReturnType } from '../src/routes/ReturnType';

describe('ReturnTypeHandler', () => {

    describe('constructor', () => {

        it('should register all given return types', () => {
            const types: ReturnType<any>[] = [
                {
                    type: 'default',
                    getHeaders: () => ({}),
                    getStatus: () => 0,
                    getValue: () => '',
                },
                {
                    type: 'String',
                    getHeaders: () => ({}),
                    getStatus: () => 0,
                    getValue: () => '',
                },
            ];

            const handler = new ReturnTypeHandler(types);

            expect(Object.keys((handler as any).returnTypes)).toEqual(expect.arrayContaining(['default', 'String']));
        });

        it('should overwrite a duplicate return type', () => {
            const rt1 = {
                type: 'default',
                getHeaders: () => ({}),
                getStatus: () => 0,
                getValue: () => '',
            };
            const rt2 = {
                type: 'default',
                getHeaders: () => ({}),
                getStatus: () => 0,
                getValue: () => '',
            };
            const types: ReturnType<any>[] = [rt1, rt2];

            const handler = new ReturnTypeHandler(types);

            expect((handler as any).returnTypes['default']).toBe(rt2);
        });

    });

    describe('handleValue()', () => {

        let response: any;

        beforeEach(() => {
            response = {
                status: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                end: jest.fn().mockReturnThis(),
            } as any;
        });

        it('should select the default handler if no handler is registered', () => {
            const type = {
                type: 'default',
                getHeaders: jest.fn(),
                getStatus: jest.fn(),
                getValue: jest.fn(),
            };
            const handler = new ReturnTypeHandler([type]);

            handler.handleValue('foobar', response);

            expect(type.getHeaders.mock.calls.length).toBe(1);
        });

        it('should handle a value with a correct handler', () => {
            const type1 = {
                type: 'default',
                getHeaders: jest.fn(),
                getStatus: jest.fn(),
                getValue: jest.fn(),
            };
            const type2 = {
                type: 'Number',
                getHeaders: jest.fn(),
                getStatus: jest.fn(),
                getValue: jest.fn(),
            };
            const handler = new ReturnTypeHandler([type1, type2]);

            handler.handleValue(1, response);

            expect(type1.getHeaders.mock.calls.length).toBe(0);
            expect(type2.getHeaders.mock.calls.length).toBe(1);
        });

        it('should throw an error if no handler is registered', () => {
            const handler = new ReturnTypeHandler([]);

            const fn = () => {
                handler.handleValue('', response);
            };

            expect(fn).toThrow(NoReturnValueHandlerFoundError);
        });

        it('should not call send if the value is not set', () => {
            const type = {
                type: 'default',
                getHeaders: jest.fn(),
                getStatus: jest.fn(),
                getValue: jest.fn(),
            };

            const handler = new ReturnTypeHandler([type]);

            handler.handleValue(null, response);

            expect(response.status.mock.calls.length).toBe(1);
            expect(response.set.mock.calls.length).toBe(1);
            expect(response.send.mock.calls.length).toBe(0);
        });

        it('should select the default handler if the value is not set', () => {
            const type = {
                type: 'default',
                getHeaders: jest.fn(),
                getStatus: jest.fn(),
                getValue: jest.fn(),
            };

            const handler = new ReturnTypeHandler([type]);

            handler.handleValue(null, response);

            expect(type.getHeaders.mock.calls.length).toBe(1);
            expect(type.getStatus.mock.calls.length).toBe(1);
            expect(type.getValue.mock.calls.length).toBe(0);
        });

    });

});
