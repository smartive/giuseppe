import 'reflect-metadata';
import { GiuseppeBaseParameter } from '../../../src/core/parameters/GiuseppeBaseParameter';
import { isNumber, isString } from '../../../src/core/parameters/ParameterAdditions';
import { GiuseppeQueryParameter, Query } from '../../../src/core/parameters/Query';
import { GiuseppeUrlParameter, UrlParam } from '../../../src/core/parameters/UrlParam';
import {
    ParameterParseError,
    ParameterValidationFailedError,
    RequiredParameterNotProvidedError,
} from '../../../src/errors';
import { ControllerMetadata } from '../../../src/utilities/ControllerMetadata';

interface ParamCase {
    decorator: Function;
    class: new (...args: any[]) => GiuseppeBaseParameter;
    name: string;
    alwaysRequired: boolean;
    getRequestMock: (value?: any) => any;
}

describe('Giuseppe parameter common', () => {

    const params: ParamCase[] = [
        {
            decorator: Query,
            class: GiuseppeQueryParameter,
            name: 'Query',
            alwaysRequired: false,
            getRequestMock: value => ({ query: { 'name': value } }),
        },
        {
            decorator: UrlParam,
            class: GiuseppeUrlParameter,
            name: 'UrlParam',
            alwaysRequired: true,
            getRequestMock: value => ({ params: { 'name': value } }),
        },
    ];

    for (const param of params) {

        describe(`@${param.name} decorator`, () => {

            it('should return a param decorator', () => {
                expect(param.decorator('name')).toBeInstanceOf(Function);
                expect(param.decorator('name').length).toBe(3);
            });

            it('should add the correct parameter declaration to the class', () => {
                class Ctrl {
                    public func( @param.decorator('name') param: string): void { }
                }

                const meta = new ControllerMetadata(Ctrl.prototype);

                const ctrlParam = meta.parameters('func')[0];

                expect(ctrlParam).toBeInstanceOf(param.class);
            });

            it('should add the correct parameter type to the declaration', () => {
                class Foobar { }

                class Ctrl {
                    public func( @param.decorator('name') param: Foobar): void { }
                }

                const meta = new ControllerMetadata(Ctrl.prototype);

                const ctrlParam = meta.parameters('func')[0];

                expect(ctrlParam.type).toBe(Foobar);
            });

        });

        describe(`Giuseppe${param.name}Parameter class`, () => {

            it('should inject the correct value', () => {
                const instance = new param.class('name', String, 0);

                expect(instance.getValue(param.getRequestMock('value'))).toBe('value');
            });

            it('should parse the correct value type', () => {
                const instance = new param.class('name', String, 0);
                expect(instance.getValue(param.getRequestMock('value')).constructor).toBe(String);

                const instance2 = new param.class('name', Number, 0);
                expect(instance2.getValue(param.getRequestMock(1337)).constructor).toBe(Number);
            });

            it('should throw on not provided required parameter', () => {
                const instance = new param.class('name', String, 0, true),
                    fn = () => instance.getValue(param.getRequestMock());

                expect(fn).toThrow(RequiredParameterNotProvidedError);
            });

            if (!param.alwaysRequired) {
                it('should inject undefined if param is not provided', () => {
                    const instance = new param.class('name', String, 0);

                    expect(instance.getValue(param.getRequestMock())).toBeUndefined();
                });
            }

            it('should correctly parse a custom type', () => {
                class Foobar {
                    constructor(value: any) { }
                }

                const instance = new param.class('name', Foobar, 0);

                expect(instance.getValue(param.getRequestMock('value'))).toBeInstanceOf(Foobar);
            });

            it('should throw on a param parse error', () => {
                class Foobar {
                    constructor(value: any) {
                        throw new Error();
                    }
                }

                const instance = new param.class('name', Foobar, 0),
                    fn = () => instance.getValue(param.getRequestMock('value'));

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

                const instance = new param.class('name', String, 0, false, null, raw => Foobar.create(raw));

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

                const instance = new param.class('name', String, 0, false, null, raw => Foobar.create(raw)),
                    fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).toThrow();
            });

            it('should validate correctly', () => {
                const instance = new param.class('name', String, 0, false, isString());

                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).not.toThrow(ParameterValidationFailedError);
            });

            it('should validate correctly with multiple validators', () => {
                const isNotEmpty = value => value.length > 0;

                const instance = new param.class('name', String, 0, false, [isString(), isNotEmpty]);

                const fn = () => instance.getValue(param.getRequestMock('value'));

                expect(fn).not.toThrow(ParameterValidationFailedError);
            });

            it('should throw on validation error', () => {
                const instance = new param.class('name', Number, 0, false, isString());

                const fn = () => instance.getValue(param.getRequestMock(1337));

                expect(fn).toThrow(ParameterValidationFailedError);
            });

            it('should throw on a later validation error (if multiple)', () => {
                const instance = new param.class('name', String, 0, false, [isString(), isNumber()]);

                const fn = () => instance.getValue(param.getRequestMock('1337'));

                expect(fn).toThrow(ParameterValidationFailedError);
            });

        });

    }

});
