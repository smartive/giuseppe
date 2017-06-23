import 'reflect-metadata';

import { Request } from 'express';

import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';

/**
 * Parameter decorator. Creates a parameter definition that injects a url parameter value from the request.
 * Can contain validators and a factory if the value is complex.
 * 
 * @export
 * @param {string} name 
 * @param {{ validator?: ParameterValidator, factory?: ParameterFactory<any> }} [{
 *         validator,
 *         factory,
 *     }={}] 
 * @returns {ParameterDecorator} 
 */
export function UrlParam(
    name: string,
    {
        validator,
        factory,
    }: { validator?: ParameterValidator, factory?: ParameterFactory<any> } = {},
): ParameterDecorator {
    return (target: Object, propertyKey: string, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey,
            new GiuseppeUrlParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
                validator,
                factory,
            ),
        );
}

/**
 * Default core url parameter of giuseppe. Injects a given url parameter for a route.
 * 
 * @export
 * @class GiuseppeUrlParameter
 * @extends {GiuseppeBaseParameter}
 */
export class GiuseppeUrlParameter extends GiuseppeBaseParameter {

    constructor(
        name: string,
        type: Function,
        index: number,
        validator?: ParameterValidator,
        factory?: ParameterFactory<any>,
    ) {
        super(name, type, index, true, validator, factory);
    }

    protected getRawValue(request: Request): any {
        return request.params[this.name];
    }
}
