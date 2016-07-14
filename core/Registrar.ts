import {Router} from 'express';
import {ControllerRegistration} from '../controllers/ControllerDecorator';

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
 * TODO
 */
export interface Registrar {
    registerControllersFromFolder(loaderOptions: ControllerLoaderOptions, baseUrl?: string, router?: Router): Promise<Router>;
    registerControllers(baseUrl?: string, router?: Router): Router;
    registerController(registration: ControllerRegistration): void;
    resetControllerRegistrations(): void;
}

/**
 *
 * @type {Symbol}
 */
export const REGISTRAR_SYMBOL = Symbol('Registrar');
