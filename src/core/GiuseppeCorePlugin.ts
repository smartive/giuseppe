import { ControllerDefinitionConstructor, GiuseppePlugin } from '../GiuseppePlugin';
import { ReturnType } from '../routes/ReturnType';
import { RouteDefinition } from '../routes/RouteDefinition';
import { RouteModificator } from '../routes/RouteModificator';
import { GiuseppeApiController } from './controller/GiuseppeApiController';
import { JsonDefaultReturnType } from './returnTypes/JsonDefaultReturnType';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly returnTypeHandler: ReturnType<any>[] = [];
    public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
    // public readonly controllerModificators: ControllerDecorator[] = []; ?
    public readonly routeDecorators: RouteDefinition[] | null;
    public readonly routeModificators: RouteModificator[] | null;
    public readonly parameterDecorators: ParameterDecorator[] | null;

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.returnTypeHandler.push(new JsonDefaultReturnType());
        this.controllerDefinitions.push(GiuseppeApiController);
    }
}
