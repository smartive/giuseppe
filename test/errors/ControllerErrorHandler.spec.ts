import 'reflect-metadata';

import { ControllerErrorHandler, ErrorHandlerWrongArgumentsError } from '../../src/errors';

describe('ControllerErrorHandler', () => {

    let manager: ControllerErrorHandler;
    let mock: jest.Mock<any>;

    beforeAll(() => {
        mock = jest.fn();
        console.warn = mock;
    });

    afterAll(() => {
        mock.mockClear();
    });

    beforeEach(() => {
        manager = new ControllerErrorHandler();
    });

    it('should add a handler to default', () => {
        const func = (req, res, err) => console.log(err);

        manager.addHandler(func);

        expect((manager as any).handlers.Error).toBe(func);
    });

    it('should add a handler to a specific error', () => {
        const func = (req, res, err) => console.log(err);

        manager.addHandler(func, TypeError);

        expect((manager as any).handlers.TypeError).toBe(func);
    });

    it('should add a handler to multiple specific errors', () => {
        const func = (req, res, err) => console.log(err);

        manager.addHandler(func, TypeError);
        manager.addHandler(func, ErrorHandlerWrongArgumentsError);

        expect((manager as any).handlers.TypeError).toBe(func);
        expect((manager as any).handlers.ErrorHandlerWrongArgumentsError).toBe(func);
    });

    it('should replace the handler if another is registered', () => {
        const func = (req, res, err) => console.log(err);
        const func2 = (req, res, err) => console.log(err);

        manager.addHandler(func, TypeError);
        manager.addHandler(func2, TypeError);

        expect((manager as any).handlers.TypeError).toBe(func2);
    });

    it('should call correct handler error', () => {
        const spy = jest.fn();

        manager.addHandler(spy);
        manager.addHandler(spy, ErrorHandlerWrongArgumentsError);

        manager.handleError(null as any, null as any, null as any, new Error());

        expect(spy.mock.calls.length).toBe(1);
    });

    it('should call correct handler for a specific error', () => {
        const spy = jest.fn();
        const spy2 = jest.fn();
        const spy3 = jest.fn();

        manager.addHandler(spy, ErrorHandlerWrongArgumentsError);
        manager.addHandler(spy2, TypeError);
        manager.addHandler(spy3);

        manager.handleError(null as any, null as any, null as any, new ErrorHandlerWrongArgumentsError());

        expect(spy.mock.calls.length).toBe(1);
        expect(spy2.mock.calls.length).toBe(0);
        expect(spy3.mock.calls.length).toBe(0);
    });

    it('should call the default if a non error type is thrown in', () => {
        const spy = jest.fn();

        manager.addHandler(spy);

        manager.handleError(null as any, null as any, null as any, 'foobar' as any);

        expect(spy.mock.calls.length).toBe(1);
    });

});
