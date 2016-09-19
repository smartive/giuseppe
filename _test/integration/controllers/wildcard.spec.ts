import {request} from 'https';
import {Registrar} from '../../../core/Registrar';
import {IocContainer} from '../../../core/IoC';
import {IoCSymbols} from '../../../core/IoCSymbols';
import {registerControllers} from '../../../';
import chai = require('chai');
import chaiHttp = require('chai-http');
import express = require('express');

let app = express();
app.use(require('body-parser').json());

const should = chai.should();

chai.use(chaiHttp);

let http: Chai.ChaiStatic = chai as any,
    server;

function basicCheck(error: any, result: ChaiHttp.Response) {
    if (error) {
        console.error(JSON.stringify(error));
    }
    should.not.exist(error);
    should.exist(result.body);

    result.status.should.equals(200);
}

describe('Integration tests for /api/wildcard', () => {

    before(() => {
        require('./wildcard');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should return body for GET /api/wildcard/foo (Wildcard route for all requests)', done => {
        http.request(app)
            .get('/api/wildcard/foo')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('catch-all');

                done();
            });
    });

    it('should return body for GET /api/wildcard/foo/bar/baz (Wildcard route for all requests with multiple segments)', done => {
        http.request(app)
            .get('/api/wildcard/foo/bar/baz')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('catch-all');

                done();
            });
    });

    it('should return body for GET /api/wildcard/giuseppe/is (One wildcard in route)', done => {
        http.request(app)
            .get('/api/wildcard/giuseppe/is')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('one-wildcard');

                done();
            });
    });

    it('should return body for GET /api/wildcard/giuseppe/is/awesome/yea (Two wildcards in route)', done => {
        http.request(app)
            .get('/api/wildcard/giuseppe/is/awesome/yea')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('two-wildcards');

                done();
            });
    });

    it('should return body for GET /api/wildcard/giuseppe/is/awesome/for/api/coding/yeah (Three wildcards in route)', done => {
        http.request(app)
            .get('/api/wildcard/giuseppe/is/awesome/for/api/coding/yeah')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('three-wildcards');

                done();
            });
    });

    it('should return body for GET /api/wildcard/giuseppe/is/awesome/for/api/coding/if/you/know/that/yeah (Three wildcards in route with multiple segments)', done => {
        http.request(app)
            .get('/api/wildcard/giuseppe/is/awesome/for/api/coding/if/you/know/that/yeah')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('three-wildcards');

                done();
            });
    });
});
