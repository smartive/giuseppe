import 'reflect-metadata';
import {Router} from 'express';
import {RouteMethod, routesKey} from '../routes/RouteDecorators';
import {HttpVerbNotSupportedError, DuplicateRouteDeclarationError} from '../errors/Errors';

let controllers: ControllerRegistration[] = [],
    definedRoutes = [];

class ControllerRegistration {
    constructor(public controller: Object, public prefix?: string) {
    }
}

/**
 * Controller decorator; decorates a class to be a rest api controller. A controller registers itself to an
 * expressJS router when "registerControllers" is called.
 *
 * @param {string} [routePrefix] - Prefix for the whole controller. This path is added to all routes.
 * @returns {(Function) => void} - Decorator for the controller class.
 */
export function Controller(routePrefix?: string) {
    return (controller: any) => {
        controllers.push(new ControllerRegistration(controller, routePrefix));
    };
}

/**
 * Function that registers all decorated controller with their decorated route functions in an expressJS router.
 * When no router is provided, this function will instantiate and return a router.
 *
 * @param {string} [baseUrl=''] - Base url for the routing system. Will be prefixed for all controllers.
 * @param {Router} [router=Router()] - Express router to attach the routes to. If omitted, a new router is instantiated.
 * @returns {Router} - The configured router.
 */
export function registerControllers(baseUrl: string = '', router: Router = Router()): Router {
    let url = baseUrl;
    if (url[url.length - 1] !== '/') {
        url += '/';
    }
    if (url[0] !== '/') {
        url = '/' + url;
    }

    controllers.forEach(ctrl => {
        let routes = Reflect.getOwnMetadata(routesKey, ctrl.controller) || [];

        routes.forEach(route => {
            let routeUrl = url + [ctrl.prefix, route.path].filter(Boolean).join('/'),
                routeId = routeUrl + route.method.toString();

            if (routeUrl.length > 1 && routeUrl[routeUrl.length - 1] === '/') {
                routeUrl = routeUrl.substr(0, routeUrl.length - 1);
            }

            if (definedRoutes.indexOf(routeId) !== -1) {
                throw new DuplicateRouteDeclarationError(routeUrl, route.method);
            }

            switch (route.method) {
                case RouteMethod.Get:
                    router.get(routeUrl, (route.func as any));
                    break;
                case RouteMethod.Put:
                    router.put(routeUrl, (route.func as any));
                    break;
                case RouteMethod.Post:
                    router.post(routeUrl, (route.func as any));
                    break;
                case RouteMethod.Delete:
                    router.delete(routeUrl, (route.func as any));
                    break;
                default:
                    throw new HttpVerbNotSupportedError(route.method);
            }
            definedRoutes.push(routeId);
        });
    });

    return router;
}

/**
 * Resets the registered controllers and the defined routes array (used for testing).
 */
export function resetControllerRegistrations(): void {
    definedRoutes = [];
    controllers = [];
}
