import 'reflect-metadata';
import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';
import { Request } from 'express';

export function Query(
    name: string,
    {
        alias,
        required,
        validator,
        factory,
    }: { alias?: string | string[], required?: boolean, validator?: ParameterValidator, factory?: ParameterFactory<any> } = {},
): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeQueryParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
                required,
                validator,
                factory,
                alias,
            ),
        );
}

export class GiuseppeQueryParameter extends GiuseppeBaseParameter {

    constructor(
        name: string,
        type: Function,
        index: number,
        required?: boolean,
        validator?: ParameterValidator,
        factory?: ParameterFactory<any>,
        private readonly alias?: string | string[],
    ) {
        super(name, type, index, required, validator, factory);
    }

    protected getRawValue(request: Request): any {
        if (!this.alias) {
            return request.query[this.name];
        }
        let aliases = !Array.isArray(this.alias) ? [this.alias] : this.alias as string[];
        aliases = aliases.map((a: string) => request.query[a]).filter(Boolean);
        return aliases[0] || request.query[this.name];
    }
}
