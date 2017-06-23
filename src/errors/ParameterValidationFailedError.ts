/**
 * Error that is thrown when the - if provided - validator of a parameter returns "false".
 * (Runtime error)
 *
 * @export
 * @class ParameterValidationFailedError
 * @extends {Error}
 */
export class ParameterValidationFailedError extends Error {
    constructor(name: string) {
        super(`The validator for the parameter "${name}" was not valid.`);
    }
}
