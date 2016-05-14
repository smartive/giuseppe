import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');
import {ErrorHandlerWrongArgumentsError, RouteError} from './Errors';
import {ControllerErrorHandler} from './ControllerErrorHandler';

let should = chai.should();
chai.use(sinonChai);

describe('ControllerErrorHandler', () => {

    let manager: ControllerErrorHandler;

    beforeEach(() => {
        manager = new ControllerErrorHandler();
    });

    it('should add a handler to default', () => {
        let func = (req, res, err) => console.log(err);

        manager.addHandler(func);

        (manager as any).handlers.Error.should.equal(func);
    });

    it('should add a handler to a specific error', () => {
        let func = (req, res, err) => console.log(err);

        manager.addHandler(func, RouteError);

        (manager as any).handlers.RouteError.should.equal(func);
    });

    it('should add a handler to multiple specific errors', () => {
        let func = (req, res, err) => console.log(err);

        manager.addHandler(func, RouteError);
        manager.addHandler(func, ErrorHandlerWrongArgumentsError);

        (manager as any).handlers.RouteError.should.equals(func);
        (manager as any).handlers.ErrorHandlerWrongArgumentsError.should.equals(func);
    });

    it('should replace the handler if another is registered', () => {
        let func = (req, res, err) => console.log(err);
        let func2 = (req, res, err) => console.log(err);

        manager.addHandler(func, RouteError);
        manager.addHandler(func2, RouteError);

        (manager as any).handlers.RouteError.should.equal(func2);
    });

    it('should call correct handler error', () => {
        let spy = sinon.spy();

        manager.addHandler(spy);
        manager.addHandler(spy, ErrorHandlerWrongArgumentsError);

        manager.handleError(null, null, null, new Error());

        spy.should.be.calledOnce;
    });

    it('should call correct handler for a specific error', () => {
        let spy = sinon.spy(),
            spy2 = sinon.spy(),
            spy3 = sinon.spy();

        manager.addHandler(spy, ErrorHandlerWrongArgumentsError);
        manager.addHandler(spy2, RouteError);
        manager.addHandler(spy3);

        manager.handleError(null, null, null, new ErrorHandlerWrongArgumentsError());

        spy.should.be.calledOnce;
        spy2.should.not.be.called;
        spy3.should.not.be.called;
    });

    it('should call the default if a non error type is thrown in', () => {
        let spy = sinon.spy();

        manager.addHandler(spy);

        manager.handleError(null, null, null, 'foobar' as any);

        spy.should.be.called;
    });

});
