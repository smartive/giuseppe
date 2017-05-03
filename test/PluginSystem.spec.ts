import 'reflect-metadata';
import { Giuseppe, GiuseppePlugin } from '../src';
import { DuplicatePluginError } from '../src/errors';
import { ControllerDefinitionConstructor } from '../src/GiuseppePlugin';
import { ReturnType } from '../src/routes/ReturnType';
import { RouteDefinition } from '../src/routes/RouteDefinition';
import { RouteModificator } from '../src/routes/RouteModificator';
import chai = require('chai');
import sinon = require('sinon');
import sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

describe('PluginSystem', () => {

    describe('Giuseppe constructor', () => {

        it('should register the giuseppe core plugin.', () => {
            const spy = sinon.spy(),
                orig = Giuseppe.prototype.registerPlugin;
            Giuseppe.prototype.registerPlugin = spy;

            try {
                const giusi = new Giuseppe();

                spy.should.be.calledOnce;
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
                public readonly routeDecorators: RouteDefinition[] | null;
                public readonly routeModificators: RouteModificator[] | null;
                public readonly parameterDecorators: ParameterDecorator[] | null;
                public initialize(): void {
                }
            }

            (giuseppe as any).plugins.should.be.an('array').with.lengthOf(1);
            giuseppe.registerPlugin(new Plugin());
            (giuseppe as any).plugins.should.be.an('array').with.lengthOf(2);
        });

        it('should throw when a duplicate plugin is registered.', () => {
            class Plugin implements GiuseppePlugin {
                public readonly name: string = 'Plugin';
                public readonly returnTypeHandler: ReturnType<any>[] | null;
                public readonly controllerDefinitions: ControllerDefinitionConstructor[] = [];
                public readonly routeDecorators: RouteDefinition[] | null;
                public readonly routeModificators: RouteModificator[] | null;
                public readonly parameterDecorators: ParameterDecorator[] | null;
                public initialize(): void {
                }
            }

            const fn = () => giuseppe.registerPlugin(new Plugin());

            fn();
            fn.should.throw(DuplicatePluginError);
        });

    });

});
