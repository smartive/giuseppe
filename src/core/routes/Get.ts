import 'reflect-metadata';
import { UrlHelper } from '../../utilities/UrlHelper';
import { Giuseppe } from '../..';
import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { HttpMethod, RouteDefinition } from '../../routes/RouteDefinition';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { RequestHandler } from 'express';

export function Get(routeOrMiddleware?: string | RequestHandler, ...middlewares: RequestHandler[]): MethodDecorator {
    const route = routeOrMiddleware && typeof routeOrMiddleware === 'string' ? routeOrMiddleware : '';
    if (routeOrMiddleware && typeof routeOrMiddleware === 'function') {
        middlewares.unshift(routeOrMiddleware);
    }
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppeGetRoute(descriptor.value, route, middlewares));
    };
}

export class GiuseppeGetRoute implements RouteDefinition {
    public readonly httpMethod: HttpMethod = HttpMethod.get;

    public get name(): string {
        return this.routeFunction.name;
    }

    constructor(
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
