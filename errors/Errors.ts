import {RouteMethod} from '../routes/RouteDecorators';

let format = (text: string, ...args: any[]) => {
    return text.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
};

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
        this.message = format('HttpVerb not supported; {0}', method);
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
        this.message = format('The route to url "{0}" with http method "{1}" is declared twice.', url, RouteMethod[method]);
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
        this.message = format('The constructor for the parameter "{0}" must accept at least 1 argument', name);
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
        this.message = format('The required parameter "{0}" was not provided', name);
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
        this.message = format('Parsing of the parameter "{0}" threw an error\nInnerException: {1}', name, innerException);
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
        this.message = format('The method "{0}" returned the wrong result type.\nExpected: {1}\nReceived: {2}', name, expected, received);
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
        this.message = format('The method "{0}" threw an error.\nInnerException: {1}', name, innerException);
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
        this.message = format('The validator for the parameter "{0}" was not valid.', name);
    }
}
