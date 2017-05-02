import { ControllerDefinition } from '../controller/ControllerDefinition';
import { GiuseppePlugin } from '../GiuseppePlugin';
import { ReturnTypeHandler } from '../routes/ReturnTypeHandler';
import { RouteDefinition } from '../routes/RouteDefinition';
import { RouteModificator } from '../routes/RouteModificator';
import { GiuseppeApiController } from './controller/GiuseppeApiController';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly returnTypeHandler: ReturnTypeHandler[] | null;
    public readonly controllerDefinitions: (new (...args: any[]) => ControllerDefinition)[] = [];
    // public readonly controllerModificators: ControllerDecorator[] = []; ?
    public readonly routeDecorators: RouteDefinition[] | null;
    public readonly routeModificators: RouteModificator[] | null;
    public readonly parameterDecorators: ParameterDecorator[] | null;

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.controllerDefinitions.push(GiuseppeApiController);
    }
}
