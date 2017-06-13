import 'reflect-metadata';
import { Giuseppe } from '../../Giuseppe';
import { ControllerMetadata } from '../../utilities/ControllerMetadata';
import { GiuseppeBaseParameter } from './GiuseppeBaseParameter';
import { ParameterFactory, ParameterValidator } from './ParameterAdditions';
import { Request } from 'express';

class CookieHelper {
    public name: string;
    public value: string;

    constructor(value: string) {
        const split = value.split('=');
        this.name = split[0];
        this.value = split[1];
    }
}

export function Cookie(
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
            new GiuseppeCookieParameter(
                name,
                new ControllerMetadata(target).parameterTypes(propertyKey)[parameterIndex],
                parameterIndex,
                required,
                validator,
                factory,
            ),
        );
}

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
