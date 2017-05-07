import 'reflect-metadata';
import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { RouteModificator } from '../../routes/RouteModificator';
import { Giuseppe } from '../../Giuseppe';

// const VERSION_KEY = 'giuseppe:RouteVersions';

export function Version(versionInformation: { from?: number, until?: number } = {}): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in the modificator`);
        }
        Giuseppe.registrar.registerRouteModificator(target, propertyKey, new GiuseppeVersionModificator(
            versionInformation.from,
            versionInformation.until,
        ));
    };
}

export class GiuseppeVersionModificator implements RouteModificator {
    constructor(public readonly from?: number, public readonly until?: number) { }

    public modifyRoute(route: GiuseppeRoute): GiuseppeRoute[] {
        // take the route, make multiple (with different id's, one "router" route)

        /*
        register the versions on the route it'self
        -> creates maybe duplicates but hey.
        */

        // const routingRoute: GiuseppeRoute = {

        // }

        return [route];
    }
}
