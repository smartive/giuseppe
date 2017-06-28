import 'reflect-metadata';

import { RequestHandler } from 'express';

import { Giuseppe } from '../..';
import { HttpMethod } from '../../routes/RouteDefinition';
import { FunctionMethodDecorator, GiuseppeBaseRoute } from './GiuseppeBaseRoute';

/**
 * Route decorator. Creates a route definition that reacts to a head request.
 * Can define one or multiple middlewares that are registered for that route. Also, a route name can be specified
 * that creates the url for express.
 * 
 * @export
 * @param {(string | RequestHandler)} [routeOrMiddleware] Either a string that represents the url for this route, or
 *                                                        an optional middleware if no specific route is needed.
 * @param {...RequestHandler[]} middlewares Other middlewares that are used for this route.
 * @returns {FunctionMethodDecorator} 
 */
export function Head(
    routeOrMiddleware?: string | RequestHandler,
    ...middlewares: RequestHandler[],
): FunctionMethodDecorator {
    const route = routeOrMiddleware && typeof routeOrMiddleware === 'string' ? routeOrMiddleware : '';
    if (routeOrMiddleware && typeof routeOrMiddleware === 'function') {
        middlewares.unshift(routeOrMiddleware);
    }
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppeHeadRoute(descriptor.value, route, middlewares));
    };
}

/**
 * Default core head route of giuseppe. Reacts to a http.HEAD.
 * 
 * @export
 * @class GiuseppeHeadRoute
 * @extends {GiuseppeBaseRoute}
 */
export class GiuseppeHeadRoute extends GiuseppeBaseRoute {
    constructor(
        routeFunction: Function,
        route: string = '',
        middlewares: RequestHandler[] = [],
    ) {
        super(HttpMethod.head, routeFunction, route, middlewares);
    }
}
