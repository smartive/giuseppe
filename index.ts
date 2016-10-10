import { Configuration } from './core/Configuration';
import {Registrar} from './core/Registrar';
import {IocContainer} from './core/IoC';
import {Router} from 'express';
import {IoCSymbols} from './core/IoCSymbols';

export * from './controllers/ControllerDecorator';
export * from './errors/ErrorHandlerDecorator';
export * from './errors/ControllerErrorHandler';
export * from './errors/Errors';
export * from './params/ParamDecorators';
export * from './routes/RouteDecorators';
export * from './validators/Validators';
export * from './versioning/VersionDecorator';

let registrar = IocContainer.get<Registrar>(IoCSymbols.registrar);

/**
 * Function that loads and registers all controllers from a given directory. All found files are "required" and
 * should not throw any errors, or else the promise is rejected.
 *
 * @param {string} folderPath - The root path to start the search for the controllers.
 * @param {string} [root=process.cwd()] - The root of the project. Can be different if you start your app through a script.
 * @param {boolean} [recursive=false] - Defines if the function searches recursively for controllers.
 * @param {RegExp} [matchRegExp=/(.*)[.]js$/] - The regular expression that must be mached before a file is required.
 * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
 * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
 * @returns {Promise<Router>} - A promise that resolves with the configured router instance. Or rejects when an error happens.
 */
export const registerControllersFromFolder = registrar.registerControllersFromFolder.bind(registrar);

/**
 * Function that registers all decorated controller with their decorated route functions in an expressJS router.
 * When no router is provided, this function will instantiate and return a router.
 *
 * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
 * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
 * @returns {Router} - The configured router.
 */
export const registerControllers = registrar.registerControllers.bind(registrar);

/**
 * Injected object that contains the global configuration for giuseppe.
 * May be changed before the registration process (e.g. accept header version setting).
 */
export const giuseppeConfiguration = IocContainer.get<Configuration>(IoCSymbols.configuration);
