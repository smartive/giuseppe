import { ControllerRegistration } from '../../controller/ControllerRegistration';
import { ControllerDecorator } from '../../controller/ControllerDecorator';
import { Giuseppe } from '../../Giuseppe';
import { RequestHandler } from 'express';

const instanceControllers: ControllerRegistration[] = [];

let giuseppeInstance: Giuseppe;

/**
 * TODO
 * 
 * @export
 * @param {string} [routePrefix=''] 
 * @param {...RequestHandler[]} middlewares 
 * @returns {ClassDecorator} 
 */
export function Controller(routePrefix: string = '', ...middlewares: RequestHandler[]): ClassDecorator {
    return (ctrl: any) => {
        const controller = new ControllerRegistration(ctrl, routePrefix, middlewares);
        if (giuseppeInstance) {
            giuseppeInstance.controller.push(controller);
        } else {
            instanceControllers.push(controller);
        }
    };
}

export class GiuseppeController implements ControllerDecorator {
    constructor(giuseppe: Giuseppe) {
        giuseppeInstance = giuseppe;
        for (const ctrl of instanceControllers) {
            giuseppeInstance.controller.push(ctrl);
        }
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
