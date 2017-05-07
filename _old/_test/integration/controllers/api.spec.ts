import {registerControllers} from '../../../';
import {Registrar} from '../../../core/Registrar';
import {IocContainer} from '../../../core/IoC';
import {IoCSymbols} from '../../../core/IoCSymbols';
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

describe('Integration tests for /api/objects', () => {

    before(() => {
        require('./api');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should return an empty array for GET /api/objects', done => {
        http.request(app)
            .get('/api/objects')
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.be.an('array').which.is.empty;

                done();
            });
    });

    it('should return a 404 for GET /api/objects/1', done => {
        http.request(app)
            .get('/api/objects/1')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(404);

                done();
            });
    });

    it('should return a 404 for PUT /api/objects/1', done => {
        http.request(app)
            .put('/api/objects/1')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(404);

                done();
            });
    });

    it('should return a 404 for DEL /api/objects/1', done => {
        http.request(app)
            .del('/api/objects/1')
            .end((error, result) => {
                should.exist(error);
                result.status.should.equals(404);

                done();
            });
    });

    it('should return the created object for POST /api/objects', done => {
        http.request(app)
            .post('/api/objects')
            .send({name: 'First object'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('id').which.is.equal(1);
                result.body.should.have.property('name').which.is.equal('First object');

                done();
            });
    });

    it('should return the second created object for PUT /api/objects', done => {
        http.request(app)
            .put('/api/objects')
            .send({name: 'Second object'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('id').which.is.equal(2);
                result.body.should.have.property('name').which.is.equal('Second object');

                done();
            });
    });

    it('should return the updated object for PUT /api/objects/1', done => {
        http.request(app)
            .put('/api/objects/1')
            .send({name: 'First object updated'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('id').which.is.equal(1);
                result.body.should.have.property('name').which.is.equal('First object updated');

                done();
            });
    });

    it('should return the second updated object for PUT /api/objects/2', done => {
        http.request(app)
            .put('/api/objects/2')
            .send({name: 'Second object updated'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('id').which.is.equal(2);
                result.body.should.have.property('name').which.is.equal('Second object updated');

                done();
            });
    });

    it('should return 204 for DEL /api/objects/1', done => {
        http.request(app)
            .del('/api/objects/1')
            .end((error, result) => {
                result.status.should.equals(204);

                done();
            });
    });

    it('should return 204 for DEL /api/objects/2', done => {
        http.request(app)
            .del('/api/objects/2')
            .end((error, result) => {
                result.status.should.equals(204);

                done();
            });
    });

    it('should return 404 for HEAD /api/objects/1', done => {
        http.request(app)
            .del('/api/objects/1')
            .end((error, result) => {
                result.status.should.equals(404);

                done();
            });
    });

    it('should return 200 for HEAD /api/objects/1 after POST /api/objects', done => {
        http.request(app)
            .post('/api/objects')
            .send({name: 'First object'})
            .end((error, result) => {
                basicCheck(error, result);

                result.body.should.have.property('id').which.is.equal(1);
                result.body.should.have.property('name').which.is.equal('First object');

                http.request(app)
                    .head('/api/objects/1')
                    .end((error, result) => {
                        basicCheck(error, result);

                        done();
                    });
            });
    });
});
