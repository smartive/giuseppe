// import { ROUTE_DECORATOR_KEY, RouteDecorator } from '../../routes/RouteDecorator';
// import { RequestHandler } from 'express-serve-static-core';

// /**
//  * Enum for the possible route http methods.
//  */
// export enum RouteMethod {
//     Get,
//     Put,
//     Post,
//     Delete,
//     Head
// }

// /**
//  * Declares the given method as an api route. Adds the route registration to the controller.
//  * All route registrations are decorated and registered during the registerControllers method.
//  *
//  * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
//  * @param {RouteMethod} httpMethod - The http verb to use for this route.
//  * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
//  * @returns {MethodDecorator} - Method decorator for the given function.
//  */
// export function Route(route: string = '', httpMethod: RouteMethod = RouteMethod.Get, ...middlewares: RequestHandler[]): MethodDecorator {
//     return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
//         const routes = Reflect.get(target.constructor, ROUTE_DECORATOR_KEY);
//         routes.push('');
//         Reflect.set(target.constructor, ROUTE_DECORATOR_KEY, routes);
//         // let routes = Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
//         // routes.push(new RouteRegistration(route || '', httpMethod, descriptor, propertyKey, middlewares));
//         // Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
//     };
// }

// export class GiuseppeRoute implements RouteDecorator {

// }
