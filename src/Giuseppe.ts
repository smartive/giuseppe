import 'reflect-metadata';

import * as express from 'express';
import glob = require('glob');
import { Server } from 'http';
import { join } from 'path';

import { ControllerDefinition } from './controller/ControllerDefinition';
import { GiuseppeCorePlugin } from './core/GiuseppeCorePlugin';
import { DefinitionNotRegisteredError, DuplicatePluginError } from './errors';
import { DuplicateRouteError } from './errors/DuplicateRouteError';
import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from './GiuseppePlugin';
import { GiuseppeRegistrar } from './GiuseppeRegistrar';
import { ReturnTypeHandler } from './ReturnTypeHandler';
import { GiuseppeRoute } from './routes/GiuseppeRoute';
import { ReturnType } from './routes/ReturnType';
import { HttpMethod } from './routes/RouteDefinition';
import { ControllerMetadata } from './utilities/ControllerMetadata';

/**
 * Score sort function for route register information. Calculates the sorting score based on segments, url params
 * and wildcards.
 * 
 * @param {RouteRegisterInformation} route 
 */
const routeScore = (route: RouteRegisterInformation) =>
    route.segments * 1000 - route.urlParams * 0.001 - route.wildcards;

/**
 * Internal interface for route registering. Convenience objects.
 *
 * @export
 * @interface RouteRegisterInformation
 */
export interface RouteRegisterInformation {
    route: GiuseppeRoute;
    ctrl: Function;
    segments: number;
    wildcards: number;
    urlParams: number;
}

/**
 * Main entry class for giuseppe. Does contain the necessary methods to get the application running.
 * Does export the configuration and plugin system.
 * 
 * @export
 * @class Giuseppe
 */
export class Giuseppe {
    /**
     * Giuseppes item registrar. Is used to register controllers, routes, parameters and all other things that
     * giuseppe contains. Can be used even when giuseppe is not instantiated yet.
     * 
     * @static
     * @type {GiuseppeRegistrar}
     * @memberof Giuseppe
     */
    public static readonly registrar: GiuseppeRegistrar = new GiuseppeRegistrar();

    /**
     * The actual server instance of express once the application has started.
     * 
     * @readonly
     * @type {(Server | undefined)}
     * @memberof Giuseppe
     */
    public get server(): Server | undefined {
        return this._server;
    }

    /**
     * The express application behind this instance of giuseppe. Someone might want to change the used express instance
     * before calling [start()]{@link Giuseppe#start()}. Also, on this propert you can add other things like
     * compression or body-parser.
     * 
     * @type {express.Express}
     * @memberof Giuseppe
     */
    public expressApp: express.Express = express();

    /**
     * The router instance that is used for this instance of giuseppe. Access it to add additional routes or even
     * switch the whole router.
     * 
     * @type {express.Router}
     * @memberof Giuseppe
     */
    public router: express.Router = express.Router();

    protected plugins: GiuseppePlugin[] = [];
    protected routes: { [id: string]: RouteRegisterInformation } = {};
    protected _server: Server | undefined;

    protected _returnTypes: ReturnType<any>[] | null;
    protected _pluginController: ControllerDefinitionConstructor[] | null;
    protected _pluginRoutes: RouteDefinitionConstructor[] | null;
    protected _pluginRouteModificators: RouteModificatorConstructor[] | null;
    protected _pluginParameters: ParameterDefinitionConstructor[] | null;

    /**
     * List of registered {@link ReturnType}.
     * 
     * @readonly
     * @protected
     * @type {ReturnType<any>[]}
     * @memberof Giuseppe
     */
    protected get returnTypes(): ReturnType<any>[] {
        if (!this._returnTypes) {
            this._returnTypes = this.plugins
                .filter(p => !!p.returnTypeHandler)
                .reduce((all, cur) => all.concat(cur.returnTypeHandler!), [] as ReturnType<any>[]);
        }
        return this._returnTypes;
    }

