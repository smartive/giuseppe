import 'reflect-metadata';
import {errorHandlerKey, ErrorHandlerManager} from '../errors/ErrorHandlerDecorator';
import {Param, paramsKey, ParamType} from '../params/ParamDecorators';
import {
    ParameterConstructorArgumentsError,
    RequiredParameterNotProvidedError,
    ParameterParseError,
    RouteError,
    WrongReturnTypeError,
    ParamValidationFailedError
} from '../errors/Errors';
import {Request, Response} from 'express';
import httpStatus = require('http-status');

const primitiveTypes = [Object, String, Array, Number, Boolean],
    nonJsonTypes = [String, Number, Boolean];

const defaultErrorHandler = (req, res, err) => {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
};

let parseParam = (value: any, param: Param) => {
    let ctor = param.type as any;

    if ((value === null || value === undefined) && param.options && param.options.required) {
        throw new RequiredParameterNotProvidedError(param.name);
    } else if (value === null || value === undefined) {
        return undefined;
    }

    let parsed;
    try {
        parsed = primitiveTypes.indexOf(ctor) !== -1 ? ctor(value) : new ctor(value);
    } catch (e) {
        throw new ParameterParseError(param.name, e);
    }

    if (param.options && param.options.validator) {
        if (param.options.validator(parsed)) {
            return parsed;
        }
        throw new ParamValidationFailedError(param.name);
    } else {
        return parsed;
    }
};

/**
 * Reflect metadata key for the controllers routes.
 * @type {string}
 */
export const routesKey = 'routes';

/**
 * Enum for the possible route http methods.
 */
export enum RouteMethod {
    Get,
    Put,
    Post,
    Delete
}

/**
 * Class for the registered routes. Contains all information for the "registerControllers" method to register the given routes.
 *
 * @class
 */
export class RouteRegistration {
    constructor(public path: string, public method: RouteMethod, public func: Function) {
    }
}

/**
 * Declares the given method as an api route. Registers itself during the "registerControllers" method with the
 * given http method and the required parameters.
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RouteMethod} httpMethod - The http verb to use for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function.
 */
export function Route(route: string = '', httpMethod: RouteMethod = RouteMethod.Get) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let returnType = Reflect.getMetadata('design:returntype', target, propertyKey),
            params: Param[] = Reflect.getOwnMetadata(paramsKey, target, propertyKey) || [],
            method = descriptor.value,
            hasResponseParam = !!params.filter(p => p.paramType === ParamType.Response).length;

        params.forEach(p => {
            if (p.type.length < 1) {
                throw new ParameterConstructorArgumentsError(p.name);
            }
        });

        params = params.sort((p1, p2) => (p1.index < p2.index) ? -1 : 1);

        descriptor.value = (request: Request, response: Response, next) => {
            let errorHandlers: ErrorHandlerManager = Reflect.getMetadata(errorHandlerKey, target.constructor),
                paramValues = [];

            if (!errorHandlers) {
                errorHandlers = new ErrorHandlerManager();
                errorHandlers.addHandler(defaultErrorHandler);
            }

            try {
                params.forEach((p: Param) => {
                    switch (p.paramType) {
                        case ParamType.Request:
                            paramValues[p.index] = request;
                            return;
                        case ParamType.Response:
                            paramValues[p.index] = response;
                            return;
                        case ParamType.Body:
                            paramValues[p.index] = parseParam(request.body, p);
                            return;
                        case ParamType.Url:
                            paramValues[p.index] = parseParam(request.params[p.name], p);
                            return;
                        case ParamType.Query:
                            paramValues[p.index] = parseParam(request.query[p.name], p);
                            return;
                        case ParamType.Header:
                            paramValues[p.index] = parseParam(request.get(p.name), p);
                            return;
                    }
                });
            } catch (e) {
                errorHandlers.callHandlers(request, response, e);
                return;
            }

            try {
                let result = method.apply(this, paramValues),
                    responseFunction = result => {
                        if (nonJsonTypes.indexOf(result.constructor) !== -1) {
                            response.send(result);
                        } else {
                            response.json(result);
                        }
                    };
                if (!returnType && hasResponseParam) {
                    return;
                }
                if (!returnType && !hasResponseParam) {
                    return response.status(httpStatus.NO_CONTENT).end();
                }
                if (!(result instanceof returnType) && !(result.constructor === returnType)) {
                    throw new WrongReturnTypeError(propertyKey, returnType, result.constructor);
                }
                if (returnType === Promise) {
                    (result as Promise<any>).then(responseFunction, err => errorHandlers.callHandlers(request, response, new RouteError(propertyKey, err)));
                } else {
                    responseFunction(result);
                }
            } catch (e) {
                errorHandlers.callHandlers(request, response, new RouteError(propertyKey, e));
            }
        };

        let routes = Reflect.getMetadata(routesKey, target.constructor) || [];
        routes.push(new RouteRegistration(route || '', httpMethod, descriptor.value));
        Reflect.defineMetadata(routesKey, routes, target.constructor);
    };
}

/**
 * Alias function for @Route(string, RouteMethod.Get)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'GET'.
 */
export function Get(route: string = '') {
    return Route(route, RouteMethod.Get);
}

/**
 * Alias function for @Route(string, RouteMethod.Put)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'PUT'.
 */
export function Put(route: string = '') {
    return Route(route, RouteMethod.Put);
}

/**
 * Alias function for @Route(string, RouteMethod.Post)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'POST'.
 */
export function Post(route: string = '') {
    return Route(route, RouteMethod.Post);
}

/**
 * Alias function for @Route(string, RouteMethod.Delete)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'DELETE'.
 */
export function Delete(route: string = '') {
    return Route(route, RouteMethod.Delete);
}
