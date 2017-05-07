import { GiuseppeQueryParameter } from './parameters/Query';
import { GiuseppeGetRoute } from './routes';
import 'reflect-metadata';
import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from '../GiuseppePlugin';
import { ReturnType } from '../routes/ReturnType';
import { GiuseppeApiController } from './controller/GiuseppeApiController';
import { JsonDefaultReturnType } from './returnTypes/JsonDefaultReturnType';

export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly returnTypeHandler: ReturnType<any>[] = [];
    public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
    public readonly routeDefinitions: RouteDefinitionConstructor[] = [];
    public readonly routeModificators: RouteModificatorConstructor[] = [];
    public readonly parameterDefinitions: ParameterDefinitionConstructor[] = [];

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.returnTypeHandler.push(new JsonDefaultReturnType());
        this.controllerDefinitions.push(GiuseppeApiController);
        this.routeDefinitions.push(GiuseppeGetRoute);
        this.parameterDefinitions.push(GiuseppeQueryParameter);
    }
}
