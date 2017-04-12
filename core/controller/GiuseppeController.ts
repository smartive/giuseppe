import { RequestHandler } from 'express';

/**
 * TODO
 * 
 * @export
 * @param {string} [routePrefix]
 * @param {...RequestHandler[]} middlewares
 * @returns {ClassDecorator}
 */
export function Controller(routePrefix?: string, ...middlewares: RequestHandler[]): ClassDecorator {
    return (ctrl: any) => {
        console.log(ctrl, routePrefix, middlewares);
    };
}

export class GiuseppeController {
    
}

// /**
//  * Controller decorator; decorates a class to be a rest api controller. A controller registers itself to an
//  * expressJS router when "registerControllers" is called.
//  *
//  * @param {string} [routePrefix] - Prefix for the whole controller. This path is added to all routes.
//  * @param {RequestHandler[]} [middlewares] - Middleware funct
// ions for the controller to be executed before the routing functions.
//  * @returns {(Function) => void} - Decorator for the controller class.
//  */
// export function Controller(routePrefix?: string, ...middlewares: RequestHandler[]) {
//     return (controller: any) => {
//         IocContainer.get<Registrar>(IoCSymbols.registrar)
// .addController(new ControllerRegistration(controller, routePrefix, middlewares));
//     };
// }
