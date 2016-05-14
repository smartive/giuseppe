import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {ErrorHandler, ERRORHANDLER_KEY} from './ErrorHandlerDecorator';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError,
    WrongReturnTypeError
} from './Errors';
import {Route, Get} from '../routes/RouteDecorators';
import {Controller, registerControllers, resetControllerRegistrations} from '../controllers/ControllerDecorator';

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

    afterEach(() => {
        resetControllerRegistrations();
    });

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

        errorManager.handlers.Error
            .should.be.a('function')
            .with.lengthOf(3)
            .that.deep.equals(Ctrl.prototype.func);
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

        errorManager.handlers.Error
            .should.be.a('function')
            .with.lengthOf(3)
            .that.deep.equals(Ctrl.prototype.func);

        errorManager.handlers.ErrorHandlerWrongReturnTypeError
            .should.be.a('function')
            .with.lengthOf(3)
            .that.deep.equals(Ctrl.prototype.func2);

        errorManager.handlers.ErrorHandlerWrongArgumentsError
            .should.be.a('function')
            .with.lengthOf(3)
            .that.deep.equals(Ctrl.prototype.func2);
    });

    it('should set the correct this context', () => {
        @Controller()
        class Ctrl {
            private test = 'foobar';

            @Route()
            public func() {
                throw 'Foobar.';
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

    it('should call the most specific error handler', () => {
        @Controller()
        class Ctrl {
            @Get()
            public getErr(): string {
                throw new WrongReturnTypeError('', String, Number);
            }

            @ErrorHandler()
            public func(req: Object, res: Object, err: Error): void {
            }

            @ErrorHandler(WrongReturnTypeError)
            public func2(req: Object, res: Object, err: Error): void {
            }
        }

        let router = new TestRouter();

        registerControllers('', (router as any));

        let errorManager: any = Reflect.getMetadata(ERRORHANDLER_KEY, Ctrl);
        let spy = sinon.spy(),
            spy2 = sinon.spy();

        errorManager.addHandler(spy, Error);
        errorManager.addHandler(spy2, WrongReturnTypeError);

        router.routes['/'].apply(this, [{}, {
            json: () => {
            },
            send: () => {
            }
        }, null]);

        spy.should.not.be.called;
        spy2.should.be.calledOnce;
    });

});
