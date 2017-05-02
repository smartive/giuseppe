import { Giuseppe } from '../..';
import { ParameterDefinition } from '../../parameter/ParameterDefinition';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';

export function Query(name: string): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeQueryParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
            ),
        );
}

export class GiuseppeQueryParameter implements ParameterDefinition {
    constructor(
        public readonly name: string,
        public readonly type: Function,
        public readonly index: number,
    ) { }
}
