import 'reflect-metadata';
import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';
import { Request } from 'express';

export function Header(
    name: string,
    {
        required,
        validator,
        factory,
    }: { required?: boolean, validator?: ParameterValidator, factory?: ParameterFactory<any> } = {},
): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeHeaderParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
                required,
                validator,
                factory,
            ),
        );
}

export class GiuseppeHeaderParameter extends GiuseppeBaseParameter {

    constructor(
        name: string,
        type: Function,
        index: number,
        required?: boolean,
        validator?: ParameterValidator,
        factory?: ParameterFactory<any>,
    ) {
        super(name, type, index, required, validator, factory);
    }

    protected getRawValue(request: Request): any {
        return request.get(this.name);
    }
}
