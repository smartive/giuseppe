import { GiuseppeRoute } from './GiuseppeRoute';

/**
 * Reflect metadata key for route definitions.
 *
 * @type {string}
 */
export const ROUTE_MODIFICATOR_KEY = 'giuseppe:RouteModificator';

/**
 * Interface for a route modificator. This modificator must be registered into a giuseppe plugin.
 * A modificator receives a list of routes (per created route) and can add, remove or modify the given routes.
 * 
 * @export
 * @interface RouteModificator
 */
export interface RouteModificator {
    /**
     * Modify the given routes. This function can add, remove or update given routes.
     * 
     * @param {GiuseppeRoute[]} route 
     * @returns {GiuseppeRoute[]} 
     * @memberof RouteModificator
     */
    modifyRoute(route: GiuseppeRoute[]): GiuseppeRoute[];
}
