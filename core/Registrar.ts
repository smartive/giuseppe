import {ControllerRegistration} from '../models/ControllerRegistration';
import {Router} from 'express';

/**
 * Options for the registerControllersFromFolder function. It is an object with configuration parameters.
 *
 * @param {string} folderPath - The root path to start the search for *.js files.
 * @param {root} [root] - The project root folder (could be different if you start your app with node .)
 * @param {boolean} [recursive] - Should the function search for *.js in a recursive mode.
 * @param {RegExp} [matchRegExp] - An optional regular expression for the found files.
 */
export type ControllerLoaderOptions = { folderPath: string, root?: string, recursive?: boolean, matchRegExp?: RegExp };

/**
 * Interface for a registrar. The registrar is responsible for registering controllers into the giuseppe core.
 *
 * @interface
 */
export interface Registrar {
    /**
     * Function that loads and registers all controllers from a given directory. All found files are "required" and
     * should not throw any errors, or else the promise is rejected.
     *
     * @param {ControllerLoaderOptions} [loaderOptions] - The options for loading controllers from a folder.
     * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
     * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
     * @returns {Promise<Router>} - A promise that resolves with the configured router instance. Or rejects when an error happens.
     */
    registerControllersFromFolder(loaderOptions: ControllerLoaderOptions, baseUrl?: string, router?: Router): Promise<Router>;

    /**
     * Function that registers all decorated controller with their decorated route functions in an expressJS router.
     * When no router is provided, this function will instantiate and return a router.
     *
     * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
     * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
     * @returns {Router} - The configured router.
     */
    registerControllers(baseUrl?: string, router?: Router): Router;

    /**
     * Adds a controller to the list of controllers.
     *
     * @param {ControllerDecorator} controller - The controller to register.
     */
    addController(controller: ControllerRegistration): void;

    /**
     * Resets the registered controllers and the defined routes array (only used for testing).
     */
    resetControllerRegistrations(): void;
}

/**
 * IoC symbol for the registrar interface.
 *
 * @type {Symbol}
 */
export const REGISTRAR_SYMBOL = Symbol('Registrar');
