import { RequestHandler } from 'express';

import { ControllerMetadata } from '../utilities/ControllerMetadata';
import { GiuseppeRoute } from './GiuseppeRoute';

/**
 * Reflect metadata key for route definitions.
 *
 * @type {string}
 */
export const ROUTE_DEFINITION_KEY = 'giuseppe:RouteDefintion';

/**
 * Enum with all supported http methods from express. Full list is available here:
 * {@link https://expressjs.com/en/api.html#routing-methods|routing-methods}
 * 
 * @export
 * @enum {number}
 */
export enum HttpMethod {
    // Normal http methods
    get,
    put,
    post,
    delete,
    head,

    // Pathological
    connect,
    options,
    trace,

    // Webdav
    copy,
    lock,
    mkcol,
    move,
    propfind,
    proppatch,
    search,
    unlock,

    // Subversion
    report,
    mkactivity,
    checkout,
    merge,

    // UPnP
    msearch,
    notify,
    subscribe,
    unsubscribe,

    // RFC-5789
    patch,
    purge,
}

/**
 * A route definition contains all relevant information for a route in a controller. This definition must be registered
 * in a giuseppe plugin. Those routes should be called by the controller and create a route (or a set of routes) that
 * are later registered within express.
 * 
 * @export
 * @interface RouteDefinition
 */
export interface RouteDefinition {
    /**
     * Route url. Is sanitized, concatenated with controller and base prefixes and later registered in express.
     * 
     * @type {string}
     * @memberof RouteDefinition
     */
    readonly route: string;

    /**
     * Used {@link HttpMethod} for this route.
     * 
     * @type {HttpMethod}
     * @memberof RouteDefinition
     */
    readonly httpMethod: HttpMethod;

    /**
     * Function that is associated with this route.
     * 
     * @type {Function}
     * @memberof RouteDefinition
     */
    readonly routeFunction: Function;

    /**
     * Name for the route.
     * 
     * @type {string}
     * @memberof RouteDefinition
     */
    readonly name: string;

    /**
     * A list of middlewares that preceed this route. Those middlewares are concatenated with the ones of
     * the containing controller.
     * 
     * @type {RequestHandler[]}
     * @memberof RouteDefinition
     */
    readonly middlewares: RequestHandler[];

    /**
     * Create a list of routes out of this definition. A route can create multiple giuseppe routes. The same rules
     * apply to all created routes: no duplicate IDs.
     * 
     * @param {ControllerMetadata} meta 
     * @param {string} baseUrl 
     * @param {RequestHandler[]} middlewares 
     * @returns {GiuseppeRoute[]} 
     * @memberof RouteDefinition
     */
    createRoutes(meta: ControllerMetadata, baseUrl: string, middlewares: RequestHandler[]): GiuseppeRoute[];
}
