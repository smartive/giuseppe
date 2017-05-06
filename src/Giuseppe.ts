import { ReturnTypeHandler } from './ReturnTypeHandler';
import { ReturnType } from './routes/ReturnType';
import { DuplicateRouteError } from './errors/DuplicateRouteError';
import { ControllerDefinition } from './controller/ControllerDefinition';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DefinitionNotRegisteredError, DuplicatePluginError } from './errors';
import { ControllerDefinitionConstructor, GiuseppePlugin } from './GiuseppePlugin';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { GiuseppeRoute } from './routes/GiuseppeRoute';
import { HttpMethod, RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';
import { ControllerMetadata } from './utilities/ControllerMetadata';
import { Request, Response, Router, RequestHandler } from 'express';

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

    constructor() {
        this.registerPlugin(new GiuseppeCorePlugin());
    }

    public registerPlugin(plugin: GiuseppePlugin): void {
        if (this.plugins.find(o => o.name === plugin.name)) {
            throw new DuplicatePluginError(plugin.name);
        }
        this._pluginController = null;
        plugin.initialize(this);
        this.plugins.push(plugin);
    }

    public start(baseUrl: string = '/'): Router {
        this.createRoutes(baseUrl);
        this.registerRoutes();
        return this.router;
    }

    // public async loadFolderAndStart(
    //     loadingOptions: LoadingOptions,
    //     baseUrl: string = '',
    //     router: Router = Router(),
    // ): Promise<Router> {
    //     // tslint:disable-next-line
    //     console.log(loadingOptions, baseUrl);
    //     return router;
    // }

    private createRoutes(baseUrl: string): void {
        const url = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;

        for (const ctrl of Giuseppe.registrar.controller) {
            this.checkPluginRegistration(ctrl);

            // create all routes, then modify all routes, then register methods (wrapper method will get parameters)
            const meta = new ControllerMetadata(ctrl.ctrlTarget.prototype),
                routes = ctrl.createRoutes(url);

            let ctrlRoutes: GiuseppeRoute[] = [];

            for (const route of routes) {
                // get modifiers and modify the routes (can be another array)
                const mods = meta.modificators(route.name);
                if (!mods.length) {
                    ctrlRoutes.push(route);
                    continue;
                }

                let modifiedRoutes: GiuseppeRoute[] = [route];
                for (const mod of mods) {
                    modifiedRoutes = modifiedRoutes.reduce((all, cur) => all.concat(mod.modifyRoute(cur)), [] as GiuseppeRoute[]);
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
            .forEach(r => this.router[HttpMethod[r.route.method]](r.route.url, ...r.route.middlewares, this.createRouteWrapper(r)));
    }

    private createRouteWrapper(routeInfo: RouteRegisterInformation): RequestHandler {
        // take return val -> run through return val handler (if there is no response handler param)
        const meta = new ControllerMetadata(routeInfo.ctrl.prototype),
            params = meta.parameters(routeInfo.route.name),
            returnTypeHandler = new ReturnTypeHandler(this.returnTypes);

        return async (req: Request, res: Response) => {
            const paramValues: any[] = [];
            for (const param of params) {
                paramValues[param.index] = param.getValue(req);
            }

            try {
                let result = routeInfo.route.function.apply(routeInfo.ctrl, paramValues);

                if (params.some(p => p.canHandleResponse)) {
                    return;
                }

                if (result instanceof Promise) {
                    result = await result;
                }

                returnTypeHandler.handleValue(result, res);
            } catch (e) {
                // handle error
            }
        };
    }

    private checkPluginRegistration(controller: ControllerDefinition): boolean {
        if (!this.pluginController.some(p => controller instanceof p)) {
            throw new DefinitionNotRegisteredError(controller.constructor.name);
        }

        // check all routes, modificators, parameters if they are registered. otherwise throw ex

        return true;
    }
}
