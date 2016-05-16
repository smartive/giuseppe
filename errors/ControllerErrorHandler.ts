import 'reflect-metadata';
import {Request, Response} from 'express';
import httpStatus = require('http-status');

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
export type ErrorHandlerFunction<T extends Error> = (request: Request, response: Response, error: T) => void;

/**
 * Manager object that handles all ErrorHandlerFunctions for a controller. Registers itself in the controllers
 * metadata. If an error is thrown, just pass it to the error handler. The handler will do all the magic.
 *
 * @class
 */
export class ControllerErrorHandler {
    private handlers: { [id: string]: ErrorHandlerFunction<Error> } = {'Error': DEFAULT_ERROR_HANDLER};

    /**
     * Adds an error handler for the current controller with the given errorType. If the errorType is omitted,
     * the handler registers the function as a 'default' error handler.
     *
     * @param {ErrorHandlerFunction} handler - The error handler to register.
     * @param {Error} [errorType] - Error class that should be registered. If omitted, the handler is registered as default.
     */
    public addHandler<T extends Error>(handler: ErrorHandlerFunction<T>, errorType?: Function): void {
        let type = ((errorType || Error) as any).name;

        if (this.handlers[type]) {
            let oldHandler: any = this.handlers[type];
            console.warn(`Duplicate error handler declaration for type '${type}'.\nActual handler: ${oldHandler.name}\nNew handler: ${(handler as any).name}`);
        }

        this.handlers[type] = handler;
    }

    /**
     * Calls the error handler for a given error.
     *
     * @param {any} context - Context of the error handler.
     * @param {Request} request - ExpressJS request object.
     * @param {Response} response - ExpressJS response object.
     * @param {Error} error - Error object that was thrown.
     */
    public handleError<T extends Error>(context: any, request: Request, response: Response, error: T): void {
        if (!(error instanceof Error)) {
            error = new Error(error as any) as T;
        }

        let proto = Object.getPrototypeOf(error);
        while (proto) {
            let type = proto.constructor;
            if (this.handlers[type.name]) {
                this.handlers[type.name].apply(context, [request, response, error]);
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
}
