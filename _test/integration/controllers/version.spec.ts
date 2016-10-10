import 'reflect-metadata';
import { registerControllers } from '../../../';
import { IocContainer } from '../../../core/IoC';
import { IoCSymbols } from '../../../core/IoCSymbols';
import { Registrar } from '../../../core/Registrar';
import chai = require('chai');
import chaiHttp = require('chai-http');
import express = require('express');

let app = express();
app.use(require('body-parser').json());

const should = chai.should();

chai.use(chaiHttp);

let http: Chai.ChaiStatic = chai as any,
    server;

describe('Integration tests for route versioning', () => {

    before(() => {
        require('./version');
        app.use(registerControllers('/api'));
        server = app.listen(8080);
    });

    after(() => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).resetControllerRegistrations();
        server.close();
    });

    it('should route a version number to a controller', done => {
        http.request(app)
            .get('/api/versioning/ctrl/v1')
            .set('Accept-Version', '1')
            .then(res => {
                (res as any).text.should.equal('found-ctrl');
                done();
            })
            .catch(done);
    });

    it('should route a version number to a route', done => {
        http.request(app)
            .get('/api/versioning/route/v1')
            .set('Accept-Version', '1')
            .then(res => {
                (res as any).text.should.equal('found-route');
                done();
            })
            .catch(done);
    });

    it('should route a version to the correct controller', done => {
        http.request(app)
            .get('/api/versioning/ctrls')
            .set('Accept-Version', '2')
            .then(res => {
                (res as any).text.should.equal('found-ctrl-v2');
                done();
            })
            .catch(done);
    });

    it('should route a version to the correct route', done => {
        http.request(app)
            .get('/api/versioning/routes')
            .set('Accept-Version', '2')
            .then(res => {
                (res as any).text.should.equal('found-route-v2');
                done();
            })
            .catch(done);
    });

    it('should use the correct non versioned controller', done => {
        http.request(app)
            .get('/api/versioning/ctrl/nonversioned')
            .set('Accept-Version', '1337')
            .then(res => {
                (res as any).text.should.equal('found-non-versioned-ctrl');
                done();
            })
            .catch(done);
    });

    it('should use the correct non versioned route', done => {
        http.request(app)
            .get('/api/versioning/route/nonversioned')
            .set('Accept-Version', '1337')
            .then(res => {
                (res as any).text.should.equal('found-non-versioned-route');
                done();
            })
            .catch(done);
    });

    it('should prefer route version over controller version', done => {
        Promise
            .all([
                http.request(app)
                    .get('/api/versioning/route-ctrl')
                    .set('Accept-Version', '2'),
                http.request(app)
                    .get('/api/versioning/route-ctrl')
                    .set('Accept-Version', '3')
            ])
            .then(res => {
                (res[0] as any).text.should.equal('found-ctrl-route-v2');
                (res[1] as any).text.should.equal('found-ctrl-route-v3');
                done();
            })
            .catch(done);
    });

    it('should correctly map header to v1 if header is not provided', done => {
        http.request(app)
            .get('/api/versioning/ctrl/v1')
            .then(res => {
                (res as any).text.should.equal('found-ctrl');
                done();
            })
            .catch(done);
    });

    it('should correctly map header to v1 if header is jibberish', done => {
        http.request(app)
            .get('/api/versioning/ctrl/v1')
            .set('Accept-Version', 'foobar')
            .then(res => {
                (res as any).text.should.equal('found-ctrl');
                done();
            })
            .catch(done);
    });

    it('should pass query params to a versioned route', done => {
        http.request(app)
            .get('/api/versioning/query-param?qParam=yay')
            .set('Accept-Version', '1')
            .then(res => {
                should.exist(res.body.qParam);
                res.body.qParam.should.equal('yay');
                done();
            })
            .catch(done);
    });

    it('should pass url params to a versioned route', done => {
        http.request(app)
            .get('/api/versioning/url-param/foobar')
            .set('Accept-Version', '1')
            .then(res => {
                should.exist(res.body.param);
                res.body.param.should.equal('foobar');
                done();
            })
            .catch(done);
    });

    it('should return 404 if a route is not available in a certain version', done => {
        http.request(app)
            .get('/api/versioning/404')
            .set('Accept-Version', '4')
            .then(res => {
                done(new Error('did not return 404'));
            })
            .catch(err => {
                err.status.should.equal(404);
                done();
            })
            .catch(done);
    });

    it('should return 404 if a route is directly called with the hashed url', done => {
        http.request(app)
            .get('/api/versioning/404/66c17c4af64020041c3236a80dab013031501ad39da0f5c88ecfc859fb7b5047')
            .set('Accept-Version', '3')
            .then(res => {
                done(new Error('did not return 404'));
            })
            .catch(err => {
                err.status.should.equal(404);
                done();
            })
            .catch(done);
    });

    it('should return 404 if a route is directly called with the hashed url and query params', done => {
        http.request(app)
            .get('/api/versioning/404/66c17c4af64020041c3236a80dab013031501ad39da0f5c88ecfc859fb7b5047?foo=bar')
            .set('Accept-Version', '3')
            .then(res => {
                done(new Error('did not return 404'));
            })
            .catch(err => {
                err.status.should.equal(404);
                done();
            })
            .catch(done);
    });

    it('should call the route specific middleware', done => {
        Promise
            .all([
                http.request(app)
                    .get('/api/versioning/middleware')
                    .set('Accept-Version', '1'),
                http.request(app)
                    .get('/api/versioning/middleware')
                    .set('Accept-Version', '2')
            ])
            .then(res => {
                (res[0] as any).get('X-Test').should.equal('v1');
                (res[1] as any).get('X-Test').should.equal('v2');
                done();
            })
            .catch(done);
    });

});
