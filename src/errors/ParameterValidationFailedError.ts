/**
 * Error that is thrown when the - if provided - validator of a parameter returns "false".
 * (Runtime error)
 *
 * @export
 * @class ParameterValidationFailedError
 * @extends {Error}
 */
export class ParameterValidationFailedError extends Error {
    constructor(name: string, public innerException?: Error) {
        super(`The validator for the parameter "${name}" was not valid.`);
        if (this.innerException) {
            this.message += `\nThe validator threw an error: ${this.innerException.toString()}`;
        }
    }
}
