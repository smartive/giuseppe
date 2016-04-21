import 'reflect-metadata';
import {Controller, registerControllers, resetControllerRegistrations} from './ControllerDecorator';
import {Router} from 'express';
import {Get, Post, Put, Delete, ROUTES_KEY} from '../routes/RouteDecorators';
import {SinonSpy} from '~sinon/lib/sinon';
import {DuplicateRouteDeclarationError, HttpVerbNotSupportedError} from '../errors/Errors';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

describe('Controller', () => {

    describe('Decorator', () => {

        afterEach(() => {
            resetControllerRegistrations();
        });

        it('should return Controller decorator', () => {
            Controller().should.be.a('function')
                .and.have.lengthOf(1);
        });

        it('should set the correct this context');

    });

    describe('Register function', () => {

        let router: Router;

        beforeEach(() => {
            router = Router();
            sinon.stub(router, 'get');
            sinon.stub(router, 'put');
            sinon.stub(router, 'post');
            sinon.stub(router, 'delete');
        });

        afterEach(() => {
            resetControllerRegistrations();
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
            }

            registerControllers('', router);

            let routes = Reflect.getOwnMetadata(ROUTES_KEY, Ctrl);
            routes.should.be.an('array').with.lengthOf(4);

            router.get.should.be.calledWithExactly('/func1', routes[0].descriptor.value);
            router.put.should.be.calledWithExactly('/func1', routes[1].descriptor.value);
            router.post.should.be.calledWithExactly('/func1', routes[2].descriptor.value);
            router.delete.should.be.calledWithExactly('/func1', routes[3].descriptor.value);
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

    });

});
