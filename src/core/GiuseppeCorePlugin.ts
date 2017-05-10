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
import { GiuseppeQueryParameter } from './parameters/Query';
import { JsonDefaultReturnType } from './returnTypes/JsonDefaultReturnType';
import { GiuseppeDeleteRoute } from './routes/Delete';
import { GiuseppeGetRoute } from './routes/Get';
import { GiuseppeHeadRoute } from './routes/Head';
import { GiuseppePostRoute } from './routes/Post';
import { GiuseppePutRoute } from './routes/Put';

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
        this.routeDefinitions.push(GiuseppePostRoute);
        this.routeDefinitions.push(GiuseppePutRoute);
        this.routeDefinitions.push(GiuseppeDeleteRoute);
        this.routeDefinitions.push(GiuseppeHeadRoute);

        this.parameterDefinitions.push(GiuseppeQueryParameter);
    }
}
