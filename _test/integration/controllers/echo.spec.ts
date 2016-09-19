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

describe('Integration tests for /api/echo', () => {

    before(() => {
        require('./echo');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should return the correct url-param for GET /api/echo/my-fancy-id', done => {
        http.request(app)
            .get('/api/echo/my-fancy-id')
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('object')
                    .which.has.property('urlParam')
                    .and.is.equal('my-fancy-id');

                done();
            });
    });

    it('should return the correct query-param for GET /api/echo?query=query', done => {
        http.request(app)
            .post('/api/echo')
            .query({query: 'query'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('object')
                    .which.has.property('query')
                    .and.is.equal('query');

                done();
            });
    });

    it('should return the correct body-param for POST /api/echo', done => {
        http.request(app)
            .post('/api/echo')
            .send({name: 'body param'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('object')
                    .which.has.deep.property('body.name')
                    .and.is.equal('body param');

                done();
            });
    });

    it('should return the correct header-param for POST /api/echo', done => {
        http.request(app)
            .post('/api/echo')
            .set('header', 'header')
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('object')
                    .which.has.property('header')
                    .and.is.equal('header');

                done();
            });
    });

    it('should return the all given params for POST /api/echo?query=query', done => {
        http.request(app)
            .post('/api/echo')
            .set('header', 'header')
            .query({query: 'query'})
            .send({name: 'body param'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('object').which.has.property('header').and.is.equal('header');
                result.body.should.have.property('query').and.is.equal('query');
                result.body.should.have.deep.property('body.name').and.is.equal('body param');

                done();
            });
    });
});
