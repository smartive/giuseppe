import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {ErrorHandlerManager, ErrorHandler, errorHandlerKey} from './ErrorHandlerDecorator';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError
} from './Errors';

let should = chai.should();
chai.use(sinonChai);

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

            manager.callHandlers(null, null, new Error());

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

            manager.callHandlers(null, null, new ErrorHandlerWrongArgumentsError());

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

        it('should should register a handler for the controller', () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: Object, res: Object, err: Error): void {
                }
            }

            let errorManager: any = Reflect.getMetadata(errorHandlerKey, Ctrl);

            errorManager.handlers.default
                .should.be.an('array')
                .with.lengthOf(1)
                .that.deep.equals([Ctrl.prototype.func]);
        });

        it('should should register a default and a specific handler for the controller', () => {
            class Ctrl {
                @ErrorHandler()
                public func(req: Object, res: Object, err: Error): void {
                }

                @ErrorHandler(ErrorHandlerWrongReturnTypeError, ErrorHandlerWrongArgumentsError)
                public func2(req: Object, res: Object, err: Error): void {
                }
            }

            let errorManager: any = Reflect.getMetadata(errorHandlerKey, Ctrl);

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

    });

});