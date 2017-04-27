import { RouteDecorator } from '../../routes/RouteDecorator';
import { RequestHandler } from 'express';

export function Get(route: string = '', ...middlewares: RequestHandler[]): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const routes = Reflect.get(target.constructor, ROUTE_DECORATOR_KEY);
        routes.push('');
        Reflect.set(target.constructor, ROUTE_DECORATOR_KEY, routes);
        // let routes = Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
        // routes.push(new RouteRegistration(route || '', httpMethod, descriptor, propertyKey, middlewares));
        // Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
    };
}

export class GiuseppeGetRoute implements RouteDecorator {
    public readonly httpMethod: string = 'get';

    public routeId(): string {
        throw new Error('Not implemented yet.');
    }

    public register(): any {
        throw new Error('Not implemented yet.');
    }
}
