import {ControllerErrorHandler} from '../errors/ControllerErrorHandler';
import {ERRORHANDLER_KEY} from '../errors/ErrorHandlerDecorator';
import {DuplicateRouteDeclarationError, GenericRouteError, HeadHasWrongReturnTypeError, HttpVerbNotSupportedError, WrongReturnTypeError} from '../errors/Errors';
import {ControllerRegistration} from '../models/ControllerRegistration';
import {RouteRegistration} from '../models/RouteRegistration';
import {ParamType} from '../params/ParamDecorators';
import {RouteMethod, ROUTES_KEY} from '../routes/RouteDecorators';
import {IoCSymbols} from './IoCSymbols';
import {ParamHandler} from './ParamHandler';
import {RouteHandler} from './RouteHandler';
import {Request, RequestHandler, Response, Router} from 'express';
import httpStatus = require('http-status');
import {inject, injectable} from 'inversify';

const NON_JSON_TYPES = [String, Number, Boolean];

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
    private routes: { [id: string]: RegistrationHelper } = {};

    constructor( @inject(IoCSymbols.paramHandler) private paramHandler: ParamHandler) {
    }

    public addRoutes(controllerRegistration: ControllerRegistration, url: string): void {
        let routes = Reflect.getOwnMetadata(ROUTES_KEY, controllerRegistration.controller) || [],
            instance = new controllerRegistration.controller();

        for (let route of routes) {
            let ctrlTarget = controllerRegistration.controller,
                routeTarget = ctrlTarget.prototype,
                routeUrl = url + [controllerRegistration.prefix, route.path].filter(Boolean).join('/'),
                returnType = Reflect.getMetadata('design:returntype', routeTarget, route.propertyKey),
                middlewares = [...controllerRegistration.middlewares, ...route.middlewares],
                method = route.descriptor.value;

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

            let params = this.paramHandler.getParamsForRoute(routeTarget, route.propertyKey),
                hasResponseParam = params.some(p => p.paramType === ParamType.Response);

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
                    paramValues = this.paramHandler.getParamValuesForRequest(params, request, response);
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
            .forEach(r => this.registerRoute(r, router));

        return router;
    }

    public resetRoutes(): void {
        this.routes = {};
    }

    private registerRoute(registration: RegistrationHelper, router: Router): void {
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
}
