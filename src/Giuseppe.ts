import { ControllerDefinition } from './controller/ControllerDefinition';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DefinitionNotRegisteredError, DuplicatePluginError } from './errors';
import { ControllerDefinitionConstructor, GiuseppePlugin } from './GiuseppePlugin';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { GiuseppeRoute } from './routes/GiuseppeRoute';
import { HttpMethod, RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';
import { ControllerMetadata } from './utilities/ControllerMetadata';
import { Router } from 'express';

type RouteRegisterInformation = { route: GiuseppeRoute, ctrl: Object, segments: number, wildcards: number };

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
        const url = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`,
            giuseppeRoutes: { [id: string]: RouteRegisterInformation } = {};

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
                if (giuseppeRoutes[route.id]) {
                    throw new Error('DUPLICATE!!11elf');
                }
                giuseppeRoutes[route.id] = {
                    route,
                    segments: route.url.split('/').length,
                    wildcards: route.url.split('*').length - 1,
                    ctrl: ctrl.ctrlTarget,
                };
            }
        }

        // register routes

        Object.keys(giuseppeRoutes)
            .map(k => giuseppeRoutes[k])
            .reduce((segmentSorted, route) => {
                (segmentSorted[route.segments] || (segmentSorted[route.segments] = [])).push(route);
                return segmentSorted;
            }, [] as RouteRegisterInformation[][])
            .filter(Boolean)
            .reverse()
            .reduce(
            (routeList, segments) => routeList.concat(segments.sort((r1, r2) => r1.wildcards - r2.wildcards)),
            [] as RouteRegisterInformation[])
            .forEach(r => {
                this.router[HttpMethod[r.route.method]](r.route.url, ...r.route.middlewares, () => {
                    // get all params and their values
                    r.route.function.apply(r.ctrl);
                    // get the return value and do the giusi magic.
                });
            });

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

    private checkPluginRegistration(controller: ControllerDefinition): boolean {
        if (!this.pluginController.some(p => controller instanceof p)) {
            throw new DefinitionNotRegisteredError(controller.constructor.name);
        }

        // check all routes, modificators, parameters if they are registered. otherwise throw ex

        return true;
    }
}
