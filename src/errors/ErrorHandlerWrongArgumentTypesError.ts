/**
 * Error that is thrown when an error handler accepts the wrong argument types.
 * (Error will happen at startup)
 *
 * @class ErrorHandlerWrongArgumentTypesError
 * @extends {DesigntimeError}
 */
export class ErrorHandlerWrongArgumentTypesError extends Error {
    constructor() {
        super('Error handler arguments must be: Object, Object, Error');
    }
}
