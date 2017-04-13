import { GiuseppePlugin } from './GiuseppePlugin';
import { LoadingOptions } from './controller/LoadingOptions';
import { Router } from 'express';

/**
 * Main entry class for giuseppe. Does contain the necessary methods to get the application running.
 * Does export the configuration and plugin system.
 * 
 * @export
 * @class Giuseppe
 */
export class Giuseppe {

    constructor() {
        // add core plugin with common stuff (actual feature set.)
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
        // register internal plugin and call initialize.
        plugin.initialize(this);
        // tslint:disable-next-line
        console.log(plugin);
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
        router: Router = Router()
    ): Promise<Router> {
        // tslint:disable-next-line
        console.log(loadingOptions, baseUrl);
        return router;
    }
}
