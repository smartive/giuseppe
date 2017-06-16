import { ControllerErrorHandler } from '../errors/ControllerErrorHandler';
import { ERRORHANDLER_KEY } from '../errors/ErrorHandlerDecorator';
import {
    DuplicateRouteDeclarationError,
    GenericRouteError,
    HeadHasWrongReturnTypeError,
    HttpVerbNotSupportedError,
    WrongReturnTypeError,
} from '../errors/Errors';
import { ControllerRegistration } from '../models/ControllerRegistration';
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
import { createHash } from 'crypto';
import { Request, RequestHandler, Response, Router } from 'express';
import httpStatus = require('http-status');
import { inject, injectable } from 'inversify';

const NON_JSON_TYPES = [String, Number, Boolean],
    defaultVersion = VersionInformation.create('default', { from: 1 });

class RouteVersion {
    constructor(public ctrlInstance: any, public ctrlTarget: any, public routeRegistration: RouteRegistration, public middlewares: RequestHandler[], public version?: VersionInformation) { }
}

class RouteInformation {
    public static headerName: string;
    public readonly wildcardCount: number;
    public readonly segmentCount: number;
    public readonly urlParamCount: number;
    public readonly versions: RouteVersion[] = [];

    public get routeId(): string {
        return `${this.routeUrl}_${RouteMethod[this.method]}`;
    }

    constructor(private paramHandler: ParamHandler, public routeUrl: string, public method: RouteMethod) {
        this.wildcardCount = this.routeUrl.split('*').length - 1;
        this.segmentCount = this.routeUrl.split('/').length;
        this.urlParamCount = this.routeUrl.split('/').filter(s => s.indexOf(':') >= 0).length;
    }

    public register(router: Router): void {
        if (!this.isUnique()) {
            throw new DuplicateRouteDeclarationError(this.routeUrl, this.method);
        }

        if (this.versions.length === 1 && !this.versions[0].version) {
            let version = this.versions[0];
            this.registerMethod(router, this.method, this.routeUrl, version.middlewares, this.buildRouteMethod(version));
            return;
        }

        let routeVersions = this.versions
            .map(version => {
                return {
                    url: `/${this.getVersionHash(version)}`,
                    version
                };
            }),
            blackMagicRouter = Router({ mergeParams: true });

        blackMagicRouter.use((req: Request, res: Response, next) => {
            let requestedVersion: number;
            try {
                requestedVersion = parseInt(req.get(RouteInformation.headerName), 10) || 1;
            } catch (e) {
                requestedVersion = 1;
            }

            let requestedRoute = routeVersions.find(o => o.version.version.isInVersionBounds(requestedVersion));

            if (!requestedRoute || routeVersions.some(o => req.url.indexOf(o.url) >= 0)) {
                return res.status(404).end();
            }

            req.url = requestedRoute.url;
            next();
        });

        for (let version of routeVersions) {
            this.registerMethod(blackMagicRouter, this.method, version.url, version.version.middlewares, this.buildRouteMethod(version.version));
        }

        router.use(this.routeUrl, blackMagicRouter);
    }

    private buildRouteMethod(version: RouteVersion): RequestHandler {
        let params = this.paramHandler.getParamsForRoute(version.ctrlTarget.prototype, version.routeRegistration.propertyKey),
            hasResponseParam = params.some(p => p.paramType === ParamType.Response),
            returnType = Reflect.getMetadata('design:returntype', version.ctrlTarget.prototype, version.routeRegistration.propertyKey),
            ctrlMethod = version.routeRegistration.descriptor.value;

        return (request: Request, response: Response, next) => {
            let errorHandler: ControllerErrorHandler = Reflect.getMetadata(ERRORHANDLER_KEY, version.ctrlTarget) || new ControllerErrorHandler(),
                paramValues = [];

            let handleError = (error: any) => {
                if (!(error instanceof Error)) {
                    error = new GenericRouteError(this.routeId, error);
                }
                errorHandler.handleError(version.ctrlInstance, request, response, error);
            };

            try {
                paramValues = this.paramHandler.getParamValuesForRequest(params, request, response);
                let result = ctrlMethod.apply(version.ctrlInstance, paramValues),
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
                    handleError(new WrongReturnTypeError(version.routeRegistration.propertyKey, returnType, result.constructor));
                }

                if (version.routeRegistration.method === RouteMethod.Head && returnType === Boolean) {
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
    }

    private registerMethod(router: Router, httpMethod: RouteMethod, url: string, middlewares: RequestHandler[], route: RequestHandler): void {
        switch (httpMethod) {
            case RouteMethod.Get:
                router.get(url, ...middlewares, route);
                break;
            case RouteMethod.Put:
                router.put(url, ...middlewares, route);
                break;
            case RouteMethod.Post:
                router.post(url, ...middlewares, route);
                break;
            case RouteMethod.Delete:
                router.delete(url, ...middlewares, route);
                break;
            case RouteMethod.Head:
                router.head(url, ...middlewares, route);
                break;
            default:
                throw new HttpVerbNotSupportedError(httpMethod);
        }
    }

    private isUnique(): boolean {
        if (this.versions.length <= 1) {
            return true;
        }

        for (let version of this.versions) {
            if (this.versions.some(o => o !== version && doRouteVersionsOverlap(version.version || defaultVersion, o.version || defaultVersion))) {
                return false;
            }
        }

        return true;
    }

    private getVersionHash(version: RouteVersion): string {
        return createHash('sha256').update(`${this.routeId}_${version.version.toString()}`).digest('hex');
    }
}

@injectable()
export class DefaultRouteHandler implements RouteHandler {
    private routes: { [id: string]: RouteInformation } = {};

    constructor(
        @inject(IoCSymbols.paramHandler) private paramHandler: ParamHandler,
        @inject(IoCSymbols.configuration) private config: Configuration
    ) {
        RouteInformation.headerName = this.config.versionHeaderName;
    }

    public addRoutes(controllerRegistration: ControllerRegistration, url: string): void {
        let routes: RouteRegistration[] = Reflect.getOwnMetadata(ROUTES_KEY, controllerRegistration.controller) || [],
            instance = new controllerRegistration.controller(),
            ctrlVersionInfo = Reflect.getMetadata(VERSION_KEY, controllerRegistration.controller);

        for (let route of routes) {
            let routeUrl = url + [controllerRegistration.prefix, route.path].filter(Boolean).join('/'),
                versionInfo: VersionInformation = Reflect.getMetadata(VERSION_KEY, controllerRegistration.controller, route.propertyKey) || ctrlVersionInfo;

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

            let routeInfo = new RouteInformation(this.paramHandler, routeUrl, route.method);
            routeInfo = this.routes[routeInfo.routeId] || routeInfo;

            routeInfo.versions.push(new RouteVersion(
                instance,
                controllerRegistration.controller,
                route,
                [...controllerRegistration.middlewares, ...route.middlewares],
                versionInfo
            ));

            this.routes[routeInfo.routeId] = routeInfo;
        }
    }

    public registerRoutes(router: Router): Router {
        const score = (route: RouteInformation) => route.segmentCount * 1000 - route.urlParamCount * 0.001 - route.wildcardCount;

        Object.keys(this.routes)
            .map(k => this.routes[k])
            .sort((a, b) => score(b) - score(a))
            .forEach(r => r.register(router));

        return router;
    }

    public resetRoutes(): void {
        this.routes = {};
    }
}
