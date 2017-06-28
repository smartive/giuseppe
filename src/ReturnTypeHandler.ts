import 'reflect-metadata';

import { Response } from 'express';

import { NoReturnValueHandlerFoundError } from './errors/NoReturnValueHandlerFoundError';
import { ReturnType } from './routes/ReturnType';

/**
 * This handler is registered within the giuseppe core and holds all registered return type handlers. All those
 * {@link ReturnType} are than checked when a return value is given to the handler. If no matching handler is found
 * the default handler is taken. If even that isn't found, an error is thrown.
 * 
 * @export
 * @class ReturnTypeHandler
 */
export class ReturnTypeHandler {
    private returnTypes: { [type: string]: ReturnType<any> } = {};

    constructor(types: ReturnType<any>[]) {
        for (const type of types) {
            this.returnTypes[type.type] = type;
        }
    }

    /**
     * Handles the response for a given value. Searches in the handlers for the correct return type handler. If no matching
     * handler is found, the `default` handler is used. And if no default is registered (or was overwritten with undefined)
     * an error is thrown.
     * 
     * @param {*} value 
     * @param {Response} response
     * @throws {NoReturnValueHandlerFoundError} One handler must be there to handle the value.
     * @memberof ReturnTypeHandler
     */
    public handleValue(value: any, response: Response): void {
        const handler = value ?
            this.returnTypes[value.constructor.name] || this.returnTypes['default'] :
            this.returnTypes['default'];
        if (!handler) {
            throw new NoReturnValueHandlerFoundError(value);
        }

        response
            .status(handler.getStatus(value))
            .set(handler.getHeaders(value));

        if (value) {
            response.send(handler.getValue(value));
        }

        response.end();
    }
}
