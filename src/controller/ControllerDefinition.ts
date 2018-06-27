import { RequestHandler } from 'express';

import { GiuseppeRoute } from '../routes/GiuseppeRoute';

/**
 * Interface for a controller definition. Contains the targeted function (class) and containing middlewares.
 * The definition must be able to create the routes that are registered within the controller.
 *
 * @export
 * @interface ControllerDefinition
 */
export interface ControllerDefinition {
    /**
     * The target class that is decorated with the controller decorator.
     *
     * @type {Function}
     * @memberof ControllerDefinition
     */
    readonly ctrlTarget: Function;

    /**
     * A collection of middlewares that is contained in the given controller.
     * Middleware priority is: Controller -> Route (they are concatenated).
     *
     * @type {RequestHandler[]}
     * @memberof ControllerDefinition
     */
    readonly middlewares: RequestHandler[];

    /**
     * A function that creates the routes for a given controller. Those routes are then modificated and registered.
     *
     * @param {string} baseUrl
     * @returns {GiuseppeRoute[]}
     * @memberof ControllerDefinition
     */
    createRoutes(baseUrl: string): GiuseppeRoute[];
}
