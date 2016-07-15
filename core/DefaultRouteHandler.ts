import {injectable, inject} from 'inversify';
import {RouteHandler} from './RouteHandler';
import {RouteRegistration, ROUTES_KEY, RouteMethod} from '../routes/RouteDecorators';
import {Router, RequestHandler, Request, Response} from 'express';
import {IoCSymbols} from './IoCSymbols';
import {ParamHandler} from './ParamHandler';
import {ControllerRegistration} from '../controllers/ControllerDecorator';
import {Param, PARAMS_KEY, ParamType} from '../params/ParamDecorators';
import {
    DuplicateRouteDeclarationError,
    HeadHasWrongReturnTypeError,
    ParameterConstructorArgumentsError,
    GenericRouteError,
    WrongReturnTypeError,
    HttpVerbNotSupportedError,
    RequiredParameterNotProvidedError,
    ParamValidationFailedError,
    ParameterParseError
} from '../errors/Errors';
import {FactoryParameterOptions, QueryParamOptions, ParameterFactory} from '../params/ParamOptions';
import {ControllerErrorHandler} from '../errors/ControllerErrorHandler';
import {ERRORHANDLER_KEY} from '../errors/ErrorHandlerDecorator';
import {Validator} from '../validators/Validators';
import httpStatus = require('http-status');

class RegistrationHelper {
    public wildcardCount: number;
    public segmentCount: number;

    constructor(public routeId: string, public routeUrl: string, public route: RouteRegistration, public decoratedMethod: Function, public middlewares: RequestHandler[]) {
        this.wildcardCount = this.routeUrl.split('*').length - 1;
        this.segmentCount = this.routeUrl.split('/').length;
    }
}

@injectable()
export class DefaultRouteHandler implements RouteHandler {
    private routes: {[id: string]: RegistrationHelper} = {};

    constructor(@inject(IoCSymbols.paramHandler) private paramHandler: ParamHandler) {
    }

    public addRoutes(controllerRegistration: ControllerRegistration, url: string): void {
        let routes = Reflect.getOwnMetadata(ROUTES_KEY, controllerRegistration.controller) || [],
            instance = new controllerRegistration.controller();

        for (let route of routes) {
            let ctrlTarget = controllerRegistration.controller,
                routeTarget = ctrlTarget.prototype,
                routeUrl = url + [controllerRegistration.prefix, route.path].filter(Boolean).join('/'),
                returnType = Reflect.getMetadata('design:returntype', routeTarget, route.propertyKey),
                params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, routeTarget, route.propertyKey) || [],
                middlewares = [...controllerRegistration.middlewares, ...route.middlewares],
                method = route.descriptor.value,
                hasResponseParam = !!params.filter(p => p.paramType === ParamType.Response).length;

            let index;
            if ((index = routeUrl.lastIndexOf('~')) > -1) {
                routeUrl = routeUrl.substring(index + 1);
            }

            if (routeUrl.length > 1) {
                routeUrl = '/' + routeUrl.split('/').filter(Boolean).join('/');
            }

            let routeId = routeUrl + route.method.toString();

            if (this.routes[routeId]) {
                throw new DuplicateRouteDeclarationError(routeUrl, route.method);
            }

            if (route.method === RouteMethod.Head && returnType !== Boolean) {
                throw new HeadHasWrongReturnTypeError();
            }

            // -> param handler
            if (params.some((p: Param) => p.paramType === ParamType.Body) && !bodyParserInstalled) {
                console.warn(`The route ${routeUrl} of controller '${instance.constructor.name}' uses a @Body parameter, but there is no 'body-parser' package installed.`);
            }

            // -> param handler
            params.forEach(p => {
                if (p.type.length < 1 && !(p.options && (p.options as FactoryParameterOptions).factory)) {
                    throw new ParameterConstructorArgumentsError(p.name);
                }
            });

            let decoratedMethod = (request: Request, response: Response, next) => {
                let errorHandler: ControllerErrorHandler = Reflect.getMetadata(ERRORHANDLER_KEY, ctrlTarget),
                    paramValues = [];

                if (!errorHandler) {
                    errorHandler = new ControllerErrorHandler();
                }

                let handleError = (error: any) => {
                    if (!(error instanceof Error)) {
                        error = new GenericRouteError(route.propertyKey, error);
                    }
                    errorHandler.handleError(instance, request, response, error);
                };

                try {
                    paramValues = getParamValues(params, request, response);
                } catch (e) {
                    handleError(e);
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
                        handleError(new WrongReturnTypeError(route.propertyKey, returnType, result.constructor));
                    }
                    if (route.method === RouteMethod.Head && returnType === Boolean) {
                        return response.status((result) ? httpStatus.OK : httpStatus.NOT_FOUND).end();
                    }
                    if (returnType === Promise) {
                        (result as Promise<any>).then(responseFunction, handleError);
                    } else {
                        responseFunction(result);
                    }
                } catch (e) {
                    handleError(e);
                }
            };

