import { ControllerDecorator } from '../controller/ControllerDecorator';
import { GiuseppePlugin } from '../GiuseppePlugin';
import { ReturnTypeHandler } from '../routes/ReturnTypeHandler';
import { RouteDecorator } from '../routes/RouteDecorator';
import { RouteModificator } from '../routes/RouteModificator';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly name: string = 'GiuseppeCorePlugin';
    public readonly returnTypeHandler: ReturnTypeHandler[] | null;
    public readonly controllerDecorators: ControllerDecorator[] | null;
    public readonly routeDecorators: RouteDecorator[] | null;
    public readonly routeModificators: RouteModificator[] | null;
    public readonly parameterDecorators: ParameterDecorator[] | null;

    public initialize(): void {
        throw new Error('Not implemented yet.');
    }

    public teardown(): void {
        throw new Error('Not implemented yet.');
    }
}
