import 'reflect-metadata';

import { Request } from 'express';

import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';

/**
 * Parameter decorator. Creates a parameter definition that injects a specific header value from the request.
 * Can contain validators and a factory if the value is complex.
 * 
 * @export
 * @param {string} name 
 * @param {{ required?: boolean, validator?: ParameterValidator, factory?: ParameterFactory<any> }} [{
 *         required,
 *         validator,
 *         factory,
 *     }={}] 
 * @returns {ParameterDecorator} 
 */
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

/**
 * Default core header parameter of giuseppe. Injects a specific header value into the route.
 * 
 * @export
 * @class GiuseppeHeaderParameter
 * @extends {GiuseppeBaseParameter}
 */
export class GiuseppeHeaderParameter extends GiuseppeBaseParameter {
    protected getRawValue(request: Request): any {
        return request.get(this.name);
    }
}