    /**
     * List of registered {@link ControllerDefinitionConstructor}.
     * 
     * @readonly
     * @protected
     * @type {ControllerDefinitionConstructor[]}
     * @memberof Giuseppe
     */
    protected get pluginController(): ControllerDefinitionConstructor[] {
        if (!this._pluginController) {
            this._pluginController = this.plugins
                .filter(p => !!p.controllerDefinitions)
                .reduce((all, cur) => all.concat(cur.controllerDefinitions!), [] as ControllerDefinitionConstructor[]);
        }
        return this._pluginController;
    }

    /**
     * List of registered {@link RouteDefinitionConstructor}.
     * 
     * @readonly
     * @protected
     * @type {RouteDefinitionConstructor[]}
     * @memberof Giuseppe
     */
    protected get pluginRoutes(): RouteDefinitionConstructor[] {
        if (!this._pluginRoutes) {
            this._pluginRoutes = this.plugins
                .filter(p => !!p.routeDefinitions)
                .reduce((all, cur) => all.concat(cur.routeDefinitions!), [] as RouteDefinitionConstructor[]);
        }
        return this._pluginRoutes;
    }

    /**
     * List of registered {@link RouteModificatorConstructor}.
     * 
     * @readonly
     * @protected
     * @type {RouteModificatorConstructor[]}
     * @memberof Giuseppe
     */
    protected get pluginRouteModificators(): RouteModificatorConstructor[] {
        if (!this._pluginRouteModificators) {
            this._pluginRouteModificators = this.plugins
                .filter(p => !!p.routeModificators)
                .reduce((all, cur) => all.concat(cur.routeModificators!), [] as RouteModificatorConstructor[]);
        }
        return this._pluginRouteModificators;
    }

    /**
     * List of registered {@link ParameterDefinitionConstructor}.
     * 
     * @readonly
     * @protected
     * @type {ParameterDefinitionConstructor[]}
     * @memberof Giuseppe
     */
    protected get pluginParameters(): ParameterDefinitionConstructor[] {
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

    /**
     * Registers a given plugin into this giuseppe instance. Clears the internal caches when it does so.
     * Calls the initialize method on a plugin.
     * 
     * @param {GiuseppePlugin} plugin 
     * @returns {this} 
     * @memberof Giuseppe
     */
    public registerPlugin(plugin: GiuseppePlugin): this {
        if (this.plugins.find(o => o.name === plugin.name)) {
            throw new DuplicatePluginError(plugin.name);
        }

        this._pluginController = null;
        this._pluginParameters = null;
        this._pluginRouteModificators = null;
        this._pluginRoutes = null;
        this._returnTypes = null;

        plugin.initialize(this);
        this.plugins.push(plugin);
        return this;
    }

    /**
     * Fires up the express application within giuseppe. Gathers all registered controllers and routes and registers
     * them on the given [router]{@link Giuseppe#router}. After the router is configured, fires up the express
     * application with the given parameter.
     * 
     * @param {number} [port=8080] The port of the web application (express.listen argument).
     * @param {string} [baseUrl=''] Base url that is preceeding all urls in the system.
     * @param {string} [hostname] Hostname that is passed to express.
     * @param {Function} [callback] Callback that is used in express when the system is listening and ready.
     * @memberof Giuseppe
     */
    public start(port: number = 8080, baseUrl: string = '', hostname?: string, callback?: Function): void {
        const router = this.configureRouter(baseUrl);
        this.expressApp.use(router);
        this._server = this.expressApp.listen.apply(this.expressApp, [port, hostname, callback].filter(Boolean));
    }

    /**
     * Closes the server of the application.
     * 
     * @param {Function} [callback] Callback that is passed to the server.
     * @memberof Giuseppe
     */
    public stop(callback?: Function): void {
        if (this._server) {
            this._server.close(callback);
            delete this._server;
        }
    }

    /**
     * Loads controllers from the actual process directory with a given globbing pattern. The start directory is always
     * process.cwd(). With globbing, you can exclude, match, find files that should be loaded.
     * More information here: [glob]{@link https://www.npmjs.com/package/glob#glob-primer}.
     *
     * Can be used when you don't want to load all controllers by hand.
     * 
     * @param {string} globPattern 
     * @returns {Promise<void>} 
     * @memberof Giuseppe
     *
     * @example
     * // load all files in build directory
     *
     * const giuseppe = new Giuseppe();
     * giuseppe.loadControllers('\* \* /build/ \* \* /*.js'); // <-- without the spaces of course.
     */
    public async loadControllers(globPattern: string): Promise<void> {
        try {
            console.info(`Loading controller for the glob pattern "${globPattern}".`);
            const files = await new Promise<string[]>((resolve, reject) => {
                glob(globPattern, (err, matches) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(matches);
                });
            });
            for (const file of files) {
                console.info(`Loading file '${file}'.`);
                require(join(process.cwd(), file));
            }
        } catch (e) {
            console.error(`An error happend during loading of controllers`, {
                globPattern,
                err: e,
            });
        }

    }

