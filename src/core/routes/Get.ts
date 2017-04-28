import { Giuseppe } from '../..';
import { RouteDefinition } from '../../routes/RouteDefinition';
import { RequestHandler } from 'express';

export function Get(route: string = '', ...middlewares: RequestHandler[]): MethodDecorator {
    return (target: Object, _: string | symbol, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in route ${route}`);
        }
        Giuseppe.registrar.registerRoute(target, new GiuseppeGetRoute(descriptor.value, route, middlewares));
    };
}

export class GiuseppeGetRoute implements RouteDefinition {
    public readonly httpMethod: string = 'get';

    public get name(): string {
        return this.routeFunction.name;
    }

    constructor(
        public readonly routeFunction: Function,
        public readonly route: string = '',
        public readonly middlewares: RequestHandler[] = [],
    ) { }

    public routeId(): string {
        throw new Error('Not implemented yet.');
    }

    public register(): any {
        throw new Error('Not implemented yet.');
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
