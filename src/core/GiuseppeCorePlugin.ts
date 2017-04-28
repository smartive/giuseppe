import { GiuseppeController } from './controller/GiuseppeController';
import { ControllerDefinition } from '../controller/ControllerDecorator';
import { GiuseppePlugin } from '../GiuseppePlugin';
import { ReturnTypeHandler } from '../routes/ReturnTypeHandler';
import { RouteDecorator } from '../routes/RouteDecorator';
import { RouteModificator } from '../routes/RouteModificator';
import { Giuseppe } from '../Giuseppe';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly name: string = 'GiuseppeCorePlugin';
    public readonly returnTypeHandler: ReturnTypeHandler[] | null;
    public readonly controllerDecorators: ControllerDefinition[] = [];
    // public readonly controllerModificators: ControllerDecorator[] = []; ?
    public readonly routeDecorators: RouteDecorator[] | null;
    public readonly routeModificators: RouteModificator[] | null;
    public readonly parameterDecorators: ParameterDecorator[] | null;

    public initialize(giuseppe: Giuseppe): void {
        // this.controllerDecorators.push(new GiuseppeController(giuseppe));
    }
}
