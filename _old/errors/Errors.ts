import { RouteMethod } from '../routes/RouteDecorators';

/// Error bases

export class DesigntimeError extends Error {
    constructor() {
        super();
    }
}

export class RuntimeError extends Error {
    constructor() {
        super();
    }
}

export class ParameterError extends RuntimeError {
    constructor() {
        super();
    }
}

export class RouteError extends RuntimeError {
    constructor() {
        super();
    }
}

export class ValidationError extends ParameterError {
    constructor() {
        super();
    }
}

/// Registration & Controller errors

/**
 * Error that is thrown when a http method is not supported by the framework.
 * (Error will happen at startup)
 *
 * @class HttpVerbNotSupportedError
 * @extends {DesigntimeError}
 */
export class HttpVerbNotSupportedError extends DesigntimeError {
    constructor(method: RouteMethod) {
        super();
        this.message = `HttpVerb not supported; ${method}`;
    }
}

/**
 * Error that is thrown when a route is duplicated (same url and method).
 * (Error will happen at startup)
 *
 * @class DuplicateRouteDeclarationError
 * @extends {DesigntimeError}
 */
export class DuplicateRouteDeclarationError extends DesigntimeError {
    constructor(url: string, method: RouteMethod) {
        super();
        this.message = `The route to url "${url}" with http method "${RouteMethod[method]}" is declared twice.\nIf you use versioning, the versions could overlap!`;
    }
}

/**
 * Error that is thrown when a head route has a non boolean return type.
 * (Error will happen at startup)
 *
 * @class HeadHasWrongReturnTypeError
 * @extends {DesigntimeError}
 */
export class HeadHasWrongReturnTypeError extends DesigntimeError {
    constructor() {
        super();
        this.message = 'Head route must have return type boolean';
    }
}

/**
 * Error that is thrown when an error handler accepts the wrong arguments.
 * (Error will happen at startup)
 *
 * @class ErrorHandlerWrongArgumentsError
 * @extends {DesigntimeError}
 */
export class ErrorHandlerWrongArgumentsError extends DesigntimeError {
    constructor() {
        super();
        this.message = 'Error handler must accept exactly request, response and an error object';
    }
}

/**
 * Error that is thrown when an error handler accepts the wrong argument types.
 * (Error will happen at startup)
 *
 * @class ErrorHandlerWrongArgumentTypesError
 * @extends {DesigntimeError}
 */
export class ErrorHandlerWrongArgumentTypesError extends DesigntimeError {
    constructor() {
        super();
        this.message = 'Error handler arguments must be: Object, Object, Error';
    }
}

/**
 * Error that is thrown when an error handler has a non void return type.
 * (Error will happen at startup)
 *
 * @class ErrorHandlerWrongReturnTypeError
 * @extends {DesigntimeError}
 */
export class ErrorHandlerWrongReturnTypeError extends DesigntimeError {
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
 * @class ParameterParseError
 * @extends {DesigntimeError}
 */
export class ParameterConstructorArgumentsError extends DesigntimeError {
    constructor(name: string) {
        super();
        this.message = `The constructor for the parameter "${name}" must accept at least 1 argument`;
    }
}

/**
 * Error that is thrown when a required parameter is not provided. Url parameters are always required.
 * (Runtime error)
 *
 * @class RequiredParameterNotProvidedError
 * @extends {ParameterError}
 */
export class RequiredParameterNotProvidedError extends ParameterError {
    constructor(name: string) {
        super();
        this.message = `The required parameter "${name}" was not provided`;
    }
}

/**
 * Error that is thrown when the parsing process of a parameters throws an error.
 * (Runtime error)
 *
 * @class ParameterParseError
 * @extends {ParameterError}
 */
export class ParameterParseError extends ParameterError {
    constructor(name: string, public innerException: Error) {
        super();
        this.message = `Parsing of the parameter "${name}" threw an error.\nInnerException: ${innerException}`;
    }
}

/// Route errors

/**
 * Error that is thrown when the route method returns the wrong type (i.e. a string instead of a number).
 * (Runtime error)

 * @class WrongReturnTypeError
 * @extends {RouteError}
 */
export class WrongReturnTypeError extends RouteError {
    constructor(name: string, expected: Function, received: Function) {
        super();
        this.message = `The method "${name}" returned the wrong result type.\nExpected: ${expected}\nReceived: ${received}`;
    }
}

/**
 * Error that is thrown when the route method throws any error (or any Promise returned by a route).
 * (Runtime error)
 *
 * @class GenericRouteError
 * @extends {RouteError}
 */
export class GenericRouteError extends RouteError {
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
 * @class ParamValidationFailedError
 * @extends {ValidationError}
 */
export class ParamValidationFailedError extends ValidationError {
    constructor(name: string) {
        super();
        this.message = `The validator for the parameter "${name}" was not valid.`;
    }
}

/// Versioning errors

/**
 * Error that is thrown when a version information on a route or a controller is missing both information,
 * i.e. there is no version in "from" and no version in "until"
 * (Error will happen at startup)
 * 
 * @class VersionInformationMissing
 * @extends {DesigntimeError}
 */
export class VersionInformationMissing extends DesigntimeError {
    constructor(ctrlOrRouteName: string) {
        super();
        this.message = `The controller or method "${ctrlOrRouteName}" has neither from nor until version information.`;
    }
}

/**
 * Error that is thrown when a version information contains errors.
 * (Error will happen at startup) 
 *
 * @class VersionInformationInvalid
 * @extends {DesigntimeError}
 */
export class VersionInformationInvalid extends DesigntimeError {
    constructor(ctrlOrRouteName: string, reason: string) {
        super();
        this.message = `The controller or method "${ctrlOrRouteName}" has invalid version information.\nReason: ${reason}`;
    }
}

/**
 * Error that is thrown when a route or a controller contains multiple
 * version information.
 * (Error will happen at startup)
 * 
 * @class DuplicateVersionInformation
 * @extends {DesigntimeError}
 */
export class DuplicateVersionInformation extends DesigntimeError {
    constructor(ctrlOrRouteName: string) {
        super();
        this.message = `The controller or method "${ctrlOrRouteName}" has duplicated version decorators.`;
    }
}
