import { Giuseppe } from '../../src';
import { Controller } from '../../src/core/controller/GiuseppeApiController';
import { Get } from '../../src/core/routes';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError
} from '../../src/errors';
import { ErrorHandler } from '../../src/errors/ErrorHandlerDecorator';
import { ControllerMetadata } from '../../src/utilities/ControllerMetadata';
import chai = require('chai');
import * as sinon from 'sinon';
import sinonChai = require('sinon-chai');

const should = chai.should();
chai.use(sinonChai);

class TestRouter {
    public routes: { [id: string]: Function } = {};

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
        (Giuseppe.registrar as any).controller = [];
    });

    it('should throw on wrong handler argument count', () => {
        const fn = () => {
            class Ctrl {
                @ErrorHandler()
                public func(): void {
                }
            }
        };

        fn.should.throw(ErrorHandlerWrongArgumentsError);
    });

    it('should throw on wrong handler argument types', () => {
        const fn = () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: any, res: string, err: number): void {
                }
            }
        };

        fn.should.throw(ErrorHandlerWrongArgumentTypesError);
    });

    it('should throw on wrong handler return type', () => {
        const fn = () => {
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

        const errorManager: any = new ControllerMetadata(Ctrl.prototype).errorHandler();

        errorManager.handlers.Error
            .should.be.a('function')
            .with.lengthOf(3)
            .that.equals(Ctrl.prototype.func);
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

        const errorManager: any = new ControllerMetadata(Ctrl.prototype).errorHandler();

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

    it('should set the correct this context', done => {
        @Controller()
        class Ctrl {
            private test: string = 'foobar';

            @Get()
            public func() {
                throw 'Foobar.';
            }

            @ErrorHandler()
            public error(req: Object, res: Object, err: Error): void {
                try {
                    this.test.should.equal('foobar');
                    done();
                } catch (e) {
                    done(e);
                }
            }
        }

        const router = new TestRouter(),
            giuseppe = new Giuseppe();

        giuseppe.router = router as any;
        giuseppe.start();

        router.routes['/'].apply(null, [{}, {}]);
    });

    it('should call the most specific error handler', () => {
        class FoobarError extends Error { }

        @Controller()
        class Ctrl {
            @Get()
            public getErr(): string {
                throw new FoobarError();
            }

            @ErrorHandler()
            public func(req: Object, res: Object, err: Error): void {
            }

            @ErrorHandler(FoobarError)
            public func2(req: Object, res: Object, err: Error): void {
            }
        }

        const router = new TestRouter(),
            giuseppe = new Giuseppe(),
            errorManager: any = new ControllerMetadata(Ctrl.prototype).errorHandler();

        giuseppe.router = router as any;
        giuseppe.start();

        const spy = sinon.spy(),
            spy2 = sinon.spy();

        errorManager.addHandler(spy, Error);
        errorManager.addHandler(spy2, FoobarError);

        router.routes['/'].apply(this, [{}, {}]);

        spy.should.not.be.called;
        spy2.should.be.calledOnce;
    });

});
