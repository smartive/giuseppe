import { Giuseppe } from '../..';
import { ParameterDefinition } from '../../parameter/ParameterDefinition';

export function Query(name: string): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) => 
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeQueryParameter(
                name,
                Giuseppe.registrar.getParameterType(target, propertyKey, parameterIndex),
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
