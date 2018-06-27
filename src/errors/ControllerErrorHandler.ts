import 'reflect-metadata';

import { Request, Response } from 'express';
import httpStatus = require('http-status');

/**
 * Default error handler. Does console.error with the error and sets the
 * http response code to 500.
 *
 * @export
 * @param {Request} _ express request object
 * @param {Response} res express response object
 * @param {Error} err error that happend
 */
export const DEFAULT_ERROR_HANDLER = (_: Request, res: Response, err: Error) => {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
};

/**
 * @typedef ErrorHandlerFunction
 * @export
 * @type {Function}
 * @param {Request} request ExpressJS request object.
 * @param {Response} response ExpressJS response object.
 * @param {Error} error The error that happend.
 */
export type ErrorHandlerFunction<T extends Error> = (request: Request, response: Response, error: T) => void;

/**
 * Manager object that handles all ErrorHandlerFunctions for a controller. Registers itself in the controllers
 * metadata. If an error is thrown, just pass it to the error handler. The handler will do all the magic.
 *
 * @export
 * @class
 */
export class ControllerErrorHandler {
    private handlers: { [id: string]: ErrorHandlerFunction<any> } = { Error: DEFAULT_ERROR_HANDLER };

    /**
     * Adds an error handler for the current controller with the given errorType. If the errorType is omitted,
     * the handler registers the function as a 'default' error handler.
     *
     * @param {ErrorHandlerFunction} handler The error handler to register.
     * @param {Error} [errorType] Error class that should be registered. If omitted, the handler is registered as default.
     */
    public addHandler<T extends Error>(handler: ErrorHandlerFunction<T>, errorType?: Function): void {
        const type = ((errorType || Error) as any).name;

        if (this.handlers[type] && this.handlers[type] !== DEFAULT_ERROR_HANDLER) {
            console.warn(`Duplicate error handler declaration for type '${type}'.`);
        }

        this.handlers[type] = handler;
    }

    /**
     * Calls the error handler for a given error.
     *
     * @param {any} context Context of the error handler.
     * @param {Request} request ExpressJS request object.
     * @param {Response} response ExpressJS response object.
     * @param {Error} error Error object that was thrown.
     */
    public handleError<T extends Error>(context: any, request: Request, response: Response, error: T): void {
        let err: Error = error;
        if (!(err instanceof Error)) {
            err = new Error(err as any) as T;
        }

        let proto = Object.getPrototypeOf(err);
        while (proto) {
            const type = proto.constructor;
            if (this.handlers[type.name]) {
                this.handlers[type.name].apply(context, [request, response, err]);
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
}