            this.routes[routeId] = new RegistrationHelper(routeId, routeUrl, route, decoratedMethod, middlewares);
        }
    }

    public registerRoutes(router: Router): Router {
        Object.keys(this.routes)
            .map(k => this.routes[k])
            .reduce((segmentSorted, route) => {
                (segmentSorted[route.segmentCount] || (segmentSorted[route.segmentCount] = [])).push(route);
                return segmentSorted;
            }, [])
            .filter(Boolean)
            .reverse()
            .reduce((routeList, segments) => routeList.concat(segments.sort((r1, r2) => r1.wildcardCount - r2.wildcardCount)), [])
            .forEach(r => registerRoute(r, router));

        return router;
    }

    public resetRoutes(): void {
        this.routes = {};
    }
}


// cleanup \/


let bodyParserInstalled = false,
    CookieHelper = class {
        public name: string;
        public value: string;

        constructor(value: string) {
            let split = value.split('=');
            this.name = split[0];
            this.value = split[1];
        }
    };

const PRIMITIVE_TYPES = [Object, String, Array, Number, Boolean],
    NON_JSON_TYPES = [String, Number, Boolean];

try {
    require('body-parser');
    bodyParserInstalled = true;
} catch (e) {
    bodyParserInstalled = false;
}

function extractParam(request: Request, param: Param): any {
    switch (param.paramType) {
        case ParamType.Body:
            return request.body;
        case ParamType.Url:
            return request.params[param.name];
        case ParamType.Query:
            let options: QueryParamOptions = param.options;
            if (!options || !options.alias) {
                return request.query[param.name];
            }
            let aliases = !Array.isArray(options.alias) ? [options.alias] : options.alias as string[];
            aliases = aliases.map((a: string) => request.query[a]).filter(Boolean);
            return aliases[0] || request.query[param.name];
        case ParamType.Header:
            return request.get(param.name);
        case ParamType.Cookie:
            let cookies = request.get('cookie');
            if (!cookies) {
                return undefined;
            }
            let cookie = cookies
                .split(';')
                .map(o => new CookieHelper(o.trim()))
                .filter(o => o.name === param.name)[0];
            return cookie ? cookie.value : undefined;
    }
}

function parseParam(value: any, param: Param) {
    let factory: ParameterFactory<any>;

    if (param.options && (param.options as FactoryParameterOptions).factory) {
        factory = (param.options as FactoryParameterOptions).factory;
    } else {
        factory = raw => {
            let ctor = param.type as any;
            if (raw.constructor === ctor) {
                return raw;
            } else {
                return PRIMITIVE_TYPES.indexOf(ctor) !== -1 ? ctor(raw) : new ctor(raw);
            }
        };
    }

    if ((value === null || value === undefined) && param.options && param.options.required) {
        throw new RequiredParameterNotProvidedError(param.name);
    } else if (value === null || value === undefined) {
        return undefined;
    }

    let parsed;
    try {
        parsed = factory(value);
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
            default:
                paramValues[p.index] = parseParam(extractParam(request, p), p);
                return;
        }
    });
    return paramValues;
}

function registerRoute(registration: RegistrationHelper, router: Router) {
    switch (registration.route.method) {
        case RouteMethod.Get:
            router.get(registration.routeUrl, ...registration.middlewares, (registration.decoratedMethod as any));
            break;
        case RouteMethod.Put:
            router.put(registration.routeUrl, ...registration.middlewares, (registration.decoratedMethod as any));
            break;
        case RouteMethod.Post:
            router.post(registration.routeUrl, ...registration.middlewares, (registration.decoratedMethod as any));
            break;
        case RouteMethod.Delete:
            router.delete(registration.routeUrl, ...registration.middlewares, (registration.decoratedMethod as any));
            break;
        case RouteMethod.Head:
            router.head(registration.routeUrl, ...registration.middlewares, (registration.decoratedMethod as any));
            break;
        default:
            throw new HttpVerbNotSupportedError(registration.route.method);
    }
}
