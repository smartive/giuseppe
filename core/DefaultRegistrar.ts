import 'reflect-metadata';
import {Router, Request, Response} from 'express';
import {RouteMethod, ROUTES_KEY, RouteRegistration} from '../routes/RouteDecorators';
import {
    HttpVerbNotSupportedError,
    DuplicateRouteDeclarationError,
    ParameterConstructorArgumentsError,
    WrongReturnTypeError,
    GenericRouteError,
    RequiredParameterNotProvidedError,
    ParameterParseError,
    ParamValidationFailedError,
    HeadHasWrongReturnTypeError
} from '../errors/Errors';
import {ControllerRegistration} from '../controllers/ControllerDecorator';
import {Param, PARAMS_KEY, ParamType} from '../params/ParamDecorators';
import {ERRORHANDLER_KEY} from '../errors/ErrorHandlerDecorator';
import {Validator} from '../validators/Validators';
import {RequestHandler} from 'express-serve-static-core';
import {QueryParamOptions, ParameterFactory, FactoryParameterOptions} from '../params/ParamOptions';
import {ControllerErrorHandler} from '../errors/ControllerErrorHandler';
import {ControllerLoaderOptions, Registrar} from './Registrar';
import {injectable, inject} from 'inversify';
import {RouteHandler} from './RouteHandler';
import {IoCSymbols} from './IoCSymbols';
import {ParamHandler} from './ParamHandler';
import httpStatus = require('http-status');

/**
 * TODO
 */
@injectable()
export class DefaultRegistrar implements Registrar {
    private controllers: ControllerRegistration[] = [];
    private definedRoutes: RegistrationHelper[] = [];

    constructor(@inject(IoCSymbols.routeHandler) private routeHandler: RouteHandler, @inject(IoCSymbols.paramHandler) private paramHandler: ParamHandler) {
    }

    public registerControllersFromFolder({folderPath, root = process.cwd(), recursive = false, matchRegExp = /(.*)[.]js$/}: ControllerLoaderOptions,
        baseUrl: string = '',
        router: Router = Router()): Promise<Router> {
        let filewalker = require('filewalker'),
            path = require('path');

        return new Promise<Router>((resolve, reject) => {
            let controllersPath = path.join(root, folderPath);
            console.info(`Load controllers from path '${controllersPath}' ${recursive ? '' : 'non '}recursive.`);

            filewalker(controllersPath, {recursive, matchRegExp})
                .on('error', err => {
                    console.error(`Error happened during loading controllers from path: ${err}`);
                    reject(err);
                })
                .on('file', controller => {
                    try {
                        console.info(`Loading controller '${controller}'.`);
                        require(path.join(controllersPath, controller));
                    } catch (e) {
                        console.error(`Error happened during load of the '${controller}' controller: ${e}`);
                        reject(e);
                    }
                })
                .on('done', () => {
                    resolve(this.registerControllers(baseUrl, router));
                })
                .walk();
        });
    }

    public registerControllers(baseUrl: string = '', router: Router = Router()): Router {
        let url = baseUrl;
        if (url[url.length - 1] !== '/') {
            url += '/';
        }
        if (url[0] !== '/') {
            url = '/' + url;
        }

        for (let ctrl of this.controllers) {
            let routes = Reflect.getOwnMetadata(ROUTES_KEY, ctrl.controller) || [],
                instance = new ctrl.controller();

            for (let route of routes) {
                let ctrlTarget = ctrl.controller,
                    routeTarget = ctrlTarget.prototype,
                    routeUrl = url + [ctrl.prefix, route.path].filter(Boolean).join('/'),
                    returnType = Reflect.getMetadata('design:returntype', routeTarget, route.propertyKey),
                    params: Param[] = Reflect.getOwnMetadata(PARAMS_KEY, routeTarget, route.propertyKey) || [],
                    middlewares = [...ctrl.middlewares, ...route.middlewares],
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

                if (this.definedRoutes.some(route => route.routeId === routeId)) {
                    throw new DuplicateRouteDeclarationError(routeUrl, route.method);
                }

                if (route.method === RouteMethod.Head && returnType !== Boolean) {
                    throw new HeadHasWrongReturnTypeError();
                }

                if (params.some((p: Param) => p.paramType === ParamType.Body) && !bodyParserInstalled) {
                    console.warn(`The route ${routeUrl} of controller '${instance.constructor.name}' uses a @Body parameter, but there is no 'body-parser' package installed.`);
                }

                params.forEach(p => {
                    if (p.type.length < 1 && !(p.options && (p.options as FactoryParameterOptions).factory)) {
                        throw new ParameterConstructorArgumentsError(p.name);
                    }
                });

                params = params.sort((p1, p2) => p1.index - p2.index);

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

                this.definedRoutes.push(new RegistrationHelper(routeId, routeUrl, route, decoratedMethod, middlewares));
            }
        }

        this.definedRoutes
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

    public registerController(registration: ControllerRegistration): void {
        this.controllers.push(registration);
    }

    public resetControllerRegistrations(): void {
        this.definedRoutes = [];
        this.controllers = [];
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

class RegistrationHelper {
    public wildcardCount: number;
    public segmentCount: number;

    constructor(public routeId: string, public routeUrl: string, public route: RouteRegistration, public decoratedMethod: Function, public middlewares: RequestHandler[]) {
        this.wildcardCount = this.routeUrl.split('*').length - 1;
        this.segmentCount = this.routeUrl.split('/').length;
    }
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
