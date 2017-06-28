import 'reflect-metadata';

import { Request } from 'express';

import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';

/**
 * @typedef QueryConfigObject
 
 * @property {string | string[]} [alias]
 * @property {boolean} [required]
 * @property {ParameterValidator} [validator]
 * @property {ParameterFactory<any>} [factory]
 */

/**
 * Parameter decorator. Creates a parameter definition that injects a query parameter value from the request.
 * Can contain validators and a factory if the value is complex. If an alias is defined, the alias(es)
 * will be used to determine a value other than the given name.
 * 
 * @export
 * @param {string} name 
 * @param {QueryConfigObject} [{alias, required, validator, factory}={}]
 * @returns {ParameterDecorator} 
 */
export function Query(
    name: string,
    {
        alias,
        required,
        validator,
        factory,
    }:
        {
            alias?: string | string[],
            required?: boolean,
            validator?: ParameterValidator,
            factory?: ParameterFactory<any>,
        } = {},
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

/**
 * Default core query parameter of giuseppe. Does inject a query parameter from the request into the route.
 * Can contain an alias that the query parameter can be named with.
 * 
 * @export
 * @class GiuseppeQueryParameter
 * @extends {GiuseppeBaseParameter}
 */
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
