import { ROUTE_MODIFICATOR_KEY, RouteModificator } from './routes/RouteModificator';
import { PARAMETER_DEFINITION_KEY, ParameterDefinition } from './parameter/ParameterDefinition';
import { ROUTE_DEFINITION_KEY, RouteDefinition } from './routes/RouteDefinition';
import { ControllerDefinition } from './controller/ControllerDefinition';
import { LoadingOptions } from './controller/LoadingOptions';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DuplicatePluginError } from './errors';
import { GiuseppePlugin } from './GiuseppePlugin';
import { Router } from 'express';

export class GiuseppeRegistrar {
    private controller: ControllerDefinition[] = [];

    public registerController(controller: ControllerDefinition): void {
        this.controller.push(controller);
    }

    public registerRoute(controller: Object, route: RouteDefinition): void {
        const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_DEFINITION_KEY, controller) || [];
        routes.push(route);
        Reflect.defineMetadata(ROUTE_DEFINITION_KEY, routes, controller);
    }

    public registerRouteModificator(controller: Object, routeName: string, modificator: RouteModificator): void {
        const mods: RouteModificator[] = Reflect.getOwnMetadata(ROUTE_MODIFICATOR_KEY, controller, routeName) || [];
        mods.push(modificator);
        Reflect.defineMetadata(ROUTE_MODIFICATOR_KEY, mods, controller, routeName);
    }

    public getParameterType(controller: Object, routeName: string, index: number): Function {
        const paramTypes = Reflect.getMetadata('design:paramtypes', controller, routeName) || [];
        return paramTypes[index];
    }
    
    public registerParameter(controller: Object, routeName: string, parameter: ParameterDefinition): void {
        const params: ParameterDefinition[] = Reflect.getOwnMetadata(PARAMETER_DEFINITION_KEY, controller, routeName) || [];
        params.push(parameter);
        Reflect.defineMetadata(PARAMETER_DEFINITION_KEY, params, controller, routeName);
    }

    public reset(): void {
        this.controller = [];
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
    private plugins: GiuseppePlugin[] = [];

    constructor() {
        // Giuseppe.register.initialize(this);
        // add core plugin with common stuff (actual feature set.)
        this.registerPlugin(new GiuseppeCorePlugin());
    }

    /**
     * Method to register a plugin with giuseppe. Giuseppe itself provides certain core features (a core plugin). If a duplicate
     * plugin name is recognized, an exception is thrown. You can unregister plugins.
     * 
     * @param {GiuseppePlugin} plugin 
     * 
     * @memberOf Giuseppe
     */
    public registerPlugin(plugin: GiuseppePlugin): void {
        if (this.plugins.find(o => o.name === plugin.name)) {
            throw new DuplicatePluginError(plugin.name);
        }
        plugin.initialize(this);
        this.plugins.push(plugin);
    }

    /**
     * Function that registers all decorated controllers with their decorated route functions in an expressJS router.
     * Be sure to load the code files for the controller before calling this method, and register all plugins before loading any
     * controllers.
     *
     * When no router is provided, this function will instantiate and return a router.
     * 
     * @param {string} [baseUrl=''] The base-url for all the routings in the system.
     * @param {Router} [router=Router()]
     * @returns {Router} A configured expressJS router instance.
     * 
     * @memberOf Giuseppe
     */
    public start(baseUrl: string = '', router: Router = Router()): Router {
        // tslint:disable-next-line
        console.log(baseUrl);
        return router;
    }

    /**
     * Function that loads and registers all controllers from a given directory. All found files are "required" and
     * should not throw any errors, or else the promise is rejected. Be sure to register all plugins before calling this method.
     *
     * @param {LoadingOptions} [loadingOptions] The options for loading controllers from a folder.
     * @param {string} [baseUrl=''] The base-url for all the routings in the system.
     * @param {Router} [router=Router()]
     * @returns {Promise<Router>} A promise that resolve to the configured expressJS router instance.
     *
     * @memberOf Giuseppe
     */
    public async loadFolderAndStart(
        loadingOptions: LoadingOptions,
        baseUrl: string = '',
        router: Router = Router(),
    ): Promise<Router> {
        // tslint:disable-next-line
        console.log(loadingOptions, baseUrl);
        return router;
    }
}
