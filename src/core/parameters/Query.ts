import { Giuseppe } from '../..';
import { ParameterDefinition } from '../../parameter/ParameterDefinition';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { Request } from 'express';

export function Query(name: string): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeQueryParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex].name,
                parameterIndex,
            ),
        );
}

export class GiuseppeQueryParameter implements ParameterDefinition {
    public readonly canHandleResponse: boolean = false;

    constructor(
        public readonly name: string,
        public readonly type: string,
        public readonly index: number,
    ) { }

    public getValue(request: Request): any {
        return request.query[this.name];
        // todo error handling
    }
}
