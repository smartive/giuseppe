import 'reflect-metadata';

import { Request } from 'express';

import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';

/**
 * Class that splits cookie values into their specific parts.
 *
 * @class CookieHelper
 */
class CookieHelper {
    public name: string;
    public value: string;

    constructor(value: string) {
        const split = value.split('=');
        this.name = split[0];
        this.value = split[1];
    }
}

/**
 * Parameter decorator. Creates a parameter definition that injects a specific cookie from the request.
 * Can contain validators and a factory if the value is complex.
 *
 * @export
 * @param {string} name Name of the cookie.
 * @param {{ required?: boolean, validator?: ParameterValidator, factory?: ParameterFactory<any> }} [{
 *         required,
 *         validator,
 *         factory,
 *     }={}] Configuration object for the cookie parameter.
 * @returns {ParameterDecorator}
 */
export function Cookie(
    name: string,
    {
        required,
        validator,
        factory,
    }: { required?: boolean, validator?: ParameterValidator, factory?: ParameterFactory<any> } = {},
): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey.toString(),
            new GiuseppeCookieParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey.toString())[parameterIndex],
                parameterIndex,
                required,
                validator,
                factory,
            ),
        );
}

/**
 * Default core cookie parameter of giuseppe. Injects the value of a specific cookie from the request.
 *
 * @export
 * @class GiuseppeCookieParameter
 * @extends {GiuseppeBaseParameter}
 */
export class GiuseppeCookieParameter extends GiuseppeBaseParameter {
    protected getRawValue(request: Request): any {
        const cookies = request.get('cookie');
        if (!cookies) {
            return undefined;
        }
        const cookie = cookies
            .split(';')
            .map(o => new CookieHelper(o.trim()))
            .filter(o => o.name === this.name)[0];
        return cookie ? cookie.value : undefined;
    }
}
