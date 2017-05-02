import { ControllerDefinition } from '../../controller/ControllerDefinition';
import { Giuseppe } from '../../Giuseppe';
import { RequestHandler, Router } from 'express';

export function Controller(routePrefix: string = '', ...middlewares: RequestHandler[]): ClassDecorator {
    return (ctrl: Function) => Giuseppe.registrar.registerController(new GiuseppeApiController(ctrl, routePrefix, middlewares));
}

export class GiuseppeApiController implements ControllerDefinition {
    constructor(
        public readonly ctrlTarget: Function,
        public readonly routePrefix: string = '',
        public readonly middlewares: RequestHandler[] = [],
    ) { }

    public register(baseUrl: string, router: Router): void {
        throw new Error('Not implemented yet.' + baseUrl + router);
    }
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
