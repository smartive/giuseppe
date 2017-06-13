import 'reflect-metadata';
import { Giuseppe } from '../src';
import { ControllerDefinition } from '../src/controller/ControllerDefinition';
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
                type: 'type',
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

            it('should register a route with the correct url');

            it('should register a root route with the correct url');

            it('should register a root controller route with the correct url');

            it('should register a root controller and a root route with the correct url');

            it('should register a higher segmented route first');

            it('should register a lower wildcarded route first');

            it('should not contain double slashes in routes');

            it('should throw on a duplicate route');

            it('should throw on duplicate root routes');

        });

    });

});
