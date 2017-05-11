import 'reflect-metadata';
import { Giuseppe } from '../..';
import { HttpMethod } from '../../routes/RouteDefinition';
import { GiuseppeBaseRoute } from './GiuseppeBaseRoute';
import { RequestHandler } from 'express';

export function Post(routeOrMiddleware?: string | RequestHandler, ...middlewares: RequestHandler[]): MethodDecorator {
    const route = routeOrMiddleware && typeof routeOrMiddleware === 'string' ? routeOrMiddleware : '';
    if (routeOrMiddleware && typeof routeOrMiddleware === 'function') {
        middlewares.unshift(routeOrMiddleware);
    }
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppePostRoute(descriptor.value, route, middlewares));
    };
}

export class GiuseppePostRoute extends GiuseppeBaseRoute {
    constructor(
        routeFunction: Function,
        route: string = '',
        middlewares: RequestHandler[] = [],
    ) {
        super(HttpMethod.post, routeFunction, route, middlewares);
    }
}
