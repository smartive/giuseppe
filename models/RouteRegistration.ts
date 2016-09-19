import {RouteMethod} from '../routes/RouteDecorators';
import {RequestHandler} from 'express-serve-static-core';

/**
 * Class for the registered routes. Contains all information for the "registerControllers" method to register the given routes.
 *
 * @class
 */
export class RouteRegistration {
    constructor(public path: string, public method: RouteMethod, public descriptor: PropertyDescriptor, public propertyKey: string, public middlewares: RequestHandler[] = []) {
    }
}
