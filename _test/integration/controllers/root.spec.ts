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

describe('Integration tests for "root"-routes', () => {

    before(() => {
        require('./root');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should return body for GET /another/root', done => {
        http.request(app)
            .get('/another/root')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('another-root');

                done();
            });
    });

    it('should return body for GET /a-third', done => {
        http.request(app)
            .get('/a-third')
            .end((error, result) => {
                basicCheck(error, result);

                (result as any).text.should.be.equal('a-third-root');

                done();
            });
    });
});
