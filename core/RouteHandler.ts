import {Router} from 'express';
import {ControllerRegistration} from '../controllers/ControllerDecorator';
/**
 * TODO
 */
export interface RouteHandler {
    /**
     * TODO
     *
     */
    addRoutes(controllerRegistration: ControllerRegistration, url: string): void;

    /**
     * TODO
     *
     * @param router
     */
    registerRoutes(router: Router): Router;

    /**
     * TODO
     */
    resetRoutes(): void;
}

/**
 *
 * @type {Symbol}
 */
export const ROUTEHANDLER_SYMBOL = Symbol('RouteHandler');
