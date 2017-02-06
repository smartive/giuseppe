import 'reflect-metadata';
import {IocContainer} from '../core/IoC';
import {IoCSymbols} from '../core/IoCSymbols';
import {Registrar} from '../core/Registrar';
import {ControllerRegistration} from '../models/ControllerRegistration';
import {RequestHandler} from 'express-serve-static-core';

/**
 * Controller decorator; decorates a class to be a rest api controller. A controller registers itself to an
 * expressJS router when "registerControllers" is called.
 *
 * @param {string} [routePrefix] - Prefix for the whole controller. This path is added to all routes.
 * @param {RequestHandler[]} [middlewares] - Middleware functions for the controller to be executed before the routing functions.
 * @returns {(Function) => void} - Decorator for the controller class.
 */
export function Controller(routePrefix?: string, ...middlewares: RequestHandler[]) {
    return (controller: any) => {
        IocContainer.get<Registrar>(IoCSymbols.registrar).addController(new ControllerRegistration(controller, routePrefix, middlewares));
    };
}
