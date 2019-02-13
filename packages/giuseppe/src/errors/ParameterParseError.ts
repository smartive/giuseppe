/**
 * Error that is thrown when the parsing process of a parameters throws an error.
 * (Runtime error)
 *
 * @export
 * @class ParameterParseError
 * @extends {Error}
 */
export class ParameterParseError extends Error {
    constructor(name: string, public innerException: Error) {
        super(`Parsing of the parameter "${name}" threw an error.\nInnerException: ${innerException}`);
    }
}
