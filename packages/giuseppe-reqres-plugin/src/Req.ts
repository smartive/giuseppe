import { Request } from 'express';
import { Giuseppe, ParameterDefinition } from 'giuseppe';

/**
 * Parameter decorator. Creates a parameter definition that injects the express js request object.
 *
 * @export
 * @returns {ParameterDecorator}
 */
export function Req(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey.toString(),
            new GiuseppeRequestParameter(parameterIndex),
        );
}

/**
 * Implementation of the request parameter definition. Does implement name and type statically, returns
 * the expressJS request object.
 *
 * @export
 * @class GiuseppeRequestParameter
 * @implements {ParameterDefinition}
 */
export class GiuseppeRequestParameter implements ParameterDefinition {
    public readonly canHandleResponse: boolean = false;
    public readonly name: string = 'ExpressRequest';
    public readonly type: Function = Object;

    constructor(
        public readonly index: number,
    ) { }

    public getValue(request: Request): any {
        return request;
    }
}
