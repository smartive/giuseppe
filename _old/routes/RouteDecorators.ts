import 'reflect-metadata';
import {RouteRegistration} from '../models/RouteRegistration';
import {RequestHandler} from 'express-serve-static-core';

/**
 * Reflect metadata key for the controllers routes.
 * 
 * @type {string}
 */
export const ROUTES_KEY = 'routes';

/**
 * Enum for the possible route http methods.
 */
export enum RouteMethod {
    Get,
    Put,
    Post,
    Delete,
    Head
}

/**
 * Declares the given method as an api route. Adds the route registration to the controller.
 * All route registrations are decorated and registered during the registerControllers method.
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RouteMethod} httpMethod - The http verb to use for this route.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function.
 */
export function Route(route: string = '', httpMethod: RouteMethod = RouteMethod.Get, ...middlewares: RequestHandler[]) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let routes = Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];
        routes.push(new RouteRegistration(route || '', httpMethod, descriptor, propertyKey, middlewares));
        Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
    };
}

/**
 * Alias function for @Route(string, RouteMethod.Get)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'GET'.
 */
export function Get(route: string = '', ...middlewares: RequestHandler[]) {
    return Route(route, RouteMethod.Get, ...middlewares);
}

/**
 * Alias function for @Route(string, RouteMethod.Put)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'PUT'.
 */
export function Put(route: string = '', ...middlewares: RequestHandler[]) {
    return Route(route, RouteMethod.Put, ...middlewares);
}

/**
 * Alias function for @Route(string, RouteMethod.Post)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'POST'.
 */
export function Post(route: string = '', ...middlewares: RequestHandler[]) {
    return Route(route, RouteMethod.Post, ...middlewares);
}

/**
 * Alias function for @Route(string, RouteMethod.Delete)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'DELETE'.
 */
export function Delete(route: string = '', ...middlewares: RequestHandler[]) {
    return Route(route, RouteMethod.Delete, ...middlewares);
}

/**
 * Alias function for @Route(string, RouteMethod.Head)
 *
 * @param {string} [route=''] - The routed endpoint of the method. If omitted, the base route is taken.
 * @param {RequestHandler[]} [middlewares=[]] - The used middleware(s) for this route.
 * @returns {(any, string, PropertyDescriptor) => void} - Method decorator for the given function with the http verb 'Head'.
 */
export function Head(route: string = '', ...middlewares: RequestHandler[]) {
    return Route(route, RouteMethod.Head, ...middlewares);
}
