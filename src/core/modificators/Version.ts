import { GiuseppeRoute } from '../../routes/GiuseppeRoute';
import { RouteModificator } from '../../routes/RouteModificator';
import { Giuseppe } from '../..';

export function Version(): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in the modificator`);
        }
        Giuseppe.registrar.registerRouteModificator(target, propertyKey, new GiuseppeVersionModificator());
    };
}

export class GiuseppeVersionModificator implements RouteModificator {
    public modifyRoute(route: GiuseppeRoute): GiuseppeRoute[] {
        const r2: GiuseppeRoute = JSON.parse(JSON.stringify(route));
        
        return [route, r2];
    }
}
