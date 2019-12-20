import 'reflect-metadata';

import { ControllerErrorHandler } from '../errors/ControllerErrorHandler';
import { ERRORHANDLER_KEY } from '../errors/ErrorHandlerDecorator';
import { PARAMETER_DEFINITION_KEY, ParameterDefinition } from '../parameter/ParameterDefinition';
import { ROUTE_DEFINITION_KEY, RouteDefinition } from '../routes/RouteDefinition';
import { ROUTE_MODIFICATOR_KEY, RouteModificator } from '../routes/RouteModificator';

/**
 * Helper class that manages metadata elements on a controller class.
 * 
 * @export
 * @class ControllerMetadata
 */
export class ControllerMetadata {

    constructor(private controller: Function | Object) { }

    /**
     * Returns the defined routes of a controller class. If no routes are defined, defines the array of routes
     * on the controller and returns the empty array.
     * 
     * @returns {RouteDefinition[]} 
     * @memberof ControllerMetadata
     */
    public routes(): RouteDefinition[] {
        if (!Reflect.hasOwnMetadata(ROUTE_DEFINITION_KEY, this.controller)) {
            Reflect.defineMetadata(ROUTE_DEFINITION_KEY, [], this.controller);
        }
        return Reflect.getOwnMetadata(ROUTE_DEFINITION_KEY, this.controller);
    }

    /**
     * Returns the defined route modificators for a given route name of a controller class.
     * If no modificators are defined, defines the array of modificators on the controller and returns the empty array.
     * 
     * @param {string} name 
     * @returns {RouteModificator[]} 
     * @memberof ControllerMetadata
     */
    public modificators(name: string): RouteModificator[] {
        if (!Reflect.hasOwnMetadata(ROUTE_MODIFICATOR_KEY, this.controller, name)) {
            Reflect.defineMetadata(ROUTE_MODIFICATOR_KEY, [], this.controller, name);
        }
        return Reflect.getOwnMetadata(ROUTE_MODIFICATOR_KEY, this.controller, name);
    }

    /**
     * Returns the defined route parameters for a given route name of a controller class.
     * If no parameters are defined, defines the array of parameters on the controller and returns the empty array.
     * 
     * @param {string} name 
     * @returns {ParameterDefinition[]} 
     * @memberof ControllerMetadata
     */
    public parameters(name: string): ParameterDefinition[] {
        if (!Reflect.hasOwnMetadata(PARAMETER_DEFINITION_KEY, this.controller, name)) {
            Reflect.defineMetadata(PARAMETER_DEFINITION_KEY, [], this.controller, name);
        }
        return Reflect.getOwnMetadata(PARAMETER_DEFINITION_KEY, this.controller, name);
    }

    /**
     * Returns the types for the parameters of a given route name. Returns an empty array if the route has no parameters.
     * 
     * @param {string} name 
     * @returns {Function[]} 
     * @memberof ControllerMetadata
     */
    public parameterTypes(name: string): Function[] {
        return Reflect.getOwnMetadata('design:paramtypes', this.controller, name) || [];
    }

    /**
     * Returns the defined error handler of a controller class. If no handler is defined, defines the empty handler
     * on the controller and returns it.
     * 
     * @returns {ControllerErrorHandler} 
     * @memberof ControllerMetadata
     */
    public errorHandler(): ControllerErrorHandler {
        if (!Reflect.hasOwnMetadata(ERRORHANDLER_KEY, this.controller)) {
            Reflect.defineMetadata(ERRORHANDLER_KEY, new ControllerErrorHandler(), this.controller);
        }
        return Reflect.getOwnMetadata(ERRORHANDLER_KEY, this.controller);
    }
}
