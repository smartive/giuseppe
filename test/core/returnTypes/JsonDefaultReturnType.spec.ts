import 'reflect-metadata';

import * as httpStatus from 'http-status';

import { JsonDefaultReturnType } from '../../../src/core/returnTypes/JsonDefaultReturnType';

describe('JsonDefaultReturnType', () => {

    const handler = new JsonDefaultReturnType();

    describe('getHeaders()', () => {

        it('should return the application/json type', () => {
            expect(handler.getHeaders()['Content-Type']).toBeDefined();
            expect(handler.getHeaders()['Content-Type']).toBe('application/json');
        });

    });

    describe('getStatus()', () => {

        it('should return OK with a value', () => {
            expect(handler.getStatus('foobar')).toBe(httpStatus.OK);
            expect(handler.getStatus(1337)).toBe(httpStatus.OK);
        });

        it('should return NO CONTENT without a value', () => {
            expect(handler.getStatus(undefined)).toBe(httpStatus.NO_CONTENT);
            expect(handler.getStatus(null)).toBe(httpStatus.NO_CONTENT);
        });

    });

    describe('getValue()', () => {

        const cases = [
            {
                value: 'foobar',
                result: '"foobar"',
            },
            {
                value: 1337,
                result: '1337',
            },
            {
                value: null,
                result: 'null',
            },
            {
                value: undefined,
                result: undefined,
            },
            {
                value: {},
                result: '{}',
            },
            {
                value: { foo: 'bar', baz: 1337 },
                result: '{"foo":"bar","baz":1337}',
            },
        ];

        for (const valueCase of cases) {
            it(`should be able to get a value for: ` +
               `${valueCase.value}; constructor: ${valueCase.value ? valueCase.value.constructor.name : valueCase.value} `,
               () => { expect(handler.getValue(valueCase.value)).toBe(valueCase.result); },
            );
        }

    });

});
