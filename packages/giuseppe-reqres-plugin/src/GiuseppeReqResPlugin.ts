import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    ReturnType,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from 'giuseppe';

import { GiuseppeRequestParameter } from './Req';
import { GiuseppeResponseParameter } from './Res';

/**
 * Giuseppe plugin that adds a @Req and @Res parameter decorator for routes. This parameter do inject the express
 * request or express response objects.
 *
 * @export
 * @class GiuseppeReqResPlugin
 * @implements {GiuseppePlugin}
 */
export class GiuseppeReqResPlugin implements GiuseppePlugin {
    public returnTypeHandler: ReturnType<any>[] | null = null;
    public controllerDefinitions: ControllerDefinitionConstructor[] | null = null;
    public routeDefinitions: RouteDefinitionConstructor[] | null = null;
    public routeModificators: RouteModificatorConstructor[] | null = null;
    public parameterDefinitions: ParameterDefinitionConstructor[] = [];

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.parameterDefinitions.push(GiuseppeRequestParameter);
        this.parameterDefinitions.push(GiuseppeResponseParameter);
    }
}
