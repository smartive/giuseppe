import { ControllerDefinition } from './controller/ControllerDefinition';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DefinitionNotRegisteredError, DuplicatePluginError } from './errors';
import { ControllerDefinitionConstructor, GiuseppePlugin } from './GiuseppePlugin';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { HttpMethod, RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';
import { ControllerMetadata } from './utilities/ControllerMetadata';
import { Router } from 'express';

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
        const url = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
        for (const ctrl of Giuseppe.registrar.controller) {
            this.checkPluginRegistration(ctrl);

            const routes = ctrl.createRoutes(url);
            console.log(routes);
        }
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
