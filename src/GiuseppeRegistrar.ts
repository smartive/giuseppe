import { ControllerDefinition } from './controller/ControllerDefinition';
import { ErrorHandlerFunction } from './errors/ControllerErrorHandler';
import { ParameterDefinition } from './parameter/ParameterDefinition';
import { RouteDefinition } from './routes/RouteDefinition';
import { RouteModificator } from './routes/RouteModificator';
import { ControllerMetadata } from './utilities/ControllerMetadata';

/**
 * Helper class that is used to register giuseppe - stuff to the specific controllers.
 * 
 * @export
 * @class GiuseppeRegistrar
 */
export class GiuseppeRegistrar {
    /**
     * List of controller definitions.
     * 
     * @type {ControllerDefinition[]}
     * @memberof GiuseppeRegistrar
     */
    public readonly controller: ControllerDefinition[] = [];

    /**
     * Registeres a controller definition within the register (list of controllers).
     * 
     * @param {ControllerDefinition} controller 
     * @memberof GiuseppeRegistrar
     */
    public registerController(controller: ControllerDefinition): void {
        this.controller.push(controller);
    }

    /**
     * Register a route to a controllers metadata.
     * 
     * @param {Object} controller 
     * @param {RouteDefinition} route 
     * @memberof GiuseppeRegistrar
     */
    public registerRoute(controller: Object, route: RouteDefinition): void {
        const meta = new ControllerMetadata(controller);
        meta.routes().push(route);
    }

    /**
     * Register a modificator for a route of a controller.
     * 
     * @param {Object} controller 
     * @param {string} routeName 
     * @param {RouteModificator} modificator 
     * @memberof GiuseppeRegistrar
     */
    public registerRouteModificator(controller: Object, routeName: string, modificator: RouteModificator): void {
        const meta = new ControllerMetadata(controller);
        meta.modificators(routeName).push(modificator);
    }

    /**
     * Register a parameter for a route of a controller.
     * 
     * @param {Object} controller 
     * @param {string} routeName 
     * @param {ParameterDefinition} parameter 
     * @memberof GiuseppeRegistrar
     */
    public registerParameter(controller: Object, routeName: string, parameter: ParameterDefinition): void {
        const meta = new ControllerMetadata(controller);
        meta.parameters(routeName).push(parameter);
    }

    /**
     * Register an error handler for a given error type for a controller.
     * 
     * @param {Object} controller 
     * @param {ErrorHandlerFunction<Error>} handler 
     * @param {Function[]} errors 
     * @memberof GiuseppeRegistrar
     */
    public registerErrorHandler(controller: Object, handler: ErrorHandlerFunction<Error>, errors: Function[]): void {
        const meta = new ControllerMetadata(controller);
        for (const error of errors) {
            meta.errorHandler().addHandler(handler, error);
        }
    }
}
