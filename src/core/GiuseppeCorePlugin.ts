import 'reflect-metadata';

import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    RouteDefinitionConstructor,
} from '../GiuseppePlugin';
import { ReturnType } from '../routes/ReturnType';
import { GiuseppeApiController } from './controller/GiuseppeApiController';
import { GiuseppeBodyParameter } from './parameters/Body';
import { GiuseppeCookieParameter } from './parameters/Cookie';
import { GiuseppeHeaderParameter } from './parameters/Header';
import { GiuseppeQueryParameter } from './parameters/Query';
import { GiuseppeUrlParameter } from './parameters/UrlParam';
import { JsonDefaultReturnType } from './returnTypes/JsonDefaultReturnType';
import { GiuseppeDeleteRoute } from './routes/Delete';
import { GiuseppeGetRoute } from './routes/Get';
import { GiuseppeHeadRoute } from './routes/Head';
import { GiuseppePostRoute } from './routes/Post';
import { GiuseppePutRoute } from './routes/Put';

/**
 * Core plugin of giuseppe. Contains all the basic routes, controller and parameter.
 * 
 * @export
 * @class GiuseppeCorePlugin
 * @implements {GiuseppePlugin}
 */
export class GiuseppeCorePlugin implements GiuseppePlugin {
    public readonly returnTypeHandler: ReturnType<any>[] = [];
    public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
    public readonly routeDefinitions: RouteDefinitionConstructor[] = [];
    public readonly routeModificators: null = null;
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
        this.parameterDefinitions.push(GiuseppeUrlParameter);
        this.parameterDefinitions.push(GiuseppeBodyParameter);
        this.parameterDefinitions.push(GiuseppeHeaderParameter);
        this.parameterDefinitions.push(GiuseppeCookieParameter);
    }
}
