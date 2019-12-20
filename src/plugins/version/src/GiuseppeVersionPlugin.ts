import {
    ControllerDefinitionConstructor,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    ReturnType,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from 'giuseppe';

import { GiuseppeRouteVersion } from './GiuseppeRouteVersion';

/**
 * Giuseppe plugin that adds a ´@Version´ route modificator to add versioning to an api.
 *
 * @export
 * @class GiuseppeVersionPlugin
 * @implements {GiuseppePlugin}
 */
export class GiuseppeVersionPlugin implements GiuseppePlugin {
    public returnTypeHandler: ReturnType<any>[] | null = null;
    public controllerDefinitions: ControllerDefinitionConstructor[] | null = null;
    public routeDefinitions: RouteDefinitionConstructor[] | null = null;
    public routeModificators: RouteModificatorConstructor[] = [];
    public parameterDefinitions: ParameterDefinitionConstructor[] | null = null;

    public get name(): string {
        return this.constructor.name;
    }

    public initialize(): void {
        this.routeModificators.push(GiuseppeRouteVersion);
    }
}
