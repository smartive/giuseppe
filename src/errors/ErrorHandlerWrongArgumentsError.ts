/**
 * Error that is thrown when an error handler accepts the wrong arguments.
 * (Error will happen at startup)
 *
 * @export
 * @class ErrorHandlerWrongArgumentsError
 * @extends {Error}
 */
export class ErrorHandlerWrongArgumentsError extends Error {
    constructor() {
        super('Error handler must accept exactly request, response and an error object');
    }
}
