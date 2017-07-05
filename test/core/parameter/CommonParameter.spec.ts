import 'reflect-metadata';

import { Body, GiuseppeBodyParameter } from '../../../src/core/parameters/Body';
import { Cookie, GiuseppeCookieParameter } from '../../../src/core/parameters/Cookie';
import { GiuseppeBaseParameter } from '../../../src/core/parameters/GiuseppeBaseParameter';
import { GiuseppeHeaderParameter, Header } from '../../../src/core/parameters/Header';
import { isNumber, isString, ParameterFactory, ParameterValidator } from '../../../src/core/parameters/ParameterAdditions';
import { GiuseppeQueryParameter, Query } from '../../../src/core/parameters/Query';
import { GiuseppeUrlParameter, UrlParam } from '../../../src/core/parameters/UrlParam';
import { ParameterParseError, ParameterValidationFailedError, RequiredParameterNotProvidedError } from '../../../src/errors';
import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';

interface ParamCase {
    class: new (...args: any[]) => GiuseppeBaseParameter;
    name: string;
    alwaysRequired: boolean;
    getRequestMock: (value?: any) => any;
    getDecorator: (name?: any) => any;
    getInstance: (
        name: string,
        type: Function,
        index: number,
        required?: boolean,
        validator?: ParameterValidator,
        factory?: ParameterFactory<any>,
    ) => GiuseppeBaseParameter;
}

