import { Request, Response } from 'express';
import { Giuseppe, ParameterDefinition } from 'giuseppe';

/**
 * Parameter decorator. Creates a parameter definition that injects the express js response object.
 * Note that when you inject this parameter, you need to handle the response for yourself. The field "canHandleResponse"
 * is set, so giuseppe won't run the result of the function through the return type handler.
 *
 * @export
 * @returns {ParameterDecorator}
 */
export function Res(): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) =>
        Giuseppe.registrar.registerParameter(
            target,
            propertyKey.toString(),
            new GiuseppeResponseParameter(parameterIndex),
        );
}

/**
 * Implementation of the request parameter definition. Does implement name and type statically, returns
 * the expressJS response object.
 *
 * @export
 * @class GiuseppeResponseParameter
 * @implements {ParameterDefinition}
 */
export class GiuseppeResponseParameter implements ParameterDefinition {
    public readonly canHandleResponse: boolean = true;
    public readonly name: string = 'ExpressResponse';
    public readonly type: Function = Object;

    constructor(
        public readonly index: number,
    ) { }

    public getValue(_request: Request, response: Response): any {
        return response;
    }
}
