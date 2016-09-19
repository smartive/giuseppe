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

describe('Integration tests for /api/secure', () => {

    before(() => {
        require('./middleware');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should return 401 for GET /api/secure', done => {
        http.request(app)
            .get('/api/secure')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(401);

                done();
            });
    });

    it('should return 401 for POST /api/secure (2 middlewares)', done => {
        http.request(app)
            .post('/api/secure')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(401);

                done();
            });
    });

    it('should return an authorized response for GET /api/secure?user=giuseppe&pass=secure', done => {
        http.request(app)
            .get('/api/secure?user=giuseppe&pass=secure')
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('secure').which.is.equal('object');

                done();
            });
    });

    it('should return a 403 for POST /api/secure?user=giuseppe&pass=secure', done => {
        http.request(app)
            .post('/api/secure?user=giuseppe&pass=secure')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(403);

                done();
            });
    });

    it('should return an authorized response for  POST /api/secure?user=giuseppe&pass=secure&admin=true', done => {
        http.request(app)
            .post('/api/secure?user=giuseppe&pass=secure&admin=true')
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('secure').which.is.equal('object');
                result.body.should.have.property('admin').which.is.equal(true);

                done();
            });
    });
});
