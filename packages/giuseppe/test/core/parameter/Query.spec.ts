import 'reflect-metadata';

import { GiuseppeQueryParameter } from '../../../src/core/parameters/Query';

describe('Giuseppe query parameter', () => {

    it('should inject the correct aliased value', () => {
        const request: any = {
            query: {
                t: 'value',
            },
        };
        const instance = new GiuseppeQueryParameter(
            'name',
            String,
            0,
            false,
            null,
            null,
            't',
        );

        expect(instance.getValue(request)).toBe('value');
    });

    it('should inject the correct multi aliased value', () => {
        const request: any = {
            query: {
                te: 'value',
            },
        };
        const instance = new GiuseppeQueryParameter(
            'name',
            String,
            0,
            false,
            null,
            null,
            ['t', 'te'],
        );

        expect(instance.getValue(request)).toBe('value');
    });

    it('should inject the correct value if no alias hits', () => {
        const request: any = {
            query: {
                name: 'value',
            },
        };
        const instance = new GiuseppeQueryParameter(
            'name',
            String,
            0,
            false,
            null,
            null,
            't',
        );

        expect(instance.getValue(request)).toBe('value');
    });

    it('should inject the correct value if an alias hits and the not alias value is present', () => {
        const request: any = {
            query: {
                t: 'value',
                name: 'nooo',
            },
        };
        const instance = new GiuseppeQueryParameter(
            'name',
            String,
            0,
            false,
            null,
            null,
            't',
        );

        expect(instance.getValue(request)).toBe('value');
    });

});
