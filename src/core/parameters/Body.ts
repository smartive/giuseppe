import 'reflect-metadata';

import { Request } from 'express';

import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';

/**
 * Parameter decorator. Creates a parameter decorator that is registered on that route. Can
 * contain a type factory and multiple validators.
 * 
 * @export
 * @param {{ validator?: ParameterValidator, factory?: ParameterFactory<any> }} [{ validator, factory } = {}] 
 * @returns {ParameterDecorator} 
 */
export function Body(
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
            new GiuseppeBodyParameter(
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
                required,
                validator,
                factory,
            ),
        );
}

/**
 * Default core body parameter of giuseppe. Injects Request.body into the route.
 * 
 * @export
 * @class GiuseppeBodyParameter
 * @extends {GiuseppeBaseParameter}
 */
export class GiuseppeBodyParameter extends GiuseppeBaseParameter {

    constructor(
        type: Function,
        index: number,
        required?: boolean,
        validator?: ParameterValidator,
        factory?: ParameterFactory<any>,
    ) {
        super('body', type, index, required, validator, factory);
    }

    protected getRawValue(request: Request): any {
        return request.body;
    }
}