describe('Giuseppe parameter common', () => {

    const params: ParamCase[] = [
        {
            class: GiuseppeQueryParameter,
            name: 'Query',
            alwaysRequired: false,
            getRequestMock: value => ({ query: { name: value } }),
            getDecorator: name => Query(name),
            getInstance: (
                name: string,
                type: Function,
                index: number,
                required?: boolean,
                validator?: ParameterValidator,
                factory?: ParameterFactory<any>,
            ) => new GiuseppeQueryParameter(name, type, index, required, validator, factory),
        },
        {
            class: GiuseppeUrlParameter,
            name: 'UrlParam',
            alwaysRequired: true,
            getRequestMock: value => ({ params: { name: value } }),
            getDecorator: name => UrlParam(name),
            getInstance: (
                name: string,
                type: Function,
                index: number,
                required?: boolean,
                validator?: ParameterValidator,
                factory?: ParameterFactory<any>,
            ) => new GiuseppeUrlParameter(name, type, index, validator, factory),
        },
        {
            class: GiuseppeBodyParameter,
            name: 'Body',
            alwaysRequired: false,
            getRequestMock: value => ({ body: value }),
            getDecorator: name => Body(),
            getInstance: (
                name: string,
                type: Function,
                index: number,
                required?: boolean,
                validator?: ParameterValidator,
                factory?: ParameterFactory<any>,
            ) => new GiuseppeBodyParameter(type, index, required, validator, factory),
        },
        {
            class: GiuseppeHeaderParameter,
            name: 'Header',
            alwaysRequired: false,
            getRequestMock: value => ({
                get: name => {
                    const foo = { name: value };
                    return foo[name];
                },
            }),
            getDecorator: name => Header(name),
            getInstance: (
                name: string,
                type: Function,
                index: number,
                required?: boolean,
                validator?: ParameterValidator,
                factory?: ParameterFactory<any>,
            ) => new GiuseppeHeaderParameter(name, type, index, required, validator, factory),
        },
        {
            class: GiuseppeCookieParameter,
            name: 'Cookie',
            alwaysRequired: false,
            getRequestMock: value => ({
                get: () => value ? `name=${value};` : null,
            }),
            getDecorator: name => Cookie(name),
            getInstance: (
                name: string,
                type: Function,
                index: number,
                required?: boolean,
                validator?: ParameterValidator,
                factory?: ParameterFactory<any>,
            ) => new GiuseppeCookieParameter(name, type, index, required, validator, factory),
        },
    ];

    for (const param of params) {

        describe(`@${param.name} decorator`, () => {

            it('should return a param decorator', () => {
                expect(param.getDecorator('name')).toBeInstanceOf(Function);
                expect(param.getDecorator('name').length).toBe(3);
            });

            it('should add the correct parameter declaration to the class', () => {
                class Ctrl {
                    public func( @param.getDecorator('name') param: string): void { }
                }

                const meta = new ControllerMetadata(Ctrl.prototype);

                const ctrlParam = meta.parameters('func')[0];

                expect(ctrlParam).toBeInstanceOf(param.class);
            });

            it('should add the correct parameter type to the declaration', () => {
                class Foobar { }

                class Ctrl {
                    public func( @param.getDecorator('name') param: Foobar): void { }
                }

                const meta = new ControllerMetadata(Ctrl.prototype);

                const ctrlParam = meta.parameters('func')[0];

                expect(ctrlParam.type).toBe(Foobar);
            });

        });

        describe(`Giuseppe${param.name}Parameter class`, () => {

            it('should inject the correct value', () => {
                const instance = param.getInstance('name', String, 0);

                expect(instance.getValue(param.getRequestMock('value'))).toBe('value');
            });

            it('should parse the correct value type', () => {
                const instance = param.getInstance('name', String, 0);
                expect(instance.getValue(param.getRequestMock('value')).constructor).toBe(String);

                const instance2 = param.getInstance('name', Number, 0);
                expect(instance2.getValue(param.getRequestMock(1337)).constructor).toBe(Number);
            });

            it('should throw on not provided required parameter', () => {
                const instance = param.getInstance('name', String, 0, true);
                const fn = () => instance.getValue(param.getRequestMock());

                expect(fn).toThrow(RequiredParameterNotProvidedError);
            });

            if (!param.alwaysRequired) {
                it('should inject undefined if param is not provided', () => {
                    const instance = param.getInstance('name', String, 0);

                    expect(instance.getValue(param.getRequestMock())).toBeUndefined();
                });

                it('should not throw on a non required parameter, if it is undefined', () => {
                    const instance = param.getInstance('name', String, 0, false);

                    const fn = () => instance.getValue(param.getRequestMock(undefined));

                    expect(fn).not.toThrow();
                });

                it('should not throw on a non required parameter, if it is undefined and has a validator', () => {
                    const instance = param.getInstance('name', String, 0, false, isString());

                    const fn = () => instance.getValue(param.getRequestMock(undefined));

                    expect(fn).not.toThrow();
                });

                it('should not throw on a non required parameter, if it is undefined and has multiple validators', () => {
                    const instance = param.getInstance('name', String, 0, false, [isString(), isNumber()]);

                    const fn = () => instance.getValue(param.getRequestMock(undefined));

                    expect(fn).not.toThrow();
                });
            }

            it('should correctly parse a custom type', () => {
                class Foobar {
                    constructor(value: any) { }
                }

                const instance = param.getInstance('name', Foobar, 0);

                expect(instance.getValue(param.getRequestMock('value'))).toBeInstanceOf(Foobar);
            });

            it('should throw on a param parse error', () => {
                class Foobar {
                    constructor(value: any) {
                        throw new Error();
                    }
                }

                const instance = param.getInstance('name', Foobar, 0);
                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).toThrow(ParameterParseError);
            });

            it('should parse correctly with a factory', () => {
                class Foobar {
                    public test: string;

                    private constructor() { }

                    public static create(value: any): Foobar {
                        const f = new Foobar();
                        f.test = value;
                        return f;
                    }
                }

                const instance = param.getInstance('name', String, 0, false, null, raw => Foobar.create(raw));

                expect(instance.getValue(param.getRequestMock('value'))).toBeInstanceOf(Foobar);
                expect(instance.getValue(param.getRequestMock('value')).test).toBe('value');
            });

            it('should throw correctly with a factory', () => {
                class Foobar {
                    public test: string;

                    private constructor() { }

                    public static create(value: any): Foobar {
                        throw new Error();
                    }
                }

                const instance = param.getInstance('name', String, 0, false, null, raw => Foobar.create(raw));
                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).toThrow();
            });

            it('should validate correctly', () => {
                const instance = param.getInstance('name', String, 0, false, isString());

                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).not.toThrow(ParameterValidationFailedError);
            });

            it('should validate correctly with multiple validators', () => {
                const isNotEmpty = value => value.length > 0;

                const instance = param.getInstance('name', String, 0, false, [isString(), isNotEmpty]);

                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).not.toThrow(ParameterValidationFailedError);
            });

            it('should throw on validation error', () => {
                const instance = param.getInstance('name', Number, 0, false, isString());

                const fn = () => instance.getValue(param.getRequestMock(1337));

                expect(fn).toThrow(ParameterValidationFailedError);
            });

            it('should throw on a later validation error (if multiple)', () => {
                const instance = param.getInstance('name', String, 0, false, [isString(), isNumber()]);

                const fn = () => instance.getValue(param.getRequestMock('1337'));

                expect(fn).toThrow(ParameterValidationFailedError);
            });

        });

    }

});
