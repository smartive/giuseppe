import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {ErrorHandlerManager, ErrorHandler, ERRORHANDLER_KEY} from './ErrorHandlerDecorator';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError
} from './Errors';
import {Route} from '../routes/RouteDecorators';
import {Controller, registerControllers} from '../controllers/ControllerDecorator';

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

    public head(route: string, func: Function): void {
        this.routes[route] = func;
    }
}

describe('ErrorHandlerDecorators', () => {

    describe('ErrorHandlerManager', () => {

        let manager: ErrorHandlerManager;

        beforeEach(() => {
            manager = new ErrorHandlerManager();
        });

        it('should add a handler to default', () => {
            let func = (req, res, err) => console.log(err);

            manager.addHandler(func);

            (manager as any).handlers.default.should.be.an('array').with.lengthOf(1);
        });

        it('should add a handler to a specific error', () => {
            let func = (req, res, err) => console.log(err);

            manager.addHandler(func, Error);

            (manager as any).handlers.default.should.be.an('array').with.lengthOf(0);
            (manager as any).handlers.Error.should.be.an('array').with.lengthOf(1);
        });

        it('should add a handler to multiple specific errors', () => {
            let func = (req, res, err) => console.log(err);

            manager.addHandler(func, Error);
            manager.addHandler(func, ErrorHandlerWrongArgumentsError);

            (manager as any).handlers.default.should.be.an('array').with.lengthOf(0);
            (manager as any).handlers.Error.should.be.an('array').with.lengthOf(1);
            (manager as any).handlers.ErrorHandlerWrongArgumentsError.should.be.an('array').with.lengthOf(1);
        });

        it('should get correct handlers for default errors', () => {
            let func = (req, res, err) => console.log(err);

            manager.addHandler(func);

            manager.getHandlers(new Error()).should.be.an('array').that.deep.equals([func]);
        });

        it('should get correct handlers for a specific error', () => {
            let func = (req, res, err) => console.log(err);

            manager.addHandler(func, ErrorHandlerWrongArgumentsError);

            manager.getHandlers(new ErrorHandlerWrongArgumentsError()).should.be.an('array').that.deep.equals([func]);
        });

        it('should call correct handlers for default errors', () => {
            let spy = sinon.spy(),
                spy2 = sinon.spy();

            manager.addHandler(spy);
            manager.addHandler(spy2);

            manager.callHandlers(null, null, null, new Error());

            spy.should.be.calledOnce;
            spy2.should.be.calledOnce;
        });

        it('should call correct handlers for a specific error', () => {
            let spy = sinon.spy(),
                spy2 = sinon.spy(),
                spy3 = sinon.spy();

            manager.addHandler(spy, ErrorHandlerWrongArgumentsError);
            manager.addHandler(spy2, ErrorHandlerWrongArgumentsError);
            manager.addHandler(spy3);

            manager.callHandlers(null, null, null, new ErrorHandlerWrongArgumentsError());

            spy.should.be.calledOnce;
            spy2.should.be.calledOnce;
            spy3.should.not.be.called;
        });

    });

    describe('ErrorHandler decorator', () => {

        it('should throw on wrong handler argument count', () => {
            let fn = () => {
                class Ctrl {
                    @ErrorHandler()
                    public func(): void {
                    }
                }
            };

            fn.should.throw(ErrorHandlerWrongArgumentsError);
        });

        it('should throw on wrong handler argument types', () => {
            let fn = () => {
                class Ctrl {
                    @ErrorHandler()
                    public func(req: any, res: string, err: number): void {
                    }
                }
            };

            fn.should.throw(ErrorHandlerWrongArgumentTypesError);
        });

        it('should throw on wrong handler return type', () => {
            let fn = () => {
                class Ctrl {
                    @ErrorHandler()
                    public func(req: Object, res: Object, err: Error): number {
                        return 0;
                    }
                }
            };

            fn.should.throw(ErrorHandlerWrongReturnTypeError);
        });

        it('should register a handler for the controller', () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: Object, res: Object, err: Error): void {
                }
            }

            let errorManager: any = Reflect.getMetadata(ERRORHANDLER_KEY, Ctrl);

            errorManager.handlers.default
                .should.be.an('array')
                .with.lengthOf(1)
                .that.deep.equals([Ctrl.prototype.func]);
        });

        it('should register a default and a specific handler for the controller', () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: Object, res: Object, err: Error): void {
                }

                @ErrorHandler(ErrorHandlerWrongReturnTypeError, ErrorHandlerWrongArgumentsError)
                public func2(req: Object, res: Object, err: Error): void {
                }
            }

            let errorManager: any = Reflect.getMetadata(ERRORHANDLER_KEY, Ctrl);

            errorManager.handlers.default
                .should.be.an('array')
                .with.lengthOf(1)
                .that.deep.equals([Ctrl.prototype.func]);

            errorManager.handlers.ErrorHandlerWrongReturnTypeError
                .should.be.an('array')
                .with.lengthOf(1)
                .that.deep.equals([Ctrl.prototype.func2]);

            errorManager.handlers.ErrorHandlerWrongArgumentsError
                .should.be.an('array')
                .with.lengthOf(1)
                .that.deep.equals([Ctrl.prototype.func2]);
        });

        it('should set the correct this context', () => {
            @Controller()
            class Ctrl {
                private test = 'foobar';

                @Route()
                public func() {
                    throw 'Foobar';
                }

                @ErrorHandler()
                public error(req: Object, res: Object, err: Error): void {
                    this.should.be.an.instanceOf(Ctrl);
                    this.test.should.equal('foobar');
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

});
