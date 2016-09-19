import {ParameterConstructorArgumentsError, ParameterParseError, ParamValidationFailedError, RequiredParameterNotProvidedError} from '../errors/Errors';
import {ParamRegistration} from '../models/ParamRegistration';
import {PARAMS_KEY, ParamType} from '../params/ParamDecorators';
import {FactoryParameterOptions, ParameterFactory, QueryParamOptions} from '../params/ParamOptions';
import {Validator} from '../validators/Validators';
import {ParamHandler} from './ParamHandler';
import {Request, Response} from 'express';
import {injectable} from 'inversify';

const PRIMITIVE_TYPES = [Object, String, Array, Number, Boolean];

let bodyParserInstalled;

try {
    require('body-parser');
    bodyParserInstalled = true;
} catch (e) {
    bodyParserInstalled = false;
}

class CookieHelper {
    public name: string;
    public value: string;

    constructor(value: string) {
        let split = value.split('=');
        this.name = split[0];
        this.value = split[1];
    }
}

@injectable()
export class DefaultParamHandler implements ParamHandler {
    public extractParam(request: Request, param: ParamRegistration): any {
        switch (param.paramType) {
            case ParamType.Body:
                return request.body;
            case ParamType.Url:
                return request.params[param.name];
            case ParamType.Query:
                let options: QueryParamOptions = param.options;
                if (!options || !options.alias) {
                    return request.query[param.name];
                }
                let aliases = !Array.isArray(options.alias) ? [options.alias] : options.alias as string[];
                aliases = aliases.map((a: string) => request.query[a]).filter(Boolean);
                return aliases[0] || request.query[param.name];
            case ParamType.Header:
                return request.get(param.name);
            case ParamType.Cookie:
                let cookies = request.get('cookie');
                if (!cookies) {
                    return undefined;
                }
                let cookie = cookies
                    .split(';')
                    .map(o => new CookieHelper(o.trim()))
                    .filter(o => o.name === param.name)[0];
                return cookie ? cookie.value : undefined;
        }
    }

    public parseParam(rawValue: any, param: ParamRegistration): any {
        let factory: ParameterFactory<any>;

        if (param.options && (param.options as FactoryParameterOptions).factory) {
            factory = (param.options as FactoryParameterOptions).factory;
        } else {
            factory = raw => {
                let ctor = param.type as any;
                if (raw.constructor === ctor) {
                    return raw;
                } else {
                    return PRIMITIVE_TYPES.indexOf(ctor) !== -1 ? ctor(raw) : new ctor(raw);
                }
            };
        }

        if ((rawValue === null || rawValue === undefined) && param.options && param.options.required) {
            throw new RequiredParameterNotProvidedError(param.name);
        } else if (rawValue === null || rawValue === undefined) {
            return undefined;
        }

        let parsed;
        try {
            parsed = factory(rawValue);
        } catch (e) {
            throw new ParameterParseError(param.name, e);
        }

        if (param.options && param.options.validator) {
            let isValid = value => {
                let predicates = param.options.validator;

                if (Array.isArray(predicates)) {
                    return (predicates as Validator[]).every(p => p(value));
                }

                return (predicates as Validator)(value);
            };

            if (isValid(parsed)) {
                return parsed;
            }
            throw new ParamValidationFailedError(param.name);
        } else {
            return parsed;
        }
    }

    public getParamValuesForRequest(params: ParamRegistration[], request: Request, response: Response): any[] {
        let paramValues = [];
        params.forEach((p: ParamRegistration) => {
            switch (p.paramType) {
                case ParamType.Request:
                    paramValues[p.index] = request;
                    return;
                case ParamType.Response:
                    paramValues[p.index] = response;
                    return;
                default:
                    paramValues[p.index] = this.parseParam(this.extractParam(request, p), p);
                    return;
            }
        });
        return paramValues;
    }


    public getParamsForRoute(target: any, routeKey: string): ParamRegistration[] {
        let params: ParamRegistration[] = Reflect.getOwnMetadata(PARAMS_KEY, target, routeKey) || [];

        if (params.some((p: ParamRegistration) => p.paramType === ParamType.Body) && !bodyParserInstalled) {
            console.warn(`A route uses a @Body parameter, but there is no 'body-parser' package installed.`);
        }

        params.forEach(p => {
            if (p.type.length < 1 && !(p.options && (p.options as FactoryParameterOptions).factory)) {
                throw new ParameterConstructorArgumentsError(p.name);
            }
        });

        return params;
    }
}
