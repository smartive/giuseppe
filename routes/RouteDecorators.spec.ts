import 'reflect-metadata';
import {Get, Put, Post, Delete, Route, ROUTES_KEY, RouteRegistration, RouteMethod} from '../routes/RouteDecorators';
import {ParameterConstructorArgumentsError, RouteError, WrongReturnTypeError} from '../errors/Errors';
import {Query, Res} from '../params/ParamDecorators';
import {Controller, registerControllers, resetControllerRegistrations} from '../controllers/ControllerDecorator';
import {Response} from 'express';
import {ErrorHandlerManager, ERRORHANDLER_KEY} from '../errors/ErrorHandlerDecorator';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

let should = chai.should();
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
}

describe('RouteDecorators', () => {

    afterEach(() => {
        resetControllerRegistrations();
    });

    describe('Get', () => {

        it('should return a Route decorator', () => {
            Get().should.be.a('function')
                .and.have.lengthOf(3);
        });

    });

    describe('Put', () => {

        it('should return a Route decorator', () => {
            Put().should.be.a('function')
                .and.have.lengthOf(3);
        });

    });

    describe('Post', () => {

        it('should return a Route decorator', () => {
            Post().should.be.a('function')
                .and.have.lengthOf(3);
        });

    });

    describe('Delete', () => {

        it('should return a Route decorator', () => {
            Delete().should.be.a('function')
                .and.have.lengthOf(3);
        });

    });

    describe('Route', () => {

        it('should return a Route decorator', () => {
            Route().should.be.a('function')
                .and.have.lengthOf(3);
        });

        it('should throw on parameter-less class constructor', () => {
            let fn = () => {
                class Foobar {
                }
                @Controller()
                class Ctrl {
                    @Route()
                    public func(@Query('foobar') foobar: Foobar): any {
                    }
                }

                registerControllers();
            };

            fn.should.throw(ParameterConstructorArgumentsError);
        });

        it('should not throw on class with correct constructor', () => {
            let fn = () => {
                class Foobar {
                    constructor(value: any) {
                    }
                }
                @Controller()
                class Ctrl {
                    @Route()
                    public func(@Query('foobar') foobar: Foobar): any {

                    }
                }

                registerControllers();
            };

            fn.should.not.throw(ParameterConstructorArgumentsError);
        });

        it('should not throw on javascript native type constructor', () => {
            let fn = () => {
                @Controller()
                class Ctrl {
                    @Route()
                    public func(@Query('foobar') foobar: number): any {

                    }
                }
                registerControllers();
            };

            fn.should.not.throw(ParameterConstructorArgumentsError);
        });

        it('should add correct metadata to controller', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(): void {
                }
            }

            let routes = Reflect.getMetadata(ROUTES_KEY, Ctrl);

            routes.should.be.an('array').with.lengthOf(1);

            let route: RouteRegistration = routes[0];

            route.descriptor.value.should.equal(Ctrl.prototype.func);
            route.method.should.equal(RouteMethod.Get);
            route.path.should.equal('');
        });

        it('should add correct metadata for multiple routes to controller', () => {
            class Ctrl {
                @Get()
                public func(): void {
                }

                @Put('test')
                public funcTest(): void {
                }
            }

            let routes = Reflect.getMetadata(ROUTES_KEY, Ctrl);

            routes.should.be.an('array').with.lengthOf(2);

            let firstRoute: RouteRegistration = routes[0];
            let secondRoute: RouteRegistration = routes[1];

            firstRoute.descriptor.value.should.equal(Ctrl.prototype.func);
            firstRoute.method.should.equal(RouteMethod.Get);
            firstRoute.path.should.equal('');

            secondRoute.descriptor.value.should.equal(Ctrl.prototype.funcTest);
            secondRoute.method.should.equal(RouteMethod.Put);
            secondRoute.path.should.equal('test');
        });

    });

    describe('Decorated method', () => {

        it('should return void 0 when it has a response param', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(@Res() res: Response): void {
                }
            }

            let router = new TestRouter();

            registerControllers('', (router as any));

            let ret = router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: () => {
                }
            }, null]);

            should.not.exist(ret);
        });

        it('should call response.status with NO_CONTENT when it has no response param', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): void {
                }
            }

            let router = new TestRouter(),
                stub = sinon.stub();

            stub.returns({
                end: () => {
                }
            });

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                status: stub
            }, null]);

            stub.should.be.calledWithExactly(204);
        });

        it('should throw when it returns the wrong return type', () => {
            @Controller()
            class Ctrl {
                @Route()
                public func(): any {
                    return 1;
                }
            }

            let handler = new ErrorHandlerManager(),
                spy = sinon.spy();
            handler.addHandler(spy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: () => {
                }
            }, null]);

            spy.should.be.calledOnce;
            spy.args[0][2].should.be.an.instanceOf(RouteError);
            spy.args[0][2].innerException.should.be.an.instanceOf(WrongReturnTypeError);
        });

        it('should correctly execute a primitive promise when one is returned', done => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): Promise<string> {
                    return Promise.resolve('foobar');
                }
            }

            let handler = new ErrorHandlerManager(),
                errSpy = sinon.spy();
            handler.addHandler(errSpy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let spy = sinon.spy();

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: spy
            }, null]);

            setTimeout(() => {
                errSpy.should.not.be.called;
                spy.should.be.calledWithExactly('foobar');
                done();
            }, 100);
        });

        it('should correctly call error handler when promise rejects', done => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): Promise<void> {
                    return Promise.reject(new Error('test'));
                }
            }

            let handler = new ErrorHandlerManager(),
                errSpy = sinon.spy();
            handler.addHandler(errSpy);
            Reflect.defineMetadata(ERRORHANDLER_KEY, handler, Ctrl);

            let spy = sinon.spy();

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: spy
            }, null]);

            setTimeout(() => {
                errSpy.should.be.called;
                errSpy.args[0][2].should.be.an.instanceOf(RouteError);
                errSpy.args[0][2].innerException.should.be.an.instanceOf(Error);
                spy.should.not.be.called;
                done();
            }, 100);
        });

        it('should call response.send on a primitive type', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): string {
                    return 'foobar';
                }
            }

            let spy = sinon.spy();

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: () => {
                },
                send: spy
            }, null]);

            spy.should.be.calledWithExactly('foobar');
        });

        it('should call response.json on a complex type', () => {
            @Controller()
            class Ctrl {
                @Get()
                public func(): any {
                    return {foo: 'bar'};
                }
            }

            let spy = sinon.spy();

            let router = new TestRouter();

            registerControllers('', (router as any));

            router.routes['/'].apply(this, [{}, {
                json: spy
            }, null]);

            spy.should.be.calledWithExactly({foo: 'bar'});
        });

    });

});
