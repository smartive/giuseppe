import { GiuseppeGetRoute } from './routes';
import 'reflect-metadata';
import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDecoratorConstructor,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from '../GiuseppePlugin';
import { ReturnType } from '../routes/ReturnType';
import { GiuseppeApiController } from './controller/GiuseppeApiController';
import { JsonDefaultReturnType } from './returnTypes/JsonDefaultReturnType';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly returnTypeHandler: ReturnType<any>[] = [];
    public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
    public readonly routeDecorators: RouteDefinitionConstructor[] = [];
    public readonly routeModificators: RouteModificatorConstructor[] = [];
    public readonly parameterDecorators: ParameterDecoratorConstructor[] = [];

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.returnTypeHandler.push(new JsonDefaultReturnType());
        this.controllerDefinitions.push(GiuseppeApiController);
        this.routeDecorators.push(GiuseppeGetRoute);
    }
}
