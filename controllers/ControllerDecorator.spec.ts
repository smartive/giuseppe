import 'reflect-metadata';
import {
    Controller,
    registerControllers,
    resetControllerRegistrations,
    registerControllersFromFolder
} from './ControllerDecorator';
import {Router} from 'express';
import {Get, Post, Put, Delete, Head, ROUTES_KEY, Route} from '../routes/RouteDecorators';
import {SinonSpy} from '~sinon/lib/sinon';
import {DuplicateRouteDeclarationError, HttpVerbNotSupportedError} from '../errors/Errors';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

class TestRouter {
    public routes: {[id: string]: Function} = {};

    public get(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public put(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public post(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public delete(route: string, func: Function): void {
        this.routes[route] = func;
    }

    public head(route: string, func: Function): void {
        this.routes[route] = func;
    }
}

describe('Controller', () => {

    afterEach(() => {
        resetControllerRegistrations();
    });

    describe('Decorator', () => {

        it('should return Controller decorator', () => {
            Controller().should.be.a('function')
                .and.have.lengthOf(1);
        });

        it('should set the correct this context', () => {

            @Controller()
            class Ctrl {
                private test = 'foobar';

                @Route()
                public func(): string {
                    this.should.be.an.instanceOf(Ctrl);
                    this.test.should.equal('foobar');
                    return this.test;
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: () => {
                }
            }, null]);
        });

    });

    describe('Register function', () => {

        let router: Router;

        beforeEach(() => {
            router = Router();
            sinon.stub(router, 'get');
            sinon.stub(router, 'put');
            sinon.stub(router, 'post');
            sinon.stub(router, 'delete');
            sinon.stub(router, 'head');
        });

        it('should register 1 controller with 1 function correctly', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): void {
                }
            }

            registerControllers('', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(1);

            router.get.should.be.calledWithExactly('/', routes[0].descriptor.value);
            router.put.should.not.be.called;
            router.post.should.not.be.called;
            router.delete.should.not.be.called;
        });

        it('should register 2 controller with 1 function correctly', () => {
            @Controller('1')
            class Ctrl {
                @Get()
                public func(): void {
                }
            }

            @Controller('2')
            class Ctrl2 {
                @Get()
                public func(): void {
                }
            }

            registerControllers('', router);

            router.get.should.be.calledTwice;
            router.put.should.not.be.called;
            router.post.should.not.be.called;
            router.delete.should.not.be.called;

            let routes1 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes1.should.be.an('array').with.lengthOf(1);

            let routes2 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl2);
            routes2.should.be.an('array').with.lengthOf(1);

            (router.get as SinonSpy).firstCall.should.be.calledWithExactly('/1', routes1[0].descriptor.value);
            (router.get as SinonSpy).secondCall.should.be.calledWithExactly('/2', routes2[0].descriptor.value);
        });

        it('should register 1 controller with 2 function correctly', () => {
            @Controller('1')
            class Ctrl {
                @Get('func1')
                public funcGet(): void {
                }

                @Post('func1')
                public funcPost(): void {
                }
            }

            registerControllers('', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(2);

            router.get.should.be.calledOnce;
            router.put.should.not.be.called;
            router.post.should.be.calledOnce;
            router.delete.should.not.be.called;

            (router.get as SinonSpy).should.be.calledWithExactly('/1/func1', routes[0].descriptor.value);
            (router.post as SinonSpy).should.be.calledWithExactly('/1/func1', routes[1].descriptor.value);
        });

        it('should register 2 controller with 2 function correctly', () => {
            @Controller('1')
            class Ctrl {
                @Get('func1')
                public funcGet(): void {
                }

                @Post('func1')
                public funcPost(): void {
                }
            }

            @Controller('2')
            class Ctrl2 {
                @Get('func1')
                public funcGet(): void {
                }

                @Post('func1')
                public funcPost(): void {
                }
            }

            registerControllers('', router);

            let routes1 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes1.should.be.an('array').with.lengthOf(2);

            let routes2 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl2);
            routes2.should.be.an('array').with.lengthOf(2);

            router.get.should.be.calledTwice;
            router.put.should.not.be.called;
            router.post.should.be.calledTwice;
            router.delete.should.not.be.called;

            (router.get as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', routes1[0].descriptor.value);
            (router.get as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', routes2[0].descriptor.value);
            (router.post as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', routes1[1].descriptor.value);
            (router.post as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', routes2[1].descriptor.value);
        });

        it('should register a full controller with all function correctly', () => {
            @Controller()
            class Ctrl {
                @Get('func1')
                public funcGet(): void {
                }

                @Put('func1')
                public funcPut(): void {
                }

                @Post('func1')
                public funcPost(): void {
                }

                @Delete('func1')
                public funcDelete(): void {
                }

                @Head('func1')
                public funcHead(): boolean {
                    return true;
                }
            }

            registerControllers('', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(5);

            router.get.should.be.calledWithExactly('/func1', routes[0].descriptor.value);
            router.put.should.be.calledWithExactly('/func1', routes[1].descriptor.value);
            router.post.should.be.calledWithExactly('/func1', routes[2].descriptor.value);
            router.delete.should.be.calledWithExactly('/func1', routes[3].descriptor.value);
            router.head.should.be.calledWithExactly('/func1', routes[4].descriptor.value);
        });

        it('should use baseUrl correctly', () => {
            @Controller()
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('base', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(1);

            router.get.should.be.calledWithExactly('/base', routes[0].descriptor.value);
        });

        it('should use controller routePrefix correctly', () => {
            @Controller('ctrl')
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(1);

            router.get.should.be.calledWithExactly('/ctrl', routes[0].descriptor.value);
        });

        it('should use baseUrl and controller routePrefix correctly', () => {
            @Controller('ctrl')
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('base', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(1);

            router.get.should.be.calledWithExactly('/base/ctrl', routes[0].descriptor.value);
        });

        it('should not register an empty controller', () => {
            @Controller('ctrl')
            class Ctrl {
            }

            registerControllers('base', router);

            router.get.should.not.be.called;
        });

        it('should throw on duplicate routes', () => {
            @Controller()
            class Ctrl {
                @Get()
                public get1(): void {
                }

                @Get()
                public get2(): void {
                }
            }

            let fn = () => {
                registerControllers('', router);
            };

            fn.should.throw(DuplicateRouteDeclarationError);
        });

        it('should throw on not supported http verb', () => {
            @Controller()
            class Ctrl {
                @Get()
                public get1(): void {
                }
            }

            let routes = Reflect.getMetadata(ROUTES_KEY, Ctrl);
            routes[0].method = -1;
            Reflect.defineMetadata(ROUTES_KEY, routes, Ctrl);

            let fn = () => {
                registerControllers('', router);
            };

            fn.should.throw(HttpVerbNotSupportedError);
        });

        it('should order more segmented urls before less segmented ones', () => {
            @Controller('1')
            class Ctrl {
                @Get('func1/segmented/4')
                public funcGet(): void {
                }

                @Get('func1/thrice')
                public funcGet2(): void {
                }
            }

            @Controller('2')
            class Ctrl2 {
                @Get('func1/segmented/5/times')
                public funcGet(): void {
                }

                @Get('func1')
                public funcGet2(): void {
                }
            }

            registerControllers('', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(4);

            spy.getCall(0).should.be.calledWith('/2/func1/segmented/5/times');
            spy.getCall(1).should.be.calledWith('/1/func1/segmented/4');
            spy.getCall(2).should.be.calledWith('/1/func1/thrice');
            spy.getCall(3).should.be.calledWith('/2/func1');
        });

        it('should order less wildcarded urls before more wildcarded ones', () => {
            @Controller('1')
            class Ctrl {
                @Get('func1/*/2/*')
                public funcGet(): void {
                }

                @Get('func1/foo/*/bar')
                public funcGet2(): void {
                }
            }

            registerControllers('', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(2);

            spy.getCall(0).should.be.calledWith('/1/func1/foo/*/bar');
            spy.getCall(1).should.be.calledWith('/1/func1/*/2/*');
        });

        it('should order a list of urls correctly', () => {
            @Controller('static')
            class StaticFiles {
                @Get('*')
                public funcGet(): void {
                }
            }

            @Controller('api')
            class Api {
                @Get('stores')
                public funcGet(): void {
                }

                @Get('products')
                public funcGet2(): void {
                }
            }

            registerControllers('', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(3);

            spy.getCall(0).should.be.calledWith('/api/stores');
            spy.getCall(1).should.be.calledWith('/api/products');
            spy.getCall(2).should.be.calledWith('/static/*');
        });

        it('should filter double slash in a normal route', () => {
            @Controller('api')
            class Api {
                @Get('/stores')
                public funcGet(): void {
                }
            }

            registerControllers('', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(1);

            spy.getCall(0).should.be.calledWith('/api/stores');
        });

        it('should filter double slash in a root route', () => {
            @Controller('')
            class Api {
                @Get('~/stores')
                public funcGet(): void {
                }
            }

            registerControllers('', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(1);

            spy.getCall(0).should.be.calledWith('/stores');
        });

        it('should register a route from root with ~', () => {
            @Controller()
            class StaticFiles {
                @Get('~/*')
                public funcGet(): void {
                }
            }

            @Controller('stores')
            class Api {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('api', router);

            let spy = router.get as SinonSpy;

            spy.callCount.should.equal(2);

            spy.getCall(0).should.be.calledWith('/api/stores');
            spy.getCall(1).should.be.calledWith('/*');
        });

        it('should throw on duplicate routes from root', () => {
            @Controller()
            class Ctrl {
                @Get('~/root')
                public get1(): void {
                }
            }

            @Controller('foobar')
            class Ctrl2 {
                @Get('~/root')
                public get1(): void {
                }
            }

            let fn = () => {
                registerControllers('baseUrl', router);
            };

            fn.should.throw(DuplicateRouteDeclarationError);
        });

    });

    describe('Register from folder function', () => {

        let router: Router;

        beforeEach(() => {
            router = Router();
            sinon.stub(router, 'get');
            sinon.stub(router, 'put');
            sinon.stub(router, 'post');
            sinon.stub(router, 'delete');
            sinon.stub(router, 'head');
        });

        it('should register 2 controller with 2 function correctly', done => {
            registerControllersFromFolder({folderPath: './build/.test/controllers/good'}, '', router)
                .then(() => {
                    let Ctrl = require('../.test/controllers/good/GoodController1').Ctrl,
                        Ctrl2 = require('../.test/controllers/good/GoodController2').Ctrl2;

                    let routes1 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
                    routes1.should.be.an('array').with.lengthOf(2);

                    let routes2 = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl2);
                    routes2.should.be.an('array').with.lengthOf(2);

                    router.get.should.be.calledTwice;
                    router.put.should.not.be.called;
                    router.post.should.be.calledTwice;
                    router.delete.should.not.be.called;

                    (router.get as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', routes1[0].descriptor.value);
                    (router.get as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', routes2[0].descriptor.value);
                    (router.post as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', routes1[1].descriptor.value);
                    (router.post as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', routes2[1].descriptor.value);

                    done();
                })
                .catch(err => {
                    done(err);
                });
        });

        it('should reject promise when error happens in process', done => {
            registerControllersFromFolder({folderPath: './build/.test/controllers/bad'}, '', router)
                .then(() => {
                    done(new Error('did not throw!'));
                })
                .catch(err => {
                    done();
                });
        });

    });

});
