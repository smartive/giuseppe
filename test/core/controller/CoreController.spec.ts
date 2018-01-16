import 'reflect-metadata';

import { Giuseppe } from '../../../src/';
import { Controller } from '../../../src/core/controller/GiuseppeApiController';
import { Get } from '../../../src/core/routes/Get';
import { DefinitionNotRegisteredError } from '../../../src/errors';

describe('Core controller', () => {

    describe('@Controller decorator', () => {

        let giuseppe: Giuseppe;

        beforeEach(() => {
            giuseppe = new Giuseppe();
        });

        afterEach(() => {
            (Giuseppe.registrar as any).controller = [];
        });

        it('should return Controller decorator', () => {
            expect(Controller()).toBeInstanceOf(Function);
        });

        it('should register a controller in giuseppe.', () => {
            @Controller()
            class Ctrl { }

            expect(Giuseppe.registrar.controller.length).toBe(1);
        });

        it('should register the correct contextual target', () => {
            @Controller()
            class Ctrl { }

            expect(Giuseppe.registrar.controller[0].ctrlTarget).toBe(Ctrl);
        });

        it('should use the correct route prefix', () => {
            @Controller('foobar')
            class Ctrl { }

            expect((Giuseppe.registrar.controller[0] as any).routePrefix).toBe('foobar');
        });

        it('should use the correct middlewares when prefix is set', () => {
            const fn = (req, res, next) => { next(); };
            @Controller('foobar', fn)
            class Ctrl { }

            expect((Giuseppe.registrar.controller[0] as any).routePrefix).toBe('foobar');
            expect(Giuseppe.registrar.controller[0].middlewares[0]).toBe(fn);
        });

        it('should use the correct middlewares when prefix is not set', () => {
            const fn = (req, res, next) => { next(); };
            @Controller(fn)
            class Ctrl { }

            expect((Giuseppe.registrar.controller[0] as any).routePrefix).toBe('');
            expect(Giuseppe.registrar.controller[0].middlewares[0]).toBe(fn);
        });

        it('should use the correct middlewares for multiple functions with a prefix', () => {
            const fn = (req, res, next) => { next(); };
            const fn2 = (req, res, next) => { next(); };
            @Controller('foobar', fn, fn2)
            class Ctrl { }

            expect((Giuseppe.registrar.controller[0] as any).routePrefix).toBe('foobar');
            expect(Giuseppe.registrar.controller[0].middlewares[0]).toBe(fn);
            expect(Giuseppe.registrar.controller[0].middlewares[1]).toBe(fn2);
        });

        it('should use the correct middlewares for multiple functions', () => {
            const fn = (req, res, next) => { next(); };
            const fn2 = (req, res, next) => { next(); };
            @Controller(fn, fn2)
            class Ctrl { }

            expect((Giuseppe.registrar.controller[0] as any).routePrefix).toBe('');
            expect(Giuseppe.registrar.controller[0].middlewares[0]).toBe(fn);
            expect(Giuseppe.registrar.controller[0].middlewares[1]).toBe(fn2);
        });

        it('should throw if the controller (plugin) is not registered', () => {
            (giuseppe as any).plugins = [];

            @Controller()
            class Ctrl { }

            const fn = () => {
                giuseppe.configureRouter();
            };

            expect(fn).toThrow(DefinitionNotRegisteredError);
        });

        it(`should return it's registered routes`, () => {
            @Controller()
            class Ctrl {
                @Get()
                public get(): void { }
            }

            const ctrl = Giuseppe.registrar.controller[0];
            const route = ctrl.createRoutes('')[0];
            expect(route.id).toBe('get__');
            expect(route.name).toBe('get');
        });

        it('should return the correct route urls for default', () => {
            @Controller('api')
            class Ctrl {
                @Get('foobar')
                public get(): void { }

                @Get('/barfoo')
                public get2(): void { }

                @Get('/rootfoo')
                public get3(): void { }
            }

            const ctrl = Giuseppe.registrar.controller[0];
            const routes = ctrl.createRoutes('');

            let route = routes[0];
            expect(route.id).toBe('get_api_foobar');
            expect(route.url).toBe('api/foobar');

            route = routes[1];
            expect(route.id).toBe('get_api_/barfoo');
            expect(route.url).toBe('api/barfoo');

            route = routes[2];
            expect(route.id).toBe('get_api_/rootfoo');
            expect(route.url).toBe('api/rootfoo');
        });

    });

});
