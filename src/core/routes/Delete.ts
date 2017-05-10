import 'reflect-metadata';
import { Giuseppe } from '../..';
import { HttpMethod } from '../../routes/RouteDefinition';
import { GiuseppeBasicRoute } from './GiuseppeBasicRoute';
import { RequestHandler } from 'express';

export function Delete(routeOrMiddleware?: string | RequestHandler, ...middlewares: RequestHandler[]): MethodDecorator {
    const route = routeOrMiddleware && typeof routeOrMiddleware === 'string' ? routeOrMiddleware : '';
    if (routeOrMiddleware && typeof routeOrMiddleware === 'function') {
        middlewares.unshift(routeOrMiddleware);
    }
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppeDeleteRoute(descriptor.value, route, middlewares));
    };
}

export class GiuseppeDeleteRoute extends GiuseppeBasicRoute {
    constructor(
        routeFunction: Function,
        route: string = '',
        middlewares: RequestHandler[] = [],
    ) {
        super(HttpMethod.delete, routeFunction, route, middlewares);
    }
}
