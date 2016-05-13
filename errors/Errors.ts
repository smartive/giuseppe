import {RouteMethod} from '../routes/RouteDecorators';

/// Registration & Controller errors

/**
 * Error that is thrown when a http method is not supported by the framework.
 * (Error will happen at startup)
 *
 * @class
 */
export class HttpVerbNotSupportedError extends Error {
    constructor(method: RouteMethod) {
        super();
        this.message = `HttpVerb not supported; ${method}`;
    }
}

/**
 * Error that is thrown when a route is duplicated (same url and method).
 * (Error will happen at startup)
 *
 * @class
 */
export class DuplicateRouteDeclarationError extends Error {
    constructor(url: string, method: RouteMethod) {
        super();
        this.message = `The route to url "${url}" with http method "${RouteMethod[method]}" is declared twice.`;
    }
}

/**
 * Error that is thrown when a head route has a non boolean return type.
 * (Error will happen at startup)
 *
 * @class
 */
export class HeadHasWrongReturnTypeError extends Error {
    constructor() {
        super();
        this.message = 'Head route must have return type boolean';
    }
}

/**
 * Error that is thrown when an error handler accepts the wrong arguments.
 * (Error will happen at startup)
 *
 * @class
 */
export class ErrorHandlerWrongArgumentsError extends Error {
    constructor() {
        super();
        this.message = 'Error handler must accept exactly request, response and an error object';
    }
}

/**
 * Error that is thrown when an error handler accepts the wrong argument types.
 * (Error will happen at startup)
 *
 * @class
 */
export class ErrorHandlerWrongArgumentTypesError extends Error {
    constructor() {
        super();
        this.message = 'Error handler arguments must be: Object, Object, Error';
    }
}

/**
 * Error that is thrown when an error handler has a non void return type.
 * (Error will happen at startup)
 *
 * @class
 */
export class ErrorHandlerWrongReturnTypeError extends Error {
    constructor() {
        super();
        this.message = 'Error handler must have return type void';
    }
}

/// Parameter & Parsing errors

/**
 * Error that is thrown when a given parameter type supports not at least argument (used for instantiation of the type).
 * (Error will happen at startup)
 *
 * @class
 */
export class ParameterConstructorArgumentsError extends Error {
    constructor(name: string) {
        super();
        this.message = `The constructor for the parameter "${name}" must accept at least 1 argument`;
    }
}

/**
 * Error that is thrown when a required parameter is not provided. Url parameters are always required.
 * (Runtime error)
 *
 * @class
 */
export class RequiredParameterNotProvidedError extends Error {
    constructor(name: string) {
        super();
        this.message = `The required parameter "${name}" was not provided`;
    }
}

/**
 * Error that is thrown when the parsing process of a parameters throws an error.
 * (Runtime error)
 *
 * @class
 */
export class ParameterParseError extends Error {
    constructor(name: string, public innerException: Error) {
        super();
        this.message = `Parsing of the parameter "${name}" threw an error.\nInnerException: ${innerException}`;
    }
}

/// Route errors

/**
 * Error that is thrown when the route method returns the wrong type (i.e. a string instead of a number).
 * (Runtime error)
 *
 * @class
 */
export class WrongReturnTypeError extends Error {
    constructor(name: string, expected: Function, received: Function) {
        super();
        this.message = `The method "${name}" returned the wrong result type.\nExpected: ${expected}\nReceived: ${received}`;
    }
}

/**
 * Error that is thrown when the route method throws any error (or any Promise returned by a route).
 * (Runtime error)
 *
 * @class
 */
export class RouteError extends Error {
    constructor(name: string, public innerException: Error) {
        super();
        this.message = `The method "${name}" threw an error.\nInnerException: ${innerException}`;
    }
}

/// Validator errors

/**
 * Error that is thrown when the - if provided - validator of a parameter returns "false".
 * (Runtime error)
 *
 * @class
 */
export class ParamValidationFailedError extends Error {
    constructor(name: string) {
        super();
        this.message = `The validator for the parameter "${name}" was not valid.`;
    }
}
