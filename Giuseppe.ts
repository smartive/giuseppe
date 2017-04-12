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
    /**
     * Function that registers all decorated controller with their decorated route functions in an expressJS router.
     * When no router is provided, this function will instantiate and return a router.
     * 
     * @param {string} [baseUrl=''] The base-url for all the routings in the system.
     * @param {Router} [router=Router()]
     * @returns {Router} A configured expressJS router instance.
     * 
     * @memberOf Giuseppe
     */
    public registerControllers(baseUrl: string = '', router: Router = Router()): Router {
        // tslint:disable-next-line
        console.log(baseUrl);
        return router;
    }

    /**
     * Function that loads and registers all controllers from a given directory. All found files are "required" and
     * should not throw any errors, or else the promise is rejected.
     *
     * @param {LoadingOptions} [loadingOptions] The options for loading controllers from a folder.
     * @param {string} [baseUrl=''] The base-url for all the routings in the system.
     * @param {Router} [router=Router()]
     * @returns {Promise<Router>} A promise that resolve to the configured expressJS router instance.
     *
     * @memberOf Giuseppe
     */
    public async registerControllersFromFolder(
        loadingOptions: LoadingOptions,
        baseUrl: string = '',
        router: Router = Router()
    ): Promise<Router> {
        // tslint:disable-next-line
        console.log(loadingOptions, baseUrl);
        return router;
    }
}
