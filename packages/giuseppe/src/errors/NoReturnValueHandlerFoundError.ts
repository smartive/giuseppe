/**
 * Error that is thrown when no return type handler is found for a given value.
 * 
 * @export
 * @class NoReturnValueHandlerFoundError
 * @extends {Error}
 */
export class NoReturnValueHandlerFoundError extends Error {
    constructor(value: any) {
        super(`There is no return type handler registered for the value ${value} (constructor: ${value.constructor.name})`);
    }
}
