import 'reflect-metadata';
import { ERRORHANDLER_KEY } from '../errors/ErrorHandlerDecorator';
import { ControllerErrorHandler } from '../errors/ControllerErrorHandler';
import { PARAMETER_DEFINITION_KEY, ParameterDefinition } from '../parameter/ParameterDefinition';
import { ROUTE_DEFINITION_KEY, RouteDefinition } from '../routes/RouteDefinition';
import { ROUTE_MODIFICATOR_KEY, RouteModificator } from '../routes/RouteModificator';

export class ControllerMetadata {

    constructor(private controller: Function | Object) { }

    public routes(): RouteDefinition[] {
        if (!Reflect.hasOwnMetadata(ROUTE_DEFINITION_KEY, this.controller)) {
            Reflect.defineMetadata(ROUTE_DEFINITION_KEY, [], this.controller);
        }
        return Reflect.getOwnMetadata(ROUTE_DEFINITION_KEY, this.controller);
    }

    public modificators(name: string): RouteModificator[] {
        if (!Reflect.hasOwnMetadata(ROUTE_MODIFICATOR_KEY, this.controller, name)) {
            Reflect.defineMetadata(ROUTE_MODIFICATOR_KEY, [], this.controller, name);
        }
        return Reflect.getOwnMetadata(ROUTE_MODIFICATOR_KEY, this.controller, name);
    }

    public parameters(name: string): ParameterDefinition[] {
        if (!Reflect.hasOwnMetadata(PARAMETER_DEFINITION_KEY, this.controller, name)) {
            Reflect.defineMetadata(PARAMETER_DEFINITION_KEY, [], this.controller, name);
        }
        return Reflect.getOwnMetadata(PARAMETER_DEFINITION_KEY, this.controller, name);
    }

    public parameterTypes(name: string): Function[] {
        return Reflect.getOwnMetadata('design:paramtypes', this.controller, name) || [];
    }

    public errorHandler(): ControllerErrorHandler {
        if (!Reflect.hasOwnMetadata(ERRORHANDLER_KEY, this.controller)) {
            Reflect.defineMetadata(ERRORHANDLER_KEY, new ControllerErrorHandler(), this.controller);
        }
        return Reflect.getOwnMetadata(ERRORHANDLER_KEY, this.controller);
    }
}
