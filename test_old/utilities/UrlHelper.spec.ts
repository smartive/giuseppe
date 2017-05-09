import 'reflect-metadata';
import { UrlHelper } from '../../src/utilities/UrlHelper';
import chai = require('chai');

chai.should();

describe('UrlHelper', () => {

    describe('buildUrl()', () => {

        it('should return an empty string with no input', () => {
            UrlHelper.buildUrl().should.equal('');
        });

        it('should return the correct url without starting slash', () => {
            UrlHelper.buildUrl('/api').should.equal('api');
        });

        it('should strip starting slashes from parts', () => {
            UrlHelper.buildUrl('/api', '/foobar').should.equal('api/foobar');
        });

        it('should strip double slashes', () => {
            UrlHelper.buildUrl('/api', '/', '/foobar').should.equal('api/foobar');
        });

        it('should strip empty parts', () => {
            UrlHelper.buildUrl('api', undefined as any, 'foobar').should.equal('api/foobar');
        });

        it('should return a root url correctly', () => {
            UrlHelper.buildUrl('api', '~/foobar').should.equal('foobar');
        });

        it('should return a built url', () => {
            UrlHelper.buildUrl('api', 'foobar', '1337').should.equal('api/foobar/1337');
        });

    });

});
