import 'reflect-metadata';

import { IRouterMatcher, Router } from 'express';

import { Giuseppe, Post, RouteRegisterInformation } from '../src';
import { ControllerDefinition } from '../src/controller/ControllerDefinition';
import { Controller } from '../src/core/controller/GiuseppeApiController';
import { Get } from '../src/core/routes/Get';
import { GiuseppeRegistrar } from '../src/GiuseppeRegistrar';
import { ParameterDefinition } from '../src/parameter/ParameterDefinition';
import { RouteDefinition } from '../src/routes/RouteDefinition';
import { RouteModificator } from '../src/routes/RouteModificator';
import { ControllerMetadata } from '../src/utilities/ControllerMetadata';

describe('Giuseppe', () => {

    describe('Giuseppe registrar', () => {

        afterEach(() => {
            (Giuseppe as any).registrar.controller = [];
        });

        it('should add a controller to it\'self', () => {
            class Ctrl { }

            const ctrl: ControllerDefinition = {
                middlewares: [],
                ctrlTarget: Ctrl,
                createRoutes: () => [],
            };

            Giuseppe.registrar.registerController(ctrl);

            expect(Giuseppe.registrar.controller[0]).toBe(ctrl);
        });

        it('should add a route to the controllers metadata', () => {
            class Ctrl { }

            const route: RouteDefinition = {
                middlewares: [],
                httpMethod: 0,
                name: 'name',
                route: 'route',
                routeFunction: () => { },
                createRoutes: () => [],
            };

            Giuseppe.registrar.registerRoute(Ctrl, route);

            const meta = new ControllerMetadata(Ctrl);

            expect(meta.routes().length).toBe(1);
            expect(meta.routes()[0]).toBe(route);
        });

        it('should add a modificator to the controllers metadata', () => {
            class Ctrl {
                public func(): void { }
            }

            const mod: RouteModificator = {
                modifyRoute: () => [],
            };

            Giuseppe.registrar.registerRouteModificator(Ctrl, 'func', mod);

            const meta = new ControllerMetadata(Ctrl);

            expect(meta.modificators('func').length).toBe(1);
            expect(meta.modificators('func')[0]).toBe(mod);
        });

        it('should add a parameter to a route metadata', () => {
            class Ctrl {
                public func(): void { }
            }

            const param: ParameterDefinition = {
                canHandleResponse: true,
                getValue: () => '',
                index: 0,
                name: 'name',
                type: String,
            };

            Giuseppe.registrar.registerParameter(Ctrl, 'func', param);

            const meta = new ControllerMetadata(Ctrl);

            expect(meta.parameters('func').length).toBe(1);
            expect(meta.parameters('func')[0]).toBe(param);
        });

        it('should add an error handler to a controller metadata', () => {
            class Ctrl { }

            const fn = () => { };

            Giuseppe.registrar.registerErrorHandler(
                Ctrl,
                fn,
                [Error],
            );

            const meta = new ControllerMetadata(Ctrl);

            expect((meta.errorHandler() as any).handlers.Error).toBe(fn);
        });

    });

    describe('Core', () => {

        describe('plugin operations', () => {

            let giuseppe: Giuseppe;
            let plugin: any;

            beforeEach(() => {
                giuseppe = new Giuseppe();
                (giuseppe as any).plugins = [];
                plugin = {
                    name: 'plugin',
                    initialize: () => { },
                    controllerDefinitions: null,
                    parameterDefinitions: null,
                    routeDefinitions: null,
                    routeModificators: null,
                    returnTypeHandler: null,
                };
            });

            describe('returnTypes()', () => {

                it('should return the definitions', () => {
                    expect((giuseppe as any)._returnTypes).toBeNull();

                    plugin.returnTypeHandler = [
                        {
                            getHeaders: () => ({}),
                            getStatus: () => 0,
                            getValue: () => '',
                            type: 'default',
                        },
                    ];
                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any).returnTypes.length).toBe(1);
                });

            });

            describe('pluginController()', () => {

                it('should return the definitions', () => {
                    expect((giuseppe as any)._pluginController).toBeNull();

                    plugin.controllerDefinitions = [() => { }];
                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any).pluginController.length).toBe(1);
                });

            });

            describe('pluginRoutes()', () => {

                it('should return the definitions', () => {
                    expect((giuseppe as any)._pluginRoutes).toBeNull();

                    plugin.routeDefinitions = [() => { }];
                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any).pluginRoutes.length).toBe(1);
                });

            });

            describe('pluginRouteModificators()', () => {

                it('should return the definitions', () => {
                    expect((giuseppe as any)._pluginRouteModificators).toBeNull();

                    plugin.routeModificators = [() => { }];
                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any).pluginRouteModificators.length).toBe(1);
                });

            });

            describe('pluginParameters()', () => {

                it('should return the definitions', () => {
                    expect((giuseppe as any)._pluginParameters).toBeNull();

                    plugin.parameterDefinitions = [() => { }];
                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any).pluginParameters.length).toBe(1);
                });

            });

            describe('registerPlugin()', () => {

                it('should reset the plugin list', () => {
                    (giuseppe as any).returnTypes;
                    (giuseppe as any).pluginController;
                    (giuseppe as any).pluginRoutes;
                    (giuseppe as any).pluginRouteModificators;
                    (giuseppe as any).pluginParameters;

                    expect((giuseppe as any).returnTypes.length).toBe(0);
                    expect((giuseppe as any).pluginController.length).toBe(0);
                    expect((giuseppe as any).pluginRoutes.length).toBe(0);
                    expect((giuseppe as any).pluginRouteModificators.length).toBe(0);
                    expect((giuseppe as any).pluginParameters.length).toBe(0);

                    giuseppe.registerPlugin(plugin);

                    expect((giuseppe as any)._returnTypes).toBeNull();
                    expect((giuseppe as any)._pluginController).toBeNull();
                    expect((giuseppe as any)._pluginRoutes).toBeNull();
                    expect((giuseppe as any)._pluginRouteModificators).toBeNull();
                    expect((giuseppe as any)._pluginParameters).toBeNull();
                });

            });

        });

        describe('configureRouter()', () => {

            let giuseppe: Giuseppe;
            let spy: jest.SpyInstance<IRouterMatcher<Router>> | null;

            beforeEach(() => {
                giuseppe = new Giuseppe();
            });

            afterEach(() => {
                (Giuseppe as any).registrar = new GiuseppeRegistrar();

                if (spy) {
                    spy.mockReset();
                    spy.mockRestore();
                    spy = null;
                }
            });

            it('should use the correct baseUrl', () => {
                @Controller()
                class Ctrl {
                    @Get('getFunc')
                    public func(): void { }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter('baseUrl');

                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toBe('/baseUrl/getFunc');
            });

            it('should use a controller prefix correctly', () => {
                @Controller('prefix')
                class Ctrl {
                    @Get('getFunc')
                    public func(): void { }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter();

                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toBe('/prefix/getFunc');
            });

            it('should use baseUrl and controller prefix correctly', () => {
                @Controller('prefix')
                class Ctrl {
                    @Get('getFunc')
                    public func(): void { }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter('baseUrl');

                expect(spy).toHaveBeenCalled();
                expect(spy.mock.calls[0][0]).toBe('/baseUrl/prefix/getFunc');
            });

            it('should register a higher segmented route first', () => {
                @Controller()
                class Ctrl {
                    @Get('/this/has/four/segments')
                    public func(): void { }

                    @Get('/this/has/five/segments/yo')
                    public func2(): void { }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter();

                expect(spy.mock.calls[0][0]).toBe('/this/has/five/segments/yo');
                expect(spy.mock.calls[1][0]).toBe('/this/has/four/segments');
            });

            it('should register a lower parameterized route first', () => {
                @Controller()
                class Ctrl {
                    @Get('/url/:id/:type')
                    public func(): void { }

                    @Get('/this/:id/notparam')
                    public func2(): void { }

                    @Get('/this/no/hotdog')
                    public func3(): void { }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter();

                expect(spy.mock.calls[0][0]).toBe('/this/no/hotdog');
                expect(spy.mock.calls[1][0]).toBe('/this/:id/notparam');
                expect(spy.mock.calls[2][0]).toBe('/url/:id/:type');
            });

            it('should register a lower wildcarded route first', () => {
                @Controller()
                class Ctrl {
                    @Get('func1/*/2/*')
                    public func(): void {
                    }

                    @Get('func1/foo/*/bar')
                    public func2(): void {
                    }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter();

                expect(spy.mock.calls[0][0]).toBe('/func1/foo/*/bar');
                expect(spy.mock.calls[1][0]).toBe('/func1/*/2/*');
            });

            it('should not contain double slashes in routes', () => {
                @Controller('/')
                class Ctrl {
                    @Get('/foo//bar')
                    public func(): void {
                    }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter('/');

                expect(spy.mock.calls[0][0]).toBe('/foo/bar');
            });

            it('should throw on a duplicate route', () => {
                @Controller()
                class Ctrl {
                    @Get('getFunc')
                    public func(): void { }

                    @Get('getFunc')
                    public func2(): void { }
                }

                const fn = () => giuseppe.configureRouter('baseUrl');

                expect(fn).toThrowErrorMatchingSnapshot();
            });

            it('should not throw on a similar route in a different controller', () => {
                @Controller('a')
                class CtrlA {
                    @Get('getFunc')
                    public func(): void { }
                }

                @Controller('b')
                class CtrlB {
                    @Get('getFunc')
                    public func(): void { }
                }

                const fn = () => giuseppe.configureRouter('baseUrl');

                expect(fn).not.toThrow();
            });

            it('should order the urls correctly (all cases)', () => {
                @Controller()
                class Ctrl {
                    @Get('*')
                    public funcGet5(): void {
                    }

                    @Get('url/:two/:params')
                    public funcGet3(): void {
                    }

                    @Get('url/:two/*')
                    public funcGet7(): void {
                    }

                    @Get('url/foo/bar')
                    public funcGet9(): void {
                    }

                    @Get('url/*/*')
                    public funcGet8(): void {
                    }

                    @Get('url/with/many/segments/there')
                    public funcGet(): void {
                    }

                    @Get('url/with/:many/segments/there')
                    public funcGet6(): void {
                    }

                    @Get('url/with/*/segments/there')
                    public funcGet4(): void {
                    }

                    @Get('url/*/:param')
                    public funcGet11(): void {
                    }

                    @Get('url/foo/:param')
                    public funcGet12(): void {
                    }

                    @Get('url/*/param')
                    public funcGet10(): void {
                    }

                    @Get('url/:one/param')
                    public funcGet2(): void {
                    }
                }

                spy = jest.spyOn(giuseppe.router, 'get');

                giuseppe.configureRouter();

                expect(spy.mock.calls).toMatchSnapshot();
            });
        });

    });

    describe('createRouteWrapper()', () => {

        it('should use the same controller instance for routes', () => {
            const giusi = new Giuseppe();
            const original = (giusi as any).createRouteWrapper as Function;
            const spy = jest.fn((routeInfo: RouteRegisterInformation) => original.apply(giusi, [routeInfo]));
            (giusi as any).createRouteWrapper = spy;

            @Controller('foo')
            class Ctrl {
                @Get('bar')
                public func1(): void { }

                @Post('baz')
                public async func2(p1: string): Promise<void> { }
            }

            @Controller('bar')
            class Ctrl2 {
                @Get('bar')
                public func1(): void { }
            }

            giusi.configureRouter();

            expect(spy.mock.calls[0][0].instance).toBe(spy.mock.calls[1][0].instance);
            expect(spy.mock.calls[0][0].instance).not.toBe(spy.mock.calls[2][0].instance);
        });

    });

});
