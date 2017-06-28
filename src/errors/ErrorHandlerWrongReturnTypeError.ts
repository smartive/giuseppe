/**
 * Error that is thrown when an error handler has a non void return type.
 * (Error will happen at startup)
 *
 * @export
 * @class ErrorHandlerWrongReturnTypeError
 * @extends {Error}
 */
export class ErrorHandlerWrongReturnTypeError extends Error {
    constructor() {
        super('Error handler must have return type void');
    }
}
