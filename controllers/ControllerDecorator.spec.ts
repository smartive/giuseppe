import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {Controller, registerControllers, resetControllerRegistrations} from './ControllerDecorator';
import {Router} from 'express';
import {Get, Post, Put, Delete, routesKey} from '../routes/RouteDecorators';
import {SinonSpy} from '~sinon/lib/sinon';
import {DuplicateRouteDeclarationError, HttpVerbNotSupportedError} from '../errors/Errors';

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

            router.get.should.be.calledWithExactly('/', Ctrl.prototype.func);
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

            (router.get as SinonSpy).firstCall.should.be.calledWithExactly('/1', Ctrl.prototype.func);
            (router.get as SinonSpy).secondCall.should.be.calledWithExactly('/2', Ctrl2.prototype.func);
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

            router.get.should.be.calledOnce;
            router.put.should.not.be.called;
            router.post.should.be.calledOnce;
            router.delete.should.not.be.called;

            (router.get as SinonSpy).should.be.calledWithExactly('/1/func1', Ctrl.prototype.funcGet);
            (router.post as SinonSpy).should.be.calledWithExactly('/1/func1', Ctrl.prototype.funcPost);
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

            router.get.should.be.calledTwice;
            router.put.should.not.be.called;
            router.post.should.be.calledTwice;
            router.delete.should.not.be.called;

            (router.get as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', Ctrl.prototype.funcGet);
            (router.get as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', Ctrl2.prototype.funcGet);
            (router.post as SinonSpy).firstCall.should.be.calledWithExactly('/1/func1', Ctrl.prototype.funcPost);
            (router.post as SinonSpy).secondCall.should.be.calledWithExactly('/2/func1', Ctrl2.prototype.funcPost);
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

            router.get.should.be.calledWithExactly('/func1', Ctrl.prototype.funcGet);
            router.put.should.be.calledWithExactly('/func1', Ctrl.prototype.funcPut);
            router.post.should.be.calledWithExactly('/func1', Ctrl.prototype.funcPost);
            router.delete.should.be.calledWithExactly('/func1', Ctrl.prototype.funcDelete);
        });

        it('should use baseUrl correctly', () => {
            @Controller()
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('base', router);

            router.get.should.be.calledWithExactly('/base', Ctrl.prototype.funcGet);
        });

        it('should use controller routePrefix correctly', () => {
            @Controller('ctrl')
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('', router);

            router.get.should.be.calledWithExactly('/ctrl', Ctrl.prototype.funcGet);
        });

        it('should use baseUrl and controller routePrefix correctly', () => {
            @Controller('ctrl')
            class Ctrl {
                @Get()
                public funcGet(): void {
                }
            }

            registerControllers('base', router);

            router.get.should.be.calledWithExactly('/base/ctrl', Ctrl.prototype.funcGet);
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

            let routes = Reflect.getMetadata(routesKey, Ctrl);
            routes[0].method = -1;
            Reflect.defineMetadata(routesKey, routes, Ctrl);

            let fn = () => {
                registerControllers('', router);
            };

            fn.should.throw(HttpVerbNotSupportedError);
        });

    });

});