    /**
     * Configures the actual instance of the express router. Creates the registered routes for the controllers in giuseppe
     * as the first step. After that, registers each route to the router and returns the router.
     * 
     * @param {string} [baseUrl=''] Base url, that is preceeding all routes.
     * @returns {express.Router} The configured router.
     * @memberof Giuseppe
     */
    public configureRouter(baseUrl: string = ''): express.Router {
        this.createRoutes(baseUrl);
        this.registerRoutes();
        return this.router;
    }

    /**
     * Ultimatively creates the routes that are registered in the registrar of giuseppe. For each controller there
     * is the following procedure:
     *  1. Check if the controller definition is registered as a plugin
     *  2. Create all routes of the controller (call .createRoutes(baseUrl))
     *  3. For each create route:
     *     - Load the routes modificators
     *     - If there are none, add routes to the list and continue
     *     - If there are any, throw the routes at the modificators (can be multiple)
     *     - Add routes to the list
     *  4. Create {@link RouteRegisterInformation} for each route
     * 
     * @protected
     * @param {string} baseUrl 
     * @memberof Giuseppe
     */
    protected createRoutes(baseUrl: string): void {
        const url = baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl;

        for (const ctrl of Giuseppe.registrar.controller) {
            this.checkPluginRegistration(ctrl);

            const meta = new ControllerMetadata(ctrl.ctrlTarget.prototype);
            const routes = ctrl.createRoutes(url);

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
                    urlParams: route.url.split('/').filter(s => s.indexOf(':') >= 0).length,
                    ctrl: ctrl.ctrlTarget,
                };
            }
        }
    }

    protected registerRoutes(): void {
        Object.keys(this.routes)
            .map(k => this.routes[k])
            .sort((a, b) => routeScore(b) - routeScore(a))
            .forEach(r => this.router[HttpMethod[r.route.method]](
                `/${r.route.url}`,
                ...r.route.middlewares,
                this.createRouteWrapper(r),
            ));
    }

    /**
     * Helper function that creates the wrapping function around a route for express. This wrapping function
     * ensures the right `this` context, does parse the actual param values and handles errors.
     *
     * The resulting function is then passed to the express router.
     * 
     * @protected
     * @param {RouteRegisterInformation} routeInfo 
     * @returns {express.RequestHandler} 
     * @memberof Giuseppe
     */
    protected createRouteWrapper(routeInfo: RouteRegisterInformation): express.RequestHandler {
        const meta = new ControllerMetadata(routeInfo.ctrl.prototype);
        const params = meta.parameters(routeInfo.route.name);
        const returnTypeHandler = new ReturnTypeHandler(this.returnTypes);
        const ctrlInstance = new (routeInfo as any).ctrl();

        return async (req: express.Request, res: express.Response) => {
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

    /**
     * Check if a given controller, the routes of the controller, the modificators and parameters of the route are
     * registered within a plugin in giuseppe. If not, throw an exception.
     * 
     * @protected
     * @throws {DefinitionNotRegisteredError} 
     * @param {ControllerDefinition} controller 
     * @returns {boolean} 
     * @memberof Giuseppe
     */
    protected checkPluginRegistration(controller: ControllerDefinition): boolean {
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
