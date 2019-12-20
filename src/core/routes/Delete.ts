import 'reflect-metadata';

import { RequestHandler } from 'express';

import { Giuseppe } from '../..';
import { HttpMethod } from '../../routes/RouteDefinition';
import { Callable, FunctionMethodDecorator, GiuseppeBaseRoute } from './GiuseppeBaseRoute';

/**
 * Route decorator. Creates a route definition that reacts to a delete request.
 * Can define one or multiple middlewares that are registered for that route. Also, a route name can be specified
 * that creates the url for express.
 *
 * @export
 * @param {(string | RequestHandler)} [routeOrMiddleware] Either a string that represents the url for this route, or
 *                                                        an optional middleware if no specific route is needed.
 * @param {...RequestHandler[]} middlewares Other middlewares that are used for this route.
 * @returns {FunctionMethodDecorator}
 */
export function Delete(
    routeOrMiddleware?: string | RequestHandler,
    ...middlewares: RequestHandler[]
): FunctionMethodDecorator {
    const route = routeOrMiddleware && typeof routeOrMiddleware === 'string' ? routeOrMiddleware : '';
    if (routeOrMiddleware && typeof routeOrMiddleware === 'function') {
        middlewares.unshift(routeOrMiddleware);
    }
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Callable>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppeDeleteRoute(descriptor.value, route, middlewares));
    };
}

/**
 * Default core delete route of giuseppe. Reacts to http.DELETE.
 *
 * @export
 * @class GiuseppeDeleteRoute
 * @extends {GiuseppeBaseRoute}
 */
export class GiuseppeDeleteRoute extends GiuseppeBaseRoute {
    constructor(
        routeFunction: Function,
        route: string = '',
        middlewares: RequestHandler[] = [],
    ) {
        super(HttpMethod.delete, routeFunction, route, middlewares);
    }
}
