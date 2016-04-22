import 'reflect-metadata';
import {
    ErrorHandlerWrongArgumentsError,
    ErrorHandlerWrongArgumentTypesError,
    ErrorHandlerWrongReturnTypeError
} from '../errors/Errors';
import {Request, Response} from 'express';
import httpStatus = require('http-status');

const ARGUMENT_COUNT = 3;

/**
 * Reflect metadata key for error handler manager.
 * @type {string}
 */
export const ERRORHANDLER_KEY = 'errorHandler';

/**
 * Default error handler. Does console.error with the error and sets the
 * http response code to 500.
 *
 * @param {Request} req - express request object
 * @param {Response} res - express response object
 * @param {Error} err - error that happend
 */
export const DEFAULT_ERROR_HANDLER = (req, res, err) => {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
};

/**
 * @typedef ErrorHandlerFunction
 * @type {Function}
 * @param {Request} request - ExpressJS request object.
 * @param {Response} response - ExpressJS response object.
 * @param {Error} error - The error that happend.
 */
export type ErrorHandlerFunction = (request: Request, response: Response, error: Error) => void;

/**
 * Manager object that handles all ErrorHandlerFunctions for a controller. Registers itself in the controllers
 * metadata.
 *
 * @class
 */
export class ErrorHandlerManager {
    private handlers: {[id: string]: ErrorHandlerFunction[]} = {'default': []};

    /**
     * Adds an error handler for the current controller with the given errorType. If the errorType is omitted,
     * the handler registers the function as a 'default' error handler.
     *
     * @param {ErrorHandlerFunction} handler - The error handler to register.
     * @param {Error} [errorType] - Error class that should be registered. If omitted, the handler is registered as default.
     */
    public addHandler(handler: ErrorHandlerFunction, errorType?: Function): void {
        let name = errorType ? (errorType as any).name : 'default';

        if (!this.handlers[name]) {
            this.handlers[name] = [];
        }

        this.handlers[name].push(handler);
    }

    /**
     * Get all error handlers for a given error type.
     *
     * @param {Error} error
     * @returns {ErrorHandlerFunction[]} - A list of error handler functions for the given error type. If no type is found, the 'default' is returned.
     */
    public getHandlers(error: Error): ErrorHandlerFunction[] {
        let name = (error.constructor as any).name;
        if (!this.handlers[name] || !this.handlers[name].length) {
            return this.handlers['default'];
        }
        return this.handlers[name];
    }

    /**
     * Calls all error handlers for a given error.
     *
     * @param {Request} request - ExpressJS request object.
     * @param {Response} response - ExpressJS response object.
     * @param {Error} error - Error object that was thrown.
     */
    public callHandlers(request: Request, response: Response, error: Error): void {
        this.getHandlers(error).forEach(o => o(request, response, error));
    }
}

/**
 * Errorhandler decorator; decorates the given function as an error handler for the current controller.
 * You can specify various errors in the open parameter list. The handler is registered for the given error types,
 * and is only called if the thrown error matches the registered type. If errors are omitted, the handler will be
 * registered as 'default' and is called if no other specialized handler matches the thrown error.
 *
 * @param {...Error[]} errors - List of error classes to register to.
 * @returns {(any, string, PropertyDescriptor) => void} - Decorator for the class function.
 */
export function ErrorHandler(...errors: Function[]) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let paramtypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        if (paramtypes.length !== ARGUMENT_COUNT) {
            throw new ErrorHandlerWrongArgumentsError();
        }

        [Object, Object, Error].forEach((type, index) => {
            if (paramtypes[index] !== type) {
                throw new ErrorHandlerWrongArgumentTypesError();
            }
        });

        let returnValue = Reflect.getMetadata('design:returntype', target, propertyKey);
        if (!!returnValue) {
            throw new ErrorHandlerWrongReturnTypeError();
        }

        let handler: ErrorHandlerManager = Reflect.getMetadata(ERRORHANDLER_KEY, target.constructor) || new ErrorHandlerManager();
        if (errors.length) {
            errors.forEach(e => handler.addHandler(descriptor.value, e));
        } else {
            handler.addHandler(descriptor.value);
        }
        Reflect.defineMetadata(ERRORHANDLER_KEY, handler, target.constructor);
    };
}
