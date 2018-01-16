import { RequestHandler } from 'express';

import { HttpMethod } from './RouteDefinition';

/**
 * Interface for a route definition. Contains all relevant data about a route.
 *
 * @export
 * @interface GiuseppeRoute
 */
export interface GiuseppeRoute {
    /**
     * ID of the route. Should be unique. When a duplicate is found during the initialization of giuseppe,
     * an error is thrown.
     *
     * @type {string}
     * @memberof GiuseppeRoute
     */
    id: string;

    /**
     * Url of the route.
     *
     * @type {string}
     * @memberof GiuseppeRoute
     */
    url: string;

    /**
     * Name of the route. This should represent the name of the function inside the controller.
     *
     * @type {string}
     * @memberof GiuseppeRoute
     */
    name: string;

    /**
     * The used http method. Can be one of the supported express js methods
     * (see the full list here: {@link https://expressjs.com/en/api.html#routing-methods|routing-methods})
     *
     * @type {HttpMethod}
     * @memberof GiuseppeRoute
     */
    method: HttpMethod;

    /**
     * The function that is called for the route. This function is most likely a reference to a class method.
     *
     * @type {Function}
     * @memberof GiuseppeRoute
     */
    function: Function;

    /**
     * A list of middlewares. All middlewares are concatenated with the ones of the controller and preceed the route
     * function. A typical error can be to forget to call "next();" inside the middleware function.
     *
     * @type {RequestHandler[]}
     * @memberof GiuseppeRoute
     */
    middlewares: RequestHandler[];
}
