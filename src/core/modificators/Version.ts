import { RouteModificator } from '../../routes/RouteModificator';
import { Giuseppe } from '../..';

export function Version(): MethodDecorator {
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        if (!descriptor.value) {
            throw new TypeError(`Function is undefined in the modificator`);
        }
        Giuseppe.registrar.registerRouteModificator(target, propertyKey, new GiuseppeVersionModificator(descriptor.value));
    };
}

export class GiuseppeVersionModificator implements RouteModificator {
    constructor(
        public readonly routeFunction: Function,
    ) { }
}
