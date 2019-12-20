import 'reflect-metadata';

import { UrlHelper } from '../../src/utilities/UrlHelper';

describe('UrlHelper', () => {

    describe('buildUrl()', () => {

        it('should return an empty string with no input', () => {
            expect(UrlHelper.buildUrl()).toBe('');
        });

        it('should return the correct url without starting slash', () => {
            expect(UrlHelper.buildUrl('/api')).toBe('api');
        });

        it('should strip starting slashes from parts', () => {
            expect(UrlHelper.buildUrl('/api', '/foobar')).toBe('api/foobar');
        });

        it('should strip double slashes', () => {
            expect(UrlHelper.buildUrl('/api', '/', '/foobar')).toBe('api/foobar');
        });

        it('should strip empty parts', () => {
            expect(UrlHelper.buildUrl('api', undefined as any, 'foobar')).toBe('api/foobar');
        });

        it('should return a root url correctly', () => {
            expect(UrlHelper.buildUrl('api', '/foobar')).toBe('api/foobar');
        });

        it('should return a built url', () => {
            expect(UrlHelper.buildUrl('api', 'foobar', '1337')).toBe('api/foobar/1337');
        });

    });

});
