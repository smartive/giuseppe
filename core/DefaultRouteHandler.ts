import { ControllerErrorHandler } from '../errors/ControllerErrorHandler';
import { ERRORHANDLER_KEY } from '../errors/ErrorHandlerDecorator';
import {
    DuplicateRouteDeclarationError,
    GenericRouteError,
    HeadHasWrongReturnTypeError,
    HttpVerbNotSupportedError,
    WrongReturnTypeError
} from '../errors/Errors';
import { ControllerRegistration } from '../models/ControllerRegistration';
import { ParamRegistration } from '../models/ParamRegistration';
import { RouteRegistration } from '../models/RouteRegistration';
import { VersionInformation } from '../models/VersionInformation';
import { ParamType } from '../params/ParamDecorators';
import { RouteMethod, ROUTES_KEY } from '../routes/RouteDecorators';
import { doRouteVersionsOverlap } from '../utilities/RouteHelpers';
import { VERSION_KEY } from '../versioning/VersionDecorator';
import { Configuration } from './Configuration';
import { IoCSymbols } from './IoCSymbols';
import { ParamHandler } from './ParamHandler';
import { RouteHandler } from './RouteHandler';
import { Request, RequestHandler, Response, Router } from 'express';
import httpStatus = require('http-status');
import { inject, injectable } from 'inversify';

const NON_JSON_TYPES = [String, Number, Boolean],
    defaultVersionInfo = VersionInformation.create('default', { from: 1 });

class RouteVersion {
    constructor(public version: VersionInformation, public ctrlInstance: any, public params: ParamRegistration[], public middlewares: RequestHandler[]) { }
}

class RouteInformation {
    public readonly wildcardCount: number;
    public readonly segmentCount: number;
    public readonly versions: RouteVersion[] = [];

    public get routeId(): string {
        return this.routeUrl + this.method.toString();
    }

    constructor(public routeUrl: string, public method: RouteMethod) {
        this.wildcardCount = this.routeUrl.split('*').length - 1;
        this.segmentCount = this.routeUrl.split('/').length;
    }

    public register(router: Router): void {
        if (!this.isUnique()) {
            throw new DuplicateRouteDeclarationError(this.routeUrl, this.method);
        }

        
    }

    private isUnique(): boolean {
        if (this.versions.length <= 1) {
            return true;
        }

        for (let version of this.versions) {
            if (this.versions.some(o => o !== version && doRouteVersionsOverlap(version.version, o.version))) {
                return false;
            }
        }

        return true;
    }
}

@injectable()
export class DefaultRouteHandler implements RouteHandler {
    private routes: { [id: string]: RouteInformation } = {};

    constructor(
        @inject(IoCSymbols.paramHandler) private paramHandler: ParamHandler,
        @inject(IoCSymbols.configuration) private config: Configuration
    ) {
    }

    public addRoutes(controllerRegistration: ControllerRegistration, url: string): void {
        let routes: RouteRegistration[] = Reflect.getOwnMetadata(ROUTES_KEY, controllerRegistration.controller) || [],
            instance = new controllerRegistration.controller(),
            ctrlVersionInfo = Reflect.getMetadata(VERSION_KEY, controllerRegistration.controller);

        for (let route of routes) {
            let routeUrl = url + [controllerRegistration.prefix, route.path].filter(Boolean).join('/'),
                versionInfo = Reflect.getMetadata(VERSION_KEY, controllerRegistration.controller.prototype, route.propertyKey) || ctrlVersionInfo || defaultVersionInfo;

            if (route.method === RouteMethod.Head && Reflect.getMetadata('design:returntype', controllerRegistration.controller.prototype, route.propertyKey) !== Boolean) {
                throw new HeadHasWrongReturnTypeError();
            }

            let index;
            if ((index = routeUrl.lastIndexOf('~')) > -1) {
                routeUrl = routeUrl.substring(index + 1);
            }

            if (routeUrl.length > 1) {
                routeUrl = '/' + routeUrl.split('/').filter(Boolean).join('/');
            }

            let routeInfo = new RouteInformation(routeUrl, route.method);
            routeInfo = this.routes[routeInfo.routeId] || routeInfo;

            routeInfo.versions.push(new RouteVersion(
                versionInfo,
                instance,
                this.paramHandler.getParamsForRoute(controllerRegistration.controller.prototype, route.propertyKey),
                [...controllerRegistration.middlewares, ...route.middlewares]
            ));

            this.routes[routeInfo.routeId] = routeInfo;

            //params.some(p => p.paramType === ParamType.Response);

            // let decoratedMethod = (request: Request, response: Response, next) => {
            //     let errorHandler: ControllerErrorHandler = Reflect.getMetadata(ERRORHANDLER_KEY, ctrlTarget),
            //         paramValues = [];

            //     if (!errorHandler) {
            //         errorHandler = new ControllerErrorHandler();
            //     }

            //     let handleError = (error: any) => {
            //         if (!(error instanceof Error)) {
            //             error = new GenericRouteError(route.propertyKey, error);
            //         }
            //         errorHandler.handleError(instance, request, response, error);
            //     };

            //     try {
            //         paramValues = this.paramHandler.getParamValuesForRequest(params, request, response);
            //         let result = method.apply(instance, paramValues), //effektivi methode.
            //             responseFunction = result => {
            //                 if (NON_JSON_TYPES.indexOf(result.constructor) !== -1) {
            //                     response.send(result);
            //                 } else {
            //                     response.json(result);
            //                 }
            //             };

            //         if (!returnType && hasResponseParam) {
            //             return;
            //         }

            //         if (!returnType && !hasResponseParam) {
            //             return response.status(httpStatus.NO_CONTENT).end();
            //         }

            //         if (!(result instanceof returnType) && !(result.constructor === returnType)) {
            //             handleError(new WrongReturnTypeError(route.propertyKey, returnType, result.constructor));
            //         }

            //         if (route.method === RouteMethod.Head && returnType === Boolean) {
            //             return response.status((result) ? httpStatus.OK : httpStatus.NOT_FOUND).end();
            //         }

            //         if (returnType === Promise) {
            //             (result as Promise<any>).then(responseFunction, handleError);
            //         } else {
            //             responseFunction(result);
            //         }
            //     } catch (e) {
            //         handleError(e);
            //     }
            // };
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
            .forEach(r => r.register(router));

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
