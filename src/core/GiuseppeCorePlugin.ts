import { RouteDefinition } from '../routes/RouteDefinition';
import { ControllerDefinition } from '../controller/ControllerDefinition';
import { Giuseppe } from '../Giuseppe';
import { GiuseppePlugin } from '../GiuseppePlugin';
import { ReturnTypeHandler } from '../routes/ReturnTypeHandler';
import { RouteModificator } from '../routes/RouteModificator';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly name: string = 'GiuseppeCorePlugin';
    public readonly returnTypeHandler: ReturnTypeHandler[] | null;
    public readonly controllerDecorators: ControllerDefinition[] = [];
    // public readonly controllerModificators: ControllerDecorator[] = []; ?
    public readonly routeDecorators: RouteDefinition[] | null;
    public readonly routeModificators: RouteModificator[] | null;
    public readonly parameterDecorators: ParameterDecorator[] | null;

    public initialize(_: Giuseppe): void {
        // this.controllerDecorators.push(new GiuseppeController(giuseppe));
    }
}
