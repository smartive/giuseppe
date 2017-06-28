import 'reflect-metadata';

import { RequestHandler } from 'express';

import { Giuseppe } from '../..';
import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { HttpMethod, RouteDefinition } from '../../routes/RouteDefinition';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { UrlHelper } from '../../utilities/UrlHelper';

/**
 * Type for giuseppes route decorators.
 * Does generically restrain the MethodDecorator to Functions only.
 */
export type FunctionMethodDecorator = (
    target: Object,
    _: string | symbol,
    descriptor: TypedPropertyDescriptor<Function>,
) => void;

/**
 * Route decorator. Creates a route definition that reacts to a specified request. The method needs to be specified.
 * Can define one or multiple middlewares that are registered for that route. Also, a route name can be specified
 * that creates the url for express.
 * 
 * @export
 * @param {HttpMethod} method The http method to use.
 * @param {(string | RequestHandler)} [routeOrMiddleware] Either a string that represents the url for this route, or
 *                                                        an optional middleware if no specific route is needed.
 * @param {...RequestHandler[]} middlewares Other middlewares that are used for this route.
 * @returns {FunctionMethodDecorator} 
 */
export function Route(
    method: HttpMethod,
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
        Giuseppe.registrar.registerRoute(target, new GiuseppeBaseRoute(method, descriptor.value, route, middlewares));
    };
}

/**
 * Default core base route of giuseppe. Is configurable with all defined http methods of express (from the source).
 * Specifies it's http method via the enum {@link HttpMethod}.
 * 
 * @export
 * @class GiuseppeBaseRoute
 * @implements {RouteDefinition}
 */
export class GiuseppeBaseRoute implements RouteDefinition {
    public get name(): string {
        return this.routeFunction.name;
    }

    constructor(
        public readonly httpMethod: HttpMethod,
        public readonly routeFunction: Function,
        public readonly route: string = '',
        public readonly middlewares: RequestHandler[] = [],
    ) { }

    public createRoutes(
        _: ControllerMetadata,
        baseUrl: string,
        controllerMiddlewares: RequestHandler[],
    ): GiuseppeRoute[] {
        return [
            {
                id: `${HttpMethod[this.httpMethod]}_${this.route}`,
                name: this.name,
                method: this.httpMethod,
                url: UrlHelper.buildUrl(baseUrl, this.route),
                middlewares: [...controllerMiddlewares, ...this.middlewares],
                function: this.routeFunction,
            },
        ];
    }
}
