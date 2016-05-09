import 'reflect-metadata';
import {Router, Request, Response} from 'express';
import {RouteMethod, ROUTES_KEY, RouteRegistration} from '../routes/RouteDecorators';
import {
    HttpVerbNotSupportedError,
    DuplicateRouteDeclarationError,
    ParameterConstructorArgumentsError,
    WrongReturnTypeError,
    RouteError,
    RequiredParameterNotProvidedError,
    ParameterParseError,
    ParamValidationFailedError,
    HeadHasWrongReturnTypeError
} from '../errors/Errors';
import {Param, PARAMS_KEY, ParamType} from '../params/ParamDecorators';
import {ErrorHandlerManager, ERRORHANDLER_KEY, DEFAULT_ERROR_HANDLER} from '../errors/ErrorHandlerDecorator';
import {Validator} from '../validators/Validators';
import httpStatus = require('http-status');

let controllers: ControllerRegistration[] = [],
    definedRoutes = [],
    bodyParserInstalled = false;

const PRIMITIVE_TYPES = [Object, String, Array, Number, Boolean],
    NON_JSON_TYPES = [String, Number, Boolean];

try {
    require('body-parser');
    bodyParserInstalled = true;
} catch (e) {
    bodyParserInstalled = false;
}

class ControllerRegistration {
    constructor(public controller: any, public prefix?: string) {
    }
}

function parseParam(value: any, param: Param) {
    let ctor = param.type as any;

    if ((value === null || value === undefined) && param.options && param.options.required) {
        throw new RequiredParameterNotProvidedError(param.name);
    } else if (value === null || value === undefined) {
        return undefined;
    }

    let parsed;
    try {
        if (value.constructor === ctor) {
            parsed = value;
        } else {
            parsed = PRIMITIVE_TYPES.indexOf(ctor) !== -1 ? ctor(value) : new ctor(value);
        }
    } catch (e) {
        throw new ParameterParseError(param.name, e);
    }

    if (param.options && param.options.validator) {
        let isValid = value => {
            let predicates = param.options.validator;

            if (Array.isArray(predicates)) {
                return (predicates as Validator[]).every(p => p(value));
            }

            return (predicates as Validator)(value);
        };

        if (isValid(parsed)) {
            return parsed;
        }
        throw new ParamValidationFailedError(param.name);
    } else {
        return parsed;
    }
}

function getParamValues(params: Param[], request: Request, response: Response) {
    let paramValues = [];
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
    return paramValues;
}

function registerRoute(route: RouteRegistration, router: Router, routeUrl: string) {
    switch (route.method) {
        case RouteMethod.Get:
            router.get(routeUrl, (route.descriptor.value as any));
            break;
        case RouteMethod.Put:
            router.put(routeUrl, (route.descriptor.value as any));
            break;
        case RouteMethod.Post:
            router.post(routeUrl, (route.descriptor.value as any));
            break;
        case RouteMethod.Delete:
            router.delete(routeUrl, (route.descriptor.value as any));
            break;
        case RouteMethod.Head:
            router.head(routeUrl, (route.descriptor.value as any));
            break;
        default:
            throw new HttpVerbNotSupportedError(route.method);
    }
}

/**
 * Controller decorator; decorates a class to be a rest api controller. A controller registers itself to an
 * expressJS router when "registerControllers" is called.
 *
 * @param {string} [routePrefix] - Prefix for the whole controller. This path is added to all routes.
 * @returns {(Function) => void} - Decorator for the controller class.
 */
export function Controller(routePrefix?: string) {
    return (controller: any) => {
        controllers.push(new ControllerRegistration(controller, routePrefix));
    };
}

/**
 * Function that registers all decorated controller with their decorated route functions in an expressJS router.
 * When no router is provided, this function will instantiate and return a router.
 *
 * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
 * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
 * @returns {Router} - The configured router.
 */
export function registerControllers(baseUrl: string = '', router: Router = Router()): Router {
    let url = baseUrl;
    if (url[url.length - 1] !== '/') {
        url += '/';
    }
    if (url[0] !== '/') {
        url = '/' + url;
    }

    controllers.forEach(ctrl => {
        let routes = Reflect.getOwnMetadata(ROUTES_KEY, ctrl.controller) || [],
            instance = new ctrl.controller();

        routes.forEach((route: RouteRegistration) => {
            let ctrlTarget = ctrl.controller,
                routeTarget = ctrlTarget.prototype,
                routeUrl = url + [ctrl.prefix, route.path].filter(Boolean).join('/'),
                routeId = routeUrl + route.method.toString(),
                returnType = Reflect.getMetadata('design:returntype', routeTarget, route.propertyKey),
                params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, routeTarget, route.propertyKey) || [],
                method = route.descriptor.value,
                hasResponseParam = !!params.filter(p => p.paramType === ParamType.Response).length;

            if (definedRoutes.indexOf(routeId) !== -1) {
                throw new DuplicateRouteDeclarationError(routeUrl, route.method);
            }

            if (route.method === RouteMethod.Head && returnType !== Boolean) {
                throw new HeadHasWrongReturnTypeError();
            }

            if (params.some((p: Param) => p.paramType === ParamType.Body) && !bodyParserInstalled) {
                console.warn(`The route ${routeUrl} of controller '${instance.constructor.name}' uses a @Body parameter, but there is no 'body-parser' package installed.`);
            }

            params.forEach(p => {
                if (p.type.length < 1) {
                    throw new ParameterConstructorArgumentsError(p.name);
                }
            });

            if (routeUrl.length > 1 && routeUrl[routeUrl.length - 1] === '/') {
                routeUrl = routeUrl.substr(0, routeUrl.length - 1);
            }

            params = params.sort((p1, p2) => (p1.index < p2.index) ? -1 : 1);

            route.descriptor.value = (request: Request, response: Response, next) => {
                let errorHandlers: ErrorHandlerManager = Reflect.getMetadata(ERRORHANDLER_KEY, ctrlTarget),
                    paramValues = [];

                if (!errorHandlers) {
                    errorHandlers = new ErrorHandlerManager();
                    errorHandlers.addHandler(DEFAULT_ERROR_HANDLER);
                }

                try {
                    paramValues = getParamValues(params, request, response);
                } catch (e) {
                    errorHandlers.callHandlers(instance, request, response, e);
                    // This return is needed, since the controller
                    // would try to call the route method (even on error).
                    return;
                }

                try {
                    let result = method.apply(instance, paramValues),
                        responseFunction = result => {
                            if (NON_JSON_TYPES.indexOf(result.constructor) !== -1) {
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
                        throw new WrongReturnTypeError(route.propertyKey, returnType, result.constructor);
                    }
                    if (route.method === RouteMethod.Head && returnType === Boolean) {
                        return response.status((result) ? httpStatus.OK : httpStatus.NOT_FOUND).end();
                    }
                    if (returnType === Promise) {
                        (result as Promise<any>).then(responseFunction, err => errorHandlers.callHandlers(instance, request, response, new RouteError(route.propertyKey, err)));
                    } else {
                        responseFunction(result);
                    }
                } catch (e) {
                    errorHandlers.callHandlers(instance, request, response, new RouteError(route.propertyKey, e));
                }
            };

            registerRoute(route, router, routeUrl);
            definedRoutes.push(routeId);
        });
    });

    return router;
}

/**
 * Resets the registered controllers and the defined routes array (used for testing).
 */
export function resetControllerRegistrations(): void {
    definedRoutes = [];
    controllers = [];
}
