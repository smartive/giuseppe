/**
 * Error that is thrown when a required parameter is not provided. Url parameters are always required.
 * (Runtime error)
 *
 * @export
 * @class RequiredParameterNotProvidedError
 * @extends {Error}
 */
export class RequiredParameterNotProvidedError extends Error {
    constructor(name: string) {
        super(`The required parameter "${name}" was not provided`);
    }
}
