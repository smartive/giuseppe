import 'reflect-metadata';
import { ControllerDefinition } from './controller/ControllerDefinition';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DefinitionNotRegisteredError, DuplicatePluginError } from './errors';
import { ErrorHandlerFunction } from './errors/ControllerErrorHandler';
import { DuplicateRouteError } from './errors/DuplicateRouteError';
import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from './GiuseppePlugin';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { ReturnTypeHandler } from './ReturnTypeHandler';
import { GiuseppeRoute } from './routes/GiuseppeRoute';
import { ReturnType } from './routes/ReturnType';
import { HttpMethod, RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';
import { ControllerMetadata } from './utilities/ControllerMetadata';
import { Request, RequestHandler, Response, Router } from 'express';

interface RouteRegisterInformation {
    route: GiuseppeRoute;
    ctrl: Function;
    segments: number;
    wildcards: number;
}

export class GiuseppeRegistrar {
    public readonly controller: ControllerDefinition[] = [];

    public registerController(controller: ControllerDefinition): void {
        this.controller.push(controller);
    }

    public registerRoute(controller: Object, route: RouteDefinition): void {
        const meta = new ControllerMetadata(controller);
        meta.routes().push(route);
    }

    public registerRouteModificator(controller: Object, routeName: string, modificator: RouteModificator): void {
        const meta = new ControllerMetadata(controller);
        meta.modificators(routeName).push(modificator);
    }

    public registerParameter(controller: Object, routeName: string, parameter: ParameterDefinition): void {
        const meta = new ControllerMetadata(controller);
        meta.parameters(routeName).push(parameter);
    }

    public registerErrorHandler(controller: Object, handler: ErrorHandlerFunction<Error>, errors: Function[]): void {
        const meta = new ControllerMetadata(controller);
        for (const error of errors) {
            meta.errorHandler().addHandler(handler, error);
        }
    }
}

/**
 * Main entry class for giuseppe. Does contain the necessary methods to get the application running.
 * Does export the configuration and plugin system.
 * 
 * @export
 * @class Giuseppe
 */
export class Giuseppe {
    public static readonly registrar: GiuseppeRegistrar = new GiuseppeRegistrar();
    public router: Router = Router();
    private plugins: GiuseppePlugin[] = [];
    private routes: { [id: string]: RouteRegisterInformation } = {};

    private _returnTypes: ReturnType<any>[] | null;
    private get returnTypes(): ReturnType<any>[] {
        if (!this._returnTypes) {
            this._returnTypes = this.plugins
                .filter(p => !!p.returnTypeHandler)
                .reduce((all, cur) => all.concat(cur.returnTypeHandler!), [] as ReturnType<any>[]);
        }
        return this._returnTypes;
    }

    private _pluginController: ControllerDefinitionConstructor[] | null;
    private get pluginController(): ControllerDefinitionConstructor[] {
        if (!this._pluginController) {
            this._pluginController = this.plugins
                .filter(p => !!p.controllerDefinitions)
                .reduce((all, cur) => all.concat(cur.controllerDefinitions!), [] as ControllerDefinitionConstructor[]);
        }
        return this._pluginController;
    }

    private _pluginRoutes: RouteDefinitionConstructor[] | null;
    private get pluginRoutes(): RouteDefinitionConstructor[] {
        if (!this._pluginRoutes) {
            this._pluginRoutes = this.plugins
                .filter(p => !!p.routeDefinitions)
                .reduce((all, cur) => all.concat(cur.routeDefinitions!), [] as RouteDefinitionConstructor[]);
        }
        return this._pluginRoutes;
    }

    private _pluginRouteModificators: RouteModificatorConstructor[] | null;
    private get pluginRouteModificators(): RouteModificatorConstructor[] {
        if (!this._pluginRouteModificators) {
            this._pluginRouteModificators = this.plugins
                .filter(p => !!p.routeModificators)
                .reduce((all, cur) => all.concat(cur.routeModificators!), [] as RouteModificatorConstructor[]);
        }
        return this._pluginRouteModificators;
    }

    private _pluginParameters: ParameterDefinitionConstructor[] | null;
    private get pluginParameters(): ParameterDefinitionConstructor[] {
        if (!this._pluginParameters) {
            this._pluginParameters = this.plugins
                .filter(p => !!p.parameterDefinitions)
                .reduce((all, cur) => all.concat(cur.parameterDefinitions!), [] as ParameterDefinitionConstructor[]);
        }
        return this._pluginParameters;
    }

    constructor() {
        this.registerPlugin(new GiuseppeCorePlugin());
    }

    public registerPlugin(plugin: GiuseppePlugin): void {
        if (this.plugins.find(o => o.name === plugin.name)) {
            throw new DuplicatePluginError(plugin.name);
        }
        this._pluginController = this._pluginParameters = this._pluginRouteModificators = this._pluginRoutes = this._returnTypes = null;
        plugin.initialize(this);
        this.plugins.push(plugin);
    }

    public start(baseUrl: string = ''): Router {
        this.createRoutes(baseUrl);
        this.registerRoutes();
        return this.router;
    }

    // TODO: public async loadFolderAndStart(
    //     loadingOptions: LoadingOptions,
    //     baseUrl: string = '',
    //     router: Router = Router(),
    // ): Promise<Router> {
    //     // tslint:disable-next-line
    //     console.log(loadingOptions, baseUrl);
    //     return router;
    // }

    private createRoutes(baseUrl: string): void {
        const url = baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl;

        for (const ctrl of Giuseppe.registrar.controller) {
            this.checkPluginRegistration(ctrl);

            const meta = new ControllerMetadata(ctrl.ctrlTarget.prototype),
                routes = ctrl.createRoutes(url);

            let ctrlRoutes: GiuseppeRoute[] = [];

            for (const route of routes) {
                const mods = meta.modificators(route.name);
                if (!mods.length) {
                    ctrlRoutes.push(route);
                    continue;
                }

                let modifiedRoutes: GiuseppeRoute[] = [route];
                for (const mod of mods) {
                    modifiedRoutes = mod.modifyRoute(modifiedRoutes);
                }
                ctrlRoutes = ctrlRoutes.concat(modifiedRoutes);
            }

            for (const route of ctrlRoutes) {
                if (this.routes[route.id]) {
                    throw new DuplicateRouteError(route);
                }
                this.routes[route.id] = {
                    route,
                    segments: route.url.split('/').length,
                    wildcards: route.url.split('*').length - 1,
                    ctrl: ctrl.ctrlTarget,
                };
            }
        }
    }

    private registerRoutes(): void {
        Object.keys(this.routes)
            .map(k => this.routes[k])
            .reduce((segmentSorted, route) => {
                (segmentSorted[route.segments] || (segmentSorted[route.segments] = [])).push(route);
                return segmentSorted;
            }, [] as RouteRegisterInformation[][])
            .filter(Boolean)
            .reverse()
            .reduce(
            (routeList, segments) => routeList.concat(segments.sort((r1, r2) => r1.wildcards - r2.wildcards)),
            [] as RouteRegisterInformation[])
            .forEach(r => this.router[HttpMethod[r.route.method]](`/${r.route.url}`, ...r.route.middlewares, this.createRouteWrapper(r)));
    }

    private createRouteWrapper(routeInfo: RouteRegisterInformation): RequestHandler {
        const meta = new ControllerMetadata(routeInfo.ctrl.prototype),
            params = meta.parameters(routeInfo.route.name),
            returnTypeHandler = new ReturnTypeHandler(this.returnTypes),
            ctrlInstance = new (routeInfo as any).ctrl();

        return async (req: Request, res: Response) => {
            const paramValues: any[] = [];

            try {
                for (const param of params) {
                    paramValues[param.index] = param.getValue(req, res);
                }

                let result = routeInfo.route.function.apply(ctrlInstance, paramValues);

                if (params.some(p => p.canHandleResponse)) {
                    return;
                }

                if (result instanceof Promise) {
                    result = await result;
                }

                returnTypeHandler.handleValue(result, res);
            } catch (e) {
                meta.errorHandler().handleError(ctrlInstance, req, res, e);
            }
        };
    }

    private checkPluginRegistration(controller: ControllerDefinition): boolean {
        if (!this.pluginController.some(p => controller instanceof p)) {
            throw new DefinitionNotRegisteredError(controller.constructor.name);
        }

        const meta = new ControllerMetadata(controller.ctrlTarget.prototype);

        for (const route of meta.routes()) {
            if (!this.pluginRoutes.some(p => route instanceof p)) {
                throw new DefinitionNotRegisteredError(route.constructor.name);
            }

            for (const mod of meta.modificators(route.name)) {
                if (!this.pluginRouteModificators.some(p => mod instanceof p)) {
                    throw new DefinitionNotRegisteredError(mod.constructor.name);
                }
            }

            for (const param of meta.parameters(route.name)) {
                if (!this.pluginParameters.some(p => param instanceof p)) {
                    throw new DefinitionNotRegisteredError(param.constructor.name);
                }
            }
        }

        return true;
    }
}
