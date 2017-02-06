import {ParamType} from '../params/ParamDecorators';
import {ParamOptions} from '../params/ParamOptions';

/**
 * Parameter class. Contains all crucial information for the instantiation of the parameters for the runtime.
 *
 * @class
 */
export class ParamRegistration {
    constructor(public paramType: ParamType, public name: string, public type: Function, public index: number, public options?: ParamOptions) {
    }
}
