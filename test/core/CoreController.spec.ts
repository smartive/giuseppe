import { Get } from '../../src/core/routes';
import 'reflect-metadata';
import { Giuseppe } from '../../src/';
import { Controller } from '../../src/core/controller/GiuseppeApiController';
import chai = require('chai');
import sinonChai = require('sinon-chai');

const should = chai.should();
chai.use(sinonChai);

describe('Core controller', () => {

    describe('@Controller decorator', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        afterEach(() => {
            (Giuseppe.registrar as any).controller = [];
        });

        it('should return Controller decorator', () => {
            Controller().should.be.a('function');
        });

        it('should register a controller in giuseppe.', () => {
            @Controller()
            class Ctrl { }

            Giuseppe.registrar.controller.should.have.length(1);
        });

        it('should register the correct contextual target', () => {
            @Controller()
            class Ctrl { }

            Giuseppe.registrar.controller[0].ctrlTarget.should.equal(Ctrl);
        });

        it('should use the correct route prefix', () => {
            @Controller('foobar')
            class Ctrl { }

            (Giuseppe.registrar.controller[0] as any).routePrefix.should.equal('foobar');
        });

        it('should use the correct middlewares when prefix is set', () => {
            const fn = (req, res, next) => { next(); };
            @Controller('foobar', fn)
            class Ctrl { }

            (Giuseppe.registrar.controller[0] as any).routePrefix.should.equal('foobar');
            Giuseppe.registrar.controller[0].middlewares[0].should.equal(fn);
        });

        it('should use the correct middlewares when prefix is not set', () => {
            const fn = (req, res, next) => { next(); };
            @Controller(fn)
            class Ctrl { }

            (Giuseppe.registrar.controller[0] as any).routePrefix.should.equal('');
            Giuseppe.registrar.controller[0].middlewares[0].should.equal(fn);
        });

        it('should use the correct middlewares for multiple functions with a prefix', () => {
            const fn = (req, res, next) => { next(); },
                fn2 = (req, res, next) => { next(); };
            @Controller('foobar', fn, fn2)
            class Ctrl { }

            (Giuseppe.registrar.controller[0] as any).routePrefix.should.equal('foobar');
            Giuseppe.registrar.controller[0].middlewares[0].should.equal(fn);
            Giuseppe.registrar.controller[0].middlewares[1].should.equal(fn2);
        });

        it('should use the correct middlewares for multiple functions', () => {
            const fn = (req, res, next) => { next(); },
                fn2 = (req, res, next) => { next(); };
            @Controller(fn, fn2)
            class Ctrl { }

            (Giuseppe.registrar.controller[0] as any).routePrefix.should.equal('');
            Giuseppe.registrar.controller[0].middlewares[0].should.equal(fn);
            Giuseppe.registrar.controller[0].middlewares[1].should.equal(fn2);
        });

        it('should throw if the controller (plugin) is not registered', done => {
            (giuseppe as any).plugins = [];

            @Controller()
            class Ctrl { }

            try {
                giuseppe.start();
                done(new Error('did not throw.'));
            } catch (e) {
                done();
            }
        });

        it(`should return it's registered routes`, () => {
            @Controller()
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const ctrl = Giuseppe.registrar.controller[0];
            const route = ctrl.createRoutes('')[0];
            route.id.should.equal('get_');
            route.name.should.equal('get');
        });

        it('should return the correct route urls for default', () => {
            @Controller('api')
            class Ctrl {
                @Get('foobar')
                public get(): void { }

                @Get('/barfoo')
                public get2(): void { }
                
                @Get('~/rootfoo')
                public get3(): void { }
            }

            const ctrl = Giuseppe.registrar.controller[0],
                routes = ctrl.createRoutes('');
            
            let route = routes[0];
            route.id.should.equal('get_foobar');
            route.url.should.equal('api/foobar');

            route = routes[1];
            route.id.should.equal('get_/barfoo');
            route.url.should.equal('api/barfoo');
            
            route = routes[2];
            route.id.should.equal('get_~/rootfoo');
            route.url.should.equal('/rootfoo');
        });

    });

});
