import { DuplicateVersionInformation } from '../errors/Errors';
import { VersionInformation } from '../models/VersionInformation';

/**
 * Reflect metadata key for the version information.
 * 
 * @type {string}
 */
export const VERSION_KEY = 'version';

/**
 * Version decorator; decorates a class or a method of a class as versioned.
 * When the routes are registered, the version information will determine
 * if a route is accessable or not. If a route is not available in a certain version
 * the system should return a 404.
 *
 * @param {{from: ?number, to: ?number}} versionInformation - An object with from and / or until information. If both are omitted, an error is thrown.
 * @returns {(Function|Object, string?, PropertyDescriptor?) => void} - Decorator for a versioned controller or route.
 */
export function Version(versionInformation: { from?: number, until?: number }) {
    return (controllerOrRoute: Function | any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        let information = VersionInformation.create(controllerOrRoute.name, versionInformation);

        if (!propertyKey || !descriptor) {
            // Decorator is called on a class
            if (Reflect.hasMetadata(VERSION_KEY, controllerOrRoute)) {
                throw new DuplicateVersionInformation(controllerOrRoute.name);
            }
            Reflect.defineMetadata(VERSION_KEY, information, controllerOrRoute);
        } else {
            // Decorator is called on a method
            if (Reflect.hasMetadata(VERSION_KEY, controllerOrRoute.constructor, propertyKey)) {
                throw new DuplicateVersionInformation(controllerOrRoute.name);
            }
            Reflect.defineMetadata(VERSION_KEY, information, controllerOrRoute.constructor, propertyKey);
        }
    };
}
