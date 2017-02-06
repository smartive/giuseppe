import {RequestHandler} from 'express-serve-static-core';

/**
 * Class for the registered controllers. Contains the information about the controller that holds the routes.
 * 
 * @class ControllerRegistration
 */
export class ControllerRegistration {
    constructor(public controller: any, public prefix?: string, public middlewares: RequestHandler[] = []) {
    }
}
