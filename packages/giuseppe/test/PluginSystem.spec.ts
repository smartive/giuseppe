import 'reflect-metadata';

import {
    ControllerDefinitionConstructor,
    Giuseppe,
    GiuseppePlugin,
    ParameterDefinitionConstructor,
    RouteDefinitionConstructor,
    RouteModificatorConstructor,
} from '../src';
import { DuplicatePluginError } from '../src/errors';
import { ReturnType } from '../src/routes/ReturnType';

describe('Plugin system', () => {

    describe('Giuseppe constructor', () => {

        it('should register the giuseppe core plugin', () => {
            const mockFn = jest.fn();
            const orig = Giuseppe.prototype.registerPlugin;

            Giuseppe.prototype.registerPlugin = mockFn;

            try {
                const giusi = new Giuseppe();

                expect(mockFn.mock.calls.length).toBe(1);
            } finally {
                Giuseppe.prototype.registerPlugin = orig;
            }
        });

    });

    describe('registerPlugin', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        it('should register a plugin in giuseppe.', () => {
            class Plugin implements GiuseppePlugin {
                public readonly name: string = 'Plugin';
                public readonly returnTypeHandler: ReturnType<any>[] | null;
                public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
                public readonly routeDefinitions: RouteDefinitionConstructor[] | null;
                public readonly routeModificators: RouteModificatorConstructor[] | null;
                public readonly parameterDefinitions: ParameterDefinitionConstructor[] | null;
                public initialize(): void {
                }
            }

            expect((giuseppe as any).plugins).toBeInstanceOf(Array);
            expect((giuseppe as any).plugins.length).toBe(1);

            giuseppe.registerPlugin(new Plugin());

            expect((giuseppe as any).plugins.length).toBe(2);
        });

        it('should throw when a duplicate plugin is registered.', () => {
            class Plugin implements GiuseppePlugin {
                public readonly name: string = 'Plugin';
                public readonly returnTypeHandler: ReturnType<any>[] | null;
                public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
                public readonly routeDefinitions: RouteDefinitionConstructor[] | null;
                public readonly routeModificators: RouteModificatorConstructor[] | null;
                public readonly parameterDefinitions: ParameterDefinitionConstructor[] | null;
                public initialize(): void {
                }
            }

            const fn = () => giuseppe.registerPlugin(new Plugin());

            fn();

            expect(fn).toThrow(DuplicatePluginError);
        });

    });

});
