import {ControllerRegistration} from '../models/ControllerRegistration';
import {Router} from 'express';

/**
 * The routehandler does handle the registering process for the routes.
 *
 * @interface
 */
export interface RouteHandler {
    /**
     * Adds the routes of a controller to the internal route list.
     *
     * @param {ControllerRegistration} controllerRegistration - The controller to take the routes from.
     * @param {string} url - The base url to register the routes on. 
     */
    addRoutes(controllerRegistration: ControllerRegistration, url: string): void;

    /**
     * Registers the routes to the expressJS system.
     *
     * @param {Router} router - An expressJS router instance.
     * @returns {Router} - The configured expressJS router instance.
     */
    registerRoutes(router: Router): Router;

    /**
     * Resets all internally registered routes.
     */
    resetRoutes(): void;
}

/**
 * IoC symbol for the routehandler interface.
 *
 * @type {Symbol}
 */
export const ROUTEHANDLER_SYMBOL = Symbol('RouteHandler');
