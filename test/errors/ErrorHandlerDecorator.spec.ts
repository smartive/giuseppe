import 'reflect-metadata';

import { Giuseppe } from '../../src';
import { Controller } from '../../src/core/controller/GiuseppeApiController';
import { Get } from '../../src/core/routes/Get';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError,
} from '../../src/errors';
import { ErrorHandler } from '../../src/errors/ErrorHandlerDecorator';
import { ControllerMetadata } from '../../src/utilities/ControllerMetadata';

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

    let mock: jest.Mock<any>;

    beforeAll(() => {
        mock = jest.fn();
        console.warn = mock;
    });

    afterAll(() => {
        mock.mockClear();
    });

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

        expect(fn).toThrow(ErrorHandlerWrongArgumentsError);
    });

    it('should throw on wrong handler argument types', () => {
        const fn = () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: any, res: string, err: number): void {
                }
            }
        };

        expect(fn).toThrow(ErrorHandlerWrongArgumentTypesError);
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

        expect(fn).toThrow(ErrorHandlerWrongReturnTypeError);
    });

    it('should register a handler for the controller', () => {
        class Ctrl {
            @ErrorHandler()
            public func(req: Object, res: Object, err: Error): void {
            }
        }

        const errorManager: any = new ControllerMetadata(Ctrl.prototype).errorHandler();

        expect(errorManager.handlers.Error).toBe(Ctrl.prototype.func);
        expect(errorManager.handlers.Error.length).toBe(3);
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

        expect(errorManager.handlers.Error).toBe(Ctrl.prototype.func);
        expect(errorManager.handlers.Error.length).toBe(3);

        expect(errorManager.handlers.ErrorHandlerWrongReturnTypeError).toBe(Ctrl.prototype.func2);
        expect(errorManager.handlers.ErrorHandlerWrongReturnTypeError.length).toBe(3);

        expect(errorManager.handlers.ErrorHandlerWrongArgumentsError).toBe(Ctrl.prototype.func2);
        expect(errorManager.handlers.ErrorHandlerWrongArgumentsError.length).toBe(3);
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
                expect(this.test).toBe('foobar');
                done();
            }
        }

        const router = new TestRouter();
        const giuseppe = new Giuseppe();

        giuseppe.router = router as any;
        giuseppe.configureRouter();

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

        const router = new TestRouter();
        const giuseppe = new Giuseppe();
        const errorManager: any = new ControllerMetadata(Ctrl.prototype).errorHandler();

        giuseppe.router = router as any;
        giuseppe.configureRouter();

        const spy = jest.fn();
        const spy2 = jest.fn();

        errorManager.addHandler(spy, Error);
        errorManager.addHandler(spy2, FoobarError);

        router.routes['/'].apply(this, [{}, {}]);

        expect(spy.mock.calls.length).toBe(0);
        expect(spy2.mock.calls.length).toBe(1);
    });

});
