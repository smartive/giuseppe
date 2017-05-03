import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { Giuseppe } from '../..';
import { HttpMethod, RouteDefinition } from '../../routes/RouteDefinition';
import { RequestHandler, Request } from 'express';

export function Get(route: string = '', ...middlewares: RequestHandler[]): MethodDecorator {
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
        meta: ControllerMetadata,
        baseUrl: string,
        controllerMiddlewares: RequestHandler[],
    ): GiuseppeRoute[] {

        return [
            {
                id: `${HttpMethod[this.httpMethod]}_${this.route}`,
                name: this.name,
                method: this.httpMethod,
                url: [baseUrl, this.route].filter(Boolean).join('/'),
                middlewares: [...controllerMiddlewares, ...this.middlewares],
                function: this.routeFunction,
            },
        ];



        /*
        get modifiers for route
        get parameters for route
        create (one or multiple) objects that contain a route ID, a route function (with prepended middlewares)
        route function is a wrapper (like in v1)
        return a hash with: id => register function
        const routeHash = route.createRouteFunctions(meta);

            Object.keys(routeHash)
                .map(k => {
                    
                })

            // check for duplicates (in router)
            // order routes by * and segments
            // register them
        */
    }
}

// export function Query(name: string): ParameterDecorator {
//     return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
//         console.log(target, propertyKey, parameterIndex);
//     };
// }

// export function Version(): MethodDecorator {
//     return <T>(target: Object | Function, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
//         console.log(target, propertyKey, descriptor);
//         const routes = Reflect.get(target, ROUTE_DECORATOR_KEY) || [];
//         routes.push('');
//         Reflect.set(target, ROUTE_DECORATOR_KEY, routes);
//     };
// }

// export class GiuseppeController implements ControllerDecorator {
//     constructor(giuseppe: Giuseppe) {
//         giuseppeInstance = giuseppe;
//         for (const ctrl of instanceControllers) {
//             giuseppeInstance.controller.push(ctrl);
//         }
//     }
// }

// export class GiuseppeGetRoute implements RouteDecorator {
//     public readonly httpMethod: string = 'get';

//     public routeId(): string {
//         throw new Error('Not implemented yet.');
//     }

//     public register(): any {
//         throw new Error('Not implemented yet.');
//     }
// }
